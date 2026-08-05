import { Pause, Play, Flag, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { RestTimer } from "./RestTimer";

interface SessionFooterProps {
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED";
  isPending?: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}

export function SessionFooter({ status, isPending, onPause, onResume, onFinish }: SessionFooterProps) {
  const isLive = status === "ACTIVE" || status === "PAUSED";

  if (!isLive) return null;

  return (
    <footer className="flex items-center justify-center gap-3">
      <RestTimer />
      {status === "PAUSED" ? (
        <Button onClick={onResume} disabled={isPending} size="lg">
          <Play className="h-4 w-4" />
          {isPending ? "Resuming..." : "Resume"}
        </Button>
      ) : (
        <Button variant="outline" onClick={onPause} disabled={isPending} size="lg">
          <Pause className="h-4 w-4" />
          {isPending ? "Pausing..." : "Pause"}
        </Button>
      )}
      <Button variant="destructive" onClick={onFinish} disabled={isPending} size="lg">
        {isPending ? <Loader2 className="animate-spin" /> : <Flag className="h-4 w-4" />}
        {isPending ? "Finishing..." : "Finish"}
      </Button>
    </footer>
  );
}
