interface PaginationProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isFetching?: boolean;
}

export default function Pagination({
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrevious,
  isFetching = false,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-slate-800 pt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPreviousPage || isFetching}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Previous
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage || isFetching}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
}