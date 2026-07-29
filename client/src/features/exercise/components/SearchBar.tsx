import { Search, X } from "lucide-react";

import { Input } from "@/shared/components/ui/Input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search exercises...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={18}
      />

      <Input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="aria-label='Search exercises' w-full rounded-xl border border-border bg-muted py-3 pl-11 pr-12 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-emerald-500"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}