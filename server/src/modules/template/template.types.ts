export type CreateTemplateInput = {
  name: string;
  description?: string;
  workoutPlanId: string;
};

export type UseTemplateInput = {
  name: string;
};

export type UpdateTemplateInput = {
  name: string;
  description?: string;
};
