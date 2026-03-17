'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
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
} from '@/components/ui/command';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useToast } from '@/hooks/use-toast';
import { fetchCustomers, fetchMaterials, createAgreement, fetchLatestQuotationByCustomer } from '@/lib/api';

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
    })).min(1, 'At least one item is required'),
});

type AgreementFormValues = z.infer<typeof agreementSchema>;

export default function CreateAgreementPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
                    description: 'Failed to load data',
                    variant: 'destructive',
                });
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, [toast]);

    // Auto-fill addresses when customer is selected
    const onCustomerSelect = (customerId: string) => {
        form.setValue('customerId', customerId);
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            form.setValue('siteAddress', customer.siteAddress || customer.officeAddress || '');
            form.setValue('residenceAddress', customer.officeAddress || customer.siteAddress || '');

            // Set Reference as Authorized Representative
            const reference = [customer.relationType, customer.relationName].filter(Boolean).join(' ');
            form.setValue('authorizedRepresentative', reference);

            // Fetch and populate items from latest quotation
            fetchLatestQuotationByCustomer(customerId).then((quotation) => {
                if (quotation && quotation.items && quotation.items.length > 0) {
                    const agreementItems = quotation.items.map((item: any) => ({
                        materialId: item.materialId,
                        hireRate: item.hireRate,
                        damageRecoveryRate: item.damageRecoveryRate,
                        shortRecoveryRate: item.shortRecoveryRate,
                        rateAppliedAs: item.rateAppliedAs,
                    }));
                    form.setValue('items', agreementItems);
                    toast({
                        title: "Quotation Items Loaded",
                        description: `Loaded ${agreementItems.length} items from latest quotation.`,
                    });
                }
            }).catch((err) => {
                console.error("Failed to fetch quotation:", err);
            });
        }
    };

    // Sync search term with selected customer when dropdown closes or value changes
    useEffect(() => {
        const customerId = form.getValues('customerId');
        if (customerId && !open) {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                const displayName = `${customer.name} ${customer.relationType ? `${customer.relationType}-${customer.relationName}` : ''}`.trim();
                setSearchTerm(displayName);
            }
        }
    }, [open, customers, form.watch('customerId')]);

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

    const onSubmit = async (data: AgreementFormValues) => {
        try {
            setLoading(true);
            await createAgreement(data);
            toast({
                title: 'Success',
                description: 'Agreement created successfully',
            });
            router.push('/dashboard/agreement');
        } catch (error) {
            console.error('Failed to create agreement:', error);
            toast({
                title: 'Error',
                description: 'Failed to create agreement',
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
                    <h2 className="text-xl font-bold tracking-tight">Create Agreement</h2>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
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
                                        onChange={(val: string) => {
                                            field.onChange(val);
                                            onCustomerSelect(val);
                                        }}
                                        placeholder="Search customer..."
                                        className="w-full"
                                    />
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
                                                disabled={(date) =>
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

                        <FormField
                            control={form.control}
                            name="minimumRentPeriod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Rent Period (Days)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
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
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
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
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="residenceAddress"
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Office Address</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Agreement Items</h3>

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
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
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
                            Create Agreement
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
                            onBlur={() => {
                                // Small delay to allow click on item
                                // With Popover, interacting with content might not trigger blur on input immediately if focus moves?
                                // Actually, if we click PopoverContent, focus moves there.
                                // But we set onOpenAutoFocus preventDefault.
                                // If we click item, we select.
                                // If we click outside, Popover closes (onOpenChange).
                                // So we might not need onBlur here?
                                // But if we tab away?
                                // Let's keep a simple blur handler or rely on Popover's outside click.
                                // Actually, for Combobox, we usually don't close on blur if interacting with list.
                                // Popover handles "interact outside".
                                // So strictly speaking, onBlur is not needed for closing, Popover handles it.
                                // But if we tab to next field, popover should close. Popover does close on focus interaction outside.
                            }}
                            className="h-5 w-full border-0 p-0 focus-visible:ring-0"
                        />
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    className="p-0 w-[--radix-popover-anchor-width] min-w-[300px]"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
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
                </PopoverContent>
            </Popover>
        </Command>
    );
}
