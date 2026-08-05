import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { workoutSessionApi } from "../api/workout-session";

export function useStartWorkout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (workoutPlanId: string) => workoutSessionApi.start(workoutPlanId),

    onSuccess: (session) => {
      toast.success("Workout started.");
      navigate(`/dashboard/workout/${session.id}`);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
