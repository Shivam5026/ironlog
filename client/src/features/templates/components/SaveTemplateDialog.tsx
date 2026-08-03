import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/shared/components/ui/Button";

import { useCreateTemplate } from "../hooks/useCreateTemplate";
import { TemplateForm } from "./TemplateForm";

interface SaveTemplateDialogProps {
  workoutPlanId: string;
  planName: string;
  onClose: () => void;
}

export function SaveTemplateDialog({ workoutPlanId, planName, onClose }: SaveTemplateDialogProps) {
  const createTemplate = useCreateTemplate();

  const handleSave = async (values: { name: string; description?: string }) => {
    await createTemplate.mutateAsync({ ...values, workoutPlanId });
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold">Save as template</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Reuse this plan later with a single click.
          </Dialog.Description>

          <div className="mt-4">
            <TemplateForm
              defaultName={planName}
              isPending={createTemplate.isPending}
              onSubmit={handleSave}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={createTemplate.isPending}>
              Cancel
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
