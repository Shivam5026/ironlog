import { forwardRef } from "react";
import { GripVertical } from "lucide-react";

interface ExerciseDragHandleProps {
  isDragging?: boolean;
  [key: string]: any;
}

export const ExerciseDragHandle = forwardRef<HTMLButtonElement, ExerciseDragHandleProps>(
  ({ isDragging, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...props}
      >
        <GripVertical className="size-4" />
      </button>
    );
  },
);

ExerciseDragHandle.displayName = "ExerciseDragHandle";
