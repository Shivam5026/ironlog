import { FormField } from "@/shared/components/ui/FormField";
import { SetsInput } from "./SetsInput";
import { RepsInput } from "./RepsInput";
import { RestTimeInput } from "./RestTimeInput";
import { ExerciseNotes } from "./ExerciseNotes";

export interface ExerciseConfigValues {
  sets: number;
  reps: number;
  restTime: number;
  notes: string;
}

interface ExerciseConfigurationFormProps {
  values: ExerciseConfigValues;
  onChange: (values: ExerciseConfigValues) => void;
}

/**
 * Sets / Reps / Rest / Notes inputs for an exercise. Controlled, no fetching.
 */
export function ExerciseConfigurationForm({ values, onChange }: ExerciseConfigurationFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Sets" htmlFor="config-sets">
          <SetsInput
            id="config-sets"
            value={values.sets}
            onChange={(sets) => onChange({ ...values, sets })}
          />
        </FormField>
        <FormField label="Reps" htmlFor="config-reps">
          <RepsInput
            id="config-reps"
            value={values.reps}
            onChange={(reps) => onChange({ ...values, reps })}
          />
        </FormField>
        <FormField label="Rest (sec)" htmlFor="config-rest">
          <RestTimeInput
            id="config-rest"
            value={values.restTime}
            onChange={(restTime) => onChange({ ...values, restTime })}
          />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="config-notes">
        <ExerciseNotes
          id="config-notes"
          value={values.notes}
          onChange={(notes) => onChange({ ...values, notes })}
        />
      </FormField>
    </div>
  );
}
