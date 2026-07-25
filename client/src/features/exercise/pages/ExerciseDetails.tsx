import { useParams } from "react-router-dom";

export default function ExerciseDetails() {
  const { exerciseId } = useParams();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold">
        Exercise Details
      </h1>

      <p className="mt-4 text-slate-400">
        Exercise ID:
      </p>

      <code className="rounded bg-slate-800 px-3 py-1 text-emerald-400">
        {exerciseId}
      </code>
    </div>
  );
}