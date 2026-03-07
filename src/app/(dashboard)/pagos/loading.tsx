import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Search Bar Skeleton */}
            <Skeleton className="h-12 w-full rounded-xl" />

            {/* Empty State / Initial View Skeleton */}
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
}
