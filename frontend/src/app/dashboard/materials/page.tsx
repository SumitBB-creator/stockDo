'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Loader2, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/use-permissions';
import { Material } from '@/types';
import { format } from 'date-fns';

const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    unit: z.string().optional(),
    hsn: z.string().optional(),
    sac: z.string().optional(),
    totalQty: z.coerce.number().min(0).default(0),
    damageQty: z.coerce.number().min(0).default(0),
    shortQty: z.coerce.number().min(0).default(0),
    lowerLimit: z.coerce.number().min(0).default(0),
    status: z.string().default('Active'),
});

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [newMaterial, setNewMaterial] = useState({
        name: '',
        unit: '',
        hsn: '',
        sac: '',
        totalQty: 0,
        damageQty: 0,
        shortQty: 0,
        lowerLimit: 0,
    });
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        action: true,
        name: true,
        materialId: true,
        unit: true,
        hsn: true,
        sac: true,
        totalQty: true,
        damageQty: true,
        shortQty: true,
        lowerLimit: true,
        updatedAt: true,
    });
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { hasAction } = usePermissions();
    const canAdd = hasAction("Master Data", "add");
    const canEdit = hasAction("Master Data", "edit");
    const canDelete = hasAction("Master Data", "delete");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            unit: '',
            hsn: '',
            sac: '',
            totalQty: 0 as any,
            damageQty: 0 as any,
            shortQty: 0 as any,
            lowerLimit: 0 as any,
            status: 'Active',
        },
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        if (editingMaterial) {
            form.reset({
                name: editingMaterial.name,
                unit: editingMaterial.unit || '',
                hsn: editingMaterial.hsn || '',
                sac: editingMaterial.sac || '',
                totalQty: editingMaterial.totalQty,
                damageQty: editingMaterial.damageQty,
                shortQty: editingMaterial.shortQty,
                lowerLimit: editingMaterial.lowerLimit,
                status: editingMaterial.status || 'Active',
            });
        } else {
            form.reset({
                name: '',
                unit: '',
                hsn: '',
                sac: '',
                totalQty: 0,
                damageQty: 0,
                shortQty: 0,
                lowerLimit: 0,
                status: 'Active',
            });
        }
    }, [editingMaterial, form, isDialogOpen]);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/materials');
            setMaterials(response.data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load materials.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            if (editingMaterial) {
                await api.patch(`/materials/${editingMaterial.id}`, values);
                toast({ title: 'Success', description: 'Material updated successfully.' });
            } else {
                await api.post('/materials', values);
                toast({ title: 'Success', description: 'Material created successfully.' });
            }
            setIsDialogOpen(false);
            setEditingMaterial(null);
            fetchMaterials();
        } catch (error) {
            console.error('Failed to save material:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save material.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditDialog = (material: Material) => {
        setEditingMaterial(material);
        setIsDialogOpen(true);
    };

    const handleNewMaterialChange = (field: string, value: any) => {
        setNewMaterial(prev => ({ ...prev, [field]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (canAdd && !isSubmitting) {
                handleAddNew();
            }
        }
    };

    const handleAddNew = async () => {
        setIsSubmitting(true);
        try {
            if (!newMaterial.name) {
                toast({ variant: 'destructive', title: 'Error', description: 'Material Name is required.' });
                return;
            }
            await api.post('/materials', newMaterial);
            toast({ title: 'Success', description: 'Material created successfully.' });

            setNewMaterial({
                name: '',
                unit: '',
                hsn: '',
                sac: '',
                totalQty: 0,
                damageQty: 0,
                shortQty: 0,
                lowerLimit: 0,
            });
            fetchMaterials();
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        } catch (error) {
            console.error('Failed to create material:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create material.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete material "${name}"?`)) return;
        setIsSubmitting(true);
        try {
            await api.delete(`/materials/${id}`);
            toast({ title: 'Success', description: 'Material deleted successfully.' });
            fetchMaterials();
        } catch (error) {
            console.error('Failed to delete material:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete material.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Materials</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
                            <Settings2 className="mr-2 h-4 w-4" />
                            View Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        {Object.keys(visibleColumns).map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column}
                                className="capitalize"
                                checked={visibleColumns[column]}
                                onCheckedChange={(value) => {
                                    setVisibleColumns((prev) => ({
                                        ...prev,
                                        [column]: value,
                                    }));
                                }}
                            >
                                {column.replace(/([A-Z])/g, ' $1').trim()}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
                        <DialogDescription>
                            {editingMaterial ? 'Update material details.' : 'Add a new material to inventory.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Material Name *</FormLabel>
                                        <FormControl><Input placeholder="Material Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="unit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl><Input placeholder="e.g. Kg, Pcs" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="hsn" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>HSN</FormLabel>
                                        <FormControl><Input placeholder="HSN Code" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="sac" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SAC</FormLabel>
                                        <FormControl><Input placeholder="SAC Code" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 border-t pt-4">
                                <FormField control={form.control} name="totalQty" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Qty</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="damageQty" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Damage Qty</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="shortQty" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Qty</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lowerLimit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lower Limit</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Table wrapperClassName="max-h-[calc(100vh-250px)] overflow-auto relative rounded-md border bg-card">
                <TableHeader>
                    <TableRow>
                        {visibleColumns.action && <TableHead className="w-[80px] sticky top-0 z-20 bg-card shadow-sm border-b">Action</TableHead>}
                        {visibleColumns.name && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Material Name</TableHead>}
                        {visibleColumns.materialId && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Material ID</TableHead>}
                        {visibleColumns.unit && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Unit</TableHead>}
                        {visibleColumns.hsn && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">HSN</TableHead>}
                        {visibleColumns.sac && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">SAC</TableHead>}
                        {visibleColumns.totalQty && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Total Qty</TableHead>}
                        {visibleColumns.damageQty && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Damage Qty</TableHead>}
                        {visibleColumns.shortQty && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Short Qty</TableHead>}
                        {visibleColumns.lowerLimit && <TableHead className="sticky top-0 z-20 bg-card shadow-sm border-b">Lower Limit</TableHead>}
                        {visibleColumns.updatedAt && <TableHead className="sticky top-0 z-20 bg-card shadow-sm text-right border-b">Last Updated</TableHead>}
                    </TableRow>
                </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center h-24">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {materials.map((material) => (
                                    <TableRow key={material.id}>
                                        {visibleColumns.action && (
                                            <TableCell className="space-x-3 whitespace-nowrap">
                                                <Button
                                                    variant="link"
                                                    className={`p-0 h-auto font-normal underline ${canEdit ? 'text-blue-600' : 'text-muted-foreground cursor-not-allowed'}`}
                                                    onClick={() => canEdit && openEditDialog(material)}
                                                    disabled={!canEdit}
                                                >
                                                    Edit
                                                </Button>
                                                {canDelete && (
                                                    <Button
                                                        variant="link"
                                                        className={`p-0 h-auto font-normal underline text-red-600`}
                                                        onClick={() => handleDelete(material.id, material.name)}
                                                        disabled={isSubmitting}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                        {visibleColumns.name && <TableCell className="font-medium">{material.name}</TableCell>}
                                        {visibleColumns.materialId && <TableCell>{material.materialId}</TableCell>}
                                        {visibleColumns.unit && <TableCell>{material.unit || ''}</TableCell>}
                                        {visibleColumns.hsn && <TableCell>{material.hsn || ''}</TableCell>}
                                        {visibleColumns.sac && <TableCell>{material.sac || ''}</TableCell>}
                                        {visibleColumns.totalQty && <TableCell>{material.totalQty}</TableCell>}
                                        {visibleColumns.damageQty && <TableCell>{material.damageQty}</TableCell>}
                                        {visibleColumns.shortQty && <TableCell>{material.shortQty}</TableCell>}
                                        {visibleColumns.lowerLimit && <TableCell>{material.lowerLimit}</TableCell>}
                                        {visibleColumns.updatedAt && (
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(material.updatedAt), 'MM/dd/yy hh:mm:ss a')}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/30">
                                    {visibleColumns.action && (
                                        <TableCell>
                                            <Button
                                                variant="link"
                                                className={`p-0 h-auto font-normal underline ${canAdd ? 'text-blue-600' : 'text-muted-foreground cursor-not-allowed'}`}
                                                onClick={canAdd ? handleAddNew : undefined}
                                                disabled={isSubmitting || !canAdd}
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add New'}
                                            </Button>
                                        </TableCell>
                                    )}
                                    {visibleColumns.name && (
                                        <TableCell>
                                            <Input
                                                ref={nameInputRef}
                                                value={newMaterial.name}
                                                onChange={(e) => handleNewMaterialChange('name', e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Name"
                                                className="h-8 min-w-[120px]"
                                                disabled={!canAdd}
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.materialId && <TableCell className="text-muted-foreground italic text-sm">Auto</TableCell>}
                                    {visibleColumns.unit && (
                                        <TableCell>
                                            <Input
                                                value={newMaterial.unit}
                                                onChange={(e) => handleNewMaterialChange('unit', e.target.value)}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    if (newMaterial.totalQty === 0) {
                                                        handleNewMaterialChange('totalQty', val);
                                                    }
                                                }}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Unit"
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.hsn && (
                                        <TableCell>
                                            <Input
                                                value={newMaterial.hsn}
                                                onChange={(e) => handleNewMaterialChange('hsn', e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="HSN"
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.sac && (
                                        <TableCell>
                                            <Input
                                                value={newMaterial.sac}
                                                onChange={(e) => handleNewMaterialChange('sac', e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="SAC"
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.totalQty && (
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={newMaterial.totalQty}
                                                onChange={(e) => handleNewMaterialChange('totalQty', parseInt(e.target.value) || 0)}
                                                onKeyDown={handleKeyDown}
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.damageQty && (
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={newMaterial.damageQty}
                                                onChange={(e) => handleNewMaterialChange('damageQty', parseInt(e.target.value) || 0)}
                                                onKeyDown={handleKeyDown}
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.shortQty && (
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={newMaterial.shortQty}
                                                onChange={(e) => handleNewMaterialChange('shortQty', parseInt(e.target.value) || 0)}
                                                onKeyDown={handleKeyDown}
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.lowerLimit && (
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={newMaterial.lowerLimit}
                                                onChange={(e) => handleNewMaterialChange('lowerLimit', parseInt(e.target.value) || 0)}
                                                onKeyDown={handleKeyDown}
                                                className="h-8 w-[80px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.updatedAt && (
                                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                                            {format(new Date(), 'MM/dd/yy hh:mm:ss a')}
                                        </TableCell>
                                    )}
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
        </div>
    );
}
