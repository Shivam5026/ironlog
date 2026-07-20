import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS } from "@/features/profile/constants/profile.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";

import { updateProfileSchema, type UpdateProfileFormValues } from "../schemas/updateProfileSchema";

import { useProfile, useUpdateProfile } from "../hooks";

import type { UpdateProfilePayload } from "../types/profile.types";

export function ProfileForm() {
  const { data: profile, isPending: isLoadingProfile } = useProfile();

  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),

    defaultValues: {
      name: "",
      height: null,
      weight: null,
      goal: null,
      experience: null,
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      name: profile.user.name ?? "",
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      experience: profile.experience,
    });
  }, [profile, form]);

  const onSubmit =  (values: UpdateProfileFormValues) => {
    const payload: UpdateProfilePayload = {
      name: values.name.trim(),
      height: values.height ?? undefined,
      weight: values.weight ?? undefined,
      goal: values.goal ?? undefined,
      experience: values.experience ?? undefined,
    };

     updateProfile.mutate(payload);
  };
  if (isLoadingProfile) {
    return <div className="flex justify-center py-16">Loading profile...</div>;
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField label="Name" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} disabled={updateProfile.isPending} />
      </FormField>
      <FormField label="Height (cm)" error={form.formState.errors.height?.message}>
        <Input
          type="number"
          disabled={updateProfile.isPending}
          {...form.register("height", {
            setValueAs: (v) => (v === "" ? null : Number.parseFloat(v)),
          })}
        />
      </FormField>
      <FormField label="Weight (kg)" error={form.formState.errors.weight?.message}>
        <Input
          type="number"
          disabled={updateProfile.isPending}
          {...form.register("weight", {
            setValueAs: (v) => (v === "" ? null : Number.parseFloat(v)),
          })}
        />
      </FormField>
      <Controller
        control={form.control}
        name="goal"
        render={({ field }) => (
          <FormField label="Goal" error={form.formState.errors.goal?.message}>
            <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={updateProfile.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>

              <SelectContent>
                {GOAL_OPTIONS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Controller
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormField label="Experience" error={form.formState.errors.experience?.message}>
            <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={updateProfile.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>

              <SelectContent>
                {EXPERIENCE_OPTIONS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
