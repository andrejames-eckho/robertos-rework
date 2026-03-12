"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, User } from "./db";
import { useLiveQuery } from "dexie-react-hooks";

interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    users: User[];
    addUser: (user: Omit<User, "created_at">) => Promise<void>;
    updateUser: (id: string, updates: Partial<Omit<User, "id" | "created_at">>) => Promise<void>;
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
                // Seed default users if table is empty
                const count = await db.users.count();
                if (count === 0) {
                    const now = new Date().toISOString();
                    await db.users.bulkAdd([
                        {
                            id: "admin_1234",
                            name: "Admin",
                            pin: "1234",
                            role: "ADMIN",
                            created_at: now
                        },
                        {
                            id: "super_8888",
                            name: "Super Admin",
                            pin: "8888",
                            role: "SUPER_ADMIN",
                            created_at: now
                        }
                    ]);
                }
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
        const user = await db.users.where("pin").equals(pin).first();
        if (user) {
            setCurrentUserId(user.id);
            localStorage.setItem("stocktrack_user_id", user.id);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUserId(null);
        localStorage.removeItem("stocktrack_user_id");
    };

    const addUser = async (user: Omit<User, "created_at">) => {
        await db.users.add({
            ...user,
            created_at: new Date().toISOString()
        });
    };

    const updateUser = async (id: string, updates: Partial<Omit<User, "id" | "created_at">>) => {
        await db.users.update(id, updates);
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
