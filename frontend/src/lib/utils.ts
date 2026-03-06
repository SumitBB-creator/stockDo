import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCustomerAddress(customer: any) {
    if (!customer) return 'N/A';

    // Prioritize Site Address components, fallback to Office Address
    const isSite = !!customer.siteAddress;
    const addr = isSite ? customer.siteAddress : customer.officeAddress;
    const city = isSite ? customer.siteCity : customer.officeCity;
    const state = isSite ? customer.siteState : customer.officeState;
    const pin = isSite ? customer.sitePin : customer.officePin;

    if (!addr && !city && !state && !pin) return 'N/A';

    const parts = [];
    if (addr) parts.push(addr);
    if (city) parts.push(city);

    const statePinParts = [];
    if (state) statePinParts.push(state);
    if (pin) statePinParts.push(pin);

    if (statePinParts.length > 0) {
        parts.push(`(${statePinParts.join(' - ')})`);
    }

    return parts.join(', ') || 'N/A';
}

export function formatCurrency(amount: number | string | undefined | null) {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (value === undefined || value === null || isNaN(value)) return '0.00';

    return value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
