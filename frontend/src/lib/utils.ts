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

    return `₹ ${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
export function toWords(num: number): string {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };

    return convert(num) + ' Only';
}
