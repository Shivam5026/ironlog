import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { InfoListCard } from "../components/InfoListCard";

import { useExercise } from "../hooks/useExercise";

export default function ExerciseDetails() {
  const { exerciseId } = useParams();

  if (!exerciseId) {
    return <Navigate to="/exercises" replace />;
  }

  const { data, isPending, isError, error } = useExercise(exerciseId);

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-slate-400">Loading exercise...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-xl font-semibold text-red-400">Failed to load exercise</h2>

        <p className="mt-2 text-slate-400">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      </div>
    );
  }

  const exercise = data;

  if (!exercise) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-xl font-semibold">Exercise not found</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft size={18} />
        Back to Library
      </Link>

      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold capitalize">{exercise.name}</h1>

            <p className="mt-2 text-slate-400">Learn how to perform this exercise correctly.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoListCard title="Body Parts" values={exercise.bodyParts} />

            <InfoListCard title="Target Muscles" values={exercise.targetMuscles} />

            <InfoListCard title="Equipment" values={exercise.equipments} />
          </div>

          {exercise.secondaryMuscles.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Secondary Muscles</h2>

              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded-full border border-slate-700 px-3 py-1 text-sm"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </section>
          )}

          {exercise.instructions.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Instructions</h2>

              <ol className="space-y-3">
                {exercise.instructions.map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-semibold text-black">
                      {index + 1}
                    </div>

                    <p className="text-slate-300">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
