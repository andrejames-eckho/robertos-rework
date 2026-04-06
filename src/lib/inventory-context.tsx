"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, InventoryItem, Transaction, Category } from "./db";
import { useLiveQuery } from "dexie-react-hooks";

interface InventoryContextType {
    items: InventoryItem[];
    categories: Category[];
    transactions: Transaction[];
    isLoading: boolean;
    addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>, userId?: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    adjustStock: (itemId: string, quantityChange: number, userId: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
    // useLiveQuery automatically updates the component when the database changes
    const items = useLiveQuery(() => db.items.orderBy('name').toArray(), []) || [];
    const categories = useLiveQuery(() => db.categories.orderBy('name').toArray(), []) || [];
    const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().limit(100).toArray(), []) || [];
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initDb = async () => {
            setIsLoading(true);
            try {
            } catch (error) {
                console.error("Error initializing local database:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initDb();
    }, []);

    const addItem = async (newItem: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>, userId?: string) => {
        const now = new Date().toISOString();
        const item: InventoryItem = {
            ...newItem,
            id: crypto.randomUUID(),
            created_at: now,
            updated_at: now
        };
        
        await db.transaction('rw', db.items, db.transactions, async () => {
            await db.items.add(item);
            
            if (userId) {
                await db.transactions.add({
                    id: crypto.randomUUID(),
                    item_id: item.id,
                    item_name: item.name,
                    user_id: userId,
                    quantity_change: item.quantity,
                    timestamp: now
                });
            }
        });
    };

    const addCategory = async (name: string) => {
        await db.categories.add({
            id: crypto.randomUUID(),
            name
        });
    };

    const deleteCategory = async (id: string) => {
        await db.categories.delete(id);
    };

    const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
        await db.items.update(id, {
            ...updates,
            updated_at: new Date().toISOString()
        });
    };

    const deleteItem = async (id: string) => {
        await db.items.delete(id);
    };

    const adjustStock = async (itemId: string, quantityChange: number, userId: string) => {
        const item = await db.items.get(itemId);
        if (!item) return;

        const newQuantity = item.quantity + quantityChange;

        await db.transaction('rw', db.items, db.transactions, async () => {
            // 1. Update the item quantity
            await db.items.update(itemId, {
                quantity: newQuantity,
                updated_at: new Date().toISOString()
            });

            // 2. Log the transaction
            await db.transactions.add({
                id: crypto.randomUUID(),
                item_id: itemId,
                item_name: item.name,
                user_id: userId,
                quantity_change: quantityChange,
                timestamp: new Date().toISOString()
            });
        });
    };

    return (
        <InventoryContext.Provider value={{ items, categories, transactions, isLoading, addItem, addCategory, deleteCategory, updateItem, deleteItem, adjustStock }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error("useInventory must be used within an InventoryProvider");
    }
    return context;
}
