import { Layers, Calendar } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";

import { TemplateActions } from "./TemplateActions";
import type { WorkoutTemplate } from "../types";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onUse: (template: WorkoutTemplate) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const exerciseCount = template.days.reduce(
    (sum, day) => sum + day.exercises.length,
    0,
  );

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 truncate text-lg capitalize">{template.name}</CardTitle>
          <span className="flex shrink-0 items-center gap-1">
            <TemplateActions template={template} />
            <Badge variant="secondary">
              {template.days.length} {template.days.length === 1 ? "day" : "days"}
            </Badge>
          </span>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(template.createdAt).toLocaleDateString()}
            </span>
          </div>
          <Button type="button" size="sm" onClick={() => onUse(template)}>
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
