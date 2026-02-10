"use client";

import { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { InventoryItem } from "@/lib/db";
import {
    PackagePlus,
    Settings,
    Users,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    History,
    Loader2
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

export default function AdminPage() {
    const { items, addItem, updateItem, deleteItem, isLoading } = useInventory();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<ItemFormData>({
        name: "",
        category: "",
        quantity: 0,
        low_stock_threshold: 10,
        unit: "Units"
    });
    const router = useRouter();

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        await deleteItem(id);
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
        <div className="flex flex-col h-screen max-w-7xl mx-auto p-4 md:p-8 gap-6 max-h-screen overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center glass rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-white/10"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-glow">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground">Manage Inventory & Reports</p>
                    </div>
                </div>
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
            </header>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-hidden">
                {/* Sidebar Nav */}
                <aside className="glass-dark rounded-3xl p-4 flex flex-col gap-2 h-fit">
                    <Button variant="ghost" className="justify-start h-12 rounded-xl bg-primary/10 text-primary">
                        <PackagePlus className="w-5 h-5 mr-3" /> Inventory Management
                    </Button>
                    <Button variant="ghost" className="justify-start h-12 rounded-xl text-muted-foreground opacity-50 cursor-not-allowed">
                        <Users className="w-5 h-5 mr-3" /> User Management
                    </Button>
                    <Button variant="ghost" className="justify-start h-12 rounded-xl text-muted-foreground opacity-50 cursor-not-allowed">
                        <Settings className="w-5 h-5 mr-3" /> App Settings
                    </Button>
                </aside>

                {/* Item Table View */}
                <main className="md:col-span-3 glass-dark rounded-3xl p-6 flex flex-col gap-4 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Inventory Items</h2>
                        <Badge variant="secondary" className="bg-white/5">{items.length} Total Items</Badge>
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
                                    items.map((item) => (
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
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                        onClick={() => handleDelete(item.id)}
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
                </main>
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
        </div>
    );
}
