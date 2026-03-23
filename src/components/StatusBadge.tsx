"use client";

import { EtapaStatus, STATUS_COLORS } from "@/lib/types";

export function StatusBadge({ status }: { status: EtapaStatus }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}
