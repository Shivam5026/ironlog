import { Dumbbell, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Separator } from "@/shared/components/ui/Separator";

interface InfoListCardProps {
  title: string;
  values?: string[];
  icon?: LucideIcon;
}

export function InfoListCard({
  title,
  values = [],
  icon: Icon = Dumbbell,
}: InfoListCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>

        <Separator />
      </CardHeader>

      <CardContent>
        {values.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 capitalize"
              >
                <Icon className="h-3.5 w-3.5" />
                {value}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No information available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}