"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, AlertTriangle, LogOut, Package, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { TransactionReports } from "@/components/dashboard/TransactionReports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
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
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useInventory } from "@/lib/inventory-context";
import { useRouter } from "next/navigation";
import { InventoryItem } from "@/lib/db";
import { useUser } from "@/lib/user-context";

export default function DashboardPage() {
    const { items, adjustStock, isLoading } = useInventory();
    const { currentUser, logout } = useUser();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<"+" | "-">("+");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"inventory" | "reports">("inventory");
    const router = useRouter();

    const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === "All" || item.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, category]);

    const handleAdjustClick = (item: InventoryItem, type: "+" | "-") => {
        setSelectedItem(item);
        setAdjustmentType(type);
        setAdjustAmount("");
    };

    const handleConfirmAdjustment = async () => {
        if (!selectedItem || !adjustAmount || isSubmitting || !currentUser) return;

        const amount = parseInt(adjustAmount);
        if (isNaN(amount) || amount <= 0) return;

        setIsSubmitting(true);
        try {
            await adjustStock(selectedItem.id, adjustmentType === "+" ? amount : -amount, currentUser.id);
            setSelectedItem(null);
            setAdjustAmount("");
        } catch (error) {
            console.error("Adjustment failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignOut = () => {
        logout();
        router.push("/auth");
    };

    return (
        <div className="flex flex-col h-screen max-w-7xl mx-auto p-4 md:p-8 gap-6">
            {/* Header */}
            <header className="flex justify-between items-center glass rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                        <Icon size={24} color="hsl(var(--primary))">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                        </Icon>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-glow">Roberto's Inventory</h1>
                        <p className="text-sm text-muted-foreground">Logged in as: <span className="text-primary font-bold">{currentUser?.name || "Loading..."}</span></p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 p-1 rounded-xl flex gap-1 mr-4 border border-white/5">
                        <button
                            className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center min-w-[120px] ${activeTab === "inventory" ? "bg-primary text-white" : "text-white/70 hover:text-white"}`}
                            onClick={() => setActiveTab("inventory")}
                        >
                            <Package className="w-4 h-4 mr-2" size={16} strokeWidth={2} absoluteStrokeWidth />
                            <span className="font-medium">Inventory</span>
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center min-w-[120px] ${activeTab === "reports" ? "bg-primary text-white" : "text-white/70 hover:text-white"}`}
                            onClick={() => setActiveTab("reports")}
                        >
                            <HistoryIcon className="w-4 h-4 mr-2" size={16} strokeWidth={2} absoluteStrokeWidth />
                            <span className="font-medium">Reports</span>
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors flex items-center"
                        onClick={() => router.push("/admin")}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ShieldCheck className="w-5 h-5" size={20} strokeWidth={2} absoluteStrokeWidth style={{ flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ display: 'inline-block' }}>Manager Panel</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="rounded-xl hover:bg-destructive/10 hover:text-destructive group flex items-center"
                        onClick={handleSignOut}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" size={20} strokeWidth={2} absoluteStrokeWidth style={{ flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ display: 'inline-block' }}>Sign Out</span>
                    </Button>
                </div>
            </header>

            {activeTab === "inventory" ? (
                <>
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} strokeWidth={2} absoluteStrokeWidth />
                            <Input
                                placeholder="Search items, labels, or fields..."
                                className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full md:w-[240px] !h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary focus:border-primary transition-all">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="glass-dark border-white/10 rounded-xl">
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat}
                                        value={cat}
                                        className="focus:bg-primary/20 focus:text-primary cursor-pointer"
                                    >
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Inventory List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <div className="col-span-full py-20 flex justify-center">
                                        <div className="text-primary animate-pulse text-lg font-bold tracking-tighter uppercase">Loading Inventory...</div>
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                                        <Package className="w-12 h-12 text-muted-foreground opacity-20" size={48} strokeWidth={2} absoluteStrokeWidth />
                                        <div className="text-muted-foreground text-lg italic">No items found matching your search.</div>
                                    </div>
                                ) : (
                                    filteredItems.map((item) => {
                                        const IsLowStock = item.quantity < item.low_stock_threshold;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`glass-dark p-6 rounded-3xl flex flex-col gap-4 border transition-all duration-500 ${IsLowStock ? "border-destructive/30 shadow-[0_0_30px_rgba(255,0,0,0.1)]" : "border-white/5"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-glow leading-tight">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                                                    </div>
                                                    {IsLowStock && (
                                                        <Badge variant="destructive" className="animate-pulse rounded-lg px-2 shrink-0">
                                                            <AlertTriangle className="w-3 h-3 mr-1" size={12} strokeWidth={2} absoluteStrokeWidth /> Low Stock
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-end justify-between mt-auto">
                                                    <div>
                                                        <span className={`text-5xl font-black ${IsLowStock ? "text-destructive" : "text-primary"}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-muted-foreground ml-2 uppercase text-xs font-bold tracking-widest">
                                                            {item.unit}
                                                        </span>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-16 w-16 rounded-2xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary transition-all active:scale-95 shadow-inner"
                                                            onClick={() => handleAdjustClick(item, "-")}
                                                        >
                                                            <Minus className="w-8 h-8" size={32} strokeWidth={2} absoluteStrokeWidth />
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-16 w-16 rounded-2xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary transition-all active:scale-95 shadow-inner"
                                                            onClick={() => handleAdjustClick(item, "+")}
                                                        >
                                                            <Plus className="w-8 h-8" size={32} strokeWidth={2} absoluteStrokeWidth />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </>
            ) : (
                <TransactionReports />
            )}

            {/* Adjust stock popup */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="glass-dark border-white/10 rounded-[2rem] sm:max-w-md">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${adjustmentType === '+' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                                {adjustmentType === '+' ? <Plus size={24} strokeWidth={2} absoluteStrokeWidth /> : <Minus size={24} strokeWidth={2} absoluteStrokeWidth />}
                            </div>
                            Adjust Stock
                        </DialogTitle>
                        <DialogDescription className="text-lg text-foreground">
                            {adjustmentType === '+' ? 'Adding' : 'Removing'} quantity for <b className="text-glow">{selectedItem?.name}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8">
                        <Input
                            type="number"
                            placeholder="0"
                            className="text-center text-4xl h-24 bg-white/5 border-white/10 rounded-2xl focus:ring-primary font-black"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="sm:justify-between gap-4">
                        <Button
                            variant="ghost"
                            className="h-14 px-8 rounded-2xl text-lg hover:bg-white/10"
                            onClick={() => setSelectedItem(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`h-14 px-8 rounded-2xl text-lg font-bold flex-1 ${adjustmentType === '+' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}
                            onClick={handleConfirmAdjustment}
                        >
                            Confirm Adjustment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
