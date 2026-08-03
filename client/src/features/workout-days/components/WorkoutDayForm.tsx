import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";
import { useCreateWorkoutDay } from "../hooks/useCreateWorkoutDay";

const daySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
});

type FormValues = z.infer<typeof daySchema>;

interface WorkoutDayFormProps {
  workoutPlanId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkoutDayForm({ workoutPlanId, onSuccess, onCancel }: WorkoutDayFormProps) {
  const createDay = useCreateWorkoutDay();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(daySchema),
  });

  const onSubmit = async (data: FormValues) => {
    await createDay.mutateAsync({ workoutPlanId, name: data.name });
    reset();
    onSuccess?.();
  };

  return (
    <div className="relative">
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Close add day form"
          onClick={onCancel}
          className="absolute -top-1.5 right-0"
        >
          <X className="size-3.5" />
        </Button>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
        <FormField
          label="Day name"
          htmlFor="day-name"
          error={errors.name?.message}
          className="flex-1"
        >
          <Input
            id="day-name"
            placeholder="e.g. Push Day"
            {...register("name")}
          />
        </FormField>

        <Button type="submit" disabled={createDay.isPending} className="shrink-0">
          {createDay.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Add Day"
          )}
        </Button>
      </form>
    </div>
  );
}
