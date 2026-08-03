import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";

interface CreatePlanDialogProps {
  templateName: string;
  isPending: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function CreatePlanDialog({
  templateName,
  isPending,
  onSubmit,
  onClose,
}: CreatePlanDialogProps) {
  const [name, setName] = useState(templateName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold">Create workout plan</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            Copy "{templateName}" into a new plan.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <FormField label="Plan name" htmlFor="plan-name">
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={100}
              />
            </FormField>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
