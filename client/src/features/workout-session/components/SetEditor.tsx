import { useRef, useState } from "react";
import { Input } from "@/shared/components/ui/Input";

interface SetEditorProps {
  weight: number;
  reps: number;
  disabled?: boolean;
  onWeightCommit: (weight: number) => void;
  onRepsCommit: (reps: number) => void;
}

export function SetEditor({
  weight,
  reps,
  disabled,
  onWeightCommit,
  onRepsCommit,
}: SetEditorProps) {
  const [weightDraft, setWeightDraft] = useState(weight || "");
  const [repsDraft, setRepsDraft] = useState(reps || "");
  const weightRef = useRef(weight);
  const repsRef = useRef(reps);

  const commitWeight = () => {
    const value = Number(weightDraft) || 0;
    if (value !== weightRef.current) {
      weightRef.current = value;
      onWeightCommit(value);
    }
  };

  const commitReps = () => {
    const value = Number(repsDraft) || 0;
    if (value !== repsRef.current) {
      repsRef.current = value;
      onRepsCommit(value);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-muted-foreground">kg</span>
      <Input
        type="number"
        min={0}
        step="0.5"
        value={weightDraft}
        onChange={(e) => setWeightDraft(e.target.value)}
        onBlur={commitWeight}
        onKeyDown={(e) => e.key === "Enter" && commitWeight()}
        placeholder="0"
        disabled={disabled}
        aria-label="Weight"
      />
      <Input
        type="number"
        min={0}
        step={1}
        value={repsDraft}
        onChange={(e) => setRepsDraft(e.target.value)}
        onBlur={commitReps}
        onKeyDown={(e) => e.key === "Enter" && commitReps()}
        placeholder="0"
        disabled={disabled}
        aria-label="Reps"
      />
    </div>
  );
}
