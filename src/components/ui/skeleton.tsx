import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200/60 shadow-sm",
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }

