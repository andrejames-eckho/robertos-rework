import Dexie, { type EntityTable } from 'dexie';

export interface User {
    id: string;
    name: string;
    pin: string;
    role: 'STANDARD' | 'ADMIN' | 'SUPER_ADMIN';
    created_at: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    low_stock_threshold: number;
    unit: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    item_id: string;
    item_name: string;
    user_id: string;
    user_name?: string;
    quantity_change: number;
    timestamp: string;
}

export interface AppSettings {
    id: string; // usually 'default'
    storeName: string;
    defaultLowStockThreshold: number;
    updated_at: string;
}

const db = new Dexie('StockTrackDB') as Dexie & {
    items: EntityTable<InventoryItem, 'id'>,
    transactions: EntityTable<Transaction, 'id'>,
    users: EntityTable<User, 'id'>,
    settings: EntityTable<AppSettings, 'id'>
};

// Increment version to 3 for the new settings table
db.version(3).stores({
    items: 'id, name, category',
    transactions: 'id, item_id, user_id, timestamp',
    users: 'id, name, pin, role',
    settings: 'id'
});

export { db };
