import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy Coran page
const CoranContent = lazy(() => import('@/pages/Coran'));

export function LazyCoranContent() {
  return (
    <Suspense fallback={<CoranSkeleton />}>
      <CoranContent />
    </Suspense>
  );
}

function CoranSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
