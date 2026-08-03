/**
 * Move `activeId` to `overId`'s position in a copy of `items`.
 * Returns null when the move is a no-op or either id is missing.
 */
export function reorderItems<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
): T[] | null {
  if (activeId === overId) return null;

  const oldIndex = items.findIndex((item) => item.id === activeId);
  const newIndex = items.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1) return null;

  const reordered = [...items];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);
  return reordered;
}
