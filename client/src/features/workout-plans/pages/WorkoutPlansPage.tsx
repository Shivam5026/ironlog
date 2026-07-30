import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Loader2,
  ArrowUpDown,
  ClipboardList,
} from "lucide-react";

import { ErrorState } from "@/shared/components/ui/ErrorState";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";

import { WorkoutPlanHeader } from "../components/WorkoutPlanHeader";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { useWorkoutPlans } from "../hooks/useWorkoutPlans";

type SortKey = "newest" | "oldest" | "name";

export default function WorkoutPlansPage() {
  const { data: plans, isPending, isError, error } = useWorkoutPlans();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    if (!plans) return [];
    let result = plans;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }

    switch (sort) {
      case "newest":
        return [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return [...result].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "name":
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return result;
    }
  }, [plans, search, sort]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <WorkoutPlanHeader
        title="Workout Plans"
        description="Create and manage your training routines."
        action={
          <Link to="/dashboard/workout-plans/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Plan
            </Button>
          </Link>
        }
      />

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sort} onValueChange={(v: SortKey) => setSort(v)}>
          <SelectTrigger className="w-[140px]" aria-label="Sort plans">
            <ArrowUpDown className="size-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isPending ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load plans"
          description={error instanceof Error ? error.message : "Something went wrong."}
        />
      ) : filtered.length === 0 && search.trim() ? (
        <EmptyState
          icon={Search}
          title="No plans match your search"
          description={`No results for "${search}". Try a different search term.`}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No workout plans yet"
          description="Create your first workout plan to get started."
          action={
            <Link to="/dashboard/workout-plans/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create Plan
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan) => (
            <WorkoutPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
