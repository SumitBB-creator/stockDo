'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Loader2, Printer, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/components/ui/use-toast';
import { fetchCustomers, fetchAgreements, createChallan } from '@/lib/api';
import { formatCustomerAddress } from '@/lib/utils';

// Validation Schema
const formSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    agreementId: z.string().min(1, "Agreement is required"),
    date: z.string().min(1, "Date is required"),
    manualChallanNumber: z.string().optional(),
    vehicleNumber: z.string().optional(),
    eWayBillNo: z.string().optional(),

    // Items
    items: z.array(z.object({
        materialId: z.string(),
        quantity: z.number().min(1, "Qty > 0"),
        issuedQuantity: z.number().optional(),
        balanceQuantity: z.number().optional()
    })).min(1, "Add at least one item"),

    // Footer Fields - Allow string coming from Input, transform to number or undefined
    goodsValue: z.union([z.string(), z.number()]).optional().transform(v => v === '' ? undefined : Number(v)),
    weight: z.union([z.string(), z.number()]).optional().transform(v => v === '' ? undefined : Number(v)),
    transportationCost: z.union([z.string(), z.number()]).optional().transform(v => v === '' ? undefined : Number(v)),
    greenTax: z.union([z.string(), z.number()]).optional().transform(v => v === '' ? undefined : Number(v)),

    transporterName: z.string().optional(),
    biltyNumber: z.string().optional(),
    receiverName: z.string().optional(),
    receiverMobile: z.string().optional(),
    driverName: z.string().optional(),
    driverMobile: z.string().optional(),
    licenseNumber: z.string().optional(),
    timeOut: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

export default function CreateChallanPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [agreements, setAgreements] = useState<any[]>([]);

    // Derived state
    const [activeAgreement, setActiveAgreement] = useState<any>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            items: [],
            manualChallanNumber: '',
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
            timeOut: '',
        }
    });

    // Watchers
    const selectedCustomerId = form.watch('customerId');

    useEffect(() => {
        loadInitialData();
    }, []);

    // When customer changes, fetch their active agreement
    useEffect(() => {
        if (selectedCustomerId) {
            const customerAgreement = agreements.find(a => a.customerId === selectedCustomerId && a.status === 'Active');
            if (customerAgreement) {
                setActiveAgreement(customerAgreement);
                form.setValue('agreementId', customerAgreement.id);
            } else {
                setActiveAgreement(null);
                form.setValue('agreementId', '');
            }
        }
    }, [selectedCustomerId, agreements, form]);

    const loadInitialData = async () => {
        try {
            const [custData, agreeData] = await Promise.all([
                fetchCustomers(),
                fetchAgreements('Active')
            ]);
            setCustomers(custData);
            setAgreements(agreeData);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    const onSubmit = async (values: FormValues, action: 'save' | 'print' = 'save') => {
        setLoading(true);
        try {
            const payload: any = {
                customerId: values.customerId,
                agreementId: values.agreementId,
                date: values.date,
                type: 'ISSUE',
                items: values.items.map(item => ({
                    materialId: item.materialId,
                    quantity: item.quantity
                })),
                manualChallanNumber: values.manualChallanNumber || undefined,
                vehicleNumber: values.vehicleNumber || undefined,
                eWayBillNo: values.eWayBillNo || undefined,
                transporterName: values.transporterName || undefined,
                biltyNumber: values.biltyNumber || undefined,
                receiverName: values.receiverName || undefined,
                receiverMobile: values.receiverMobile || undefined,
                driverName: values.driverName || undefined,
                driverMobile: values.driverMobile || undefined,
                licenseNumber: values.licenseNumber || undefined,
                timeOut: values.timeOut || undefined,
            };

            // Safely add numeric fields if they are valid numbers
            if (values.goodsValue && !isNaN(Number(values.goodsValue))) payload.goodsValue = Number(values.goodsValue);
            if (values.weight && !isNaN(Number(values.weight))) payload.weight = Number(values.weight);
            if (values.transportationCost && !isNaN(Number(values.transportationCost))) payload.transportationCost = Number(values.transportationCost);
            if (values.greenTax && !isNaN(Number(values.greenTax))) payload.greenTax = Number(values.greenTax);

            const result = await createChallan(payload);
            toast({ title: "Success", description: "Challan created successfully" });

            if (action === 'print' && result?.id) {
                router.push(`/dashboard/stock/challan/${result.id}/print`);
            } else {
                router.push('/dashboard/stock/challan');
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create challan",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const onError = (errors: any) => {
        console.error("Form Errors:", errors);
        toast({
            title: "Validation Error",
            description: "Please check the form fields.",
            variant: "destructive"
        });
    };

    const handlePrint = () => {
        form.handleSubmit((data) => onSubmit(data, 'print'), onError)();
    };

    const handleAddItem = (materialId: string) => {
        const currentItems = form.getValues('items');
        if (currentItems.find(i => i.materialId === materialId)) return;

        form.setValue('items', [...currentItems, { materialId, quantity: 0, issuedQuantity: 0, balanceQuantity: 0 }]);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Create Challan</h2>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => onSubmit(data, 'save'), onError)} className="space-y-8">

                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-2">
                            <Label className="text-sm font-medium">Challan No</Label>
                            <div className="font-mono font-medium mt-2">CHN-AUTO</div>
                        </div>

                        <FormField
                            control={form.control}
                            name="manualChallanNumber"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Manual Challan No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} placeholder="Optional mapping..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col space-y-2">
                            <Label className="text-sm font-medium">Customer</Label>
                            <Controller
                                control={form.control}
                                name="customerId"
                                render={({ field }) => (
                                    <Autocomplete
                                        items={customers.map(c => ({
                                            value: c.id,
                                            label: c.name,
                                            subLabel: c.relationType && c.relationName ? `${c.relationType} ${c.relationName}` : undefined,
                                            tertiaryLabel: formatCustomerAddress(c)
                                        }))}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Search Customer..."
                                        className="w-full"
                                    />
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicleNumber"
                            render={({ field }) => (
                                <FormItem className="flex flex-col md:col-start-1 md:col-span-2">
                                    <FormLabel>Vehicle No.</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} placeholder="e.g. MH-12-AB-1234" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Material Table Section */}
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Material Name</TableHead>
                                    <TableHead className="w-[25%]">Issued Quantity</TableHead>
                                    <TableHead className="w-[25%]">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Active Agreement Items Selector */}
                                {activeAgreement && activeAgreement.items.map((item: any) => {
                                    const formItems = form.watch('items');
                                    const formItemIndex = formItems.findIndex(i => i.materialId === item.materialId);
                                    const isSelected = formItemIndex >= 0;

                                    return (
                                        <TableRow key={item.id} className={isSelected ? 'bg-muted/50' : ''}>
                                            <TableCell className="font-medium p-4">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                handleAddItem(item.materialId);
                                                            } else {
                                                                const newItems = formItems.filter(i => i.materialId !== item.materialId);
                                                                form.setValue('items', newItems);
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    {item.material?.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                {isSelected && (
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="max-w-[150px]"
                                                        {...form.register(`items.${formItemIndex}.quantity`, { valueAsNumber: true })}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="p-4 text-muted-foreground">
                                                0 {/* Placeholder for Balance logic */}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!activeAgreement && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            Select a customer with an active agreement to view materials.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">

                        <FormField
                            control={form.control}
                            name="goodsValue"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Goods Value</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Weight</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="transportationCost"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Transportation</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="greenTax"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Green Tax</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="transporterName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Transporter Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="eWayBillNo"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>E-Way Bill No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="biltyNumber"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Bilty No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="receiverName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Receiver Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="receiverMobile"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Mobile No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="driverName"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Driver Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="driverMobile"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Driver Mobile No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="licenseNumber"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>License No</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="timeOut"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Time Out</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary" onClick={handlePrint} disabled={loading}>
                            <Printer className="mr-2 h-4 w-4" /> Print Challan
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Challan
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
