/**
 * TypeScript types and interfaces for the ADR Generator backend.
 */

// --- Enums ---

/**
 * Error codes used in API error responses.
 */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  GENERATION_FAILED = "GENERATION_FAILED",
  TIMEOUT = "TIMEOUT",
  SAVE_FAILED = "SAVE_FAILED",
  LIST_FAILED = "LIST_FAILED",
  NOT_FOUND = "NOT_FOUND",
  DELETE_FAILED = "DELETE_FAILED",
  DOWNLOAD_FAILED = "DOWNLOAD_FAILED",
}

// --- Core Types ---

/**
 * Possible statuses for an ADR.
 */
export type ADRStatus = "Propuesto" | "Aceptado" | "Deprecado" | "Reemplazado";

/**
 * A single entry in the ADR index (stored in index.json in S3).
 */
export interface ADRIndexEntry {
  /** Número secuencial: "001", "002", etc. */
  id: string;
  /** Título original del ADR */
  title: string;
  /** Nombre del archivo: "001-titulo-kebab.md" */
  filename: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** Estado del ADR */
  status: ADRStatus;
}

/**
 * The full ADR index structure stored in S3.
 */
export interface ADRIndex {
  /** Siguiente número secuencial disponible */
  nextId: number;
  /** Lista de entradas del índice */
  entries: ADRIndexEntry[];
}

// --- Request Types ---

/**
 * Request body for POST /adrs — generate a new ADR.
 */
export interface GenerateADRRequest {
  /** Título del ADR (5-100 caracteres) */
  title: string;
  /** Descripción del contexto (20-2000 caracteres) */
  context: string;
  /** Stack tecnológico (máximo 200 caracteres, opcional) */
  techStack?: string;
  /** Restricciones conocidas (máximo 500 caracteres, opcional) */
  constraints?: string;
  /** Nivel de detalle para la generación (opcional, default: "standard") */
  detailLevel?: "brief" | "standard" | "detailed";
}

/**
 * Validation error detail for a specific field.
 */
export interface ValidationError {
  /** Nombre del campo con error */
  field: string;
  /** Mensaje descriptivo del error de validación */
  message: string;
}

// --- Response Types ---

/**
 * Full ADR response returned by the API after generation or retrieval.
 */
export interface ADRResponse {
  /** Número secuencial del ADR */
  id: string;
  /** Título del ADR */
  title: string;
  /** Nombre del archivo markdown */
  filename: string;
  /** Markdown completo incluyendo front matter */
  content: string;
  /** ISO 8601 timestamp de creación */
  createdAt: string;
  /** Estado del ADR */
  status: ADRStatus;
}

/**
 * Standard API error response structure.
 */
export interface APIErrorResponse {
  /** Código de error tipado */
  error: ErrorCode;
  /** Mensaje descriptivo del error */
  message: string;
  /** Detalles de validación (solo para VALIDATION_ERROR) */
  details?: ValidationError[];
}
