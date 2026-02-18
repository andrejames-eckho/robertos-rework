"use client";

import { useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { useUser } from "@/lib/user-context";
import { Icon } from "@/components/ui/icon";
import { format } from "date-fns";

interface TransactionSummaryCompactProps {
    dateRange?: { start?: Date; end?: Date };
}

export function TransactionSummaryCompact({ dateRange }: TransactionSummaryCompactProps) {
    const { transactions, isLoading } = useInventory();
    const { users } = useUser();

    // Filter transactions based on date range (same logic as TransactionReports)
    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

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
    }, [transactions, dateRange]);

    // Calculate summary stats based on filtered data
    const summaryStats = useMemo(() => {
        const total = filteredTransactions.length;
        const additions = filteredTransactions.filter(t => t.quantity_change > 0).length;
        const removals = filteredTransactions.filter(t => t.quantity_change < 0).length;
        return { total, additions, removals };
    }, [filteredTransactions]);

    return (
        <div className="flex items-center gap-3">
            <div className="glass-dark p-3 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Icon size={16} color="hsl(var(--primary))">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                    </Icon>
                </div>
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total</p>
                    <p className="text-lg font-black">{isLoading ? "..." : summaryStats.total}</p>
                </div>
            </div>
            
            <div className="glass-dark p-3 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Icon size={16} color="hsl(var(--primary))">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                            <polyline points="17 6 23 6 23 12"/>
                        </svg>
                    </Icon>
                </div>
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Adds</p>
                    <p className="text-lg font-black text-primary">{isLoading ? "..." : summaryStats.additions}</p>
                </div>
            </div>
            
            <div className="glass-dark p-3 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                    <Icon size={16} color="hsl(var(--destructive))">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                            <polyline points="17 18 23 18 23 12"/>
                        </svg>
                    </Icon>
                </div>
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Removes</p>
                    <p className="text-lg font-black text-destructive">{isLoading ? "..." : summaryStats.removals}</p>
                </div>
            </div>
            
            <div className="glass-dark p-3 rounded-xl flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <Icon size={16} color="hsl(var(--secondary))">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </Icon>
                </div>
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Range</p>
                    <p className="text-sm font-black">
                        {dateRange?.start && dateRange?.end 
                            ? `${format(dateRange.start, "MMM dd")} - ${format(dateRange.end, "MMM dd")}`
                            : dateRange?.start 
                                ? `From ${format(dateRange.start, "MMM dd")}`
                                : dateRange?.end 
                                    ? `Until ${format(dateRange.end, "MMM dd")}`
                                    : "All Time"
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
