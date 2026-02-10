export type InventoryItem = {
    id: string;
    name: string;
    category: string;
    quantity: number;
    lowStockThreshold: number;
    unit: string;
};

export type Transaction = {
    id: string;
    itemId: string;
    itemName: string;
    userId: string;
    quantityChange: number;
    timestamp: string;
};

export const MOCK_ITEMS: InventoryItem[] = [
    { id: "1", name: "Thermal Labels 4x6", category: "Shipping", quantity: 150, lowStockThreshold: 50, unit: "Rolls" },
    { id: "2", name: "Packing Tape - Clear", category: "Shipping", quantity: 12, lowStockThreshold: 20, unit: "Rolls" },
    { id: "3", name: "Cubble Wrap Large", category: "Shipping", quantity: 5, lowStockThreshold: 10, unit: "Rolls" },
    { id: "4", name: "AA Alkaline Batteries", category: "Electronics", quantity: 100, lowStockThreshold: 25, unit: "Pack" },
    { id: "5", name: "HDMI Cable 6ft", category: "Electronics", quantity: 8, lowStockThreshold: 10, unit: "Units" },
    { id: "6", name: "Kraft Envelopes #10", category: "Stationery", quantity: 500, lowStockThreshold: 100, unit: "Units" },
    { id: "7", name: "Staples Box 5000ct", category: "Stationery", quantity: 15, lowStockThreshold: 5, unit: "Boxes" },
    { id: "8", name: "Marker Pen - Black", category: "Stationery", quantity: 45, lowStockThreshold: 10, unit: "Units" },
    { id: "9", name: "AAA Batteries (Bulk)", category: "Electronics", quantity: 45, lowStockThreshold: 20, unit: "Packs" },
    { id: "10", name: "Bubble Wrap 50ft", category: "Shipping", quantity: 3, lowStockThreshold: 5, unit: "Rolls" },
    { id: "11", name: "A4 Printing Paper", category: "Stationery", quantity: 1200, lowStockThreshold: 200, unit: "Sheets" },
    { id: "12", name: "Safety Vests (XL)", category: "Safety", quantity: 12, lowStockThreshold: 15, unit: "Units" },
    { id: "13", name: "High Vis Tape", category: "Safety", quantity: 25, lowStockThreshold: 10, unit: "Rolls" },
    { id: "14", name: "Network Switch 8-Port", category: "Electronics", quantity: 2, lowStockThreshold: 3, unit: "Units" },
    { id: "15", name: "Standard Gaffer Tape", category: "Shipping", quantity: 18, lowStockThreshold: 10, unit: "Rolls" },
    { id: "16", name: "Cardboard Box (M)", category: "Shipping", quantity: 500, lowStockThreshold: 100, unit: "Units" },
];
