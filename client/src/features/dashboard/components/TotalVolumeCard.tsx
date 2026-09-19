import { Layers } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { formatVolume } from "../utils/format";

interface TotalVolumeCardProps {
  volume: number;
}

export function TotalVolumeCard({ volume }: TotalVolumeCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="size-4 text-primary" />
          Total Volume
        </div>

        <div className="mt-3">
          <p className="text-xl font-bold">{formatVolume(volume)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {volume === 0
              ? "No volume yet — lift to see it grow."
              : "Weight lifted across all workouts"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}