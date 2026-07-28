import { useState } from "react";

import { Card } from "@/shared/components/ui";

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
    <Card className="overflow-hidden p-0">
      {imageError ? (
        <div className="flex aspect-square items-center justify-center bg-slate-900 text-slate-500">
          Image unavailable
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setImageError(true)}
          className="aspect-square w-full object-cover"
        />
      )}
    </Card>
  );
}