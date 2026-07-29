import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";
import { useCreateWorkoutPlan } from "../hooks/useCreateWorkoutPlan";

const createPlanSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof createPlanSchema>;

interface WorkoutPlanFormProps {
  onSuccess?: () => void;
}

export default function WorkoutPlanForm({ onSuccess }: WorkoutPlanFormProps) {
  const navigate = useNavigate();
  const createPlan = useCreateWorkoutPlan();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createPlanSchema),
  });

  const onSubmit = async (data: FormValues) => {
    await createPlan.mutateAsync(data);
    reset();
    onSuccess?.();
    navigate("/dashboard/workout-plans");
  };

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
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create"
        )}
      </Button>
    </form>
  );
}
