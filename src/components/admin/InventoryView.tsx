"use client";

import { useState, useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { useUser } from "@/lib/user-context";
import { InventoryItem } from "@/lib/db";
import {
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertTriangle,
    Tags,
    Filter,
    X,
    Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-picker";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, isToday, subDays } from "date-fns";

// Local insert type matching Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
type ItemFormData = {
    name: string;
    category: string;
    quantity: number;
    low_stock_threshold: number;
    unit: string;
};

export function InventoryView() {
    const { items, categories, addItem, addCategory, deleteCategory, updateItem, deleteItem, isLoading } = useInventory();
    const { currentUser } = useUser();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [stockFilter, setStockFilter] = useState<string>("all");
    const [formData, setFormData] = useState<ItemFormData>({
        name: "",
        category: "",
        quantity: 0,
        low_stock_threshold: 10,
        unit: "Units"
    });

    // Filter items based on search, date, category, and stock level
    const filteredItems = useMemo(() => {
        let filtered = items;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.unit.toLowerCase().includes(query)
            );
        }

        // Apply date range filter
        if (dateRange?.start || dateRange?.end) {
            filtered = filtered.filter(item => {
                const createdDate = new Date(item.created_at);
                const updatedDate = new Date(item.updated_at);
                
                // Check if either created or updated date falls within range
                const inRange = (!dateRange?.start || (isAfter(createdDate, dateRange.start) || isAfter(updatedDate, dateRange.start))) &&
                               (!dateRange?.end || (isBefore(createdDate, dateRange.end) || isBefore(updatedDate, dateRange.end)));
                
                return inRange;
            });
        }

        // Apply category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Apply stock filter
        if (stockFilter === "low") {
            filtered = filtered.filter(item => item.quantity < item.low_stock_threshold);
        } else if (stockFilter === "out") {
            filtered = filtered.filter(item => item.quantity === 0);
        } else if (stockFilter === "in_stock") {
            filtered = filtered.filter(item => item.quantity > 0 && item.quantity >= item.low_stock_threshold);
        }

        return filtered;
    }, [items, searchQuery, dateRange, selectedCategory, stockFilter]);

    const clearFilters = () => {
        setSearchQuery("");
        setDateRange(undefined);
        setSelectedCategory("all");
        setStockFilter("all");
    };

    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await updateItem(editingItem.id, formData);
            } else {
                await addItem(formData, currentUser?.id);
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

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsSubmitting(true);
        try {
            await addCategory(newCategoryName.trim());
            setNewCategoryName("");
        } catch (error) {
            console.error("Failed to add category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Delete this category?")) return;
        setIsSubmitting(true);
        try {
            await deleteCategory(id);
        } catch (error) {
            console.error("Failed to delete category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            {/* Header with Search and Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Inventory Items</h2>
                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            className="rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary"
                            onClick={() => setIsCategoryManagerOpen(true)}
                        >
                            <Tags className="w-5 h-5 mr-2" /> Manage Categories
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

                {/* Search and Filter Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative group flex-1 max-w-sm">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" size={18} strokeWidth={2} absoluteStrokeWidth />
                            <Input
                                placeholder="Search items..."
                                className="pl-10 bg-white/5 border-white/10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="rounded-xl border border-white/5 bg-white/5 flex items-center gap-2"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <CalendarIcon className="w-4 h-4" size={16} strokeWidth={2} absoluteStrokeWidth />
                                <span>Filters</span>
                                {(searchQuery || dateRange || selectedCategory !== "all" || stockFilter !== "all") && (
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Filter Section */}
                    {showFilters && (
                        <div className="glass-dark rounded-2xl p-4 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Filter Options</h3>
                                {(searchQuery || dateRange || selectedCategory !== "all" || stockFilter !== "all") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-white hover:text-primary flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Date Range</label>
                                    <DateRangePicker
                                        value={dateRange}
                                        onChange={setDateRange}
                                        placeholder="Select date range"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Category</label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Stock Level</label>
                                    <Select value={stockFilter} onValueChange={setStockFilter}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="All items" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Items</SelectItem>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="low">Low Stock</SelectItem>
                                            <SelectItem value="out">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(searchQuery || dateRange || selectedCategory !== "all" || stockFilter !== "all") && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-xs text-white mb-2">Active Filters:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {searchQuery && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                Search: "{searchQuery}"
                                            </Badge>
                                        )}
                                        {dateRange?.start && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                From: {format(dateRange.start, "MMM dd, yyyy")}
                                            </Badge>
                                        )}
                                        {dateRange?.end && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                To: {format(dateRange.end, "MMM dd, yyyy")}
                                            </Badge>
                                        )}
                                        {selectedCategory !== "all" && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                Category: {selectedCategory}
                                            </Badge>
                                        )}
                                        {stockFilter !== "all" && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                Stock: {stockFilter.replace("_", " ")}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar rounded-xl border border-white/5">
                <Table>
                    <TableHeader className="bg-white/5 sticky top-0 z-10">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold">Item Name</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Category</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-center">Unit</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-center">Stock</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-center">Threshold</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Created</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-20">
                                    <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-bold">
                                        <Loader2 className="animate-spin" /> LOADING INVENTORY...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                                        {items.length === 0 ? "No items found. Add one to get started." : "No items match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map((item) => (
                                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/10">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                        {item.unit}
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        <span className={item.quantity < item.low_stock_threshold ? "text-destructive" : "text-primary"}>
                                            {item.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground">{item.low_stock_threshold}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(item.created_at), "MMM dd, yyyy")}
                                    </TableCell>
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
                            <div className="col-span-3">
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                <DialogContent className="glass-dark border-white/10 rounded-4xl sm:max-w-md">
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
            {/* Category Manager Dialog */}
            <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
                <DialogContent className="glass-dark border-white/10 rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Manage Categories</DialogTitle>
                        <DialogDescription>
                            Add or remove categories for inventory items.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim() || isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.length === 0 ? (
                                <p className="text-center text-muted-foreground italic py-4">No categories yet.</p>
                            ) : (
                                categories.map((cat) => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <span className="font-medium">{cat.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/20"
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
