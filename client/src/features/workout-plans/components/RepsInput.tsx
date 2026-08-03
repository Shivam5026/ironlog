import { Input } from "@/shared/components/ui/Input";

interface RepsInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

export function RepsInput({ value, onChange, id = "reps" }: RepsInputProps) {
  return (
    <Input
      id={id}
      type="number"
      min={1}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
