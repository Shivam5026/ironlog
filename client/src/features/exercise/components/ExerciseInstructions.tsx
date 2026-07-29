import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { Separator } from "@/shared/components/ui/Separator";

interface ExerciseInstructionsProps {
  instructions: string[];
}

export default function ExerciseInstructions({
  instructions,
}: ExerciseInstructionsProps) {
  return (
    <section
      aria-labelledby="exercise-instructions"
      className="space-y-6"
    >
      <div className="space-y-3">
        <h2
          id="exercise-instructions"
          className="text-2xl font-bold tracking-tight"
        >
          Instructions
        </h2>

        <p className="max-w-2xl text-muted-foreground">
          Follow each step carefully to perform the exercise safely and with
          proper form.
        </p>

        <Separator />
      </div>

      {instructions.length > 0 ? (
        <ol className="space-y-4">
          {instructions.map((instruction, index) => (
            <li key={`${index}-${instruction}`}>
              <Card>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                    {index + 1}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold">
                      Step {index + 1}
                    </h3>

                    <p className="leading-7 text-muted-foreground">
                      {instruction}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Instructions Available</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">
              Instructions for this exercise are not available at the moment.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}