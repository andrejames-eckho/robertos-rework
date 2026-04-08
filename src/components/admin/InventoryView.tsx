"use client";

import { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { InventoryItem } from "@/lib/db";
import {
    Plus,
    Edit2,
    Trash2,
    History,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Local insert type matching Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
type ItemFormData = {
    name: string;
    category: string;
    quantity: number;
    low_stock_threshold: number;
    unit: string;
};

export function InventoryView() {
    const { items, addItem, updateItem, deleteItem, isLoading } = useInventory();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<ItemFormData>({
        name: "",
        category: "",
        quantity: 0,
        low_stock_threshold: 10,
        unit: "Units"
    });
    const router = useRouter();

    const sortedItems = [...items].sort((a, b) => {
        const aLow = a.quantity < a.low_stock_threshold;
        const bLow = b.quantity < b.low_stock_threshold;
        if (aLow && !bLow) return -1;
        if (!aLow && bLow) return 1;
        return a.name.localeCompare(b.name);
    });

    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await updateItem(editingItem.id, formData);
            } else {
                await addItem(formData);
            }
            setIsAddOpen(false);
            setEditingItem(null);
            setFormData({ name: "", category: "", quantity: 0, low_stock_threshold: 10, unit: "Units" });
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (item: InventoryItem) => {
        setItemToDelete(item);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteItem(itemToDelete.id);
            setItemToDelete(null);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete item.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            low_stock_threshold: item.low_stock_threshold,
            unit: item.unit
        });
        setIsAddOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Inventory Items</h2>
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        className="rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary"
                        onClick={() => router.push("/reports")}
                    >
                        <History className="w-5 h-5 mr-2" /> View Reports
                    </Button>
                    <Button
                        className="rounded-xl bg-primary hover:bg-primary/80"
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ name: "", category: "", quantity: 0, low_stock_threshold: 10, unit: "Units" });
                            setIsAddOpen(true);
                        }}
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New Item
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar rounded-xl border border-white/5">
                <Table>
                    <TableHeader className="bg-white/5 sticky top-0 z-10">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold">Item Name</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Category</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-center">Stock</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-center">Threshold</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-bold">
                                        <Loader2 className="animate-spin" /> LOADING INVENTORY...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                                    No items found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedItems.map((item) => (
                                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/10">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        <span className={item.quantity < item.low_stock_threshold ? "text-destructive" : "text-primary"}>
                                            {item.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground">{item.low_stock_threshold}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg hover:bg-primary/20 hover:text-primary"
                                                onClick={() => startEdit(item)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg hover:bg-destructive/20 hover:text-destructive"
                                                onClick={() => handleDelete(item)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) setEditingItem(null);
            }}>
                <DialogContent className="glass-dark border-white/10 rounded-3xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Update item details and thresholds." : "Create a new inventory item for tracking."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-bold opacity-70">Name</label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/10"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-bold opacity-70">Category</label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/10"
                                value={formData.category || ""}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-bold opacity-70">Stock</label>
                            <Input
                                type="number"
                                className="col-span-3 bg-white/5 border-white/10"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-bold opacity-70">Threshold</label>
                            <Input
                                type="number"
                                className="col-span-3 bg-white/5 border-white/10"
                                value={formData.low_stock_threshold}
                                onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-bold opacity-70">Unit</label>
                            <Input
                                className="col-span-3 bg-white/5 border-white/10"
                                value={formData.unit || ""}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/80 min-w-24" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingItem ? "Update Item" : "Create Item")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => {
                if (!open) setItemToDelete(null);
            }}>
                <DialogContent className="glass-dark border-white/10 rounded-[2rem] sm:max-w-md">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-destructive/20 text-destructive">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            Delete Item?
                        </DialogTitle>
                        <DialogDescription className="text-lg text-foreground">
                            Are you sure you want to permanently delete <b className="text-glow">{itemToDelete?.name}</b>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-between gap-4 mt-4">
                        <Button
                            variant="ghost"
                            className="h-14 px-8 rounded-2xl text-lg hover:bg-white/10"
                            onClick={() => setItemToDelete(null)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-14 px-8 rounded-2xl text-lg font-bold flex-1 bg-destructive hover:bg-destructive/80 transition-all active:scale-95"
                            onClick={confirmDelete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Delete Item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
