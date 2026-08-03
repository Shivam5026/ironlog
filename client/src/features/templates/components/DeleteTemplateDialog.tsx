import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/shared/components/ui/Button";

import { useDeleteTemplate } from "../hooks/useDeleteTemplate";
import type { WorkoutTemplate } from "../types";

interface DeleteTemplateDialogProps {
  template: WorkoutTemplate;
  onClose: () => void;
}

export function DeleteTemplateDialog({ template, onClose }: DeleteTemplateDialogProps) {
  const deleteTemplate = useDeleteTemplate();

  const handleDelete = async () => {
    try {
      await deleteTemplate.mutateAsync(template.id);
      onClose();
    } catch {
      // Error toast from hook; keep dialog open.
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold">Delete template?</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            The "{template.name}" template will be permanently deleted.
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={deleteTemplate.isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteTemplate.isPending}>
              Delete
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}