import { WorkoutPlanHeader } from "@/features/workout-plans/components/WorkoutPlanHeader";
import { TemplateSelector } from "../components/TemplateSelector";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <WorkoutPlanHeader
        title="Templates"
        description="Reusable workout plans. Pick one to create a new plan."
      />
      <TemplateSelector />
    </div>
  );
}
