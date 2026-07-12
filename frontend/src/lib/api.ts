/**
 * API client for the ADR Generator backend.
 * Handles all HTTP communication, error handling, timeouts, and network failures.
 */

import type {
  GenerateADRRequest,
  ADRResponse,
  ADRIndexEntry,
  ListADRsResponse,
  APIErrorResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Custom error class for API errors with structured information.
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Wraps a fetch call with a 30-second timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new APIError(
        "La solicitud excedió el tiempo de espera de 30 segundos.",
        504,
        "TIMEOUT"
      );
    }
    throw new APIError(
      "Error de conexión. Verifique su conexión a internet.",
      0,
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parses an error response from the API and throws a descriptive APIError.
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let message: string;
  try {
    const body: APIErrorResponse = await response.json();
    message = body.message;
  } catch {
    message = `Error inesperado del servidor (${response.status}).`;
  }
  throw new APIError(message, response.status);
}

/**
 * Result of an ADR generation request, including the HTTP status code
 * to distinguish between full success (201) and partial failure (207).
 */
export interface GenerateADRResult {
  data: ADRResponse;
  statusCode: number;
}

/**
 * Generates a new ADR by sending the request to the backend.
 * Handles 201 (success), 207 (partial — ADR generated but save failed), and error responses.
 */
export async function generateADR(
  request: GenerateADRRequest
): Promise<GenerateADRResult> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/adrs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (response.status === 201) {
    const data: ADRResponse = await response.json();
    return { data, statusCode: 201 };
  }

  if (response.status === 207) {
    const body = await response.json();
    const data: ADRResponse = body.adr;
    return { data, statusCode: 207 };
  }

  return handleErrorResponse(response);
}

/**
 * Lists all ADRs from the backend, returning the array of index entries.
 */
export async function listADRs(): Promise<ADRIndexEntry[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/adrs`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data: ListADRsResponse = await response.json();
    return data.adrs;
  }

  return handleErrorResponse(response);
}

/**
 * Retrieves a single ADR by its ID.
 */
export async function getADR(id: string): Promise<ADRResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/adrs/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    const data: ADRResponse = await response.json();
    return data;
  }

  return handleErrorResponse(response);
}

/**
 * Deletes an ADR by its ID.
 */
export async function deleteADR(id: string): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/adrs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    return;
  }

  await handleErrorResponse(response);
}

/**
 * Downloads an ADR as a markdown file on the client side.
 * Creates a Blob from the ADR content and triggers a browser download.
 */
export function downloadADR(adr: ADRResponse): void {
  const blob = new Blob([adr.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = adr.filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
