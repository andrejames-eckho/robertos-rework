"use client";

import { useInventory } from "@/lib/inventory-context";
import { useUser } from "@/lib/user-context";
import {
    Download,
    Search,
    Calendar as CalendarIcon,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function TransactionReports() {
    const { transactions, isLoading } = useInventory();
    const { users } = useUser();

    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden">
            {/* Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Logs</p>
                        <h3 className="text-3xl font-black mt-1">
                            {isLoading ? "..." : transactions.length}
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
                            {isLoading ? "..." : transactions.filter(t => t.quantity_change > 0).length}
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
                            {isLoading ? "..." : transactions.filter(t => t.quantity_change < 0).length}
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
                <div className="flex justify-between items-center">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" size={18} strokeWidth={2} absoluteStrokeWidth />
                        <Input
                            placeholder="Search by item or user..."
                            className="pl-10 bg-white/5 border-white/10 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="rounded-xl border border-white/5 bg-white/5 flex items-center gap-2"
                        >
                            <CalendarIcon className="w-4 h-4" size={16} strokeWidth={2} absoluteStrokeWidth />
                            <span>Today</span>
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

                <div className="flex-1 overflow-auto no-scrollbar rounded-xl border border-white/5">
                    <Table>
                        <TableHeader className="bg-white/5 sticky top-0 z-10">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-muted-foreground font-bold">Timestamp</TableHead>
                                <TableHead className="text-muted-foreground font-bold">User</TableHead>
                                <TableHead className="text-muted-foreground font-bold">Item</TableHead>
                                <TableHead className="text-muted-foreground font-bold text-center">Change</TableHead>
                                <TableHead className="text-muted-foreground font-bold text-right">ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20">
                                        <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-bold">
                                            <Loader2 className="w-5 h-5 animate-spin" size={20} strokeWidth={2} absoluteStrokeWidth />
                                            <span>LOADING REPORTS...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground h-48">
                                        No transactions recorded yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="text-xs font-mono opacity-70">
                                            {format(new Date(t.timestamp), "MMM dd, HH:mm:ss")}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {users.find(u => u.id === t.user_id)?.name || t.user_id}
                                        </TableCell>
                                        <TableCell>{t.item_name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={t.quantity_change > 0 ? "default" : "destructive"}
                                                className={`rounded-lg px-2 ${t.quantity_change > 0 ? "bg-primary/20 text-primary border-primary/20" : ""}`}
                                            >
                                                {t.quantity_change > 0 ? "+" : ""}{t.quantity_change}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-[10px] font-mono opacity-30">
                                            #{t.id.slice(0, 8)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
