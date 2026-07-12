"use client";

import Link from "next/link";
import { ADRIndexEntry, ADRStatus } from "@/lib/types";

/**
 * Formats an ISO 8601 date string to DD/MM/YYYY format.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
}

interface ADRListProps {
  adrs: ADRIndexEntry[];
  onSelect: (id: string) => void;
}

const statusStyles: Record<ADRStatus, string> = {
  Propuesto: "bg-blue-50 text-blue-700 border border-blue-200",
  Aceptado: "bg-green-50 text-green-700 border border-green-200",
  Deprecado: "bg-amber-50 text-amber-700 border border-amber-200",
  Reemplazado: "bg-red-50 text-red-700 border border-red-200",
};

export default function ADRList({ adrs, onSelect }: ADRListProps) {
  if (adrs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg mb-4">
          No hay ADRs generados aún
        </p>
        <Link
          href="/generate"
          className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
        >
          Crear tu primer ADR
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {adrs.map((adr) => (
        <li key={adr.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <button
                onClick={() => onSelect(adr.id)}
                className="text-left text-base font-medium text-gray-900 hover:text-blue-700 transition-colors duration-150 truncate block w-full"
              >
                {adr.title}
              </button>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(adr.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[adr.status]}`}
            >
              {adr.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
