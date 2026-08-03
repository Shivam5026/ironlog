import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { Input } from "@/shared/components/ui/Input";

interface TemplateFormProps {
  defaultName: string;
  defaultDescription?: string;
  isPending?: boolean;
  onSubmit: (values: { name: string; description?: string }) => void;
}

export function TemplateForm({
  defaultName,
  defaultDescription,
  isPending,
  onSubmit,
}: TemplateFormProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, description: description.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Template name" htmlFor="template-name">
        <Input
          id="template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={100}
        />
      </FormField>

      <FormField label="Description (optional)" htmlFor="template-description">
        <Input
          id="template-description"
          placeholder="e.g. Push-Pull-Legs, 6 days"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    </form>
  );
}
