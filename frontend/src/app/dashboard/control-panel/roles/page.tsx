'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
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
import { Loader2, Save, Trash2, Pencil, Settings2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/use-permissions';
import { Checkbox } from '@/components/ui/checkbox';

const MODULES = [
    "Master Data", "Agreement", "Daybook", "Ledger", "Company Stock",
    "Customer Stock", "Challan", "Dues List", "Billing", "Quotation",
    "Return", "Manage Role", "Manage User", "Transportation", "Receipt",
    "Transfer", "Sale & Purchase", "Local Sale", "Central Sale",
    "Purchase Details", "Local Purchase", "Central Purchase", "Shortage Notice"
];

const INITIAL_PERMISSIONS = MODULES.map(m => ({
    module: m,
    view: false,
    add: false,
    edit: false,
    delete: false,
    print: false,
    fullControl: false
}));

export default function RolesPage() {
    const { toast } = useToast();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { hasAction } = usePermissions();
    const { user, setUser } = useAuthStore();
    const canAdd = hasAction("Manage Role", "add");
    const canEdit = hasAction("Manage Role", "edit");

    // Form State
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

    // Visibility Control
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        action: true,
        roleName: true,
        permissions: true,
        securityProfile: true,
        updatedAt: true
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load roles", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (index: number, field: string, value: boolean) => {
        const updated = [...permissions];
        if (field === 'fullControl') {
            updated[index] = {
                ...updated[index],
                fullControl: value,
                view: value,
                add: value,
                edit: value,
                delete: value,
                print: value
            };
        } else {
            updated[index] = { ...updated[index], [field]: value };
            if (!value) updated[index].fullControl = false;
        }
        setPermissions(updated);
    };

    const handleEdit = (role: any) => {
        setEditingRoleId(role.id);
        setRoleName(role.name);

        // Merge DB permissions with INITIAL_PERMISSIONS to ensure new modules are visible for editing
        const mergedPermissions = INITIAL_PERMISSIONS.map(initial => {
            const existing = role.permissions?.find((p: any) => p.module === initial.module);
            return existing ? { ...initial, ...existing } : initial;
        });

        setPermissions(mergedPermissions);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingRoleId(null);
        setRoleName('');
        setPermissions(INITIAL_PERMISSIONS);
        setIsDialogOpen(false); // Inline row is for adding now
    };

    const handleSave = async () => {
        if (!roleName) {
            toast({ title: "Validation Error", description: "Role Name is required", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const data = { name: roleName, permissions };
            if (editingRoleId) {
                const response = await api.patch(`/roles/${editingRoleId}`, data);
                // Update local user state if editing own role
                if (user && user.role?.id === editingRoleId) {
                    setUser({ ...user, role: response.data });
                }
                toast({ title: "Success", description: "Role updated successfully" });
            } else {
                await api.post('/roles', data);
                toast({ title: "Success", description: "Role created successfully" });
            }
            setIsDialogOpen(false);
            setRoleName('');
            setPermissions(INITIAL_PERMISSIONS);
            setEditingRoleId(null);
            loadRoles();
        } catch (error) {
            toast({ title: "Execution Error", description: "Failed to save role", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await api.delete(`/roles/${id}`);
            toast({ title: "Deleted", description: "Role removed successfully" });
            loadRoles();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 min-h-screen bg-[#020817] p-6 text-slate-100">
            <div className="flex justify-between items-center bg-[#0f172a] p-4 rounded-t-lg border-b border-slate-800 shadow-xl">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    Role Management
                </h2>
                <div className="flex gap-2">
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
            </div>

            <div className="rounded-md border border-slate-800 bg-[#0f172a] overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-[#1e293b]/50">
                        <TableRow className="hover:bg-transparent border-slate-800">
                            {visibleColumns.action && <TableHead className="font-bold text-slate-400">Action</TableHead>}
                            {visibleColumns.roleName && <TableHead className="font-bold text-slate-400">Role Name</TableHead>}
                            {visibleColumns.permissions && <TableHead className="font-bold text-slate-400">Permissions Summary</TableHead>}
                            {visibleColumns.securityProfile && <TableHead className="font-bold text-slate-400">Security Profile</TableHead>}
                            {visibleColumns.updatedAt && <TableHead className="font-bold text-slate-400 text-right pr-6">Last Updated</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {roles.map((role) => (
                                    <TableRow key={role.id} className="hover:bg-[#1e293b]/30 border-slate-800 transition-colors">
                                        {visibleColumns.action && (
                                            <TableCell className="space-x-4">
                                                <Button
                                                    variant="link"
                                                    className={`p-0 h-auto font-bold underline decoration-blue-500/30 ${canEdit ? 'text-blue-500 hover:text-blue-400' : 'text-slate-500 cursor-not-allowed'}`}
                                                    onClick={() => canEdit && handleEdit(role)}
                                                    disabled={!canEdit}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto font-medium text-slate-500 hover:text-red-500"
                                                    onClick={() => handleDelete(role.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        )}
                                        {visibleColumns.roleName && (
                                            <TableCell className="font-bold text-slate-200">{role.name}</TableCell>
                                        )}
                                        {visibleColumns.permissions && (
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {role.permissions.filter((p: any) => p.view).slice(0, 4).map((p: any, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            {p.module}
                                                        </span>
                                                    ))}
                                                    {role.permissions.filter((p: any) => p.view).length > 4 && (
                                                        <span className="text-[10px] text-slate-500 font-medium self-center ml-1">
                                                            + {role.permissions.filter((p: any) => p.view).length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.securityProfile && (
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {role.permissions.filter((p: any) => p.fullControl).length} Full Control
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        )}
                                        {visibleColumns.updatedAt && (
                                            <TableCell className="text-right pr-6 text-slate-500 text-sm">
                                                {new Date(role.updatedAt || Date.now()).toLocaleDateString()}
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
                                                className={`p-0 h-auto font-bold underline decoration-blue-500/30 ${canAdd ? 'text-blue-500 hover:text-blue-400' : 'text-slate-500 cursor-not-allowed'}`}
                                                onClick={canAdd ? handleSave : undefined}
                                                disabled={saving || !canAdd}
                                            >
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add New'}
                                            </Button>
                                        </TableCell>
                                    )}
                                    {visibleColumns.roleName && (
                                        <TableCell>
                                            <Input
                                                value={editingRoleId ? '' : roleName}
                                                onChange={(e) => setRoleName(e.target.value)}
                                                placeholder="Enter Role Name"
                                                className="h-8 bg-[#020817] border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-blue-500"
                                                disabled={!canAdd}
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.permissions && <TableCell className="text-slate-600 italic text-sm">Defaulting to null scope</TableCell>}
                                    {visibleColumns.securityProfile && <TableCell className="text-slate-600 text-xs">Configure via Edit</TableCell>}
                                    {visibleColumns.updatedAt && <TableCell className="text-right pr-6 text-slate-600 text-sm">Now</TableCell>}
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Permissions Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl bg-[#0f172a] border-slate-800 text-slate-100 shadow-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-500" />
                            Edit Role Scope: {roleName}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure granular access permissions for each system module.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-[#1e293b] sticky top-0 z-20">
                                <TableRow className="hover:bg-transparent border-slate-700">
                                    <TableHead className="text-slate-200 font-bold">Module Name</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400">View</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400">Add</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400">Edit</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400">Delete</TableHead>
                                    <TableHead className="text-center font-bold text-slate-400">Print</TableHead>
                                    <TableHead className="text-center font-bold text-blue-400">Internal Access</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((p, idx) => (
                                    <TableRow key={idx} className="hover:bg-[#1e293b]/50 border-slate-800">
                                        <TableCell className="font-medium text-slate-300">{p.module}</TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.view}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'view', !!v)}
                                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.add}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'add', !!v)}
                                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.edit}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'edit', !!v)}
                                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.delete}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'delete', !!v)}
                                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.print}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'print', !!v)}
                                                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={p.fullControl}
                                                onCheckedChange={(v) => handlePermissionChange(idx, 'fullControl', !!v)}
                                                className="border-blue-500 border-2 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                            <RotateCcw className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-8">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Commit Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0f172a;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
