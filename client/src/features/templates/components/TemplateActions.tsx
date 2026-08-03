import { UpdateTemplateButton } from "./UpdateTemplateButton";
import { DeleteTemplateButton } from "./DeleteTemplateButton";
import type { WorkoutTemplate } from "../types";

interface TemplateActionsProps {
  template: WorkoutTemplate;
}

export function TemplateActions({ template }: TemplateActionsProps) {
  return (
    <>
      <UpdateTemplateButton template={template} />
      <DeleteTemplateButton template={template} />
    </>
  );
}