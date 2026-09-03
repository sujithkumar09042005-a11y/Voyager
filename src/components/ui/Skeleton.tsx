

interface SkeletonProps {
  className?: string;
  width?:  string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ className = '', width, height, rounded = 'md' }: SkeletonProps) {
  const roundedMap = {
    sm:   'rounded',
    md:   'rounded-lg',
    lg:   'rounded-xl',
    xl:   'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`skeleton ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// ─── Preset Skeleton Layouts ─────────────────────────────────────────────────

export function DestinationCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-card" aria-hidden="true">
      <Skeleton height={220} rounded="sm" className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="40%" />
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="70%" />
        <div className="flex gap-2 pt-1">
          <Skeleton height={22} width={60} rounded="full" />
          <Skeleton height={22} width={70} rounded="full" />
          <Skeleton height={22} width={55} rounded="full" />
        </div>
      </div>
    </div>
  );
}

export function WeatherWidgetSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-white shadow-card space-y-4" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton height={20} width={120} />
        <Skeleton height={48} width={48} rounded="full" />
      </div>
      <Skeleton height={56} width={100} />
      <div className="flex gap-4">
        <Skeleton height={14} width={80} />
        <Skeleton height={14} width={80} />
        <Skeleton height={14} width={80} />
      </div>
    </div>
  );
}

export function ItinerarySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Day tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={36} width={80} rounded="lg" />
        ))}
      </div>
      {/* Timeline */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton height={10} width={10} rounded="full" />
            <Skeleton height={60} width={2} className="mt-1" />
          </div>
          <div className="flex-1 pb-4 space-y-2">
            <Skeleton height={16} width="30%" />
            <Skeleton height={20} width="70%" />
            <Skeleton height={14} width="90%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatBubbleSkeleton() {
  return (
    <div className="flex gap-3 items-start" aria-hidden="true">
      <Skeleton height={32} width={32} rounded="full" />
      <div className="space-y-2 flex-1 max-w-xs">
        <Skeleton height={14} width="80%" />
        <Skeleton height={14} width="65%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
  );
}
