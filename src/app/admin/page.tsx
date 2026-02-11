"use client";

import { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { useUser } from "@/lib/user-context";
import {
    PackagePlus,
    Settings,
    Users,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { InventoryView } from "@/components/admin/InventoryView";
import { UserManagement } from "@/components/admin/UserManagement";
import { AppSettingsView } from "@/components/admin/AppSettings";

export default function AdminPage() {
    const { currentUser } = useUser();
    const [activeView, setActiveView] = useState<"INVENTORY" | "USERS" | "SETTINGS">("INVENTORY");
    const router = useRouter();

    const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

    return (
        <div className="flex flex-col h-screen max-w-7xl mx-auto p-4 md:p-8 gap-6 max-h-screen overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center glass rounded-3xl p-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-white/10"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="w-6 h-6" size={24} strokeWidth={2} absoluteStrokeWidth />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-glow">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground mr-4">
                            {activeView === "INVENTORY" && "Manage Inventory & Reports"}
                            {activeView === "USERS" && "Manage System Users"}
                            {activeView === "SETTINGS" && "Application Configuration"}
                        </p>
                        {currentUser && (
                            <Badge variant="outline" className="border-primary/50 text-primary">
                                {currentUser.role.replace('_', ' ')}
                            </Badge>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-hidden">
                {/* Sidebar Nav */}
                <aside className="glass-dark rounded-3xl p-4 flex flex-col gap-2 h-fit">
                    <button
                        className={`w-full justify-start h-12 rounded-xl transition-all flex items-center px-4 gap-3 ${activeView === "INVENTORY" ? "bg-primary text-white" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                        onClick={() => setActiveView("INVENTORY")}
                    >
                        <PackagePlus className="w-5 h-5" size={20} strokeWidth={2} absoluteStrokeWidth />
                        <span className="font-medium">Inventory Management</span>
                    </button>
                    <button
                        className={`w-full justify-start h-12 rounded-xl transition-all flex items-center px-4 gap-3 ${activeView === "USERS" ? "bg-primary text-white" : "text-white/70 hover:text-white hover:bg-white/5"} ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setActiveView("USERS")}
                        disabled={!isSuperAdmin}
                    >
                        <Users className="w-5 h-5" size={20} strokeWidth={2} absoluteStrokeWidth />
                        <span className="font-medium">User Management</span>
                    </button>
                    <button
                        className={`w-full justify-start h-12 rounded-xl transition-all flex items-center px-4 gap-3 ${activeView === "SETTINGS" ? "bg-primary text-white" : "text-white/70 hover:text-white hover:bg-white/5"} ${!isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => setActiveView("SETTINGS")}
                        disabled={!isSuperAdmin}
                    >
                        <Settings className="w-5 h-5" size={20} strokeWidth={2} absoluteStrokeWidth />
                        <span className="font-medium">App Settings</span>
                    </button>
                </aside>

                {/* Main View Area */}
                <main className="md:col-span-3 glass-dark rounded-3xl p-6 overflow-hidden flex flex-col">
                    {activeView === "INVENTORY" && <InventoryView />}
                    {activeView === "USERS" && <UserManagement />}
                    {activeView === "SETTINGS" && <AppSettingsView />}
                </main>
            </div>
        </div>
    );
}
