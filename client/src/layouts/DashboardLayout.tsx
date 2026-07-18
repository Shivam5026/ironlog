import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}

      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
