import { Dumbbell } from "lucide-react";

interface InfoListCardProps {
  title: string;
  values: string[];
}

export function InfoListCard({
  title,
  values,
}: InfoListCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm capitalize"
          >
            <Dumbbell size={14} />
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}