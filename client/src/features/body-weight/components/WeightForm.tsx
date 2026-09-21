import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";

const weightFormSchema = z.object({
  weight: z
    .number({ error: "Weight must be a number" })
    .positive("Weight must be greater than 0")
    .max(9999.99, "Weight is too large"),
  recordedAt: z.string().min(1, "Date is required"),
});

type WeightFormValues = z.infer<typeof weightFormSchema>;

interface WeightFormProps {
  initialValues?: {
    weight: number;
    recordedAt: string;
  };
  isPending: boolean;
  onSubmit: (data: WeightFormValues) => void;
  onCancel?: () => void;
}

export function WeightForm({
  initialValues,
  isPending,
  onSubmit,
  onCancel,
}: WeightFormProps) {
  const isEditing = !!initialValues;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WeightFormValues>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: initialValues?.weight,
      recordedAt:
        initialValues?.recordedAt ??
        new Date().toISOString().slice(0, 16),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
      <FormField
        label="Weight (kg)"
        htmlFor="weight-input"
        error={errors.weight?.message}
        className="w-32"
      >
        <Input
          id="weight-input"
          type="number"
          step="0.01"
          placeholder="e.g. 85.5"
          {...register("weight", { valueAsNumber: true })}
        />
      </FormField>

      <FormField
        label="Date"
        htmlFor="recorded-at-input"
        error={errors.recordedAt?.message}
        className="flex-1"
      >
        <Input
          id="recorded-at-input"
          type="datetime-local"
          {...register("recordedAt")}
        />
      </FormField>

      <div className="flex gap-2 shrink-0">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Save"
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Log Weight
            </>
          )}
        </Button>

        {isEditing && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
