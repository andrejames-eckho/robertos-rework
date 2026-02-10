"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { User } from "@/lib/db";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Loader2, AlertTriangle, UserCog } from "lucide-react";

export function UserManagement() {
    const { users, addUser, updateUser, deleteUser, currentUser } = useUser();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        pin: "",
        role: "STANDARD" as "STANDARD" | "ADMIN" | "SUPER_ADMIN"
    });

    const handleSave = async () => {
        if (!formData.name || !formData.pin) return;
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, {
                    name: formData.name,
                    pin: formData.pin,
                    role: formData.role
                });
            } else {
                await addUser({
                    id: crypto.randomUUID(),
                    name: formData.name,
                    pin: formData.pin,
                    role: formData.role
                });
            }
            setIsAddOpen(false);
            setEditingUser(null);
            setFormData({ name: "", pin: "", role: "STANDARD" });
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteUser(userToDelete.id);
            setUserToDelete(null);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete user. You cannot delete your own account.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            pin: user.pin,
            role: user.role
        });
        setIsAddOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserCog className="w-6 h-6 text-primary" />
                    User Management
                </h2>
                <Button
                    className="rounded-xl bg-primary hover:bg-primary/80"
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({ name: "", pin: "", role: "STANDARD" });
                        setIsAddOpen(true);
                    }}
                >
                    <Plus className="w-5 h-5 mr-2" /> Add User
                </Button>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar rounded-xl border border-white/5">
                <Table>
                    <TableHeader className="bg-white/5 sticky top-0 z-10">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold">Name</TableHead>
                            <TableHead className="text-muted-foreground font-bold">Role</TableHead>
                            <TableHead className="text-muted-foreground font-bold">PIN</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium">
                                    {user.name}
                                    {user.id === currentUser?.id && <Badge className="ml-2 bg-primary/20 text-primary border-0">You</Badge>}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-white/10">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-muted-foreground">
                                    {user.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN' ? '****' : user.pin}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-lg hover:bg-primary/20 hover:text-primary"
                                            onClick={() => startEdit(user)}
                                            disabled={user.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN'}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-lg hover:bg-destructive/20 hover:text-destructive"
                                            onClick={() => setUserToDelete(user)}
                                            disabled={user.id === currentUser?.id || (user.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) setEditingUser(null);
            }}>
                <DialogContent className="glass-dark border-white/10 rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? "Update user details and permissions." : "Create a new user for the system."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold opacity-70">Name</label>
                            <Input
                                className="bg-white/5 border-white/10"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-bold opacity-70">PIN (4-6 digits)</label>
                            <Input
                                className="bg-white/5 border-white/10"
                                value={formData.pin}
                                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                placeholder="1234"
                                maxLength={6}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-bold opacity-70">Role</label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: "STANDARD" | "ADMIN" | "SUPER_ADMIN") => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-dark border-white/10">
                                    <SelectItem value="STANDARD">Standard User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/80" disabled={isSubmitting || !formData.name || !formData.pin}>
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingUser ? "Update User" : "Create User")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="glass-dark border-white/10 rounded-[2rem] sm:max-w-md">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-destructive/20 text-destructive">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            Delete User?
                        </DialogTitle>
                        <DialogDescription className="text-lg text-foreground">
                            Are you sure you want to delete <b className="text-glow">{userToDelete?.name}</b>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-between gap-4 mt-4">
                        <Button variant="ghost" className="h-14 px-8 rounded-2xl text-lg hover:bg-white/10" onClick={() => setUserToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" className="h-14 px-8 rounded-2xl text-lg font-bold flex-1" onClick={confirmDelete} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Delete User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
