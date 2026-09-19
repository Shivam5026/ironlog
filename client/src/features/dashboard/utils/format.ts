export function formatWeight(kg: number): string {
  return `${Math.round(kg * 10) / 10} kg`;
}

export function formatVolume(kg: number): string {
  return `${Math.round(kg * 10) / 10} kg`;
}

export function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}