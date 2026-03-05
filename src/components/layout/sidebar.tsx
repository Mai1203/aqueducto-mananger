"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Tags,
    FileText,
    CreditCard,
    BarChart3,
    LogOut,
    Droplet,
    Menu,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Usuarios", href: "/usuarios", icon: Users },
    { name: "Categorías", href: "/categorias", icon: Tags },
    { name: "Facturación", href: "/facturacion", icon: FileText },
    { name: "Pagos", href: "/pagos", icon: CreditCard },
    { name: "Reportes", href: "/reportes", icon: BarChart3 },
];


function SidebarContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-5">
                <Link href="/" className="flex items-center gap-2.5 font-bold">
                    <div className="bg-sky-500 rounded-xl p-2">
                        <Droplet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl tracking-tight text-slate-900">AguaRural</span>
                </Link>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav label */}
            <div className="px-6 mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menú</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive =
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}`));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150",
                                isActive
                                    ? "bg-sky-50 text-sky-700 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 flex-shrink-0 h-[18px] w-[18px] transition-colors",
                                    isActive
                                        ? "text-sky-600"
                                        : "text-slate-400 group-hover:text-slate-500"
                                )}
                            />
                            {item.name}
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-sm font-bold flex-shrink-0">
                        A
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">Administrador</p>
                        <p className="text-xs text-slate-500 truncate">admin@aguarural.co</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                >
                    <LogOut className="mr-3 flex-shrink-0 h-4 w-4" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile hamburger button (rendered inside Topbar via prop, but we place a fallback here) */}
            <button
                type="button"
                aria-label="Abrir menú"
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors md:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
                <SidebarContent />
            </div>
        </>
    );
}
