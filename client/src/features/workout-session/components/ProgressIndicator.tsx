import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Trend = "up" | "down" | "flat";

interface ProgressIndicatorProps {
  trend: Trend;
  label?: string;
}

const config: Record<Trend, { icon: typeof TrendingUp; className: string }> = {
  up: { icon: TrendingUp, className: "text-emerald-500" },
  down: { icon: TrendingDown, className: "text-amber-500" },
  flat: { icon: Minus, className: "text-muted-foreground" },
};

export function ProgressIndicator({ trend, label }: ProgressIndicatorProps) {
  const { icon: Icon, className } = config[trend];

  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Icon className={`h-4 w-4 ${className}`} aria-label={trend} />
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}
