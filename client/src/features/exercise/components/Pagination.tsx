import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";

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
    <>
      <Separator className="my-8" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Showing up to{" "}
          <span className="font-semibold text-foreground">20</span> exercises
          per page
        </p>

        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!hasPreviousPage || isFetching}
          >
            ← Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onNext}
            disabled={!hasNextPage || isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Next →</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}