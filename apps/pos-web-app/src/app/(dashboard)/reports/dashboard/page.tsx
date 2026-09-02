"use client";

import { Suspense } from "react";
import { DashboardView } from "@/views/dashboard/DashboardView";

export default function ReportingDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
