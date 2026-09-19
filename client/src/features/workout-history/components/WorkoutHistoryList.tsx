import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import { WorkoutHistoryCard } from "./WorkoutHistoryCard";
import type { WorkoutHistoryItem } from "../types/workout-history.types";

interface WorkoutHistoryListProps {
  items: WorkoutHistoryItem[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function WorkoutHistoryList({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: WorkoutHistoryListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <WorkoutHistoryCard key={item.id} item={item} />
        ))}
      </div>

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
          aria-hidden="true"
        >
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}