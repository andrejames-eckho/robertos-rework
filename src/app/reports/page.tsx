"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { TransactionReports } from "@/components/dashboard/TransactionReports";
import { TransactionSummaryCompact } from "@/components/dashboard/TransactionSummaryCompact";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";

export default function ReportsPage() {
    const router = useRouter();
    const { currentUser } = useUser();
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>();

    return (
        <div className="flex flex-col h-screen max-w-[95vw] mx-auto p-4 md:p-8 gap-4">
            {/* Header */}
            <header className="glass rounded-3xl p-6">
                <div className="flex flex-col gap-4">
                    {/* Navigation Row */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors flex items-center"
                                onClick={() => router.push("/dashboard")}
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" size={20} strokeWidth={2} absoluteStrokeWidth />
                                Back to Dashboard
                            </Button>
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                                <Icon size={24} color="hsl(var(--primary))">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="12" y1="18" x2="12" y2="12"/>
                                    </svg>
                                </Icon>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-glow">Transaction Reports</h1>
                                <p className="text-sm text-muted-foreground">Full transaction history and analytics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <TransactionSummaryCompact dateRange={dateRange} />
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Viewing as:</p>
                                <p className="text-primary font-bold">{currentUser?.name || "Loading..."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Transaction Reports - Full Width */}
            <div className="flex-1 overflow-hidden">
                <TransactionReports isFullView={true} dateRange={dateRange} setDateRange={setDateRange} />
            </div>
        </div>
    );
}
