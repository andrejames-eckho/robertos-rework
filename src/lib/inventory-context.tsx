"use client";

import React, { createContext, useContext, useState } from "react";
import { InventoryItem, Transaction, MOCK_ITEMS } from "./mock-data";

interface InventoryContextType {
    items: InventoryItem[];
    transactions: Transaction[];
    addItem: (item: Omit<InventoryItem, "id">) => void;
    updateItem: (id: string, updates: Partial<InventoryItem>) => void;
    deleteItem: (id: string) => void;
    adjustStock: (itemId: string, quantityChange: number, userId: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const addItem = (newItem: Omit<InventoryItem, "id">) => {
        const item: InventoryItem = {
            ...newItem,
            id: Math.random().toString(36).substr(2, 9),
        };
        setItems((prev) => [...prev, item]);
    };

    const updateItem = (id: string, updates: Partial<InventoryItem>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
    };

    const deleteItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const adjustStock = (itemId: string, quantityChange: number, userId: string) => {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        setItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + quantityChange } : i
            )
        );

        const newTransaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            itemId,
            itemName: item.name,
            userId,
            quantityChange,
            timestamp: new Date().toISOString(),
        };

        setTransactions((prev) => [newTransaction, ...prev]);
    };

    return (
        <InventoryContext.Provider value={{ items, transactions, addItem, updateItem, deleteItem, adjustStock }}>
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
