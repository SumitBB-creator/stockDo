'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Assuming this exists or using Input
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchCompany, updateCompany, uploadLogo } from '@/lib/api';

const companySchema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    employerName: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    stateCode: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pin: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    phone: z.string().optional(),
    fax: z.string().optional(),
    pan: z.string().optional(),
    gstin: z.string().optional(),
    history: z.string().optional(),
    logo: z.string().optional(),
    gstOnTransportation: z.boolean().default(false).optional(),
    fixedAssetsValue: z.number().default(0).optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: '',
            employerName: '',
            address1: '',
            address2: '',
            city: '',
            stateCode: '',
            state: '',
            country: '',
            pin: '',
            email: '',
            website: '',
            phone: '',
            fax: '',
            pan: '',
            gstin: '',
            history: '',
            logo: '',
            gstOnTransportation: false,
            fixedAssetsValue: 0,
        },
    });

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const data = await fetchCompany();
                if (data) {
                    form.reset({
                        companyName: data.companyName || '',
                        employerName: data.employerName || '',
                        address1: data.address1 || '',
                        address2: data.address2 || '',
                        city: data.city || '',
                        stateCode: data.stateCode || '',
                        state: data.state || '',
                        country: data.country || '',
                        pin: data.pin || '',
                        email: data.email || '',
                        website: data.website || '',
                        phone: data.phone || '',
                        fax: data.fax || '',
                        pan: data.pan || '',
                        gstin: data.gstin || '',
                        history: data.history || '',
                        logo: data.logo || '',
                        gstOnTransportation: data.gstOnTransportation || false,
                        fixedAssetsValue: data.fixedAssetsValue || 0,
                    });
                }
            } catch (error) {
                console.error('Failed to load company details:', error);
                // It's okay if it fails on 404/empty, user can create new.
            } finally {
                setLoading(false);
            }
        };
        loadCompany();
    }, [form]);

    const onSubmit = async (data: CompanyFormValues) => {
        try {
            setSaving(true);
            await updateCompany(data);
            toast({
                title: 'Success',
                description: 'Company details saved successfully',
            });
        } catch (error) {
            console.error('Failed to save company details:', error);
            toast({
                title: 'Error',
                description: 'Failed to save company details',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Company Details</h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <FormField control={form.control} name="companyName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name *</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="employerName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employer Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="website" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone No</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fax" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fax No</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <div className="col-span-1 md:col-span-3">
                            <h3 className="text-lg font-medium mb-4">Address Details</h3>
                        </div>
                        <FormField control={form.control} name="address1" render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-3">
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="address2" render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-3">
                                <FormLabel>Address Line 2</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="stateCode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>State Code</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="pin" render={({ field }) => (
                            <FormItem>
                                <FormLabel>PIN Code</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    {/* Tax & Others */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-lg font-medium mb-4">Tax & Other Details</h3>
                        </div>
                        <FormField control={form.control} name="pan" render={({ field }) => (
                            <FormItem>
                                <FormLabel>PAN</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="gstin" render={({ field }) => (
                            <FormItem>
                                <FormLabel>GSTIN</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="fixedAssetsValue" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fixed Assets Valuation (Current)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Total current value of company assets (Vehicles, Machinery, etc.) for Balance Sheet.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {form.watch('gstin') && form.watch('gstin')?.trim() !== '' && (
                            <FormField control={form.control} name="gstOnTransportation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Add GST on Transportation</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val === 'true')}
                                        defaultValue={field.value ? 'true' : 'false'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        If Yes, GST will be applied to transportation costs.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        <FormField control={form.control} name="logo" render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Company Logo</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-4">
                                        {field.value && (
                                            <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={
                                                        field.value.startsWith('http')
                                                            ? field.value
                                                            : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${field.value}`
                                                    }
                                                    alt="Company Logo"
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            // Calculate API base URL without /api/v1 prefix for static files if needed
                                                            // But uploadLogo returns relative path /uploads/...
                                                            const result = await uploadLogo(file);
                                                            field.onChange(result.url);
                                                            toast({ title: "Logo uploaded successfully" });
                                                        } catch (error) {
                                                            console.error(error);
                                                            toast({ title: "Failed to upload logo", variant: "destructive" });
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>Upload a company logo image.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {/* Assuming Textarea component exists, if not fallback to Input or create it. Using Input for now if unsure, but code above imports Textarea. I'll check if Textarea exists in components/ui, if not I'll switch to Input or standard textarea */}
                        <FormField control={form.control} name="history" render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>History / About</FormLabel>
                                <FormControl>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Details
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
