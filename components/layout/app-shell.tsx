"use client";

import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

import {
  viewInformation,
} from "@/data/navigation";

import type { View } from "@/types";

export function AppShell() {
  const [activeView, setActiveView] =
    useState<View>("dashboard");

  const [search, setSearch] = useState("");

  const currentView =
    viewInformation[activeView];

  const CurrentIcon = currentView.icon;

  function handleViewChange(view: View) {
    setActiveView(view);
    setSearch("");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      <SidebarInset className="min-w-0 bg-[#f4f7fa]">
        <AppHeader
          activeView={activeView}
          search={search}
          onSearchChange={setSearch}
        />

        <main className="mx-auto w-full max-w-[1540px] flex-1 p-4 md:p-7">
          <div className="mb-4 sm:hidden">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Tìm kiếm..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {activeView === "dashboard" ? (
            <DashboardOverview
            onViewChange={handleViewChange}
            />
        ) : (
            <section className="flex min-h-[450px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div>
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <CurrentIcon className="size-8" />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-950">
                  {currentView.title}
                </h1>

                <p className="mx-auto mt-2 max-w-md text-slate-500">
                  {currentView.description}
                </p>

                <p className="mt-5 text-sm font-medium text-teal-700">
                  Phân hệ này sẽ được xây dựng trong các bước tiếp theo.
                </p>

                {search && (
                  <p className="mt-3 text-sm text-slate-500">
                    Từ khóa đang nhập:{" "}
                    <strong>{search}</strong>
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </SidebarInset>

      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}