"use client";

import { useState, useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { useUser } from "@/lib/user-context";
import {
    Download,
    Search,
    Calendar as CalendarIcon,
    Loader2,
    Filter,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { DateRangePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function TransactionReports() {
    const { transactions, isLoading, items } = useInventory();
    const { users } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>();
    const [showFilters, setShowFilters] = useState(false);

    // Filter transactions based on search and date range
    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => {
                const item = items.find(i => i.id === t.item_id);
                const unit = item?.unit || '';
                return t.item_name.toLowerCase().includes(query) ||
                       unit.toLowerCase().includes(query) ||
                       users.find(u => u.id === t.user_id)?.name.toLowerCase().includes(query);
            });
        }

        // Apply date range filter
        if (dateRange?.start || dateRange?.end) {
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.timestamp);
                if (dateRange?.start && transactionDate < dateRange.start) return false;
                if (dateRange?.end && transactionDate > dateRange.end) return false;
                return true;
            });
        }

        return filtered;
    }, [transactions, searchQuery, dateRange, users, items]);

    // Calculate summary stats based on filtered data
    const summaryStats = useMemo(() => {
        const total = filteredTransactions.length;
        const additions = filteredTransactions.filter(t => t.quantity_change > 0).length;
        const removals = filteredTransactions.filter(t => t.quantity_change < 0).length;
        return { total, additions, removals };
    }, [filteredTransactions]);

    const quickFilterToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDateRange({ start: today, end: tomorrow });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDateRange(undefined);
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Logs</p>
                        <h3 className="text-3xl font-black mt-1">
                            {isLoading ? "..." : summaryStats.total}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                        <Icon size={24} color="hsl(var(--primary))">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                            </svg>
                        </Icon>
                    </div>
                </div>
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Additions</p>
                        <h3 className="text-3xl font-black mt-1 text-primary">
                            {isLoading ? "..." : summaryStats.additions}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                        <Icon size={24} color="hsl(var(--primary))">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                <polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </Icon>
                    </div>
                </div>
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Removals</p>
                        <h3 className="text-3xl font-black mt-1 text-destructive">
                            {isLoading ? "..." : summaryStats.removals}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-destructive/20 rounded-2xl flex items-center justify-center">
                        <Icon size={24} color="hsl(var(--destructive))">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                                <polyline points="17 18 23 18 23 12"/>
                            </svg>
                        </Icon>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 glass-dark rounded-3xl p-6 flex flex-col gap-4 overflow-hidden">
                {/* Search and Filter Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative group flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" size={18} strokeWidth={2} absoluteStrokeWidth />
                            <Input
                                placeholder="Search by item or user..."
                                className="pl-10 bg-white/5 border-white/10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="rounded-xl border border-white/5 bg-white/5 flex items-center gap-2"
                                onClick={quickFilterToday}
                            >
                                <CalendarIcon className="w-4 h-4" size={16} strokeWidth={2} absoluteStrokeWidth />
                                <span>Today</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-xl border border-white/5 bg-white/5 flex items-center gap-2"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="w-4 h-4" size={16} strokeWidth={2} absoluteStrokeWidth />
                                <span>Filters</span>
                                {(searchQuery || dateRange) && (
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                className="rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary opacity-50 cursor-not-allowed flex items-center gap-2"
                                disabled
                            >
                                <Download className="w-4 h-4" size={16} strokeWidth={2} absoluteStrokeWidth />
                                <span>Export</span>
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Filter Section */}
                    {showFilters && (
                        <div className="glass-dark rounded-2xl p-4 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-white">Filter Options</h3>
                                {(searchQuery || dateRange) && (
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Date Range</label>
                                    <DateRangePicker
                                        value={dateRange}
                                        onChange={setDateRange}
                                        placeholder="Select date range"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white mb-2 block">Quick Filters</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={quickFilterToday}
                                            className="border-white/10 bg-white/5 hover:bg-white/10"
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date();
                                                const yesterday = new Date(today);
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                yesterday.setHours(0, 0, 0, 0);
                                                today.setHours(0, 0, 0, 0);
                                                setDateRange({ start: yesterday, end: today });
                                            }}
                                            className="border-white/10 bg-white/5 hover:bg-white/10"
                                        >
                                            Yesterday
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date();
                                                const weekAgo = new Date(today);
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                weekAgo.setHours(0, 0, 0, 0);
                                                setDateRange({ start: weekAgo, end: today });
                                            }}
                                            className="border-white/10 bg-white/5 hover:bg-white/10"
                                        >
                                            This Week
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date();
                                                const monthAgo = new Date(today);
                                                monthAgo.setMonth(monthAgo.getMonth() - 1);
                                                monthAgo.setHours(0, 0, 0, 0);
                                                setDateRange({ start: monthAgo, end: today });
                                            }}
                                            className="border-white/10 bg-white/5 hover:bg-white/10"
                                        >
                                            This Month
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(searchQuery || dateRange) && (
                                <div className="pt-2 border-t border-white/5">
                                    <p className="text-xs text-white mb-2">Active Filters:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {searchQuery && (
                                            <Badge variant="secondary" className="bg-primary/20 text-white border-primary/30">
                                                Search: &quot;{searchQuery}&quot;
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
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-white/5">
                    <div className="overflow-auto no-scrollbar flex-1">
                        <table className="w-full caption-bottom text-sm">
                            <thead 
                                className="sticky top-0 z-20"
                                style={{ 
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 20,
                                    backgroundColor: 'hsl(0 0% 8%)',
                                    backdropFilter: 'none'
                                }}
                            >
                                <tr className="border-white/5 hover:bg-transparent">
                                    <th className="text-white h-10 px-2 text-left align-middle whitespace-nowrap sticky" style={{ position: 'sticky', top: 0, zIndex: 20 }}>Timestamp</th>
                                    <th className="text-white h-10 px-2 text-left align-middle whitespace-nowrap sticky" style={{ position: 'sticky', top: 0, zIndex: 20 }}>User</th>
                                    <th className="text-white h-10 px-2 text-left align-middle whitespace-nowrap sticky" style={{ position: 'sticky', top: 0, zIndex: 20 }}>Item</th>
                                    <th className="text-white h-10 px-2 text-center align-middle whitespace-nowrap sticky" style={{ position: 'sticky', top: 0, zIndex: 20 }}>Change</th>
                                    <th className="text-white h-10 px-2 text-right align-middle whitespace-nowrap sticky" style={{ position: 'sticky', top: 0, zIndex: 20 }}>ID</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-bold">
                                            <Loader2 className="w-5 h-5 animate-spin" size={20} strokeWidth={2} absoluteStrokeWidth />
                                            <span>LOADING REPORTS...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground h-48">
                                        {transactions.length === 0 
                                            ? "No transactions recorded yet." 
                                            : "No transactions match your filters."}
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => {
                                    const item = items.find(i => i.id === t.item_id);
                                    const unit = item?.unit || '';
                                    return (
                                    <tr key={t.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="text-xs font-mono opacity-70">
                                            {format(new Date(t.timestamp), "MMM dd, HH:mm:ss")}
                                        </td>
                                        <td className="font-bold">
                                            {users.find(u => u.id === t.user_id)?.name || t.user_id}
                                        </td>
                                        <td>
                                            <div>
                                                <span>{t.item_name}</span>
                                                {unit && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({unit})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <Badge
                                                variant={t.quantity_change > 0 ? "default" : "destructive"}
                                                className={`rounded-lg px-2 ${t.quantity_change > 0 ? "bg-primary text-primary-foreground border-primary" : ""}`}
                                            >
                                                {t.quantity_change > 0 ? "+" : ""}{t.quantity_change}
                                            </Badge>
                                        </td>
                                        <td className="text-right text-[10px] font-mono opacity-30">
                                            #{t.id.slice(0, 8)}
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
