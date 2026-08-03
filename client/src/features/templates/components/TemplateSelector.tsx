import { useState } from "react";
import { Bookmark } from "lucide-react";

import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";

import { useTemplates } from "../hooks/useTemplates";
import { TemplateCard } from "./TemplateCard";
import { UseTemplateDialog } from "./UseTemplateDialog";
import type { WorkoutTemplate } from "../types";

interface TemplateSelectorProps {
  onSelect?: () => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { data, isPending, isError } = useTemplates();
  const [selected, setSelected] = useState<WorkoutTemplate | null>(null);

  const templates = data ?? [];

  return (
    <div>
      {isPending ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Bookmark}
          title="Unable to load templates"
          description="Try again in a moment."
        />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No templates yet"
          description="Save a workout plan as a template to reuse it here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={(t) => setSelected(t)}
            />
          ))}
        </div>
      )}

      {selected && (
        <UseTemplateDialog
          template={selected}
          onClose={() => {
            setSelected(null);
            onSelect?.();
          }}
        />
      )}
    </div>
  );
}
