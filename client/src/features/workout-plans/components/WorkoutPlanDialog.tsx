import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import WorkoutPlanForm from "./WorkoutPlanForm";

export default function WorkoutPlanDialog() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Plan
      </Button>

      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Create workout plan"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === overlayRef.current) close();
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Workout Plan</h2>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={close}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <WorkoutPlanForm onSuccess={close} />
          </div>
        </div>
      )}
    </>
  );
}
