interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function FilterSelect({
  id,
  label,
  value,
  options = [],
  placeholder = "All",
  onChange,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-muted px-4 py-3 text-foreground outline-none transition-colors focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="capitalize"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}