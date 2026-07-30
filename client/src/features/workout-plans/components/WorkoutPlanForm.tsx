import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";
import { useCreateWorkoutPlan } from "../hooks/useCreateWorkoutPlan";
import { useUpdateWorkoutPlan } from "../hooks/useUpdateWorkoutPlan";
import type { WorkoutPlan } from "../types";

const planSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof planSchema>;

interface WorkoutPlanFormProps {
  plan?: WorkoutPlan;
  onSuccess?: () => void;
}

export default function WorkoutPlanForm({ plan, onSuccess }: WorkoutPlanFormProps) {
  const createPlan = useCreateWorkoutPlan();
  const updatePlan = useUpdateWorkoutPlan();
  const isEdit = !!plan;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? { name: plan.name, description: plan.description ?? "" } : undefined,
  });

  const onSubmit = async (data: FormValues) => {
    if (plan) {
      await updatePlan.mutateAsync({ id: plan.id, payload: data });
    } else {
      await createPlan.mutateAsync(data);
    }
    onSuccess?.();
  };

  const saving = createPlan.isPending || updatePlan.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Workout Name"
        htmlFor="name"
        error={errors.name?.message}
        required
      >
        <Input
          id="name"
          type="text"
          placeholder="e.g. Push Day"
          {...register("name")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
        helperText="Briefly describe the focus or goal of this plan."
      >
        <Input
          id="description"
          type="text"
          placeholder="e.g. Chest, shoulders, and triceps"
          {...register("description")}
        />
      </FormField>

      <Button
        type="submit"
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEdit ? "Saving..." : "Creating..."}
          </>
        ) : (
          isEdit ? "Save" : "Create"
        )}
      </Button>
    </form>
  );
}
