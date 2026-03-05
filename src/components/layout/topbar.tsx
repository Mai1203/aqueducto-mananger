"use client";

import { Bell, User } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

interface TopbarProps {
    title?: string;
}

export function Topbar({ title }: TopbarProps) {
    const { user, role } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:px-6 lg:px-8">
            
            <div className="w-10 md:hidden" />

            {title && (
                <h1 className="text-base font-semibold text-slate-900 md:hidden truncate">
                    {title}
                </h1>
            )}

            <div className="flex flex-1 items-center justify-end gap-x-4">

                {/* Notificaciones */}
                <button
                    type="button"
                    className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* Usuario compacto */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold text-sm">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>

                    <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-sm font-medium text-slate-800">
                            {role === "admin" ? "Administrador" : "Cajero"}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[140px]">
                            {user?.email}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}