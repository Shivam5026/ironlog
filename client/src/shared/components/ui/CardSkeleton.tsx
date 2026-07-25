import { Card, CardContent, CardHeader } from "./Card";
import { Skeleton } from "./Skeleton";

interface CardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: boolean;
  showHeader?: boolean;
  rows?: number;
}

const widths = ["w-full", "w-11/12", "w-5/6", "w-3/4"];

export function CardSkeleton({ showHeader = true, rows = 3 }: CardSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
      )}

      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={`h-4 ${widths[index % widths.length]}`} />
        ))}
      </CardContent>
    </Card>
  );
}
