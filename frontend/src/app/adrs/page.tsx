"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ADRList from "@/components/ADRList";
import { listADRs } from "@/lib/api";
import type { ADRIndexEntry } from "@/lib/types";

export default function ADRsPage() {
  const router = useRouter();
  const [adrs, setAdrs] = useState<ADRIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchADRs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listADRs();
      setAdrs(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los ADRs.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchADRs();
  }, []);

  const handleSelect = (id: string) => {
    router.push(`/adrs/${id}`);
  };

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10">
      <h1 className="text-2xl font-semibold text-white mb-8">Mis ADRs</h1>

      {isLoading && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-base">Cargando...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-red-400 text-base mb-4">{error}</p>
          <button
            onClick={fetchADRs}
            className="px-5 py-2.5 bg-[#FF9900] text-white text-sm font-medium rounded-md hover:bg-[#FFB84D] transition-colors duration-150"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && <ADRList adrs={adrs} onSelect={handleSelect} />}
    </div>
  );
}
