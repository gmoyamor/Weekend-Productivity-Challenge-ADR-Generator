"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ADRViewer from "@/components/ADRViewer";
import DeleteModal from "@/components/DeleteModal";
import { getADR, deleteADR, downloadADR, APIError } from "@/lib/api";
import type { ADRResponse } from "@/lib/types";

export default function ADRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [adr, setAdr] = useState<ADRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchADR() {
      try {
        const data = await getADR(id);
        setAdr(data);
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError("Error inesperado al cargar el ADR.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchADR();
  }, [id]);

  function handleDownload() {
    if (adr) {
      downloadADR(adr);
    }
  }

  function handleDeleteClick() {
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    try {
      await deleteADR(id);
      setShowDeleteModal(false);
      setIsDeleting(false);
      setDeleteSuccess(true);
      setTimeout(() => {
        router.push("/adrs");
      }, 3000);
    } catch (err) {
      setShowDeleteModal(false);
      setIsDeleting(false);
      if (err instanceof APIError) {
        setDeleteError(err.message);
      } else {
        setDeleteError("La eliminación no se completó.");
      }
      setTimeout(() => setDeleteError(null), 5000);
    }
  }

  function handleDeleteCancel() {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-12 text-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[720px] mx-auto px-6 py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          href="/adrs"
          className="text-sm font-medium text-[#232f3e] hover:underline"
        >
          Volver
        </Link>
      </div>
    );
  }

  if (!adr) return null;

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8">
      {/* Success notification */}
      {deleteSuccess && (
        <div className="mb-6 px-4 py-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">ADR eliminado exitosamente</p>
        </div>
      )}

      {/* Delete error notification */}
      {deleteError && (
        <div className="mb-6 px-4 py-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{deleteError}</p>
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-6">
        {adr.title}
      </h1>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-medium text-[#232f3e] border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors duration-150"
        >
          Descargar
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors duration-150"
        >
          Eliminar
        </button>
      </div>

      {/* ADR Content */}
      <ADRViewer content={adr.content} />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        adrTitle={adr.title}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
