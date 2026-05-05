import Dexie, { type EntityTable } from 'dexie';
import { generateSalt, hashPin } from './crypto';

export interface User {
    id: string;
    name: string;
    pin: string;      // PBKDF2 hash (base64)
    pin_salt: string; // random salt (base64)
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
    recoveryTotpSecret?: string;
}

export interface Category {
    id: string;
    name: string;
}

const db = new Dexie('StockTrackDB') as Dexie & {
    items: EntityTable<InventoryItem, 'id'>,
    transactions: EntityTable<Transaction, 'id'>,
    users: EntityTable<User, 'id'>,
    settings: EntityTable<AppSettings, 'id'>,
    categories: EntityTable<Category, 'id'>
};

db.version(4).stores({
    items: 'id, name, category',
    transactions: 'id, item_id, user_id, timestamp',
    users: 'id, name, pin, role',
    settings: 'id',
    categories: 'id, name'
});

// Version 5: add pin_salt field; migrate existing plaintext PINs to PBKDF2 hashes
db.version(5).stores({
    items: 'id, name, category',
    transactions: 'id, item_id, user_id, timestamp',
    users: 'id, name, pin, pin_salt, role',
    settings: 'id',
    categories: 'id, name'
}).upgrade(async tx => {
    const usersTable = tx.table<User, string>('users');
    const users = await usersTable.toArray();
    for (const user of users) {
        if (!user.pin_salt) {
            const salt = generateSalt();
            const hash = await hashPin(user.pin, salt);
            await usersTable.update(user.id, { pin: hash, pin_salt: salt });
        }
    }
});

export { db };
