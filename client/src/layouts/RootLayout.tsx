import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}

      <main>
        <Outlet />
      </main>

      {/* Footer */}
    </div>
  );
};

export default RootLayout;
