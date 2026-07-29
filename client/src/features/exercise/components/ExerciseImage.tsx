import { useState } from "react";
import { ImageOff } from "lucide-react";

import { Card } from "@/shared/components/ui/Card";

interface ExerciseImageProps {
  src: string;
  alt: string;
}

export default function ExerciseImage({
  src,
  alt,
}: ExerciseImageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group overflow-hidden p-0">
      {imageError ? (
        <div className="flex aspect-square flex-col items-center justify-center gap-3 bg-muted px-6 text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground" />

          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Image unavailable
            </p>

            <p className="text-sm text-muted-foreground">
              No preview is available for this exercise.
            </p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setImageError(true)}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </Card>
  );
}