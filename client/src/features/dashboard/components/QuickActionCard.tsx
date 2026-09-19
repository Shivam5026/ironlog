import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/Card";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  subtitle?: string;
  disabled?: boolean;
}

export function QuickActionCard({
  title,
  icon: Icon,
  href,
  onClick,
  subtitle,
  disabled,
}: QuickActionCardProps) {
  const content = (
    <Card
      className={cn(
        "transition",
        !disabled && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
        <Icon className="size-6 text-primary" />
        <span className="text-sm font-medium">{title}</span>
        {subtitle ? (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        ) : null}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return <div className="block w-full">{content}</div>;
  }

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}