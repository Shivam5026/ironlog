import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
}

export function QuickActionCard({ title, icon: Icon, href }: QuickActionCardProps) {
  return (
    <Link to={href}>
      <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/30">
        <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
          <Icon className="size-6 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </CardContent>
      </Card>
    </Link>
  );
}