import { cn } from "../../utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-secondary/60 dark:bg-muted/50", className)}
    />
  );
}

export function AnimeCardSkeleton({ layout = "portrait" }: { layout?: "portrait" | "landscape" }) {
  if (layout === "landscape") {
    return (
      <div className="flex flex-col gap-3 rounded-xl overflow-hidden">
        <Skeleton className="w-full aspect-video rounded-xl" />
        <div className="flex flex-col gap-1.5 px-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl">
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] min-h-[400px] flex items-end pb-12 md:pb-24 pt-32 px-6 md:px-12 bg-secondary/20">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none bg-secondary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl flex flex-col gap-4 md:gap-6 w-full">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-10 md:h-16 w-3/4 max-w-xl rounded-2xl" />
        <div className="flex flex-col gap-2 max-w-2xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton({ title }: { title?: string }) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 py-1">
      <div className="flex items-end justify-between px-4 sm:px-6 md:px-12">
        {title ? (
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">{title}</h2>
        ) : (
          <Skeleton className="h-7 w-48 rounded-lg" />
        )}
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>

      <div className="flex overflow-hidden gap-3.5 sm:gap-4 px-4 sm:px-6 md:px-12 pb-3 sm:pb-4 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[140px] md:w-[180px] lg:w-[220px]">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AnimeDetailsSkeleton() {
  return (
    <div className="flex flex-col pb-20 min-h-screen px-4 sm:px-6 md:px-12 pt-6 md:pt-10 gap-6 md:gap-8">
      {/* Header section */}
      <div className="flex items-end gap-3.5 sm:gap-6 md:gap-8">
        <Skeleton className="w-28 sm:w-44 md:w-60 aspect-[2/3] rounded-xl sm:rounded-2xl shrink-0" />
        <div className="flex flex-col gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-md" />
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-md" />
            <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-md" />
          </div>
          <Skeleton className="h-7 sm:h-10 md:h-12 w-4/5 rounded-xl" />
          <Skeleton className="h-4 sm:h-5 w-2/5 rounded-lg" />
          <div className="hidden sm:flex items-center gap-3 mt-2">
            <Skeleton className="h-10 sm:h-11 w-32 sm:w-36 rounded-xl" />
            <Skeleton className="h-10 sm:h-11 w-36 sm:w-44 rounded-xl" />
            <Skeleton className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Action buttons on mobile */}
      <div className="flex sm:hidden items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Grid info stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-secondary/20 border border-border/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 sm:gap-1.5 p-1.5 sm:p-2">
            <Skeleton className="h-3 w-12 sm:w-16" />
            <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
          </div>
        ))}
      </div>

      {/* Synopsis section */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-full" />
          <Skeleton className="h-3.5 sm:h-4 w-3/4" />
        </div>
      </div>

      {/* Episode list section */}
      <div className="flex flex-col gap-3 sm:gap-4 mt-2">
        <Skeleton className="h-6 sm:h-7 w-36 sm:w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border/30 gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <Skeleton className="w-24 sm:w-28 aspect-video rounded-lg shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <Skeleton className="h-3 w-12 sm:w-16" />
                  <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-28" />
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Skeleton className="h-6 sm:h-7 w-10 sm:w-12 rounded-md" />
                <Skeleton className="h-6 sm:h-7 w-10 sm:w-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EpisodeListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border/30 gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <Skeleton className="w-18 sm:w-24 aspect-video rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-12 sm:w-16" />
              <Skeleton className="h-3.5 sm:h-4 w-3/4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Skeleton className="h-6 w-9 sm:w-11 rounded-md" />
            <Skeleton className="h-6 w-9 sm:w-11 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EpisodeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border/30 gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <Skeleton className="w-20 sm:w-28 aspect-video rounded-lg shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-16 sm:w-20" />
              <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-28" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg" />
            <Skeleton className="h-7 sm:h-8 w-8 sm:w-10 rounded-lg" />
            <Skeleton className="h-7 sm:h-8 w-8 sm:w-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
