import { Card } from "@/shared/components/ui/Card";
import FilterSelect from "./FilterSelect";
import ClearFiltersButton from "./ClearFiltersButton";

interface FilterBarFilters {
  search: string;
  bodyParts: string;
  targetMuscles: string;
  equipments: string;
}

interface FilterBarProps {
  filters: FilterBarFilters;
  bodyParts: string[];
  targetMuscles: string[];
  equipments: string[];
  onChange: (field: keyof FilterBarFilters, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  filters,
  bodyParts,
  targetMuscles,
  equipments,
  onChange,
  onReset,
}: FilterBarProps) {
  return (
    <Card className="grid gap-4 rounded-2xl border-border bg-muted/40 p-6 md:grid-cols-2 xl:grid-cols-4">
      <FilterSelect
        id="body-parts"
        label="Body Part"
        value={filters.bodyParts}
        options={bodyParts}
        onChange={(value) => onChange("bodyParts", value)}
      />

      <FilterSelect
        id="target-muscles"
        label="Target Muscle"
        value={filters.targetMuscles}
        options={targetMuscles}
        onChange={(value) => onChange("targetMuscles", value)}
      />

      <FilterSelect
        id="equipments"
        label="Equipment"
        value={filters.equipments}
        options={equipments}
        onChange={(value) => onChange("equipments", value)}
      />

      <div className="flex items-end">
        <ClearFiltersButton onClick={onReset} />
      </div>
    </Card>
  );
}
