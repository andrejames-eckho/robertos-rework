"use client";

import { useInventory } from "@/lib/inventory-context";
import {
    ArrowLeft,
    Download,
    Search,
    Calendar as CalendarIcon,
    TrendingDown,
    TrendingUp,
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
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ReportsPage() {
    const { transactions, isLoading } = useInventory();
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen max-w-7xl mx-auto p-4 md:p-8 gap-6 max-h-screen overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center glass rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-white/10"
                        onClick={() => router.push("/admin")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-glow">Transaction Reports</h1>
                        <p className="text-sm text-muted-foreground">Detailed history of stock movements</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        className="rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary opacity-50 cursor-not-allowed"
                        disabled
                    >
                        <Download className="w-5 h-5 mr-2" /> Export CSV
                    </Button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Logs</p>
                        <h3 className="text-3xl font-black mt-1">
                            {isLoading ? "..." : transactions.length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <History className="text-primary w-6 h-6" />
                    </div>
                </div>
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Additions</p>
                        <h3 className="text-3xl font-black mt-1 text-primary">
                            {isLoading ? "..." : transactions.filter(t => t.quantity_change > 0).length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="text-primary w-6 h-6" />
                    </div>
                </div>
                <div className="glass-dark p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Removals</p>
                        <h3 className="text-3xl font-black mt-1 text-destructive">
                            {isLoading ? "..." : transactions.filter(t => t.quantity_change < 0).length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
                        <TrendingDown className="text-destructive w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <main className="flex-1 glass-dark rounded-3xl p-6 flex flex-col gap-4 overflow-hidden">
                <div className="flex justify-between items-center">
                    <div className="relative group w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by item or user..."
                            className="pl-10 bg-white/5 border-white/10 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="rounded-xl border border-white/5 bg-white/5">
                            <CalendarIcon className="w-4 h-4 mr-2" /> Today
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
                                            <Loader2 className="animate-spin" /> LOADING REPORTS...
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
                                        <TableCell className="font-bold">{t.user_id}</TableCell>
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
            </main>
        </div>
    );
}
