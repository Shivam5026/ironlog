import { Search, Dumbbell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { EmptyState } from "@/shared/components/ui/EmptyState";

interface ExercisePickerProps {
  /** Called with exercise id when one is selected */
  onSelect?: (exerciseId: string) => void;
}

/**
 * Exercise picker for adding exercises to a workout day.
 * ponytail: placeholder component — wire to exercise search API when
 * implementing the day-level exercise management UI.
 */
export function ExercisePicker({ onSelect }: ExercisePickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Exercise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search exercises..." className="pl-8" />
        </div>
        <EmptyState
          icon={Dumbbell}
          title="Search to find exercises"
          description="Type above to search the exercise library."
        />
      </CardContent>
    </Card>
  );
}
