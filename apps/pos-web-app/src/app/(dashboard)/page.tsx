"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ReportsHubView } from "@/views/reports/ReportsHubView";

export default function ReportsHubPage() {
  const { isAdmin, isManager, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not Admin or Branch Manager (e.g. Inventory Manager or Cashier), redirect to Dashboard
    if (!loading && !isAdmin && !isManager) {
      router.replace("/reports/dashboard");
    }
  }, [isAdmin, isManager, loading, router]);

  if (!loading && !isAdmin && !isManager) {
    return null;
  }

  return <ReportsHubView />;
}
