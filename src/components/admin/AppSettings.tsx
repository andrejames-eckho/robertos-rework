"use client";

import { useState, useRef } from "react";
import { useSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, Download, Upload, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export function AppSettingsView() {
    const { settings, updateSettings, exportData, importData, resetDatabase, isLoading } = useSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        storeName: settings?.storeName || "",
        defaultLowStockThreshold: settings?.defaultLowStockThreshold || 10
    });

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await updateSettings(formData);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportData();
            const filename = `stocktrack_backup_${new Date().toISOString().split('T')[0]}.json`;

            if (Capacitor.isNativePlatform()) {
                const result = await Filesystem.writeFile({
                    path: filename,
                    data: data,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });
                
                await Share.share({
                    title: 'StockTrack Backup',
                    text: 'Here is my StockTrack Database Backup',
                    url: result.uri,
                    dialogTitle: 'Export Database Backup',
                });
            } else {
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
            await importData(text);
            alert("Data restored successfully! The page will reload.");
            window.location.reload();
        } catch (error) {
            console.error("Import failed:", error);
            alert("Failed to import data. Please check the file format.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar pb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                App Settings
            </h2>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card className="glass-dark border-white/10">
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                        <CardDescription>Manage global application settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold opacity-70">Store Name</label>
                            <Input
                                className="bg-white/5 border-white/10"
                                value={formData.storeName}
                                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                placeholder="Store Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-bold opacity-70">Default Low Stock Threshold</label>
                            <Input
                                type="number"
                                className="bg-white/5 border-white/10"
                                value={formData.defaultLowStockThreshold}
                                onChange={(e) => setFormData({ ...formData, defaultLowStockThreshold: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-primary hover:bg-primary/80">
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="glass-dark border-white/10">
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Backup and restore your data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-16 border-white/10 hover:bg-white/5 flex flex-col gap-1 items-center justify-center"
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? <Loader2 className="animate-spin w-5 h-5 mb-1" /> : <Download className="w-5 h-5 mb-1" />}
                                <span className="font-bold">Export Backup</span>
                                <span className="text-xs text-muted-foreground font-normal">Download JSON file</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex-1 h-16 border-white/10 hover:bg-white/5 flex flex-col gap-1 items-center justify-center"
                                onClick={handleImportClick}
                                disabled={isImporting}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleFileChange}
                                />
                                {isImporting ? <Loader2 className="animate-spin w-5 h-5 mb-1" /> : <Upload className="w-5 h-5 mb-1" />}
                                <span className="font-bold">Restore Data</span>
                                <span className="text-xs text-muted-foreground font-normal">Import from JSON</span>
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <Button
                                variant="destructive"
                                className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"
                                onClick={() => setShowResetConfirm(true)}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Reset Database
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reset Confirmation Dialog */}
            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent className="glass-dark border-white/10 rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            Reset Database?
                        </DialogTitle>
                        <DialogDescription>
                            This will wipe ALL data including inventory, transactions, and users (except defaults). This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" disabled={isResetting} onClick={async () => {
                            setIsResetting(true);
                            try {
                                await resetDatabase();
                                setShowResetConfirm(false);
                                window.location.reload();
                            } catch (error) {
                                console.error("Reset failed:", error);
                                alert("Failed to reset database.");
                                setIsResetting(false);
                            }
                        }}>
                            {isResetting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Confirm Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
