export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}
