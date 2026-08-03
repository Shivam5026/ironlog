import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

/** Shared pointer sensor config for list reordering. */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
}
