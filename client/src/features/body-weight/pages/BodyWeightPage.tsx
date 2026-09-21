import { useState } from "react";
import { Loader2, Plus, Scale } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useBodyWeight } from "../hooks/useBodyWeight";
import { WeightForm } from "../components/WeightForm";
import { WeightChart } from "../components/WeightChart";
import { WeightHistory } from "../components/WeightHistory";
import { formatDate } from "../utils/format";
import type { BodyWeightEntry } from "../types/body-weight.types";

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="py-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BodyWeightPage() {
  const {
    query,
    createWeight,
    updateWeight,
    deleteWeight,
  } = useBodyWeight();

  const { data, isPending, isError, error } = query;
  const items = data?.items ?? [];
  const latest = items[0] ?? null;

  const [editing, setEditing] = useState<BodyWeightEntry | null>(null);
  const [deleting, setDeleting] = useState<BodyWeightEntry | null>(null);

  const handleAdd = async (formData: { weight: number; recordedAt: string }) => {
    await createWeight.mutateAsync({
      weight: formData.weight,
      recordedAt: new Date(formData.recordedAt).toISOString(),
    });
  };

  const handleEdit = async (formData: { weight: number; recordedAt: string }) => {
    if (!editing) return;
    await updateWeight.mutateAsync({
      id: editing.id,
      payload: {
        weight: formData.weight,
        recordedAt: new Date(formData.recordedAt).toISOString(),
      },
    });
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteWeight.mutateAsync(deleting.id);
    setDeleting(null);
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Scale className="h-8 w-8" />
            Body Weight
          </h1>
        </div>
        <PageSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Scale className="h-8 w-8" />
            Body Weight
          </h1>
        </div>
        <ErrorState
          title="Failed to load weight history"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Scale className="h-8 w-8" />
          Body Weight
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your weight over time.
        </p>
      </div>

      {/* Current weight card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Current Weight</div>
              {latest ? (
                <div className="mt-1 text-3xl font-bold">
                  {latest.weight} <span className="text-lg font-normal text-muted-foreground">kg</span>
                </div>
              ) : (
                <div className="mt-1 text-3xl font-bold text-muted-foreground">--</div>
              )}
              {latest && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(latest.recordedAt)}
                </div>
              )}
            </div>

            {!editing && (
              <Button onClick={() => setEditing(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Log Weight
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form: add or edit */}
      {!editing ? (
        <WeightForm
          isPending={createWeight.isPending}
          onSubmit={handleAdd}
        />
      ) : (
        <WeightForm
          initialValues={{
            weight: editing.weight,
            recordedAt: new Date(editing.recordedAt).toISOString().slice(0, 16),
          }}
          isPending={updateWeight.isPending}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Chart */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Weight Chart</h2>
        <WeightChart items={items} />
      </div>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Weight History</h2>
        <WeightHistory
          items={items}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </div>

      {/* Delete confirmation dialog */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete this entry?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Weight recorded on {formatDate(deleting.recordedAt)} will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleting(null)}
                disabled={deleteWeight.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteWeight.isPending}
              >
                {deleteWeight.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
