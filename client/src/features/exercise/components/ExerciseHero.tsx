import { ArrowLeft } from "lucide-react";

import { Button } from "@/shared/components/ui";
import { useNavigate } from "react-router-dom";

interface ExerciseHeroProps {
  name: string;
}

export default function ExerciseHero({ name }: ExerciseHeroProps) {
  const navigate = useNavigate();
  return (
    <header className="space-y-4">
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate("/dashboard/exercises")}
        className="inline-flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        Back
      </Button>

      <div>
        <h1 className="text-4xl font-bold capitalize">{name}</h1>

        <p className="mt-2 text-slate-400">
          Learn the correct form, muscles worked and exercise instructions.
        </p>
      </div>
    </header>
  );
}
