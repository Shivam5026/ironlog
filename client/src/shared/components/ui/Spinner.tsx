import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return <LoaderCircle className={`h-4 w-4 animate-spin ${className ?? ""}`} />;
}
