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
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Settings2, Trash2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Type definition (move to types.ts later if needed)
interface Vehicle {
    id: string;
    vehicleNumber: string;
    vehicleType: string;
    nextServiceDue?: string;
    pollutionDue?: string;
    insuranceDue?: string;
    roadTaxDue?: string;
    tokenTaxDue?: string;
    nationalPermitDue?: string;
    statePermitDue?: string;
    fitnessTestDue?: string;
    details?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inline Add State
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        vehicleNumber: '',
        vehicleType: '',
        details: '',
        // Dates are undefined by default
    });

    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
        vehicleNumber: true,
        vehicleType: true,
        nextServiceDue: true,
        pollutionDue: true,
        insuranceDue: true,
        roadTaxDue: true,
        tokenTaxDue: true,
        nationalPermitDue: true,
        statePermitDue: true,
        fitnessTestDue: true,
        details: true,
        action: true,
    });

    const { toast } = useToast();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load vehicles.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewVehicleChange = (field: string, value: any) => {
        setNewVehicle(prev => ({ ...prev, [field]: value }));
    };

    const handleAddNew = async () => {
        setIsSubmitting(true);
        try {
            if (!newVehicle.vehicleNumber || !newVehicle.vehicleType) {
                toast({ variant: 'destructive', title: 'Error', description: 'Vehicle Number and Type are required.' });
                return;
            }

            // Format dates to ISO string if they exist, else undefined
            const payload = { ...newVehicle };

            await api.post('/vehicles', payload);
            toast({ title: 'Success', description: 'Vehicle created successfully.' });

            setNewVehicle({
                vehicleNumber: '',
                vehicleType: '',
                details: '',
                nextServiceDue: undefined,
                pollutionDue: undefined,
                insuranceDue: undefined,
                roadTaxDue: undefined,
                tokenTaxDue: undefined,
                nationalPermitDue: undefined,
                statePermitDue: undefined,
                fitnessTestDue: undefined,
            });
            fetchVehicles();
        } catch (error) {
            console.error('Failed to create vehicle:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create vehicle.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast({ title: 'Success', description: 'Vehicle deleted successfully.' });
            fetchVehicles();
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete vehicle.' });
        }
    };

    // Helper for Date Picker
    const DatePickerCell = ({
        value,
        onChange,
        placeholder
    }: {
        value: string | undefined,
        onChange: (date: Date | undefined) => void,
        placeholder: string
    }) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[140px] pl-3 text-left font-normal h-8",
                        !value && "text-muted-foreground"
                    )}
                >
                    {value ? (
                        format(new Date(value), "PP")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => onChange(date)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );

    const ReadOnlyDateCell = ({ value }: { value: string | undefined }) => (
        <div className="whitespace-nowrap">
            {value ? format(new Date(value), 'PP') : '-'}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Vehicles</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
                            <Settings2 className="mr-2 h-4 w-4" />
                            View Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
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

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {visibleColumns.action && <TableHead className="w-[50px]">Action</TableHead>}
                            {visibleColumns.vehicleNumber && <TableHead>Vehicle Number</TableHead>}
                            {visibleColumns.vehicleType && <TableHead>Vehicle Type</TableHead>}
                            {visibleColumns.nextServiceDue && <TableHead>Next Service</TableHead>}
                            {visibleColumns.pollutionDue && <TableHead>Pollution Due</TableHead>}
                            {visibleColumns.insuranceDue && <TableHead>Insurance Due</TableHead>}
                            {visibleColumns.roadTaxDue && <TableHead>Road Tax Due</TableHead>}
                            {visibleColumns.tokenTaxDue && <TableHead>Token Tax Due</TableHead>}
                            {visibleColumns.nationalPermitDue && <TableHead>National Permit</TableHead>}
                            {visibleColumns.statePermitDue && <TableHead>State Permit</TableHead>}
                            {visibleColumns.fitnessTestDue && <TableHead>Fitness Due</TableHead>}
                            {visibleColumns.details && <TableHead>Details</TableHead>}
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
                                {vehicles.map((vehicle) => (
                                    <TableRow key={vehicle.id}>
                                        {visibleColumns.action && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(vehicle.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                        {visibleColumns.vehicleNumber && <TableCell className="font-medium">{vehicle.vehicleNumber}</TableCell>}
                                        {visibleColumns.vehicleType && <TableCell>{vehicle.vehicleType}</TableCell>}
                                        {visibleColumns.nextServiceDue && <TableCell><ReadOnlyDateCell value={vehicle.nextServiceDue} /></TableCell>}
                                        {visibleColumns.pollutionDue && <TableCell><ReadOnlyDateCell value={vehicle.pollutionDue} /></TableCell>}
                                        {visibleColumns.insuranceDue && <TableCell><ReadOnlyDateCell value={vehicle.insuranceDue} /></TableCell>}
                                        {visibleColumns.roadTaxDue && <TableCell><ReadOnlyDateCell value={vehicle.roadTaxDue} /></TableCell>}
                                        {visibleColumns.tokenTaxDue && <TableCell><ReadOnlyDateCell value={vehicle.tokenTaxDue} /></TableCell>}
                                        {visibleColumns.nationalPermitDue && <TableCell><ReadOnlyDateCell value={vehicle.nationalPermitDue} /></TableCell>}
                                        {visibleColumns.statePermitDue && <TableCell><ReadOnlyDateCell value={vehicle.statePermitDue} /></TableCell>}
                                        {visibleColumns.fitnessTestDue && <TableCell><ReadOnlyDateCell value={vehicle.fitnessTestDue} /></TableCell>}
                                        {visibleColumns.details && <TableCell className="max-w-[150px] truncate" title={vehicle.details}>{vehicle.details || '-'}</TableCell>}
                                    </TableRow>
                                ))}
                                {/* Inline Add Row */}
                                <TableRow className="bg-muted/30 border-t-2 border-primary/20">
                                    {visibleColumns.action && (
                                        <TableCell>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 w-[80px]"
                                                onClick={handleAddNew}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add New'}
                                            </Button>
                                        </TableCell>
                                    )}
                                    {visibleColumns.vehicleNumber && (
                                        <TableCell>
                                            <Input
                                                value={newVehicle.vehicleNumber}
                                                onChange={(e) => handleNewVehicleChange('vehicleNumber', e.target.value)}
                                                placeholder="Vehicle No."
                                                className="h-8 min-w-[120px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.vehicleType && (
                                        <TableCell>
                                            <Input
                                                value={newVehicle.vehicleType}
                                                onChange={(e) => handleNewVehicleChange('vehicleType', e.target.value)}
                                                placeholder="Type"
                                                className="h-8 min-w-[100px]"
                                            />
                                        </TableCell>
                                    )}

                                    {/* Date Pickers */}
                                    {visibleColumns.nextServiceDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.nextServiceDue}
                                                onChange={(date) => handleNewVehicleChange('nextServiceDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.pollutionDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.pollutionDue}
                                                onChange={(date) => handleNewVehicleChange('pollutionDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.insuranceDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.insuranceDue}
                                                onChange={(date) => handleNewVehicleChange('insuranceDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.roadTaxDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.roadTaxDue}
                                                onChange={(date) => handleNewVehicleChange('roadTaxDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.tokenTaxDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.tokenTaxDue}
                                                onChange={(date) => handleNewVehicleChange('tokenTaxDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.nationalPermitDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.nationalPermitDue}
                                                onChange={(date) => handleNewVehicleChange('nationalPermitDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.statePermitDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.statePermitDue}
                                                onChange={(date) => handleNewVehicleChange('statePermitDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.fitnessTestDue && (
                                        <TableCell>
                                            <DatePickerCell
                                                value={newVehicle.fitnessTestDue}
                                                onChange={(date) => handleNewVehicleChange('fitnessTestDue', date?.toISOString())}
                                                placeholder="Pick date"
                                            />
                                        </TableCell>
                                    )}

                                    {visibleColumns.details && (
                                        <TableCell>
                                            <Input
                                                value={newVehicle.details || ''}
                                                onChange={(e) => handleNewVehicleChange('details', e.target.value)}
                                                placeholder="Details"
                                                className="h-8 min-w-[150px]"
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
