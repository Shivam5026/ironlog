import { useParams, Navigate } from "react-router-dom";
import { useExercise } from "@/features/exercise/hooks/useExercise";
import { FullPageLoader } from "@/shared/components/ui/FullPageLoader";
import { ErrorState } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/ui";

import ExerciseHero from "@/features/exercise/components/ExerciseHero";
import ExerciseImage from "@/features/exercise/components/ExerciseImage";
import ExerciseMetadata from "@/features/exercise/components/ExerciseMetadata";
import ExerciseInstructions from "@/features/exercise/components/ExerciseInstructions";

export default function ExerciseDetails() {
  const { exerciseId } = useParams();

  if (!exerciseId) {
    return <Navigate to="/dashboard/exercises" replace />;
  }

  const { data: exercise, isPending, isError, error } = useExercise(exerciseId);

  if (isPending) {
    return <FullPageLoader />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load exercise"
        description={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  if (!exercise) {
    return (
      <EmptyState
        title="Exercise not found"
        description="The requested exercise could not be found."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <ExerciseHero name={exercise.name} />

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <ExerciseImage src={exercise.gifUrl} alt={exercise.name} />

        <ExerciseMetadata
          bodyParts={exercise.bodyParts}
          targetMuscles={exercise.targetMuscles}
          equipments={exercise.equipments}
          secondaryMuscles={exercise.secondaryMuscles}
        />
      </div>

      <ExerciseInstructions instructions={exercise.instructions} />
    </div>
  );
}
