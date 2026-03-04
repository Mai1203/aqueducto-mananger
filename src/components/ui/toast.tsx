"use client";

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextValue {
    toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
};

const styles: Record<ToastType, string> = {
    success: "border-emerald-200 bg-white",
    error: "border-rose-200 bg-white",
    warning: "border-amber-200 bg-white",
    info: "border-sky-200 bg-white",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    useEffect(() => {
        const t = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(t);
    }, [toast.id, onRemove]);

    return (
        <div
            className={cn(
                "flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
                styles[toast.type]
            )}
        >
            {icons[toast.type]}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{toast.description}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((opts: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...opts, id }]);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
