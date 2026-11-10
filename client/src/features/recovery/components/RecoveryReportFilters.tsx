import { Button } from "@/shared/components/ui/Button";
import {
  RECOVERY_TRENDS_RANGES,
  type RecoveryTrendsRange,
} from "../types/recovery.types";

const RANGE_LABELS: Record<RecoveryTrendsRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
};

interface RecoveryReportFiltersProps {
  range: RecoveryTrendsRange;
  onChange: (range: RecoveryTrendsRange) => void;
}

/**
 * Recovery report period filter (Feature 7.2). A single period scopes every
 * report section so the insights are always directly comparable.
 */
export function RecoveryReportFilters({
  range,
  onChange,
}: RecoveryReportFiltersProps) {
  return (
    <div
      className="flex gap-1"
      role="group"
      aria-label="Recovery report period"
    >
      {RECOVERY_TRENDS_RANGES.map((value) => (
        <Button
          key={value}
          variant={range === value ? "default" : "outline"}
          size="sm"
          aria-pressed={range === value}
          onClick={() => onChange(value)}
        >
          {RANGE_LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
