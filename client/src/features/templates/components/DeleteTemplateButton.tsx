import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { DeleteTemplateDialog } from "./DeleteTemplateDialog";
import type { WorkoutTemplate } from "../types";

interface DeleteTemplateButtonProps {
  template: WorkoutTemplate;
}

export function DeleteTemplateButton({ template }: DeleteTemplateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete template ${template.name}`}
        onClick={() => setDialogOpen(true)}
      >
        <Trash2 className="size-3.5" />
      </Button>

      {dialogOpen && (
        <DeleteTemplateDialog
          template={template}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}