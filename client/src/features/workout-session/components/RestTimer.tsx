import { useEffect } from "react";
import { Timer, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { useRestTimer } from "../hooks/useRestTimer";
import { formatDuration } from "../utils/format";

export function RestTimer() {
  const { remainingTime, startRest, stopRest } = useRestTimer();
  const active = remainingTime > 0;

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      // nudge: briefly highlight the badge when rest completes
      // (placeholder for an audio/visual cue)
    }, 0);
    return () => clearTimeout(timeout);
  }, [active, remainingTime]);

  if (!active) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1 font-mono tabular-nums">
        <Timer className="h-3 w-3" />
        {formatDuration(remainingTime)}
      </Badge>
      <Button variant="ghost" size="icon-xs" onClick={stopRest} aria-label="Skip rest">
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
