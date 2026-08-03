import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/shared/components/ui/Button";

import { useUpdateTemplate } from "../hooks/useUpdateTemplate";
import { TemplateForm } from "./TemplateForm";
import type { WorkoutTemplate } from "../types";

interface EditTemplateDialogProps {
  template: WorkoutTemplate;
  onClose: () => void;
}

export function EditTemplateDialog({ template, onClose }: EditTemplateDialogProps) {
  const updateTemplate = useUpdateTemplate();

  const handleSave = async (values: { name: string; description?: string }) => {
    try {
      await updateTemplate.mutateAsync({ templateId: template.id, ...values });
      onClose();
    } catch {
      // Error toast from hook; keep dialog open so edits are not lost.
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold">Edit template</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Update name or description.
          </Dialog.Description>

          <div className="mt-4">
            <TemplateForm
              defaultName={template.name}
              defaultDescription={template.description ?? ""}
              isPending={updateTemplate.isPending}
              onSubmit={handleSave}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={updateTemplate.isPending}>
              Cancel
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
