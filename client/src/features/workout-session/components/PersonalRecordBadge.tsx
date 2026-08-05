import { Trophy } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge";

interface PersonalRecordBadgeProps {
  label?: string;
}

export function PersonalRecordBadge({ label = "PR" }: PersonalRecordBadgeProps) {
  return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
      <Trophy className="h-3 w-3" />
      {label}
    </Badge>
  );
}
