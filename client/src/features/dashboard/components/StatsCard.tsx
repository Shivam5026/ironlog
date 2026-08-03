import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}

export function StatsCard({ icon: Icon, label, value, sub }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 px-4 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}