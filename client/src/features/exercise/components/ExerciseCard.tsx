import { useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardTitle } from "@/shared/components/ui/Card";

import type { Exercise } from "../types/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

function TagList({
  items,
  variant,
}: {
  items: string[] | undefined | null;
  variant: "emerald" | "blue" | "orange";
}) {
  if (!items?.length) return null;

  const colors = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400",
    orange: "bg-orange-500/15 text-orange-400",
  };

  return (
    <>
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 text-xs ${colors[variant]}`}
        >
          {item}
        </span>
      ))}
    </>
  );
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      to={`/dashboard/exercises/${exercise.exerciseId}`}
      className="group block rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      <Card className="gap-0 transition-all duration-300 hover:-translate-y-1 hover:ring-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10">
        {imgErr ? (
          <div className="flex h-56 w-full items-center justify-center bg-slate-800 text-sm text-slate-400">
            No image
          </div>
        ) : (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        <CardContent className="space-y-4">
          <CardTitle className="text-lg font-semibold capitalize">
            {exercise.name}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <TagList items={exercise.bodyParts} variant="emerald" />
            <TagList items={exercise.targetMuscles} variant="blue" />
            <TagList items={exercise.equipments} variant="orange" />
          </div>

          <div className="pt-2 text-sm font-medium text-emerald-400">
            View Details →
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}