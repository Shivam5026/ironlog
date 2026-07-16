import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}

      <main>
        <Outlet />
      </main>

      {/* Footer */}
    </div>
  );
};

export default RootLayout;
