import { Link } from "react-router-dom";

import { Card, CardContent } from "@/shared/components/ui/Card";
import type { RecentTemplate } from "../types";

interface TemplateCardProps {
  template: RecentTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link to="/dashboard/templates" className="block">
      <Card className="transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
        <CardContent className="px-4 py-4">
          <p className="font-semibold capitalize">{template.name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}