import { Inbox } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-600 border-r-primary-300" />
      </div>
    </div>
  );
}

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <SkeletonBlock className="h-8 w-48" />
      <div className="card space-y-4">
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-32" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="card overflow-hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-6 w-36" />
        <SkeletonBlock className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(90px, 1fr))` }}>
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <SkeletonBlock key={columnIndex} className="h-5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="card space-y-3">
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="card space-y-3 border-l-4 border-primary-100">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-7 w-52" />
        <SkeletonBlock className="h-4 w-full max-w-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="stat-card">
            <SkeletonBlock className="h-12 w-12 shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-7 w-14" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="card space-y-3">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
        <div className="card space-y-3">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
          <SkeletonBlock className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message = 'No records found' }) {
  return (
    <div className="card text-center py-14 text-gray-500">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-50 text-primary-500">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="font-medium">{message}</p>
    </div>
  );
}
