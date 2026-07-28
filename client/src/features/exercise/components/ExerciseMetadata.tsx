import { InfoListCard } from "./InfoListCard";

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
    <div className="grid gap-5">
      <InfoListCard title="Body Parts" values={bodyParts} />

      <InfoListCard title="Target Muscles" values={targetMuscles} />

      <InfoListCard title="Equipment" values={equipments} />

      <InfoListCard title="Secondary Muscles" values={secondaryMuscles} />
    </div>
  );
}
