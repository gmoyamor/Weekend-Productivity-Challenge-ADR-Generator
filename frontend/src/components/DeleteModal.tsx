"use client";

import { useEffect } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  adrTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({
  isOpen,
  adrTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!isDeleting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-[400px] mx-4 bg-white rounded-lg p-6 shadow-sm">
        <h2
          id="delete-modal-title"
          className="text-lg font-semibold text-[#1a1a1a]"
        >
          ¿Eliminar ADR?
        </h2>

        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          ¿Estás seguro de que querés eliminar &lsquo;{adrTitle}&rsquo;? Esta
          acción no se puede deshacer.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
