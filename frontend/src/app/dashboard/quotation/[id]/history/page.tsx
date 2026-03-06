'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchQuotation, fetchQuotationVersions, fetchCustomers, fetchMaterials } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuotationVersion {
    id: string;
    version: number;
    data: any;
    createdAt: string;
}

export default function QuotationHistoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();

    // Data State
    const [quotation, setQuotation] = useState<any>(null);
    const [versions, setVersions] = useState<QuotationVersion[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [selectedVersionData, setSelectedVersionData] = useState<any>(null);
    const [comparisonVersionData, setComparisonVersionData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'diff' | 'snapshot'>('diff');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [quotationData, versionsData, customersData, materialsData] = await Promise.all([
                    fetchQuotation(id),
                    fetchQuotationVersions(id),
                    fetchCustomers(),
                    fetchMaterials(),
                ]);
                setQuotation(quotationData);
                setVersions(versionsData);
                setCustomers(customersData);
                setMaterials(materialsData);
            } catch (error) {
                console.error('Failed to load history:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load quotation history',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, toast]);

    const getCustomerName = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown Customer';
    };

    const getMaterialName = (materialId: string) => {
        const material = materials.find(m => m.id === materialId);
        return material ? material.name : 'Unknown Material';
    };

    const parseData = (data: any) => {
        if (typeof data === 'string') return JSON.parse(data);
        return data;
    };

    const handleViewVersion = (version: QuotationVersion | 'current') => {
        if (version === 'current') {
            // Current version vs Latest History
            const currentData = {
                ...quotation,
                date: quotation.date, // Ensure format matches if needed
            };
            setSelectedVersionData(currentData);

            if (versions.length > 0) {
                // Compare with the latest historical version (first in list)
                setComparisonVersionData(parseData(versions[0].data));
            } else {
                setComparisonVersionData(null); // No history to compare
            }
        } else {
            // Selected History vs Previous History
            const currentData = parseData(version.data);
            setSelectedVersionData(currentData);

            // Find the version immediately before this one
            // versions is desc: [v3, v2, v1]
            // if selected is v2 (index 1), previous is v1 (index 2)
            const currentIndex = versions.findIndex(v => v.id === version.id);
            if (currentIndex !== -1 && currentIndex < versions.length - 1) {
                setComparisonVersionData(parseData(versions[currentIndex + 1].data));
            } else {
                setComparisonVersionData(null); // It's the first version
            }
        }
    };

    const computeDiff = (oldData: any, newData: any) => {
        const changes: any[] = [];
        if (!oldData || !newData) return changes;

        // 1. Header Fields
        if (oldData.customerId !== newData.customerId) {
            changes.push({
                field: 'Customer',
                oldVal: getCustomerName(oldData.customerId),
                newVal: getCustomerName(newData.customerId)
            });
        }

        const oldDate = new Date(oldData.date).toDateString();
        const newDate = new Date(newData.date).toDateString();
        if (oldDate !== newDate) {
            changes.push({
                field: 'Date',
                oldVal: format(new Date(oldData.date), 'PPP'),
                newVal: format(new Date(newData.date), 'PPP')
            });
        }

        if (oldData.status !== newData.status) {
            changes.push({
                field: 'Status',
                oldVal: oldData.status || 'Draft',
                newVal: newData.status || 'Draft'
            });
        }

        // 2. Items
        const oldItems = oldData.items || [];
        const newItems = newData.items || [];
        const allMaterialIds = new Set([
            ...oldItems.map((i: any) => i.materialId),
            ...newItems.map((i: any) => i.materialId)
        ]);

        allMaterialIds.forEach(matId => {
            const oldItem = oldItems.find((i: any) => i.materialId === matId);
            const newItem = newItems.find((i: any) => i.materialId === matId);

            const matName = getMaterialName(matId);

            if (!oldItem && newItem) {
                changes.push({ field: `Item Added: ${matName}`, oldVal: '-', newVal: `Hire Rate: ${newItem.hireRate}` });
            } else if (oldItem && !newItem) {
                changes.push({ field: `Item Removed: ${matName}`, oldVal: `Hire Rate: ${oldItem.hireRate}`, newVal: '-' });
            } else if (oldItem && newItem) {
                // Check specific fields
                if (oldItem.hireRate !== newItem.hireRate) {
                    changes.push({ field: `Item Update: ${matName} (Hire Rate)`, oldVal: oldItem.hireRate, newVal: newItem.hireRate });
                }
                if (oldItem.damageRecoveryRate !== newItem.damageRecoveryRate) {
                    changes.push({ field: `Item Update: ${matName} (Dmg Rec)`, oldVal: oldItem.damageRecoveryRate, newVal: newItem.damageRecoveryRate });
                }
                if (oldItem.shortRecoveryRate !== newItem.shortRecoveryRate) {
                    changes.push({ field: `Item Update: ${matName} (Short Rec)`, oldVal: oldItem.shortRecoveryRate, newVal: newItem.shortRecoveryRate });
                }
                if (oldItem.rateAppliedAs !== newItem.rateAppliedAs) {
                    changes.push({ field: `Item Update: ${matName} (Rate Unit)`, oldVal: oldItem.rateAppliedAs, newVal: newItem.rateAppliedAs });
                }
            }
        });

        return changes;
    };

    const renderSnapshotContent = (data: any) => {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold block">Customer:</span>
                        {getCustomerName(data.customerId)}
                    </div>
                    <div>
                        <span className="font-semibold block">Date:</span>
                        {data.date ? format(new Date(data.date), 'PPP') : 'N/A'}
                    </div>
                    <div>
                        <span className="font-semibold block">Quotation ID:</span>
                        {data.quotationId || 'N/A'}
                    </div>
                    <div>
                        <span className="font-semibold block">Status:</span>
                        {data.status || 'Draft'}
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead className="text-right">Hire Rate</TableHead>
                                <TableHead className="text-right">Damage (Rec)</TableHead>
                                <TableHead className="text-right">Short (Rec)</TableHead>
                                <TableHead>Rate As</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.items?.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{getMaterialName(item.materialId)}</TableCell>
                                    <TableCell className="text-right">{item.hireRate}</TableCell>
                                    <TableCell className="text-right">{item.damageRecoveryRate}</TableCell>
                                    <TableCell className="text-right">{item.shortRecoveryRate}</TableCell>
                                    <TableCell>{item.rateAppliedAs}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Version History</h2>
                    <p className="text-muted-foreground">
                        History for Quotation {quotation?.quotationId}
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Version</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Items Count</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-muted/50">
                            <TableCell className="font-medium">Current (v{quotation.version})</TableCell>
                            <TableCell>{format(new Date(quotation.updatedAt), 'PP pp')}</TableCell>
                            <TableCell>{quotation.items?.length || 0}</TableCell>
                            <TableCell>
                                {quotation.items?.reduce((sum: number, item: any) => sum + (item.hireRate || 0), 0) || 0} (Hire Rate Total)
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewVersion('current')}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </Button>
                            </TableCell>
                        </TableRow>

                        {versions.map((v) => {
                            const data = parseData(v.data);
                            return (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">v{v.version}</TableCell>
                                    <TableCell>{format(new Date(v.createdAt), 'PP pp')}</TableCell>
                                    <TableCell>{data.items?.length || 0}</TableCell>
                                    <TableCell>
                                        {data.items?.reduce((sum: number, item: any) => sum + (item.hireRate || 0), 0) || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewVersion(v)}>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {versions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No past versions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedVersionData} onOpenChange={(open) => !open && setSelectedVersionData(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Version Details
                            {selectedVersionData?.version ? ` (v${selectedVersionData.version})` : ' (Current)'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedVersionData && (
                                comparisonVersionData
                                    ? `Comparing with previous version (v${comparisonVersionData.version})`
                                    : "Initial Version (No previous history)"
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center space-x-1 rounded-md bg-muted p-1">
                        <button
                            onClick={() => setViewMode('diff')}
                            className={cn(
                                "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                viewMode === 'diff'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted-foreground/10"
                            )}
                        >
                            Changes vs Previous
                        </button>
                        <button
                            onClick={() => setViewMode('snapshot')}
                            className={cn(
                                "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                viewMode === 'snapshot'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted-foreground/10"
                            )}
                        >
                            Full Snapshot
                        </button>
                    </div>

                    <ScrollArea className="flex-1 p-1 mt-4 border rounded-md">
                        <div className="p-4">
                            {selectedVersionData && (
                                viewMode === 'diff' ? (
                                    comparisonVersionData ? (
                                        <div className="space-y-4">
                                            <div className="text-sm text-muted-foreground mb-4">
                                                Comparing v{selectedVersionData.version || 'Current'} with v{comparisonVersionData.version}
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[200px]">Field / Item</TableHead>
                                                        <TableHead>Old Value</TableHead>
                                                        <TableHead>New Value</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {computeDiff(comparisonVersionData, selectedVersionData).length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                                No significant changes detected.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        computeDiff(comparisonVersionData, selectedVersionData).map((change, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="font-medium">{change.field}</TableCell>
                                                                <TableCell className="text-red-500 line-through decoration-red-500/50">{change.oldVal}</TableCell>
                                                                <TableCell className="text-green-600 font-medium">{change.newVal}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground py-10">
                                            This is the first version (Initial). No previous changes to compare.
                                        </div>
                                    )
                                ) : (
                                    renderSnapshotContent(selectedVersionData)
                                )
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
