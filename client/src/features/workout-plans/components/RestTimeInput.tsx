import { Input } from "@/shared/components/ui/Input";

interface RestTimeInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
}

export function RestTimeInput({ value, onChange, id = "rest-time" }: RestTimeInputProps) {
  return (
    <Input
      id={id}
      type="number"
      min={0}
      max={600}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
