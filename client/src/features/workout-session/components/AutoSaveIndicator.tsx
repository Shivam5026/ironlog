import { Cloud, CloudUpload, CloudOff } from "lucide-react";

interface AutoSaveIndicatorProps {
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

function formatSavedAt(date: Date) {
  return `Saved ${date.toLocaleTimeString()}`;
}

export function AutoSaveIndicator({
  lastSavedAt,
  isSaving,
  hasUnsavedChanges,
}: AutoSaveIndicatorProps) {
  let icon = <Cloud className="h-4 w-4 text-muted-foreground" />;
  let label = "Saved";

  if (isSaving) {
    icon = <CloudUpload className="h-4 w-4 animate-pulse text-emerald-500" />;
    label = "Saving…";
  } else if (hasUnsavedChanges) {
    icon = <CloudOff className="h-4 w-4 text-amber-500" />;
    label = "Unsaved changes";
  } else if (lastSavedAt) {
    icon = <Cloud className="h-4 w-4 text-emerald-500" />;
    label = formatSavedAt(lastSavedAt);
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}