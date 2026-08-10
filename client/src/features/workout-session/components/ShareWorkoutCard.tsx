import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import type { WorkoutSummary } from "../types/workout-summary";

interface ShareWorkoutCardProps {
  summary: WorkoutSummary;
}

export function ShareWorkoutCard({ summary }: ShareWorkoutCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = [
      `💪 ${summary.totalVolume} kg volume · ${summary.completedSets} sets · ${summary.totalReps} reps`,
      summary.personalRecords.length > 0
        ? `${summary.personalRecords.length} new PR${summary.personalRecords.length > 1 ? "s" : ""}!`
        : null,
    ].filter(Boolean).join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Workout Summary", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // share aborted
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Share</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copied" : "Share workout"}
        </Button>
      </CardContent>
    </Card>
  );
}