'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react';

import { cn, formatCustomerAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Autocomplete } from '@/components/ui/autocomplete';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchCustomers, fetchMaterials, createQuotation } from '@/lib/api';

const quotationSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    date: z.date(),
    items: z.array(z.object({
        materialId: z.string().min(1, 'Material is required'),
        hireRate: z.number().min(0, 'Must be positive'),
        damageRecoveryRate: z.number().min(0, 'Must be positive'),
        shortRecoveryRate: z.number().min(0, 'Must be positive'),
        rateAppliedAs: z.string().min(1),
    })).min(1, 'At least one item is required'),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

export default function CreateQuotationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<QuotationFormValues>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            date: new Date(),
            items: [{ materialId: '', hireRate: 0, damageRecoveryRate: 0, shortRecoveryRate: 0, rateAppliedAs: 'Nos/Days' }],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        name: 'items',
        control: form.control,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [customersData, materialsData] = await Promise.all([
                    fetchCustomers(),
                    fetchMaterials(),
                ]);
                setCustomers(customersData);
                setMaterials(materialsData);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load customers or materials',
                    variant: 'destructive',
                });
            }
        };
        loadData();
    }, [toast]);

    const onMaterialSelect = (index: number, materialId: string) => {
        const material = materials.find((m) => m.id === materialId);
        if (material) {
            update(index, {
                materialId,
                hireRate: material.hireRate || 0,
                damageRecoveryRate: material.damageRecoveryRate || 0,
                shortRecoveryRate: material.shortRecoveryRate || 0,
                rateAppliedAs: 'Nos/Days', // Default
            });
        }
    };

    const onSubmit = async (data: QuotationFormValues) => {
        try {
            setLoading(true);
            await createQuotation({
                ...data,
                date: data.date.toISOString(),
            });
            toast({
                title: 'Success',
                description: 'Quotation created successfully',
            });
            router.push('/dashboard/quotation');
        } catch (error) {
            console.error('Failed to create quotation:', error);
            toast({
                title: 'Error',
                description: 'Failed to create quotation',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Create Quotation</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Customer</FormLabel>
                                    <Autocomplete
                                        items={customers.map(c => ({
                                            value: c.id,
                                            label: c.name,
                                            subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                            tertiaryLabel: formatCustomerAddress(c)
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select customer"
                                        className="w-full"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-medium">Items</h3>
                        </div>
                        <div className="p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Sr.</TableHead>
                                        <TableHead className="w-[300px]">Material</TableHead>
                                        <TableHead>Hire Rate</TableHead>
                                        <TableHead>Damage (Recovery)</TableHead>
                                        <TableHead>Short (Recovery)</TableHead>
                                        <TableHead className="w-[150px]">Rate As</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.materialId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select
                                                                onValueChange={(value) => onMaterialSelect(index, value)}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select Material" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {materials.map((m) => {
                                                                        const isSelected = form.watch('items')?.some((item, idx) => item.materialId === m.id && idx !== index);
                                                                        return (
                                                                            <SelectItem key={m.id} value={m.id} disabled={isSelected}>
                                                                                {m.name}
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.hireRate`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.damageRecoveryRate`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.shortRecoveryRate`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.rateAppliedAs`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Nos/Days">Nos/Days</SelectItem>
                                                                    <SelectItem value="Nos">Nos</SelectItem>
                                                                    <SelectItem value="Kg">Kg</SelectItem>
                                                                    <SelectItem value="Sq.Ft">Sq.Ft</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => append({ materialId: '', hireRate: 0, damageRecoveryRate: 0, shortRecoveryRate: 0, rateAppliedAs: 'Nos/Days' })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Quotation'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
