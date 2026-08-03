import { useState } from "react";
import { Search, Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/Sheet";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Spinner } from "@/shared/components/ui/Spinner";
import { Separator } from "@/shared/components/ui/Separator";

import { useDebounce } from "@/features/exercise/hooks/useDebounce";
import { useExercises } from "@/features/exercise/hooks/useExercises";
import { useBodyParts } from "@/features/exercise/hooks/useBodyParts";
import { useTargetMuscles } from "@/features/exercise/hooks/useTargetMuscles";
import { useEquipments } from "@/features/exercise/hooks/useEquipments";
import type { Exercise } from "@/features/exercise/types/exercise";

import { ExercisePickerCard } from "./ExercisePickerCard";
import { useCreateWorkoutExercise } from "@/features/workout-exercises/hooks/useCreateWorkoutExercise";
import { useReplaceWorkoutExercise } from "@/features/workout-exercises/hooks/useReplaceWorkoutExercise";

const LIMIT = 20;

interface ExercisePickerDialogProps {
  workoutDayId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Replace mode: pick swaps exerciseId/name/gif on this workout exercise, keeps sets/reps/rest/notes. */
  mode?: "add" | "replace";
  replaceExerciseId?: string;
}

/**
 * Add-exercise picker. Reuses the Exercise Library's hooks + service
 * (useExercises / useDebounce / exercise.service) — no duplicate search stack.
 */
export function ExercisePickerDialog({
  workoutDayId,
  open,
  onOpenChange,
  mode = "add",
  replaceExerciseId,
}: ExercisePickerDialogProps) {
  const createExercise = useCreateWorkoutExercise();
  const replaceExercise = useReplaceWorkoutExercise();

  const [search, setSearch] = useState("");
  const [bodyParts, setBodyParts] = useState("");
  const [targetMuscles, setTargetMuscles] = useState("");
  const [equipments, setEquipments] = useState("");
  const [after, setAfter] = useState<string | undefined>();
  const [before, setBefore] = useState<string | undefined>();
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [config, setConfig] = useState({ sets: 3, reps: 10, restTime: 90 });

  const bodyPartsQuery = useBodyParts();
  const targetMusclesQuery = useTargetMuscles();
  const equipmentsQuery = useEquipments();

  const debouncedSearch = useDebounce(search, 300);
  const { data, isPending, isError, isFetching } = useExercises({
    search: debouncedSearch,
    bodyParts,
    targetMuscles,
    equipments,
    limit: LIMIT,
    after,
    before,
  });

  const exercises = data?.data ?? [];
  const meta = data?.meta;
  const isPendingSave = mode === "replace" ? replaceExercise.isPending : createExercise.isPending;

  const hasActiveFilters =
    Boolean(bodyParts) || Boolean(targetMuscles) || Boolean(equipments);

  const selectClasses =
    "shrink-0 rounded-lg border border-border bg-muted px-2 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-emerald-500";

  function updateFilter(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setAfter(undefined);
    setBefore(undefined);
  }

  const handleSelect = (exercise: Exercise) => {
    setSelected(exercise);
  };

  const handleSave = async () => {
    if (!selected) return;

    if (mode === "replace" && replaceExerciseId) {
      await replaceExercise.mutateAsync({
        workoutExerciseId: replaceExerciseId,
        exerciseId: selected.exerciseId,
        exerciseName: selected.name,
        gifUrl: selected.gifUrl,
      });
    } else {
      await createExercise.mutateAsync({
        workoutDayId,
        exerciseId: selected.exerciseId,
        exerciseName: selected.name,
        gifUrl: selected.gifUrl,
        sets: config.sets,
        reps: config.reps,
        restTime: config.restTime,
      });
    }

    setSelected(null);
    setSearch("");
    setBodyParts("");
    setTargetMuscles("");
    setEquipments("");
    setAfter(undefined);
    setBefore(undefined);
    setConfig({ sets: 3, reps: 10, restTime: 90 });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{selected ? "Configure Exercise" : mode === "replace" ? "Replace Exercise" : "Add Exercise"}</SheetTitle>
          <SheetDescription>
            {selected
              ? mode === "replace"
                ? "This will swap the exercise and keep its sets, reps and rest time."
                : "Set the workout values for this exercise."
              : "Pick an exercise from the library."}
          </SheetDescription>
        </SheetHeader>

        {selected ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            <ExercisePickerCard
              exercise={selected}
              selected
              onSelect={() => setSelected(null)}
            />

            {mode === "replace" ? (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Your sets, reps, rest time and notes stay unchanged.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
              <FormField label="Sets" htmlFor="picker-sets">
                <Input
                  id="picker-sets"
                  type="number"
                  min={1}
                  max={50}
                  value={config.sets}
                  onChange={(e) => setConfig((c) => ({ ...c, sets: Number(e.target.value) }))}
                />
              </FormField>
              <FormField label="Reps" htmlFor="picker-reps">
                <Input
                  id="picker-reps"
                  type="number"
                  min={1}
                  max={100}
                  value={config.reps}
                  onChange={(e) => setConfig((c) => ({ ...c, reps: Number(e.target.value) }))}
                />
              </FormField>
              <FormField label="Rest (s)" htmlFor="picker-rest">
                <Input
                  id="picker-rest"
                  type="number"
                  min={0}
                  max={600}
                  value={config.restTime}
                  onChange={(e) => setConfig((c) => ({ ...c, restTime: Number(e.target.value) }))}
                />
              </FormField>
              </div>
            )}

            <div className="mt-auto flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(null)}
                disabled={isPendingSave}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isPendingSave}>
                {isPendingSave ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {mode === "replace" ? "Replace Exercise" : "Add to Day"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="space-y-2 px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <select
                  aria-label="Filter by body part"
                  value={bodyParts}
                  onChange={(e) => updateFilter(setBodyParts, e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All body parts</option>
                  {(bodyPartsQuery.data ?? []).map((option) => (
                    <option key={option} value={option} className="capitalize">
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by target muscle"
                  value={targetMuscles}
                  onChange={(e) => updateFilter(setTargetMuscles, e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All muscles</option>
                  {(targetMusclesQuery.data ?? []).map((option) => (
                    <option key={option} value={option} className="capitalize">
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by equipment"
                  value={equipments}
                  onChange={(e) => updateFilter(setEquipments, e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All equipment</option>
                  {(equipmentsQuery.data ?? []).map((option) => (
                    <option key={option} value={option} className="capitalize">
                      {option}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setBodyParts("");
                      setTargetMuscles("");
                      setEquipments("");
                      setAfter(undefined);
                      setBefore(undefined);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
              {isPending ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              ) : isError ? (
                <EmptyState
                  icon={Search}
                  title="Unable to load exercises"
                  description="Try again in a moment."
                />
              ) : exercises.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No exercises found"
                  description="Try a different search term."
                />
              ) : (
                exercises.map((exercise) => (
                  <ExercisePickerCard
                    key={exercise.exerciseId}
                    exercise={exercise}
                    selected={false}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>

            {(meta?.hasNextPage || meta?.hasPreviousPage) && (
              <>
                <Separator />
                <div className="flex items-center justify-between px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">{meta?.total ?? 0} exercises</p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setBefore(meta?.previousCursor)}
                      disabled={!meta?.hasPreviousPage || isFetching}
                    >
                      <ChevronLeft className="size-3" />
                      Prev
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setAfter(meta?.nextCursor)}
                      disabled={!meta?.hasNextPage || isFetching}
                    >
                      Next
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
