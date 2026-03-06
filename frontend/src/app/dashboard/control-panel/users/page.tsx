'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Pencil, Settings2, RotateCcw, UserPlus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/use-permissions';

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { hasAction } = usePermissions();
    const canAdd = hasAction("Manage User", "add");
    const canEdit = hasAction("Manage User", "edit");

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    // Visibility Control
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        action: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/roles')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load personnel data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (isInline = false) => {
        if (!name || (!isInline && !email) || (!editingUserId && !password) || !roleId) {
            toast({ title: "Validation Error", description: "Essential fields are missing", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            if (editingUserId) {
                await api.patch(`/users/${editingUserId}`, { name, email, roleId });
                toast({ title: "Success", description: "Personnel record updated" });
            } else {
                await api.post('/users', { name, email, password, roleId });
                toast({ title: "Success", description: "New account registered" });
            }
            handleReset();
            loadData();
            if (!isInline) setIsDialogOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRoleId('');
        setEditingUserId(null);
    };

    const handleEdit = (user: any) => {
        setEditingUserId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRoleId(user.roleId || '');
        setPassword('');
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently remove this user record?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast({ title: "Deleted", description: "User removed from system" });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Deletion failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 min-h-screen bg-[#020817] p-6 text-slate-100">
            <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-t-lg border-b border-slate-800 shadow-xl">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    Personnel Management
                </h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-[#1e293b] border-slate-700 text-slate-300 hover:bg-[#334155] hover:text-white">
                            <Settings2 className="mr-2 h-4 w-4" />
                            View Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-[#1e293b] border-slate-700 text-slate-200">
                        {Object.keys(visibleColumns).map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column}
                                className="capitalize focus:bg-[#334155] focus:text-white"
                                checked={visibleColumns[column]}
                                onCheckedChange={(value) => setVisibleColumns(prev => ({ ...prev, [column]: value }))}
                            >
                                {column.replace(/([A-Z])/g, ' $1').trim()}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#0f172a] overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-[#1e293b]/50">
                        <TableRow className="hover:bg-transparent border-slate-800">
                            {visibleColumns.action && <TableHead className="font-bold text-slate-400">Action</TableHead>}
                            {visibleColumns.name && <TableHead className="font-bold text-slate-400">Full Name</TableHead>}
                            {visibleColumns.email && <TableHead className="font-bold text-slate-400">System Email</TableHead>}
                            {visibleColumns.role && <TableHead className="font-bold text-slate-400">Assigned Role</TableHead>}
                            {visibleColumns.updatedAt && <TableHead className="font-bold text-slate-400 text-right pr-6">Activity</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-[#1e293b]/30 border-slate-800 transition-colors">
                                        {visibleColumns.action && (
                                            <TableCell className="space-x-4">
                                                <Button
                                                    variant="link"
                                                    className={`p-0 h-auto font-normal underline ${canEdit ? 'text-blue-600' : 'text-muted-foreground cursor-not-allowed'}`}
                                                    onClick={() => {
                                                        if (canEdit) {
                                                            setEditingUserId(user.id);
                                                            setName(user.name);
                                                            setEmail(user.email);
                                                            setRoleId(user.roleId);
                                                            setIsDialogOpen(true);
                                                        }
                                                    }}
                                                    disabled={!canEdit}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto font-medium text-slate-500 hover:text-red-500"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        )}
                                        {visibleColumns.name && (
                                            <TableCell className="font-bold text-slate-200">{user.name}</TableCell>
                                        )}
                                        {visibleColumns.email && (
                                            <TableCell className="text-slate-400">{user.email}</TableCell>
                                        )}
                                        {visibleColumns.role && (
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500/60"></div>
                                                    <span className="font-bold text-blue-400/80 uppercase tracking-tight text-[10px]">
                                                        {user.role?.name || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.updatedAt && (
                                            <TableCell className="text-right pr-6 text-slate-500 text-sm italic">
                                                Registered
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}

                                {/* Inline Add New Row */}
                                <TableRow className="bg-[#1e293b]/20 border-t border-slate-700">
                                    {visibleColumns.action && (
                                        <TableCell>
                                            <Button
                                                variant="link"
                                                className={`p-0 h-auto font-normal underline ${canAdd ? 'text-blue-600' : 'text-muted-foreground cursor-not-allowed'}`}
                                                onClick={() => canAdd && handleSave(true)}
                                                disabled={saving || !canAdd}
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add New'}
                                            </Button>
                                        </TableCell>
                                    )}
                                    {visibleColumns.name && (
                                        <TableCell>
                                            <Input
                                                value={editingUserId ? '' : name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Full Name"
                                                className="h-8 min-w-[120px] bg-[#020817] border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500"
                                                disabled={!canAdd}
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.email && (
                                        <TableCell>
                                            <Input
                                                value={editingUserId ? '' : email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Email"
                                                className="h-8 min-w-[150px] bg-[#020817] border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500"
                                                disabled={!canAdd}
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.role && (
                                        <TableCell>
                                            <Select value={editingUserId ? '' : roleId} onValueChange={setRoleId} disabled={!canAdd}>
                                                <SelectTrigger className="h-8 bg-[#020817] border-slate-700 text-slate-200">
                                                    <SelectValue placeholder="Role" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id} className="focus:bg-[#334155] focus:text-white">
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    )}
                                    {visibleColumns.updatedAt && (
                                        <TableCell className="text-right pr-6">
                                            <Input
                                                type="password"
                                                value={editingUserId ? '' : password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
                                                className="h-8 w-32 bg-[#020817] border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500 ml-auto"
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-[#0f172a] border-slate-800 text-slate-100 shadow-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-500" />
                            Update Personnel Details
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Modify the account details for {name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-[#020817] border-slate-700 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#020817] border-slate-700 text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Role</label>
                            <Select value={roleId} onValueChange={setRoleId}>
                                <SelectTrigger className="bg-[#020817] border-slate-700 text-slate-200">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={() => handleSave(false)} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-8">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Account
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
