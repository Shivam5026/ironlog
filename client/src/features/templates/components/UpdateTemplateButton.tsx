import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { EditTemplateDialog } from "./EditTemplateDialog";
import type { WorkoutTemplate } from "../types";

interface UpdateTemplateButtonProps {
  template: WorkoutTemplate;
}

export function UpdateTemplateButton({ template }: UpdateTemplateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit template ${template.name}`}
        onClick={() => setDialogOpen(true)}
      >
        <Pencil className="size-3.5" />
      </Button>

      {dialogOpen && (
        <EditTemplateDialog
          template={template}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
