'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Supplier } from '@/types';

const formSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    ledgerAccountId: z.string().optional(),
    relationType: z.string().optional(),
    relationName: z.string().optional(),
    pan: z.string().optional(),

    // Address
    address: z.string().optional(),
    city: z.string().optional(),
    pin: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    fax: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    gstIn: z.string().optional(),
});

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            ledgerAccountId: '',
            relationType: 'C/O',
            relationName: '',
            pan: '',
            address: '',
            city: '',
            pin: '',
            state: '',
            country: 'India',
            phone: '',
            fax: '',
            email: '',
            gstIn: '',
        },
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (editingSupplier) {
            form.reset({
                name: editingSupplier.name,
                ledgerAccountId: editingSupplier.ledgerAccountId || '',
                relationType: editingSupplier.relationType || 'C/O',
                relationName: editingSupplier.relationName || '',
                pan: editingSupplier.pan || '',
                address: editingSupplier.address || '',
                city: editingSupplier.city || '',
                pin: editingSupplier.pin || '',
                state: editingSupplier.state || '',
                country: editingSupplier.country || 'India',
                phone: editingSupplier.phone || '',
                fax: editingSupplier.fax || '',
                email: editingSupplier.email || '',
                gstIn: editingSupplier.gstIn || '',
            });
        } else {
            form.reset({
                name: '',
                ledgerAccountId: '',
                relationType: 'C/O',
                relationName: '',
                pan: '',
                address: '',
                city: '',
                pin: '',
                state: '',
                country: 'India',
                phone: '',
                fax: '',
                email: '',
                gstIn: '',
            });
        }
    }, [editingSupplier, form, isDialogOpen]);

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load suppliers.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        // Sanitize values
        const sanitizedValues = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value === '' ? undefined : value])
        );

        try {
            if (editingSupplier) {
                await api.patch(`/suppliers/${editingSupplier.id}`, sanitizedValues);
                toast({ title: 'Success', description: 'Supplier updated successfully.' });
            } else {
                await api.post('/suppliers', sanitizedValues);
                toast({ title: 'Success', description: 'Supplier created successfully.' });
            }
            setIsDialogOpen(false);
            setEditingSupplier(null);
            fetchSuppliers();
        } catch (error) {
            console.error('Failed to save supplier:', error);
            const message = (error as any).response?.data?.message;
            const description = Array.isArray(message) ? message.join(', ') : 'Failed to save supplier.';
            toast({
                variant: 'destructive',
                title: 'Error',
                description: description,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            toast({ title: 'Success', description: 'Supplier deleted successfully.' });
            fetchSuppliers();
        } catch (error) {
            console.error('Failed to delete supplier:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete supplier.',
            });
        }
    };

    const openEditDialog = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsDialogOpen(true);
    };

    const openAddDialog = () => {
        setEditingSupplier(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Suppliers</h2>
                <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-y-auto">
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                        <DialogDescription>
                            Fill in the supplier details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 px-6 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name *</FormLabel>
                                                <FormControl><Input placeholder="Supplier Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="ledgerAccountId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ledger Account ID</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Auto-generated"
                                                        {...field}
                                                        disabled={true}
                                                        readOnly={true}
                                                        className="bg-muted"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {!editingSupplier && <p className="text-xs text-muted-foreground">Auto-generated on save</p>}
                                            </FormItem>
                                        )} />
                                        <div className="flex gap-2">
                                            <FormField control={form.control} name="relationType" render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel>Relation</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Owner Name">Owner Name</SelectItem>
                                                            <SelectItem value="Proprietor Name">Proprietor Name</SelectItem>
                                                            <SelectItem value="Director Name">Director Name</SelectItem>
                                                            <SelectItem value="C/O">C/O</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="relationName" render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Relative Name</FormLabel>
                                                    <FormControl><Input placeholder="Relative Name" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="pan" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PAN</FormLabel>
                                                <FormControl><Input placeholder="PAN Number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="text-lg font-medium">Address</h3>
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl><Textarea placeholder="Full Address" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl><Input placeholder="City" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="pin" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>PIN</FormLabel>
                                                <FormControl><Input placeholder="PIN Code" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="state" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl><Input placeholder="State" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="country" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl><Input placeholder="Country" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl><Input placeholder="Phone" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="fax" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fax</FormLabel>
                                                <FormControl><Input placeholder="Fax" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input placeholder="Email" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="gstIn" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GSTIN</FormLabel>
                                                <FormControl><Input placeholder="GSTIN" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                    <div className="flex justify-end space-x-2 p-6 border-t bg-background">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Supplier
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Phone No</TableHead>
                            <TableHead>Fax No</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>PIN</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>PAN</TableHead>
                            <TableHead>GSTIN</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center h-24">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : suppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
                                    No suppliers found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell className="font-medium">
                                        <div>{supplier.name}</div>
                                        <div className="text-xs text-muted-foreground">{supplier.ledgerAccountId}</div>
                                    </TableCell>
                                    <TableCell>
                                        {supplier.relationType || supplier.relationName
                                            ? `${supplier.relationType ? `${supplier.relationType} - ` : ''}${supplier.relationName || ''}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>{supplier.phone || 'N/A'}</TableCell>
                                    <TableCell>{supplier.fax || 'N/A'}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={supplier.address}>
                                        {supplier.address || 'N/A'}
                                    </TableCell>
                                    <TableCell>{supplier.city || 'N/A'}</TableCell>
                                    <TableCell>{supplier.pin || 'N/A'}</TableCell>
                                    <TableCell>{supplier.state || 'N/A'}</TableCell>
                                    <TableCell>{supplier.pan || 'N/A'}</TableCell>
                                    <TableCell>{supplier.gstIn || 'N/A'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(supplier.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
