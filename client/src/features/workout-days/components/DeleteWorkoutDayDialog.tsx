import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

interface DeleteWorkoutDayDialogProps {
  dayName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteWorkoutDayDialog({
  dayName,
  isPending,
  onConfirm,
  onCancel,
}: DeleteWorkoutDayDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Delete "{dayName}"?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This will remove the day and all its exercises. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
