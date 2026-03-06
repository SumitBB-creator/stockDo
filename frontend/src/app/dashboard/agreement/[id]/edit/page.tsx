'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Loader2, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useToast } from '@/hooks/use-toast';
import { fetchCustomers, fetchMaterials, fetchAgreement, updateAgreement, fetchLatestQuotationByCustomer } from '@/lib/api';

const agreementSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    validFrom: z.date(),
    siteAddress: z.string().optional(),
    residenceAddress: z.string().optional(),
    authorizedRepresentative: z.string().optional(),
    minimumRentPeriod: z.number().int('Must be a whole number').min(1, 'Minimum rent period is required'),
    status: z.string().default('Active'),
    items: z.array(z.object({
        materialId: z.string().min(1, 'Material is required'),
        hireRate: z.number().min(0, 'Must be positive'),
        damageRecoveryRate: z.number().min(0, 'Must be positive'),
        shortRecoveryRate: z.number().min(0, 'Must be positive'),
        rateAppliedAs: z.string().min(1),
        isExisting: z.boolean().optional(),
    })).min(1, 'At least one item is required'),
});

type AgreementFormValues = z.infer<typeof agreementSchema>;

export default function EditAgreementPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    // Store original status to handle transitions if needed, though mostly we just update.
    const [originalStatus, setOriginalStatus] = useState('Draft');

    const form = useForm<AgreementFormValues>({
        resolver: zodResolver(agreementSchema) as any,
        defaultValues: {
            customerId: '',
            validFrom: new Date(),
            siteAddress: '',
            residenceAddress: '',
            authorizedRepresentative: '',
            items: [],
            minimumRentPeriod: 30,
            status: 'Active'
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        name: 'items',
        control: form.control,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [customersData, materialsData, agreementData] = await Promise.all([
                    fetchCustomers(),
                    fetchMaterials(),
                    fetchAgreement(params.id as string)
                ]);
                setCustomers(customersData);
                setMaterials(materialsData);
                setOriginalStatus(agreementData.status);

                // Populate form
                form.reset({
                    customerId: agreementData.customerId,
                    validFrom: new Date(agreementData.validFrom),
                    siteAddress: agreementData.siteAddress || '',
                    residenceAddress: agreementData.residenceAddress || '',
                    authorizedRepresentative: agreementData.authorizedRepresentative || '',
                    minimumRentPeriod: agreementData.minimumRentPeriod,
                    status: agreementData.status,
                    items: agreementData.items.map((item: any) => ({
                        materialId: item.materialId,
                        hireRate: item.hireRate,
                        damageRecoveryRate: item.damageRecoveryRate,
                        shortRecoveryRate: item.shortRecoveryRate,
                        rateAppliedAs: item.rateAppliedAs,
                        isExisting: true // Mark as existing
                    }))
                });

            } catch (error) {
                console.error('Failed to load data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load agreement data',
                    variant: 'destructive',
                });
                router.push('/dashboard/agreement');
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, [params.id, toast, router, form]);

    // Sync search term only if customer changes manually (handled by onCustomerSelect/setSearchTerm)
    // or if we need to re-verify against loaded customers. 
    // The initial load sets it.

    const onMaterialSelect = (index: number, materialId: string) => {
        const material = materials.find((m) => m.id === materialId);
        if (material) {
            update(index, {
                materialId,
                hireRate: material.hireRate || 0,
                damageRecoveryRate: material.damageRecoveryRate || 0,
                shortRecoveryRate: material.shortRecoveryRate || 0,
                rateAppliedAs: 'Nos/Days', // Default
                isExisting: false
            });
        }
    };

    const onSubmit = async (data: AgreementFormValues) => {
        try {
            setLoading(true);

            // Strip isExisting flag from items before sending to API
            // content of data.items is what we want, but without isExisting
            const payload = {
                ...data,
                items: data.items.map(({ isExisting, ...rest }: any) => rest)
            };

            await updateAgreement(params.id as string, payload);
            toast({
                title: 'Success',
                description: 'Agreement updated successfully',
            });
            router.push('/dashboard/agreement');
        } catch (error) {
            console.error('Failed to update agreement:', error);
            toast({
                title: 'Error',
                description: 'Failed to update agreement',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight">Edit Agreement</h2>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Field - Maybe disable changing customer in Edit mode? Usually Agreement is tied to customer. 
                            But if we allow it, we should be careful. I'll allow it but keeps the logic simple.
                        */}
                        <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Customer</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm">
                                        {(() => {
                                            const customer = customers.find(c => c.id === field.value);
                                            // Handle case where customers might not remain loaded or customer not found
                                            if (!customer) {
                                                return <div className="text-muted-foreground">Loading customer details...</div>;
                                            }
                                            return (
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                        {customer.relationType && (
                                                            <span>{customer.relationType} - {customer.relationName}</span>
                                                        )}
                                                        {customer.ledgerAccountId && (
                                                            <span>• Ledger: {customer.ledgerAccountId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="validFrom"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Valid From</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm">
                                        {field.value ? format(field.value, "PPP") : "N/A"}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="minimumRentPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Rent Period (Days)</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm">
                                        {field.value || 0} Days
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="authorizedRepresentative"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Authorized Representative</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm min-h-[40px]">
                                        {field.value || "N/A"}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="siteAddress"
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Site Address</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm min-h-[80px] whitespace-pre-wrap">
                                        {field.value || "N/A"}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="residenceAddress"
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Residence Address</FormLabel>
                                    <div className="rounded-md border bg-muted p-2.5 text-sm min-h-[80px] whitespace-pre-wrap">
                                        {field.value || "N/A"}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Agreement Items</h3>
                            <div className="text-sm text-muted-foreground">
                                Existing items are read-only. Add new items below.
                            </div>
                        </div>

                        <div className="border rounded-md">
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
                                    {fields.map((field: any, index) => (
                                        <TableRow key={field.id} className={field.isExisting ? "bg-muted/30" : ""}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {field.isExisting ? (
                                                    <div className="py-2 text-sm font-medium">
                                                        {materials.find(m => m.id === field.materialId)?.name || 'Unknown Material'}
                                                    </div>
                                                ) : (
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.materialId`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <MaterialCombobox
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    materials={materials}
                                                                    onSelect={(material) => onMaterialSelect(index, material.id)}
                                                                    isOptionDisabled={(id) => form.watch('items')?.some((item, idx) => item.materialId === id && idx !== index)}
                                                                />
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {field.isExisting ? (
                                                    <div className="py-2 text-sm">{field.hireRate}</div>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {field.isExisting ? (
                                                    <div className="py-2 text-sm">{field.damageRecoveryRate}</div>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {field.isExisting ? (
                                                    <div className="py-2 text-sm">{field.shortRecoveryRate}</div>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {field.isExisting ? (
                                                    <div className="py-2 text-sm">{field.rateAppliedAs}</div>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {!field.isExisting && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
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
                                onClick={() => append({ materialId: '', hireRate: 0, damageRecoveryRate: 0, shortRecoveryRate: 0, rateAppliedAs: 'Nos/Days', isExisting: false })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </div>
                        {form.formState.errors.items && (
                            <p className="text-sm font-medium text-destructive">
                                {form.formState.errors.items.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Agreement
                        </Button>
                    </div>
                </form>
            </Form>
        </div >
    );
}

function MaterialCombobox({
    value,
    onChange,
    materials,
    onSelect,
    isOptionDisabled
}: {
    value: string;
    onChange: (value: string) => void;
    materials: any[];
    onSelect: (material: any) => void;
    isOptionDisabled?: (id: string) => boolean;
}) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (value && !open) {
            const material = materials.find(m => m.id === value);
            if (material) {
                setSearchTerm(material.name);
            }
        }
    }, [open, value, materials]);

    return (
        <Command className="overflow-visible bg-transparent [&_[cmdk-input-wrapper]]:border-0 [&_[cmdk-input-wrapper]]:px-0 [&_[cmdk-input-wrapper]_svg]:hidden [&_[cmdk-input]]:h-auto [&_[cmdk-input]]:py-0">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <CommandInput
                            placeholder="Select Material"
                            value={searchTerm}
                            onValueChange={(val) => {
                                setSearchTerm(val);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            className="h-5 w-full border-0 p-0 focus-visible:ring-0"
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="p-0 w-[--radix-popover-anchor-width] min-w-[300px]"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="relative">
                        <div className="absolute top-0 z-[9999] w-full min-w-[300px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
                            <CommandList>
                                <CommandEmpty>No material found.</CommandEmpty>
                                <CommandGroup>
                                    {materials.map((material) => (
                                        <CommandItem
                                            key={material.id}
                                            value={material.name}
                                            disabled={isOptionDisabled ? isOptionDisabled(material.id) : false}
                                            onSelect={() => {
                                                if (isOptionDisabled && isOptionDisabled(material.id)) return;
                                                onChange(material.id);
                                                onSelect(material);
                                                setSearchTerm(material.name);
                                                setOpen(false);
                                            }}
                                            className={cn("cursor-pointer", isOptionDisabled && isOptionDisabled(material.id) && "opacity-50 cursor-not-allowed")}
                                        >
                                            {material.name}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    material.id === value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </Command>
    );
}
