import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AppRouter, AuthProvider, QueryProvider } from "@/app/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);