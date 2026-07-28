import { Card } from "@/shared/components/ui";

interface ExerciseInstructionsProps {
  instructions: string[];
}

export default function ExerciseInstructions({
  instructions,
}: ExerciseInstructionsProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">
          Instructions
        </h2>

        <p className="mt-1 text-slate-400">
          Follow each step carefully to perform the exercise safely.
        </p>
      </div>

      <div className="space-y-4">
        {instructions.map((instruction, index) => (
          <Card
            key={index}
            className="flex items-start gap-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-semibold text-slate-950">
              {index + 1}
            </div>

            <p className="leading-7 text-slate-300">
              {instruction}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}