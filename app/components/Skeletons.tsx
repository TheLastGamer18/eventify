import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => {
    return (
        <div className="brutal-border brutal-shadow overflow-hidden rounded-lg bg-card">
            {/* Banner Skeleton */}
            <Skeleton className="h-28 w-full bg-muted" />

            <div className="p-5 space-y-3">
                {/* Title & Badge */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-5 w-12 rounded-full bg-muted" />
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-2/3 bg-muted" />
                </div>

                {/* Footer Meta */}
                <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="h-4 w-20 bg-muted" />
                    <Skeleton className="h-4 w-16 bg-muted" />
                </div>
            </div>
        </div>
    );
};

export const EventSliderSkeleton = () => {
    return (
        <section>
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-8 w-48 bg-muted" />
                <Skeleton className="h-4 w-20 bg-muted" />
            </div>
            <div className="flex gap-5 overflow-hidden p-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="brutal-border brutal-shadow min-w-[260px] max-w-[280px] shrink-0 overflow-hidden rounded-lg bg-card">
                        <Skeleton className="h-24 w-full bg-muted" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4 bg-muted" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-3 w-16 bg-muted" />
                                <Skeleton className="h-3 w-10 bg-muted" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};


export const ExploreSkeleton = () => {
    return (
        <main className="mx-auto max-w-site px-6 py-12">
            <Skeleton className="mb-4 h-10 w-64 bg-muted" />
            <Skeleton className="mb-10 h-4 w-96 bg-muted" />

            {/* Filters Skeleton */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="w-full sm:w-[200px] space-y-2">
                    <Skeleton className="h-3 w-16 bg-muted" />
                    <Skeleton className="h-10 w-full bg-muted" />
                </div>
                <div className="w-full sm:w-[200px] space-y-2">
                    <Skeleton className="h-3 w-12 bg-muted" />
                    <Skeleton className="h-10 w-full bg-muted" />
                </div>
                <div className="w-full sm:w-[200px] space-y-2">
                    <Skeleton className="h-3 w-14 bg-muted" />
                    <Skeleton className="h-10 w-full bg-muted" />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <EventCardSkeleton key={i} />
                ))}
            </div>
        </main>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="mx-auto max-w-site px-6 py-12">
            {/* Header */}
            <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-black" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-muted" />
                    <Skeleton className="h-4 w-64 bg-muted" />
                </div>
            </div>

            {/* Tabs Stub */}
            <div className="mb-8 flex gap-4 border-b-2 border-black pb-1">
                <Skeleton className="h-10 w-32 bg-muted" />
                <Skeleton className="h-10 w-32 bg-muted" />
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <EventCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
};

export const EventDetailsSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section Skeleton */}
            <div className="relative h-[400px] w-full bg-muted">
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative mx-auto flex h-full max-w-site flex-col justify-end px-6 pb-12 text-white">
                    <Skeleton className="mb-4 h-12 w-3/4 bg-white/20" />
                    <div className="flex gap-6">
                        <Skeleton className="h-6 w-32 bg-white/20" />
                        <Skeleton className="h-6 w-32 bg-white/20" />
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-site gap-12 px-6 py-12 md:grid-cols-[2fr_1fr]">
                <div className="space-y-8">
                    <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                        <Skeleton className="mb-4 h-8 w-48 bg-muted" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-2/3 bg-muted" />
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="brutal-border brutal-shadow rounded-lg bg-card p-6">
                        <Skeleton className="mb-4 h-6 w-32 bg-muted" />
                        <Skeleton className="h-12 w-full rounded-md bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );
};
