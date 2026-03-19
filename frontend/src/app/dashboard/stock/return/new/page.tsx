'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatCustomerAddress } from '@/lib/utils';
import { InlineCombobox } from '@/components/ui/inline-combobox';
import { Autocomplete } from '@/components/ui/autocomplete';
import { fetchCustomers, fetchAgreements, createChallan, fetchCustomerStock } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

// Schema
const formSchema = z.object({
    challanNumber: z.string().optional(),
    manualChallanNumber: z.string().optional(),
    customerId: z.string().min(1, "Customer is required"),
    agreementId: z.string().optional(),
    date: z.date(),
    vehicleNumber: z.string().optional(),
    eWayBillNo: z.string().optional(),
    goodsValue: z.number().optional(),
    weight: z.number().optional(),
    transportationCost: z.number().optional(),
    greenTax: z.number().optional(),
    transporterName: z.string().optional(),
    biltyNumber: z.string().optional(),
    receiverName: z.string().optional(),
    receiverMobile: z.string().optional(),
    driverName: z.string().optional(),
    driverMobile: z.string().optional(),
    licenseNumber: z.string().optional(),
    timeOut: z.string().optional(),
    timeIn: z.string().optional(),
    remarks: z.string().optional(),
    type: z.literal('RETURN'),
    items: z.array(z.object({
        materialId: z.string().min(1, "Material is required"),
        quantity: z.number().min(0, "Quantity must be at least 0"), // Can be 0 if only returning damaged/short
        damageQuantity: z.number().optional(),
        shortQuantity: z.number().optional(),
        maxQuantity: z.number().optional(), // For validation display
    })).min(1, "At least one item is required").refine(items =>
        items.every(item => (item.quantity + (item.damageQuantity || 0) + (item.shortQuantity || 0)) > 0),
        { message: "Total quantity per item must be greater than 0" }
    ),
});

export default function CreateReturnPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [customerStock, setCustomerStock] = useState<any[]>([]);

    // Derived state for available materials (Customer Stock)
    const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            challanNumber: '',
            manualChallanNumber: '',
            customerId: '',
            agreementId: '',
            date: new Date(),
            vehicleNumber: '',
            eWayBillNo: '',
            goodsValue: undefined,
            weight: undefined,
            transportationCost: undefined,
            greenTax: undefined,
            transporterName: '',
            biltyNumber: '',
            receiverName: '',
            receiverMobile: '',
            driverName: '',
            driverMobile: '',
            licenseNumber: '',
            timeIn: '',
            type: 'RETURN',
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [custData, agmtData] = await Promise.all([
                fetchCustomers(),
                fetchAgreements()
            ]);
            setCustomers(custData);
            setAgreements(agmtData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const watchCustomerId = form.watch("customerId");

    // Fetch stock when customer changes
    useEffect(() => {
        if (watchCustomerId) {
            loadCustomerStock(watchCustomerId);
        } else {
            setCustomerStock([]);
            setAvailableMaterials([]);
            form.setValue("items", []);
        }
    }, [watchCustomerId]);

    const loadCustomerStock = async (customerId: string) => {
        try {
            const stock = await fetchCustomerStock(customerId);
            setCustomerStock(stock);

            // Transform for Combobox
            setAvailableMaterials(stock.map((s: any) => ({
                value: s.materialId,
                label: `${s.materialName} (Qty: ${s.quantity})`,
                subLabel: `Available: ${s.quantity}`,
                maxQty: s.quantity
            })));

            // Auto-select latest active agreement if possible, or just filter agreements
        } catch (error) {
            console.error('Failed to load stock:', error);
            toast({
                title: "Error",
                description: "Failed to load customer stock",
                variant: "destructive",
            });
        }
    };

    const customerAgreements = agreements.filter(a => a.customerId === watchCustomerId && a.status !== 'Closed');

    const [action, setAction] = useState<'save' | 'print'>('save');

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Validate against stock
        for (const item of values.items) {
            const stockItem = customerStock.find(s => s.materialId === item.materialId);
            const totalReturned = item.quantity + (item.damageQuantity || 0) + (item.shortQuantity || 0);
            if (!stockItem || totalReturned > stockItem.quantity) {
                toast({
                    title: "Stock Validation Error",
                    description: `Cannot return total of ${totalReturned} for material. Max returnable: ${stockItem?.quantity || 0}`,
                    variant: "destructive",
                });
                return;
            }
        }

        setLoading(true);
        try {
            const payload: Record<string, any> = {
                date: values.date.toISOString(),
                customerId: values.customerId,
                type: 'RETURN',
                items: values.items.map(item => ({
                    materialId: item.materialId,
                    quantity: item.quantity,
                    ...(item.damageQuantity ? { damageQuantity: item.damageQuantity } : {}),
                    ...(item.shortQuantity ? { shortQuantity: item.shortQuantity } : {}),
                })),
            };

            // Only include optional string fields if they have a value
            if (values.agreementId) payload.agreementId = values.agreementId;
            if (values.manualChallanNumber) payload.manualChallanNumber = values.manualChallanNumber;
            if (values.vehicleNumber) payload.vehicleNumber = values.vehicleNumber;
            if (values.eWayBillNo) payload.eWayBillNo = values.eWayBillNo;
            if (values.remarks) payload.remarks = values.remarks;
            if (values.transporterName) payload.transporterName = values.transporterName;
            if (values.biltyNumber) payload.biltyNumber = values.biltyNumber;
            if (values.receiverName) payload.receiverName = values.receiverName;
            if (values.receiverMobile) payload.receiverMobile = values.receiverMobile;
            if (values.driverName) payload.driverName = values.driverName;
            if (values.driverMobile) payload.driverMobile = values.driverMobile;
            if (values.licenseNumber) payload.licenseNumber = values.licenseNumber;
            if (values.timeOut) payload.timeOut = values.timeOut;
            if (values.timeIn) payload.timeIn = values.timeIn;
            if (values.goodsValue != null) payload.goodsValue = values.goodsValue;
            if (values.weight != null) payload.weight = values.weight;
            if (values.transportationCost != null) payload.transportationCost = values.transportationCost;
            if (values.greenTax != null) payload.greenTax = values.greenTax;

            const result = await createChallan(payload);
            toast({
                title: "Success",
                description: "Return created successfully",
            });
            if (action === 'print' && result?.id) {
                router.push(`/dashboard/stock/challan/${result.id}/print`);
            } else {
                router.push('/dashboard/stock/return');
            }
        } catch (error: any) {
            const message = Array.isArray(error.response?.data?.message)
                ? error.response.data.message.join(', ')
                : error.response?.data?.message || "Failed to create return";
            console.error(error);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        setAction('print');
        form.handleSubmit(onSubmit)();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-red-600">Create Return (Inward)</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-6 bg-card rounded-lg border shadow-sm">
                        <FormField
                            control={form.control}
                            name="challanNumber"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-4 space-y-0">
                                    <FormLabel className="w-[120px] shrink-0 text-left font-semibold">Challan No</FormLabel>
                                    <div className="flex items-center flex-1 space-x-2">
                                        <span className="font-bold">:</span>
                                        <FormControl>
                                            <Input placeholder="Auto Generated (RTN-...)" readOnly {...field} className="bg-muted text-muted-foreground h-8" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="manualChallanNumber"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-4 space-y-0">
                                    <FormLabel className="w-[140px] shrink-0 text-left font-semibold whitespace-nowrap">Manual Challan No.</FormLabel>
                                    <div className="flex items-center flex-1 space-x-2">
                                        <span className="font-bold">:</span>
                                        <FormControl>
                                            <Input placeholder="" {...field} value={field.value ?? ''} className="h-8" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-4 space-y-0 w-full">
                                        <FormLabel className="w-[120px] shrink-0 text-left font-semibold">Enter Customer</FormLabel>
                                        <div className="flex items-center flex-1 space-x-2">
                                            <span className="font-bold">:</span>
                                            <FormControl>
                                                <Autocomplete
                                                    items={customers.map(c => ({
                                                        value: c.id,
                                                        label: c.name,
                                                        subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                                        tertiaryLabel: formatCustomerAddress(c)
                                                    }))}
                                                    value={field.value}
                                                    onChange={(value) => {
                                                        field.onChange(value);
                                                        // Fallback to any agreement even if closed, because Returns can be against closed agreements
                                                        const customerAgreements = agreements.filter(a => a.customerId === value);
                                                        form.setValue("agreementId", customerAgreements.length > 0 ? customerAgreements[0].id : "");
                                                        loadCustomerStock(value as string);
                                                    }} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-4 space-y-0">
                                    <FormLabel className="w-[120px] shrink-0 text-left font-semibold">Date</FormLabel>
                                    <div className="flex items-center flex-1 space-x-2">
                                        <span className="font-bold">:</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal h-8",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "dd-MMM-yyyy") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicleNumber"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-4 space-y-0">
                                    <FormLabel className="w-[140px] shrink-0 text-left font-semibold">Vehicle No.</FormLabel>
                                    <div className="flex items-center flex-1 space-x-2">
                                        <span className="font-bold">:</span>
                                        <FormControl>
                                            <Input placeholder="" {...field} value={field.value ?? ''} className="h-8" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hidden Agreement Field to meet backend requirements invisibly */}
                        <FormField
                            control={form.control}
                            name="agreementId"
                            render={({ field }) => (
                                <FormItem className="hidden">
                                    <FormControl>
                                        <Input type="hidden" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Return Items</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ materialId: '', quantity: 1 })}
                                disabled={!watchCustomerId || availableMaterials.length === 0}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>

                        {!watchCustomerId && (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                                Please select a Customer to fetch returnable items.
                            </div>
                        )}

                        {watchCustomerId && availableMaterials.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                                This customer has no items to return (Stock is 0).
                            </div>
                        )}

                        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[30%]">Material Name</TableHead>
                                        <TableHead>Returned Quantity</TableHead>
                                        <TableHead>Damage Quantity</TableHead>
                                        <TableHead>Short Quantity</TableHead>
                                        <TableHead className="text-right">Balance Quantity</TableHead>
                                        <TableHead className="text-right">Frozen Quantity</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const materialId = form.watch(`items.${index}.materialId`);
                                        const stockItem = availableMaterials.find(m => m.value === materialId);
                                        const returnedQty = form.watch(`items.${index}.quantity`) || 0;
                                        const damageQty = form.watch(`items.${index}.damageQuantity`) || 0;
                                        const shortQty = form.watch(`items.${index}.shortQuantity`) || 0;
                                        const maxQty = stockItem?.maxQty || 0;

                                        const totalDeducted = returnedQty + damageQty + shortQty;
                                        const balanceQty = maxQty > 0 ? (maxQty - totalDeducted) : 0;

                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell className="align-top pt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.materialId`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <InlineCombobox
                                                                        items={availableMaterials}
                                                                        value={field.value}
                                                                        onChange={field.onChange}
                                                                        placeholder="Select Material..."
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top pt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? '' : (parseInt(e.target.value) || 0);
                                                                            field.onChange(val);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top pt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.damageQuantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? '' : (parseInt(e.target.value) || 0);
                                                                            field.onChange(val);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top pt-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.shortQuantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? '' : (parseInt(e.target.value) || 0);
                                                                            field.onChange(val);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="align-top pt-4 text-right">
                                                    <div className="font-medium px-3 py-2 border border-transparent">
                                                        {balanceQty}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top pt-4 text-right">
                                                    <div className="font-medium px-3 py-2 border border-transparent text-muted-foreground">
                                                        -
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top pt-4 pl-0 pr-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Footer Layout Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 bg-card border rounded-b-lg shadow-sm text-sm">
                        {/* Left Column */}
                        <div className="flex flex-col border-r divide-y divide-border">
                            {[
                                { name: "goodsValue", label: "Goods Value", type: "number" },
                                { name: "transportationCost", label: "Transportation", type: "number" },
                                { name: "eWayBillNo", label: "E-Way Bill No", type: "text" },
                                { name: "transporterName", label: "Transporter Name", type: "text" },
                                { name: "receiverName", label: "Receiver Name", type: "text" },
                                { name: "driverName", label: "Driver Name", type: "text" },
                                { name: "licenseNumber", label: "License No", type: "text" }
                            ].map(fieldConfig => (
                                <FormField
                                    key={fieldConfig.name}
                                    control={form.control}
                                    name={fieldConfig.name as any}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center px-4 py-1 space-y-0">
                                            <FormLabel className="w-1/3 font-semibold text-muted-foreground">{fieldConfig.label}</FormLabel>
                                            <FormControl className="flex-1">
                                                <Input
                                                    type={fieldConfig.type}
                                                    className="h-8 border-none shadow-none focus-visible:ring-0 rounded-none bg-muted/20 hover:bg-muted/50 transition-colors"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(fieldConfig.type === 'number' ? (e.target.value === '' ? undefined : parseFloat(e.target.value)) : e.target.value)}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col divide-y divide-border">
                            {[
                                { name: "weight", label: "Weight", type: "number" },
                                { name: "greenTax", label: "Green Tax", type: "number" },
                                { name: "biltyNumber", label: "Bilty No", type: "text" },
                                { name: "receiverMobile", label: "Mobile No", type: "text" },
                                { name: "driverMobile", label: "Driver Mobile No", type: "text" },
                                { name: "timeIn", label: "Time In", type: "text" }
                            ].map(fieldConfig => (
                                <FormField
                                    key={fieldConfig.name}
                                    control={form.control}
                                    name={fieldConfig.name as any}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center px-4 py-1 space-y-0">
                                            <FormLabel className="w-1/3 font-semibold text-muted-foreground">{fieldConfig.label}</FormLabel>
                                            <FormControl className="flex-1">
                                                <Input
                                                    type={fieldConfig.type}
                                                    className="h-8 border-none shadow-none focus-visible:ring-0 rounded-none bg-muted/20 hover:bg-muted/50 transition-colors"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(fieldConfig.type === 'number' ? (e.target.value === '' ? undefined : parseFloat(e.target.value)) : e.target.value)}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
                        <Button type="button" variant="outline" className="w-32 hover:bg-muted" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="button" variant="outline" className="w-32 hover:bg-muted" onClick={handlePrint} disabled={loading}>
                            {loading && action === 'print' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Printer className="mr-2 h-4 w-4" /> Print Return
                        </Button>
                        <Button type="submit" className="w-32 hover:bg-primary/90" onClick={() => setAction('save')} disabled={loading}>
                            {loading && action === 'save' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Return
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
