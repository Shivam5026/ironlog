import { Button } from "@/shared/components/ui/Button";

interface ClearFiltersButtonProps {
  onClick: () => void;
}

export default function ClearFiltersButton({
  onClick,
}: ClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-red-500 hover:text-red-400"
    >
      Clear Filters
    </Button>
  );
}