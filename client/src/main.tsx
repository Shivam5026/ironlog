import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AppRouter, AuthProvider, QueryProvider } from "@/app/providers";
import { Toaster } from "./shared/components/ui/Sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);
