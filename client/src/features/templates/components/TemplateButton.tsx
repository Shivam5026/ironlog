import { useState } from "react";
import { Bookmark } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { SaveTemplateDialog } from "./SaveTemplateDialog";

interface TemplateButtonProps {
  workoutPlanId: string;
  planName: string;
}

export function TemplateButton({ workoutPlanId, planName }: TemplateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Save as template"
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
      >
        <Bookmark className="h-4 w-4" />
      </Button>

      {dialogOpen && (
        <SaveTemplateDialog
          workoutPlanId={workoutPlanId}
          planName={planName}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
