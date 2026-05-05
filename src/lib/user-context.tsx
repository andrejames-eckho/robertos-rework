"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, User } from "./db";
import { generateSalt, hashPin } from "./crypto";
import { useLiveQuery } from "dexie-react-hooks";

type UserRole = 'STANDARD' | 'ADMIN' | 'SUPER_ADMIN';

interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    users: User[];
    addUser: (userData: { id: string; name: string; pin: string; role: UserRole }) => Promise<void>;
    updateUser: (id: string, updates: { name?: string; pin?: string; role?: UserRole }) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("stocktrack_user_id");
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    const users = useLiveQuery(() => db.users.toArray(), []) || [];
    const currentUser = useLiveQuery(
        async () => (currentUserId ? await db.users.get(currentUserId) : null),
        [currentUserId]
    ) || null;

    useEffect(() => {
        const initUsers = async () => {
            setIsLoading(true);
            try {
                // No default users seeded — first-run setup wizard handles account creation
                await db.users.count();
            } catch (error) {
                console.error("Error initializing users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (typeof window !== "undefined") {
            initUsers();
        }
    }, []);

    const login = async (pin: string): Promise<boolean> => {
        const allUsers = await db.users.toArray();
        for (const user of allUsers) {
            if (!user.pin_salt) continue;
            const hash = await hashPin(pin, user.pin_salt);
            if (hash === user.pin) {
                setCurrentUserId(user.id);
                localStorage.setItem("stocktrack_user_id", user.id);
                return true;
            }
        }
        return false;
    };

    const logout = () => {
        setCurrentUserId(null);
        localStorage.removeItem("stocktrack_user_id");
    };

    const addUser = async (userData: { id: string; name: string; pin: string; role: UserRole }) => {
        const salt = generateSalt();
        const hash = await hashPin(userData.pin, salt);
        await db.users.add({
            id: userData.id,
            name: userData.name,
            pin: hash,
            pin_salt: salt,
            role: userData.role,
            created_at: new Date().toISOString()
        });
    };

    const updateUser = async (id: string, updates: { name?: string; pin?: string; role?: UserRole }) => {
        const dbUpdates: Partial<User> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.pin !== undefined) {
            const salt = generateSalt();
            const hash = await hashPin(updates.pin, salt);
            dbUpdates.pin = hash;
            dbUpdates.pin_salt = salt;
        }
        await db.users.update(id, dbUpdates);
    };

    const deleteUser = async (id: string) => {
        if (currentUser?.id === id) {
            throw new Error("Cannot delete your own account");
        }
        await db.users.delete(id);
    };

    return (
        <UserContext.Provider value={{ currentUser, users, isLoading, login, logout, addUser, updateUser, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
