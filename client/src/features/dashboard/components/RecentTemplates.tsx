import { useRecentTemplates } from "../hooks/useRecentTemplates";
import { TemplateCard } from "./TemplateCard";
import { TemplateSkeleton } from "./TemplateSkeleton";
import { EmptyTemplates } from "./EmptyTemplates";

export function RecentTemplates() {
  const { data, isPending } = useRecentTemplates();

  if (isPending) return <TemplateSkeleton />;

  const templates = data ?? [];
  if (templates.length === 0) return <EmptyTemplates />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}