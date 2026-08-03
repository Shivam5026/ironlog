import { Input } from "@/shared/components/ui/Input";

interface ExerciseNotesProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function ExerciseNotes({ value, onChange, id = "exercise-notes" }: ExerciseNotesProps) {
  return (
    <Input
      id={id}
      placeholder="Add notes (e.g. tempo, cues)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
