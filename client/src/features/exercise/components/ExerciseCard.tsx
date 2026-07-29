import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageOff } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Separator } from "@/shared/components/ui/Separator";

import type { Exercise } from "../types/exercise";

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({
  exercise,
}: ExerciseCardProps) {
  const [imgError, setImgError] = useState(false);

  const bodyPart = exercise.bodyParts?.[0];
  const target = exercise.targetMuscles?.[0];
  const equipment = exercise.equipments?.[0];

  return (
    <Link
      to={`/dashboard/exercises/${exercise.exerciseId}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="overflow-hidden border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
        {/* Image */}
        {imgError ? (
          <div className="flex h-60 flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
            <ImageOff className="h-10 w-10" />
            <p className="text-sm">No preview available</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-xl font-bold capitalize">
            {exercise.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Exercise Metadata */}
          <div className="space-y-3">
            {bodyPart && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Body Part
                </span>

                <Badge
                  variant="secondary"
                  className="capitalize"
                >
                  {bodyPart}
                </Badge>
              </div>
            )}

            {target && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Target
                </span>

                <Badge
                  variant="outline"
                  className="capitalize"
                >
                  {target}
                </Badge>
              </div>
            )}

            {equipment && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Equipment
                </span>

                <Badge className="capitalize">
                  {equipment}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* CTA */}
          <div className="flex items-center justify-between text-sm font-medium text-primary">
            <span>View Details</span>

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}