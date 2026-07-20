import { ProfileForm } from "@/features/profile/components/ProfileForm";

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Profile
        </h1>

        <p className="text-muted-foreground">
          Manage your personal information and fitness preferences.
        </p>
      </header>

      <ProfileForm />
    </div>
  );
}