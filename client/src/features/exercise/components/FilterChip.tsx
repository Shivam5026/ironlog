import { Badge } from "@/shared/components/ui/Badge";

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export default function FilterChip({
  label,
  value,
  onRemove,
}: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      render={<button />}
      onClick={onRemove}
      className="bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400"
    >
      {label}: {value} ✕
    </Badge>
  );
}