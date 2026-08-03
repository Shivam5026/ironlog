import { useNavigate } from "react-router-dom";

import { useUseTemplate } from "../hooks/useUseTemplate";
import { CreatePlanDialog } from "./CreatePlanDialog";
import type { WorkoutTemplate } from "../types";

interface UseTemplateDialogProps {
  template: WorkoutTemplate;
  onClose: () => void;
}

export function UseTemplateDialog({ template, onClose }: UseTemplateDialogProps) {
  const navigate = useNavigate();
  const useTemplate = useUseTemplate();

  return (
    <CreatePlanDialog
      templateName={template.name}
      isPending={useTemplate.isPending}
      onSubmit={(name) => {
        // Close only once the plan is created; stay open while pending so
        // the spinner shows and errors keep the dialog visible.
        useTemplate.mutate(
          { templateId: template.id, name },
          { onSuccess: (plan) => {
            onClose();
            navigate(`/dashboard/workout-plans/${plan.id}`);
          } },
        );
      }}
      onClose={onClose}
    />
  );
}
