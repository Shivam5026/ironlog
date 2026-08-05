import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

interface ExerciseNotesProps {
  notes: string | null;
  onSave: (notes: string) => void;
  disabled?: boolean;
}

export function ExerciseNotes({ notes, onSave, disabled }: ExerciseNotesProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <p className="truncate text-sm text-muted-foreground">
          {notes ? notes : "No notes"}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} disabled={disabled}>
          <StickyNote className="h-4 w-4" />
          {notes ? "Edit" : "Add note"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Note…"
        autoFocus
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onSave(value.trim());
          setEditing(false);
        }}
        disabled={disabled}
      >
        Save
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  );
}
