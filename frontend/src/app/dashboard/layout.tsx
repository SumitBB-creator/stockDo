'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { fetchCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Factory,
    Package,
    Truck,
    FileText,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    ChevronRight,
    Building2,
    Layers,
    ClipboardList,
    RotateCcw,
    ArrowRightLeft,
    Calculator,
    Calendar,
    Settings2,
    Printer,
    Book,
    Receipt,
    ShieldCheck,
    UserPlus,
    AlertTriangle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';
import { usePermissions } from '@/hooks/use-permissions';

// Stable NavItems component outside DashboardLayout
const NavItems = ({
    isExpanded = true,
    canView,
    isManagementOpen,
    setIsManagementOpen,
    isStockOpen,
    setIsStockOpen,
    isAccountingOpen,
    setIsAccountingOpen,
    isSalePurchaseOpen,
    setIsSalePurchaseOpen,
    isControlPanelOpen,
    setIsControlPanelOpen
}: {
    isExpanded?: boolean;
    canView: (moduleName: string) => boolean;
    isManagementOpen: boolean;
    setIsManagementOpen: (val: boolean) => void;
    isStockOpen: boolean;
    setIsStockOpen: (val: boolean) => void;
    isAccountingOpen: boolean;
    setIsAccountingOpen: (val: boolean) => void;
    isSalePurchaseOpen: boolean;
    setIsSalePurchaseOpen: (val: boolean) => void;
    isControlPanelOpen: boolean;
    setIsControlPanelOpen: (val: boolean) => void;
}) => (
    <nav className="space-y-1 p-4">
        <Link href="/dashboard" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Dashboard">
            <LayoutDashboard className="h-5 w-5" />
            {isExpanded && <span>Dashboard</span>}
        </Link>

        {canView("Master Data") && (
            <>
                <Link href="/dashboard/employees" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Employees">
                    <Briefcase className="h-5 w-5" />
                    {isExpanded && <span>Employees</span>}
                </Link>

                <Link href="/dashboard/customers" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Customers">
                    <Users className="h-5 w-5" />
                    {isExpanded && <span>Customers</span>}
                </Link>
                <Link href="/dashboard/suppliers" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Suppliers">
                    <Factory className="h-5 w-5" />
                    {isExpanded && <span>Suppliers</span>}
                </Link>
                <Link href="/dashboard/materials" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Materials">
                    <Package className="h-5 w-5" />
                    {isExpanded && <span>Materials</span>}
                </Link>
                <Link href="/dashboard/vehicles" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Vehicles">
                    <Truck className="h-5 w-5" />
                    {isExpanded && <span>Vehicles</span>}
                </Link>

                <Link href="/dashboard/company" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors" title="Company Details">
                    <Building2 className="h-5 w-5" />
                    {isExpanded && <span>Company Details</span>}
                </Link>
            </>
        )}

        <div className="pt-2">
            {isExpanded ? (
                <>
                    {(canView("Agreement") || canView("Quotation") || canView("Customer Stock") || canView("Company Stock")) && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsManagementOpen(!isManagementOpen)}
                                className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-left"
                                title="Management"
                            >
                                <div className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Management</span>
                                </div>
                                {isManagementOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            {isManagementOpen && (
                                <div className="ml-4 space-y-1 border-l pl-2">
                                    {canView("Agreement") && (
                                        <Link href="/dashboard/agreement" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Agreement">
                                            <FileText className="h-4 w-4" />
                                            <span>Agreement</span>
                                        </Link>
                                    )}
                                    {canView("Quotation") && (
                                        <Link href="/dashboard/quotation" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Quotation">
                                            <FileText className="h-4 w-4" />
                                            <span>Quotation</span>
                                        </Link>
                                    )}
                                    {canView("Customer Stock") && (
                                        <Link href="/dashboard/customer-stock" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Customer Stock">
                                            <Package className="h-4 w-4" />
                                            <span>Customer Stock</span>
                                        </Link>
                                    )}
                                    {canView("Company Stock") && (
                                        <Link href="/dashboard/company-stock" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Company Stock">
                                            <Package className="h-4 w-4" />
                                            <span>Company Stock</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(canView("Challan") || canView("Return") || canView("Transfer") || canView("Shortage Notice")) && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsStockOpen(!isStockOpen)}
                                className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-left"
                                title="Stock"
                            >
                                <div className="flex items-center space-x-2">
                                    <Layers className="h-5 w-5" />
                                    <span>Stock</span>
                                </div>
                                {isStockOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            {isStockOpen && (
                                <div className="ml-4 space-y-1 border-l pl-2">
                                    {canView("Challan") && (
                                        <Link href="/dashboard/stock/challan" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Challan">
                                            <ClipboardList className="h-4 w-4" />
                                            <span>Challan</span>
                                        </Link>
                                    )}
                                    {canView("Return") && (
                                        <Link href="/dashboard/stock/return" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Return">
                                            <RotateCcw className="h-4 w-4" />
                                            <span>Return</span>
                                        </Link>
                                    )}
                                    {canView("Transfer") && (
                                        <Link href="/dashboard/stock/transfer" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Transfer">
                                            <ArrowRightLeft className="h-4 w-4" />
                                            <span>Transfer</span>
                                        </Link>
                                    )}
                                    {canView("Shortage Notice") && (
                                        <Link href="/dashboard/stock/shortage" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Shortage Notice">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            <span>Shortage Notice</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(canView("Billing") || canView("Transportation") || canView("Ledger") || canView("Dues List") || canView("Daybook") || canView("Receipt")) && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsAccountingOpen(!isAccountingOpen)}
                                className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-left"
                                title="Accounting"
                            >
                                <div className="flex items-center space-x-2">
                                    <Calculator className="h-5 w-5" />
                                    <span>Accounting</span>
                                </div>
                                {isAccountingOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            {isAccountingOpen && (
                                <div className="ml-4 space-y-1 border-l pl-2">
                                    {canView("Billing") && (
                                        <>
                                            <Link href="/dashboard/accounting/billing" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Monthly Billing">
                                                <Calendar className="h-4 w-4" />
                                                <span>Monthly Billing</span>
                                            </Link>
                                            <Link href="/dashboard/accounting/customize-billing" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Customize Billing">
                                                <Settings2 className="h-4 w-4" />
                                                <span>Customize Billing</span>
                                            </Link>
                                            <Link href="/dashboard/accounting/print-bill" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Print Bill">
                                                <Printer className="h-4 w-4" />
                                                <span>Print Bill</span>
                                            </Link>
                                        </>
                                    )}
                                    {canView("Transportation") && (
                                        <Link href="/dashboard/accounting/transportation" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Transportation">
                                            <Truck className="h-4 w-4" />
                                            <span>Transportation</span>
                                        </Link>
                                    )}
                                    {canView("Ledger") && (
                                        <Link href="/dashboard/accounting/ledger" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Ledger">
                                            <Book className="h-4 w-4" />
                                            <span>Ledger</span>
                                        </Link>
                                    )}
                                    {canView("Dues List") && (
                                        <Link href="/dashboard/accounting/dueslist" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Dues List">
                                            <FileText className="h-4 w-4" />
                                            <span>Dues List</span>
                                        </Link>
                                    )}
                                    {canView("Daybook") && (
                                        <Link href="/dashboard/accounting/daybook" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Daybook">
                                            <Book className="h-4 w-4" />
                                            <span>Daybook</span>
                                        </Link>
                                    )}
                                    {canView("Receipt") && (
                                        <Link href="/dashboard/accounting/receipt" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Receipt">
                                            <Receipt className="h-4 w-4" />
                                            <span>Receipt</span>
                                        </Link>
                                    )}
                                    <Link href="/dashboard/accounting/notes" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Credit / Debit Notes">
                                        <FileText className="h-4 w-4" />
                                        <span>Credit / Debit Notes</span>
                                    </Link>
                                    <Link href="/dashboard/accounting/balance-sheet" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Balance Sheet">
                                        <Calculator className="h-4 w-4" />
                                        <span>Balance Sheet</span>
                                    </Link>
                                    <Link href="/dashboard/accounting/gst-summary" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="GST Summary">
                                        <FileText className="h-4 w-4" />
                                        <span>GST Summary</span>
                                    </Link>
                                    <Link href="/dashboard/accounting/annual-report" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Annual Report">
                                        <Layers className="h-4 w-4" />
                                        <span>Annual Report</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {(canView("Sale & Purchase") || canView("Local Sale") || canView("Central Sale") || canView("Purchase Details") || canView("Local Purchase") || canView("Central Purchase")) && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsSalePurchaseOpen(!isSalePurchaseOpen)}
                                className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-left"
                                title="Sale & Purchase"
                            >
                                <div className="flex items-center space-x-2">
                                    <ArrowRightLeft className="h-5 w-5" />
                                    <span>Sale & Purchase</span>
                                </div>
                                {isSalePurchaseOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>

                            {isSalePurchaseOpen && (
                                <div className="ml-4 space-y-1 border-l pl-2">
                                    {(canView("Local Sale") || canView("Central Sale")) && (
                                        <div className="py-1">
                                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Sale Report
                                            </div>
                                            {canView("Local Sale") && (
                                                <Link href="/dashboard/sale-report/local" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Local Sale">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Local Sale</span>
                                                </Link>
                                            )}
                                            {canView("Central Sale") && (
                                                <Link href="/dashboard/sale-report/central" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Central Sale">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Central Sale</span>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                    {(canView("Purchase Details") || canView("Local Purchase") || canView("Central Purchase")) && (
                                        <div className="py-1 border-t">
                                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Purchase
                                            </div>
                                            {canView("Purchase Details") && (
                                                <Link href="/dashboard/purchase/details" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Purchase Details">
                                                    <ClipboardList className="h-4 w-4" />
                                                    <span>Purchase Details</span>
                                                </Link>
                                            )}
                                            {canView("Local Purchase") && (
                                                <Link href="/dashboard/purchase/local" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Local Purchase">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Local Purchase</span>
                                                </Link>
                                            )}
                                            {canView("Central Purchase") && (
                                                <Link href="/dashboard/purchase/central" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Central Purchase">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Central Purchase</span>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="flex justify-center p-2 group relative">
                        <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer" />
                    </div>
                    <div className="flex justify-center p-2 group relative">
                        <Layers className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer" />
                    </div>
                    <div className="flex justify-center p-2 group relative">
                        <Calculator className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer" />
                    </div>
                    <div className="flex justify-center p-2 group relative">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer" />
                    </div>
                </>
            )}

            {isExpanded && (canView("Manage Role") || canView("Manage User")) && (
                <div className="space-y-1">
                    <button
                        onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                        className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors text-left"
                        title="Control Panel"
                    >
                        <div className="flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <span>Control Panel</span>
                        </div>
                        {isControlPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {isControlPanelOpen && (
                        <div className="ml-4 space-y-1 border-l pl-2">
                            {canView("Manage Role") && (
                                <Link href="/dashboard/control-panel/roles" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Manage Role">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Manage Role</span>
                                </Link>
                            )}
                            {canView("Manage User") && (
                                <Link href="/dashboard/control-panel/users" className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors text-sm" title="Manage User">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Manage User</span>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </nav >
);

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. All hooks called unconditionally at the top
    const router = useRouter();
    const { token, logout, user, _hasHydrated } = useAuthStore();
    const { canView } = usePermissions();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isManagementOpen, setIsManagementOpen] = useState(false);
    const [isStockOpen, setIsStockOpen] = useState(false);
    const [isAccountingOpen, setIsAccountingOpen] = useState(false);
    const [isSalePurchaseOpen, setIsSalePurchaseOpen] = useState(false);
    const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
    const [companyData, setCompanyData] = useState<any>(null);

    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [logout, router]);

    useEffect(() => {
        const loadCompany = async () => {
            if (!_hasHydrated || !token) return;
            try {
                const data = await fetchCompany();
                setCompanyData(data);
            } catch (error) {
                console.error('Failed to load company info', error);
            }
        };
        loadCompany();
    }, [_hasHydrated, token]);

    useEffect(() => {
        if (_hasHydrated && !token) {
            router.push('/');
        }
    }, [_hasHydrated, token, router]);

    // 2. Early returns happen AFTER all hooks are called
    if (!_hasHydrated) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    if (!token) {
        return null;
    }

    // 3. Render logic
    const navProps = {
        canView,
        isManagementOpen,
        setIsManagementOpen,
        isStockOpen,
        setIsStockOpen,
        isAccountingOpen,
        setIsAccountingOpen,
        isSalePurchaseOpen,
        setIsSalePurchaseOpen,
        isControlPanelOpen,
        setIsControlPanelOpen
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar for Desktop */}
            <aside className={`hidden md:flex flex-col border-r bg-card transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b font-bold text-xl overflow-hidden whitespace-nowrap">
                    {isSidebarOpen && (
                        companyData?.logo ? (
                            <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={companyData.logo.startsWith('http') ? companyData.logo : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${companyData.logo}`}
                                    alt="Logo"
                                    className="h-10 w-auto object-contain max-w-[150px]"
                                />
                            </div>
                        ) : (
                            <span>Inventory</span>
                        )
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <NavItems isExpanded={isSidebarOpen} {...navProps} />
                </div>
                <div className="p-4 border-t">
                    <Button variant="ghost" className={`w-full ${isSidebarOpen ? 'justify-start' : 'justify-center'}`} onClick={handleLogout} title="Logout">
                        <LogOut className="h-5 w-5 mr-2" />
                        {isSidebarOpen && 'Logout'}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-4">
                    <div className="flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <div className="h-16 flex items-center justify-start px-4 border-b font-bold text-xl overflow-hidden">
                                    {companyData?.logo ? (
                                        <div className="flex items-center gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={companyData.logo.startsWith('http') ? companyData.logo : `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1').replace('/api/v1', '')}${companyData.logo}`}
                                                alt="Logo"
                                                className="h-8 w-8 object-contain"
                                            />
                                            <span className="truncate">{companyData.companyName}</span>
                                        </div>
                                    ) : (
                                        <span>{companyData?.companyName || 'Inventory'}</span>
                                    )}
                                </div>
                                <NavItems isExpanded={true} {...navProps} />
                            </SheetContent>
                        </Sheet>
                        <h1 className="text-lg font-semibold ml-4">
                            {companyData?.companyName || 'Inventory'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{user?.email}</span>
                        <ModeToggle />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
