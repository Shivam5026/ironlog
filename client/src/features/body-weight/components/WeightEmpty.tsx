import { Scale } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";

export function WeightEmpty() {
  return (
    <EmptyState
      icon={Scale}
      title="No weight entries yet"
      description="Log your first weight above to start tracking."
    />
  );
}
