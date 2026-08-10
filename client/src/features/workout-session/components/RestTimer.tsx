import { Timer, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { useRestTimer } from "../hooks/useRestTimer";
import { formatDuration } from "../utils/format";

export function RestTimer() {
  const { remainingTime, stopRest } = useRestTimer();
  const active = remainingTime > 0;

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
