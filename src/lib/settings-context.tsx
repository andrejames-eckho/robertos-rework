"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db, AppSettings } from "./db";
import { useLiveQuery } from "dexie-react-hooks";

interface SettingsContextType {
    settings: AppSettings | null;
    isLoading: boolean;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    exportData: () => Promise<string>;
    importData: (jsonData: string) => Promise<void>;
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
                        updated_at: new Date().toISOString()
                    });
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

            await db.transaction("rw", db.items, db.transactions, db.users, db.settings, async () => {
                // Clear existing data
                await db.items.clear();
                await db.transactions.clear();
                await db.users.clear();
                await db.settings.clear();

                // Import new data
                await db.items.bulkAdd(data.items);
                if (data.transactions) await db.transactions.bulkAdd(data.transactions);
                if (data.users) await db.users.bulkAdd(data.users);
                if (data.settings) await db.settings.bulkAdd(data.settings);
            });
        } catch (error) {
            console.error("Import failed:", error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, updateSettings, exportData, importData }}>
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
