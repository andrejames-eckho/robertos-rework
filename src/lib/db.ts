import Dexie, { type EntityTable } from 'dexie';

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
    quantity_change: number;
    timestamp: string;
}

const db = new Dexie('StockTrackDB') as Dexie & {
    items: EntityTable<InventoryItem, 'id'>,
    transactions: EntityTable<Transaction, 'id'>
};

db.version(1).stores({
    items: 'id, name, category',
    transactions: 'id, item_id, user_id, timestamp'
});

export { db };
