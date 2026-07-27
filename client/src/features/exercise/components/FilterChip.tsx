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
    <button
      onClick={onRemove}
      className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400 transition hover:bg-red-500/15 hover:text-red-400"
    >
      {label}: {value} ✕
    </button>
  );
}