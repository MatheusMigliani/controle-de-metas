"use client";

import { EtapaStatus, STATUS_COLORS } from "@/lib/types";

export function StatusBadge({ status }: { status: EtapaStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}
