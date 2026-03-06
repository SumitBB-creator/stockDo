import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1',
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Unwrap the standardized response format from NestJS
        if (response.data && response.data.data) {
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Quotations
export const fetchQuotations = async () => {
    const response = await api.get('/quotations');
    return response.data;
};

export const fetchQuotation = async (id: string) => {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
};

export const createQuotation = async (data: any) => {
    const response = await api.post('/quotations', data);
    return response.data;
};

export const updateQuotation = async (id: string, data: any) => {
    const response = await api.patch(`/quotations/${id}`, data);
    return response.data;
};

export const fetchQuotationVersions = async (id: string) => {
    const response = await api.get(`/quotations/${id}/versions`);
    return response.data;
};

export const deleteQuotation = async (id: string) => {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
};

export const fetchCustomers = async () => {
    const response = await api.get('/customers');
    return response.data;
};

export const fetchLatestQuotationByCustomer = async (customerId: string) => {
    const response = await api.get(`/quotations/latest/${customerId}`);
    return response.data;
};

export const fetchMaterials = async () => {
    const response = await api.get('/materials');
    return response.data;
};

export const fetchSuppliers = async () => {
    const response = await api.get('/suppliers');
    return response.data;
};

export const fetchEmployees = async () => {
    const response = await api.get('/employees');
    return response.data;
};



export const fetchCompany = async () => {
    const response = await api.get('/company');
    return response.data;
};

export const updateCompany = async (data: any) => {
    const response = await api.post('/company', data);
    return response.data;
};

export const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/company/upload-logo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Agreements
export const fetchAgreements = async (status?: string) => {
    const response = await api.get('/agreements', { params: { status } });
    return response.data;
};

export const fetchAgreement = async (id: string) => {
    const response = await api.get(`/agreements/${id}`);
    return response.data;
};

export const createAgreement = async (data: any) => {
    const response = await api.post('/agreements', data);
    return response.data;
};

export const updateAgreement = async (id: string, data: any) => {
    const response = await api.patch(`/agreements/${id}`, data);
    return response.data;
};

export const deleteAgreement = async (id: string) => {
    const response = await api.delete(`/agreements/${id}`);
    return response.data;
};

// Challans
export const fetchChallans = async () => {
    const response = await api.get('/challans');
    return response.data;
};

export const fetchChallan = async (id: string) => {
    const response = await api.get(`/challans/${id}`);
    return response.data;
};

export const createChallan = async (data: any) => {
    const response = await api.post('/challans', data);
    return response.data;
};

export const deleteChallan = async (id: string) => {
    const response = await api.delete(`/challans/${id}`);
    return response.data;
};

export const fetchCustomerStock = async (customerId: string) => {
    const response = await api.get(`/challans/stock/${customerId}`);
    return response.data;
};

export const fetchCompanyStock = async () => {
    const response = await api.get('/challans/company-stock');
    return response.data;
};

export const fetchTransportationChallans = async (filters: { year?: string; month?: string; customerId?: string }) => {
    const response = await api.get('/challans/transportation', { params: filters });
    return response.data;
};

// Billing
export const fetchUnbilledCustomers = async (month: number, year: number) => {
    const response = await api.get('/billing/unbilled', { params: { month, year } });
    return response.data;
};

export const fetchBillsByMonth = async (month: number, year: number) => {
    const response = await api.get('/billing', { params: { month, year } });
    return response.data;
};

export const fetchBills = fetchBillsByMonth;

export const fetchFilteredBills = async (filters: { year?: string; month?: string; customerId?: string; customerIds?: string; fromDate?: string; toDate?: string }) => {
    const response = await api.get('/billing/filter', { params: filters });
    return response.data;
};

export const fetchBill = async (id: string) => {
    const response = await api.get(`/billing/${id}`);
    return response.data;
};

export const previewBill = async (customerId: string, month: number, year: number) => {
    const response = await api.get('/billing/preview', { params: { customerId, month, year } });
    return response.data;
};

export const finalizeBills = async (customerIds: string[], month: number, year: number) => {
    const response = await api.post('/billing/finalize', { customerIds, month, year });
    return response.data;
};

export const cancelBill = async (id: string) => {
    const response = await api.patch(`/billing/${id}/cancel`);
    return response.data;
};

export const createBill = async (data: any) => {
    const response = await api.post('/billing', data);
    return response.data;
};

export const previewCustomBill = async (customerId: string, fromDate: string, toDate: string) => {
    const response = await api.post('/billing/custom-preview', { customerId, fromDate, toDate });
    return response.data;
};

export const finalizeCustomBill = async (customerId: string, fromDate: string, toDate: string) => {
    const response = await api.post('/billing/finalize-custom', { customerId, fromDate, toDate });
    return response.data;
};

export const fetchTransactions = async (customerId: string) => {
    const response = await api.get('/transactions', { params: { customerId } });
    return response.data;
};

export const createTransaction = async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
};

export default api;

// --- TRANSACTIONS / LEDGER ---
export const fetchTransaction = async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
};
export const fetchLedger = async (customerId: string, fromDate?: string, toDate?: string) => {
    const params: Record<string, string> = { customerId };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await api.get('/transactions/ledger', { params });
    return response.data;
};

export const fetchDueslist = async (asOfDate?: string) => {
    const params: Record<string, string> = {};
    if (asOfDate) params.asOfDate = asOfDate;

    const response = await api.get('/transactions/dues', { params });
    return response.data;
};

export const fetchDaybook = async (date?: string) => {
    const params: Record<string, string> = {};
    if (date) params.date = date;

    const response = await api.get('/transactions/daybook', { params });
    return response.data;
};

export const fetchBalanceSheet = async (asOfDate?: string) => {
    const params: Record<string, string> = {};
    if (asOfDate) params.asOfDate = asOfDate;
    const response = await api.get('/transactions/balance-sheet', { params });
    return response.data;
};

export const fetchGstSummary = async (fromDate: string, toDate: string) => {
    const response = await api.get('/transactions/gst-summary', { params: { fromDate, toDate } });
    return response.data;
};

// --- TRANSFERS ---
export const fetchTransfers = async () => {
    const response = await api.get('/transfers');
    return response.data;
};

export const createTransfer = async (data: any) => {
    const response = await api.post('/transfers', data);
    return response.data;
};

// --- REPORTS ---
export const fetchAnnualReport = async (year: number) => {
    const response = await api.get('/transactions/annual-report', { params: { year } });
    return response.data;
};

export const fetchDashboardSummary = async () => {
    const response = await api.get('/transactions/dashboard-summary');
    return response.data;
};

export const fetchYearlyBalanceSheet = async (year: number) => {
    const response = await api.get(`/transactions/yearly-balance-sheet?year=${year}`);
    return response.data;
};

export const fetchDailyRevenueTrend = async () => {
    const response = await api.get('/daily-revenue/trend');
    return response.data;
};
