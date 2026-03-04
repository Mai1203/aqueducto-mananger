import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FileX, Users, CreditCard, FileText, BarChart3, FolderOpen } from "lucide-react";

type EmptyIcon = "data" | "users" | "invoices" | "payments" | "reports" | "categories";

const iconMap: Record<EmptyIcon, ReactNode> = {
    data: <FolderOpen className="w-12 h-12 text-slate-300" />,
    users: <Users className="w-12 h-12 text-slate-300" />,
    invoices: <FileText className="w-12 h-12 text-slate-300" />,
    payments: <CreditCard className="w-12 h-12 text-slate-300" />,
    reports: <BarChart3 className="w-12 h-12 text-slate-300" />,
    categories: <FileX className="w-12 h-12 text-slate-300" />,
};

interface EmptyStateProps {
    icon?: EmptyIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon = "data",
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center",
                className
            )}
        >
            <div className="rounded-full bg-slate-50 border border-slate-100 p-6 mb-5">
                {iconMap[icon]}
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>
            {action}
        </div>
    );
}
