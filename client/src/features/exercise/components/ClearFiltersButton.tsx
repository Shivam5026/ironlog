interface ClearFiltersButtonProps {
  onClick: () => void;
}

export default function ClearFiltersButton({
  onClick,
}: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:text-red-400"
    >
      Clear Filters
    </button>
  );
}