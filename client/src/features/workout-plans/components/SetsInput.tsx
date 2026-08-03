import { Input } from "@/shared/components/ui/Input";

interface SetsInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

export function SetsInput({ value, onChange, id = "sets" }: SetsInputProps) {
  return (
    <Input
      id={id}
      type="number"
      min={1}
      max={20}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
