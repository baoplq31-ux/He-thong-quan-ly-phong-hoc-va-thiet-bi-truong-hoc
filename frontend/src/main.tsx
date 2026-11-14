import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";

import { AppShell } from "@/components/layout/app-shell";
import "@/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppShell />
    </ThemeProvider>
  </React.StrictMode>,
);
