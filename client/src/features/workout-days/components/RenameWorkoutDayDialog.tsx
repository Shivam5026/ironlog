import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";

import { useUpdateWorkoutDay } from "../hooks/useUpdateWorkoutDay";

interface RenameWorkoutDayDialogProps {
  day: { id: string; name: string };
  onClose: () => void;
}

export function RenameWorkoutDayDialog({ day, onClose }: RenameWorkoutDayDialogProps) {
  const updateDay = useUpdateWorkoutDay();
  const [name, setName] = useState(day.name);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === day.name) {
      onClose();
      return;
    }
    await updateDay.mutateAsync({ id: day.id, payload: { name: trimmed } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Rename day</h2>

        <div className="mt-4">
          <FormField label="Day name" htmlFor="rename-day-name" error={undefined}>
            <Input
              id="rename-day-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={50}
            />
          </FormField>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={updateDay.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateDay.isPending}>
            {updateDay.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
