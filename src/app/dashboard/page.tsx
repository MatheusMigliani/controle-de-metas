import { Suspense } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export default function DashboardRoute() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  );
}
