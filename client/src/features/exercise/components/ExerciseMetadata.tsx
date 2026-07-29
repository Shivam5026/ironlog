import { InfoListCard } from "./InfoListCard";
import {
  Activity,
  Dumbbell,
  Target,
  User,
} from "lucide-react";

interface ExerciseMetadataProps {
  bodyParts: string[];
  targetMuscles: string[];
  equipments: string[];
  secondaryMuscles: string[];
}

export default function ExerciseMetadata({
  bodyParts,
  targetMuscles,
  equipments,
  secondaryMuscles,
}: ExerciseMetadataProps) {
  return (
    <section
      aria-label="Exercise metadata"
      className="grid gap-5 lg:gap-6"
    >
      <InfoListCard
        title="Body Parts"
        values={bodyParts}
        icon={User}
      />

      <InfoListCard
        title="Target Muscles"
        values={targetMuscles}
        icon={Target} 
      />

      <InfoListCard
        title="Equipment"
        values={equipments}
        icon={Dumbbell}
      />

      <InfoListCard
        title="Secondary Muscles"
        values={secondaryMuscles}
        icon={Activity}
      />
    </section>
  );
}