import type { Exercise } from "../types/exercise";

import ExerciseCard from "./ExerciseCard";
import { CardSkeleton } from "@/shared/components/ui/CardSkeleton";

import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";

interface SearchResultsProps {
  exercises: Exercise[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export default function SearchResults({
  exercises,
  isPending,
  isError,
  error,
}: SearchResultsProps) {
  if (isPending) {
    return (
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} image showHeader={false} rows={2} />
        ))}
      </section>
    );
  }

  if (isError) {
    return <ErrorState title="Unable to load exercises" description={error?.message} />;
  }

  if (exercises.length === 0) {
    return <EmptyState title="No exercises found" description="Try another search term." />;
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.exerciseId} exercise={exercise} />
      ))}
    </section>
  );
}
