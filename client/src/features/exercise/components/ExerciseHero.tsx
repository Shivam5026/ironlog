import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/components/ui/Button";
import { Separator } from "@/shared/components/ui/Separator";

interface ExerciseHeroProps {
  name: string;
}

export default function ExerciseHero({
  name,
}: ExerciseHeroProps) {
  const navigate = useNavigate();

  return (
    <header className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate("/dashboard/exercises")}
        className="w-fit gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exercises
      </Button>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold capitalize tracking-tight sm:text-4xl lg:text-5xl">
          {name}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Learn the correct technique, discover the muscles worked, and follow
          step-by-step instructions to perform this exercise safely and
          effectively.
        </p>
      </div>

      <Separator />
    </header>
  );
}