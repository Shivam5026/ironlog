export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatVolume(volume: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    volume,
  );
}

export function formatWeight(weight: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    weight,
  );
}