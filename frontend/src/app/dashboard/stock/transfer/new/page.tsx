'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Save, Printer, X, Loader2, ArrowRightLeft } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatCustomerAddress } from '@/lib/utils';
import {
    fetchCustomers,
    fetchAgreements,
    fetchMaterials,
    fetchCustomerStock,
    createTransfer
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    date: z.date(),
    fromCustomerId: z.string().min(1, 'Sender is required'),
    toCustomerId: z.string().min(1, 'Receiver is required'),
    agreementId: z.string().min(1, 'Agreement is required'),
    vehicleNumber: z.string().optional(),
    remarks: z.string().optional(),
    senderTransportation: z.coerce.number().default(0),
    receiverTransportation: z.coerce.number().default(0),
    items: z.array(z.object({
        materialId: z.string().min(1, 'Material is required'),
        materialName: z.string().optional(),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
        fromBalance: z.number().default(0),
        toBalance: z.number().default(0),
    })).min(1, 'At least one material is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTransferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [receiverAgreements, setReceiverAgreements] = useState<any[]>([]);
    const [fromStock, setFromStock] = useState<Record<string, number>>({});
    const [toStock, setToStock] = useState<Record<string, number>>({});

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: new Date(),
            fromCustomerId: '',
            toCustomerId: '',
            agreementId: '',
            vehicleNumber: '',
            remarks: '',
            senderTransportation: 0,
            receiverTransportation: 0,
            items: [{ materialId: '', quantity: 0, fromBalance: 0, toBalance: 0 }],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [customersData, materialsData] = await Promise.all([
                    fetchCustomers(),
                    fetchMaterials(),
                ]);
                setCustomers(customersData);
                setMaterials(materialsData);
            } catch (error) {
                console.error('Failed to load initial data', error);
            }
        };
        loadInitialData();
    }, []);

    const fromCustomerId = form.watch('fromCustomerId');
    const toCustomerId = form.watch('toCustomerId');

    // Load Sender Stock
    useEffect(() => {
        if (fromCustomerId) {
            fetchCustomerStock(fromCustomerId).then(stock => {
                const stockMap = stock.reduce((acc: any, curr: any) => {
                    acc[curr.materialId] = curr.quantity;
                    return acc;
                }, {});
                setFromStock(stockMap);

                // Update existing items fromBalance
                const currentItems = form.getValues('items');
                currentItems.forEach((item, index) => {
                    if (item.materialId) {
                        update(index, { ...item, fromBalance: stockMap[item.materialId] || 0 });
                    }
                });
            });
        }
    }, [fromCustomerId, update, form]);

    // Load Receiver Agreements and Stock
    useEffect(() => {
        if (toCustomerId) {
            fetchAgreements('Active').then(allAgreements => {
                const filtered = allAgreements.filter((a: any) => a.customerId === toCustomerId);
                setReceiverAgreements(filtered);
                if (filtered.length === 1) {
                    form.setValue('agreementId', filtered[0].id);
                } else {
                    form.setValue('agreementId', '');
                }
            });

            // Fetch Stock
            fetchCustomerStock(toCustomerId).then(stock => {
                const stockMap = stock.reduce((acc: any, curr: any) => {
                    acc[curr.materialId] = curr.quantity;
                    return acc;
                }, {});
                setToStock(stockMap);

                // Update existing items toBalance
                const currentItems = form.getValues('items');
                currentItems.forEach((item, index) => {
                    if (item.materialId) {
                        update(index, { ...item, toBalance: stockMap[item.materialId] || 0 });
                    }
                });
            });
        } else {
            setReceiverAgreements([]);
            form.setValue('agreementId', '');
        }
    }, [toCustomerId, update, form]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const sanitizedData = {
                ...values,
                date: values.date.toISOString(),
                items: values.items.map(item => ({
                    materialId: item.materialId,
                    quantity: item.quantity,
                })),
            };

            await createTransfer(sanitizedData);
            toast({
                title: 'Success',
                description: 'Material transfer recorded successfully.',
            });
            router.push('/dashboard/stock/transfer');
        } catch (error: any) {
            console.error('Transfer failed:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create transfer.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">New Material Transfer</h2>
                    <p className="text-muted-foreground text-sm">Move stock between sites and generate linked challans.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        <X className="h-4 w-4 mr-2" /> Exit
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-500"
                        onClick={form.handleSubmit(onSubmit as any)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Transfer
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                                    Parties Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="fromCustomerId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>From (Sender Site)</FormLabel>
                                            <Autocomplete
                                                items={customers.map(c => ({
                                                    value: c.id,
                                                    label: c.name,
                                                    subLabel: formatCustomerAddress(c)
                                                }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select sender..."
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="toCustomerId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>To (Receiver Site)</FormLabel>
                                            <Autocomplete
                                                items={customers
                                                    .filter(c => c.id !== fromCustomerId)
                                                    .map(c => ({
                                                        value: c.id,
                                                        label: c.name,
                                                        subLabel: formatCustomerAddress(c)
                                                    }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select receiver..."
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="agreementId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Receiver Agreement</FormLabel>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                                disabled={!toCustomerId}
                                                title="Agreement"
                                            >
                                                <option value="">Select Agreement...</option>
                                                {receiverAgreements.map(a => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.agreementId} (Valid From: {format(new Date(a.validFrom), 'dd MMM yyyy')})
                                                    </option>
                                                ))}
                                            </select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Transfer Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
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
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg">Other Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control as any}
                                    name="vehicleNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vehicle Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MH-XX-1234" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional notes" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Transfer Items</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ materialId: '', quantity: 0, fromBalance: 0, toBalance: 0 })}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Material
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[400px]">Material Name</TableHead>
                                            <TableHead>From Balance</TableHead>
                                            <TableHead>To Balance</TableHead>
                                            <TableHead className="w-[150px]">Qty to Transfer</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id} className="group">
                                                <TableCell>
                                                    <Autocomplete
                                                        items={materials.map(m => ({
                                                            value: m.id,
                                                            label: m.name,
                                                            subLabel: m.category
                                                        }))}
                                                        value={form.watch(`items.${index}.materialId`)}
                                                        onChange={(val) => {
                                                            const material = materials.find(m => m.id === val);
                                                            update(index, {
                                                                ...form.getValues(`items.${index}`),
                                                                materialId: val,
                                                                materialName: material?.name,
                                                                fromBalance: fromStock[val] || 0,
                                                                toBalance: toStock[val] || 0
                                                            });
                                                        }}
                                                        placeholder="Select material..."
                                                        className="w-full"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "font-medium",
                                                        form.watch(`items.${index}.fromBalance`) === 0 ? "text-red-500" : "text-green-500"
                                                    )}>
                                                        {form.watch(`items.${index}.fromBalance`)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {form.watch(`items.${index}.toBalance`)}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        {...form.register(`items.${index}.quantity` as const)}
                                                        placeholder="0"
                                                        className={cn(
                                                            form.watch(`items.${index}.quantity`) > form.watch(`items.${index}.fromBalance`) && "border-red-500 ring-red-500"
                                                        )}
                                                    />
                                                    {form.watch(`items.${index}.quantity`) > form.watch(`items.${index}.fromBalance`) && (
                                                        <p className="text-[10px] text-red-500 mt-1">Exceeds balance</p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length === 1}
                                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg">Transportation Costs</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="senderTransportation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sender Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="receiverTransportation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Receiver Cost (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>
        </div>
    );
}
