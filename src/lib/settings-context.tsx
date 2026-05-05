"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db, AppSettings, User } from "./db";
import { generateSalt, hashPin, generateTotpSecret, verifyTotp } from "./crypto";
import { useLiveQuery } from "dexie-react-hooks";

interface SettingsContextType {
    settings: AppSettings | null;
    isLoading: boolean;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    exportData: () => Promise<string>;
    importData: (jsonData: string) => Promise<void>;
    resetDatabase: () => Promise<void>;
    regenerateRecoverySecret: () => Promise<void>;
    checkRecoveryCode: (code: string) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    const settings = useLiveQuery(async () => {
        const s = await db.settings.get("default");
        return s || null;
    }, []) || null;

    useEffect(() => {
        const initSettings = async () => {
            setIsLoading(true);
            try {
                const count = await db.settings.count();
                if (count === 0) {
                    await db.settings.add({
                        id: "default",
                        storeName: "Roberto's StockTrack",
                        defaultLowStockThreshold: 10,
                        updated_at: new Date().toISOString(),
                        recoveryTotpSecret: generateTotpSecret(),
                    });
                } else {
                    // Migrate existing settings that don't have a recovery secret yet
                    const existing = await db.settings.get("default");
                    if (existing && !existing.recoveryTotpSecret) {
                        await db.settings.update("default", {
                            recoveryTotpSecret: generateTotpSecret(),
                        });
                    }
                }
            } catch (error) {
                console.error("Error initializing settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        await db.settings.update("default", {
            ...newSettings,
            updated_at: new Date().toISOString()
        });
    };

    const exportData = async () => {
        const items = await db.items.toArray();
        const transactions = await db.transactions.toArray();
        const users = await db.users.toArray();
        const currentSettings = await db.settings.toArray();

        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            items,
            transactions,
            users,
            settings: currentSettings
        };

        return JSON.stringify(data, null, 2);
    };

    const importData = async (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);

            if (!data.version || !data.items || !data.users) {
                throw new Error("Invalid backup file format");
            }

            // Migrate users from old backups that stored plaintext PINs (no pin_salt field)
            const usersToImport: User[] = await Promise.all(
                data.users.map(async (u: User) => {
                    if (!u.pin_salt) {
                        const salt = generateSalt();
                        const hash = await hashPin(u.pin, salt);
                        return { ...u, pin: hash, pin_salt: salt };
                    }
                    return u;
                })
            );

            // Ensure imported settings have a recovery secret
            const settingsToImport = (data.settings || []).map((s: AppSettings) => ({
                ...s,
                recoveryTotpSecret: s.recoveryTotpSecret || generateTotpSecret(),
            }));

            await db.transaction("rw", db.items, db.transactions, db.users, db.settings, async () => {
                await db.items.clear();
                await db.transactions.clear();
                await db.users.clear();
                await db.settings.clear();

                await db.items.bulkAdd(data.items);
                if (data.transactions) await db.transactions.bulkAdd(data.transactions);
                await db.users.bulkAdd(usersToImport);
                await db.settings.bulkAdd(settingsToImport);
            });
        } catch (error) {
            console.error("Import failed:", error);
            throw error;
        }
    };

    const resetDatabase = async () => {
        const now = new Date().toISOString();
        await db.transaction("rw", [db.items, db.transactions, db.users, db.settings, db.categories], async () => {
            await db.items.clear();
            await db.transactions.clear();
            await db.users.clear();
            await db.settings.clear();
            await db.categories.clear();

            // No default users seeded — setup wizard runs on next /auth visit
            // Generate a NEW recovery secret on reset — developer must re-register authenticator
            await db.settings.add({
                id: "default",
                storeName: settings?.storeName || "StockTrack",
                defaultLowStockThreshold: 10,
                updated_at: now,
                recoveryTotpSecret: generateTotpSecret(),
            });
        });
    };

    const regenerateRecoverySecret = async () => {
        await db.settings.update("default", {
            recoveryTotpSecret: generateTotpSecret(),
            updated_at: new Date().toISOString(),
        });
    };

    const checkRecoveryCode = async (code: string): Promise<boolean> => {
        const s = await db.settings.get("default");
        if (!s?.recoveryTotpSecret) return false;
        return verifyTotp(s.recoveryTotpSecret, code);
    };

    return (
        <SettingsContext.Provider value={{
            settings, isLoading, updateSettings, exportData, importData,
            resetDatabase, regenerateRecoverySecret, checkRecoveryCode
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
