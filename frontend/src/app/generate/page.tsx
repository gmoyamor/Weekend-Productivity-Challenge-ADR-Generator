"use client";

import { useState } from "react";
import Link from "next/link";
import ADRForm from "@/components/ADRForm";
import ADRViewer from "@/components/ADRViewer";
import LoadingIndicator from "@/components/LoadingIndicator";
import { generateADR, APIError } from "@/lib/api";
import type { GenerateADRRequest, ADRResponse } from "@/lib/types";

type PageState = "form" | "loading" | "success" | "partial" | "error";

export default function GeneratePage() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [generatedADR, setGeneratedADR] = useState<ADRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerateADRRequest | null>(
    null
  );

  async function handleSubmit(request: GenerateADRRequest) {
    setLastRequest(request);
    setPageState("loading");
    setError(null);
    setGeneratedADR(null);

    try {
      const result = await generateADR(request);
      setGeneratedADR(result.data);

      if (result.statusCode === 207) {
        setPageState("partial");
      } else {
        setPageState("success");
      }
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado. Por favor reintente.");
      }
      setPageState("error");
    }
  }

  async function handleRetry() {
    if (!lastRequest) return;
    await handleSubmit(lastRequest);
  }

  function handleReset() {
    setPageState("form");
    setGeneratedADR(null);
    setError(null);
    setLastRequest(null);
  }

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-white mb-8">
        Generar ADR
      </h1>

      {/* Form — visible during form and loading states */}
      {(pageState === "form" || pageState === "loading") && (
        <ADRForm onSubmit={handleSubmit} isLoading={pageState === "loading"} />
      )}

      {/* Loading indicator */}
      {pageState === "loading" && (
        <div className="mt-8">
          <LoadingIndicator />
        </div>
      )}

      {/* Success state */}
      {pageState === "success" && generatedADR && (
        <div>
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-800 font-medium">
              ADR generado y guardado correctamente ✓
            </p>
          </div>
          <ADRViewer content={generatedADR.content} />
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={`/adrs/${generatedADR.id}`}
              className="rounded-md bg-[#FF9900] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#FFB84D]"
            >
              Ver ADR
            </Link>
            <button
              onClick={handleReset}
              className="rounded-md border border-gray-600 px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-[#FF9900] hover:text-[#FF9900]"
            >
              Generar otro
            </button>
          </div>
        </div>
      )}

      {/* Partial failure state — ADR generated but save failed */}
      {pageState === "partial" && generatedADR && (
        <div>
          <div className="mb-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800 font-medium">
              El ADR se generó pero no se pudo guardar
            </p>
            <button
              onClick={handleRetry}
              className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
            >
              Reintentar
            </button>
          </div>
          <ADRViewer content={generatedADR.content} />
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleReset}
              className="rounded-md border border-gray-600 px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-[#FF9900] hover:text-[#FF9900]"
            >
              Generar otro
            </button>
          </div>
        </div>
      )}

      {/* Full error state */}
      {pageState === "error" && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-4">
          <p className="text-sm text-red-800 font-medium mb-3">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
