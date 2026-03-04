import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    isPositive?: boolean;
    icon: LucideIcon;
    className?: string;
}

export function MetricCard({
    title,
    value,
    trend,
    isPositive,
    icon: Icon,
    className,
}: MetricCardProps) {
    return (
        <Card className={cn("transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                </CardTitle>
                <div className="rounded-lg bg-sky-50 p-2 text-sky-600 ring-1 ring-inset ring-sky-100/50">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {trend && (
                    <p className="mt-1 flex items-center text-xs text-slate-500">
                        <span
                            className={cn(
                                "mr-1 font-medium",
                                isPositive ? "text-emerald-600" : "text-rose-600"
                            )}
                        >
                            {trend}
                        </span>
                        vs mes pasado
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
