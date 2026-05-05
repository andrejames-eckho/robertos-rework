"use client";

import { useState, useRef } from "react";
import { useSettings } from "@/lib/settings-context";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, Download, Upload, Loader2, RefreshCw, AlertTriangle, ShieldAlert, Copy, Check } from "lucide-react";
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
import { totpUri } from "@/lib/crypto";

export function AppSettingsView() {
    const { settings, updateSettings, exportData, importData, resetDatabase, regenerateRecoverySecret, isLoading } = useSettings();
    const { currentUser } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedUri, setCopiedUri] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const totpSecret = settings?.recoveryTotpSecret;
    const formattedSecret = totpSecret
        ? totpSecret.match(/.{1,4}/g)?.join(' ') ?? totpSecret
        : '';
    const otpauthUri = totpSecret ? totpUri(totpSecret, settings?.storeName || 'StockTrack') : '';

    const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                {/* Developer Recovery — SUPER_ADMIN only */}
                {isSuperAdmin && totpSecret && (
                    <Card className="glass-dark border-amber-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-400">
                                <ShieldAlert className="w-5 h-5" />
                                Developer Recovery
                            </CardTitle>
                            <CardDescription>
                                Scan this secret into Google Authenticator (or any TOTP app). Use the 6-digit code on the login screen if all admin PINs are lost.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-xs font-bold opacity-60 uppercase tracking-wider">Secret Key</label>
                                <div className="flex gap-2 items-center">
                                    <code className="flex-1 bg-black/30 border border-amber-500/20 rounded-xl px-4 py-3 text-sm font-mono text-amber-300 tracking-widest select-all">
                                        {formattedSecret}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 rounded-xl hover:bg-amber-500/10"
                                        onClick={() => copyToClipboard(totpSecret, setCopiedSecret)}
                                    >
                                        {copiedSecret ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs font-bold opacity-60 uppercase tracking-wider">TOTP URI (for QR scanners)</label>
                                <div className="flex gap-2 items-center">
                                    <code className="flex-1 bg-black/30 border border-amber-500/20 rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground break-all select-all">
                                        {otpauthUri}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 rounded-xl hover:bg-amber-500/10"
                                        onClick={() => copyToClipboard(otpauthUri, setCopiedUri)}
                                    >
                                        {copiedUri ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Paste this URI into <a href="https://totp.app" target="_blank" rel="noopener" className="underline">totp.app</a> to generate a QR code you can scan.
                                </p>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <Button
                                    variant="outline"
                                    className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                    onClick={() => setShowRegenerateConfirm(true)}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate Secret
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Regenerating invalidates the current secret — you must re-register in your authenticator app.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reset Confirmation Dialog */}
            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent className="glass-dark border-white/10 rounded-[2rem]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            Reset Database?
                        </DialogTitle>
                        <DialogDescription>
                            This will wipe ALL data including inventory, transactions, and users. A new recovery secret will also be generated — re-register your authenticator after reset. This action cannot be undone.
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

            {/* Regenerate Recovery Secret Confirmation */}
            <Dialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
                <DialogContent className="glass-dark border-amber-500/20 rounded-[2rem]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-amber-400 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Regenerate Recovery Secret?
                        </DialogTitle>
                        <DialogDescription>
                            The current secret will be invalidated immediately. You must remove the old entry from your authenticator app and re-add the new secret.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowRegenerateConfirm(false)}>Cancel</Button>
                        <Button
                            className="bg-amber-500 hover:bg-amber-500/80 text-black"
                            disabled={isRegenerating}
                            onClick={async () => {
                                setIsRegenerating(true);
                                try {
                                    await regenerateRecoverySecret();
                                    setShowRegenerateConfirm(false);
                                } catch (error) {
                                    console.error("Regenerate failed:", error);
                                } finally {
                                    setIsRegenerating(false);
                                }
                            }}
                        >
                            {isRegenerating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Regenerate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
