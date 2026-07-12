import { GenerateADRRequest, ValidationError } from "../types";

/**
 * Valid detail levels for ADR generation.
 */
const VALID_DETAIL_LEVELS: readonly string[] = ["brief", "standard", "detailed"];

/**
 * Result type for validation: either valid with parsed data, or invalid with errors.
 */
export type ValidationResult =
  | { valid: true; data: GenerateADRRequest }
  | { valid: false; errors: ValidationError[] };

/**
 * Validates the request body for the POST /adrs endpoint.
 * Checks required fields (title, context) and optional fields (techStack, constraints, detailLevel).
 *
 * @param body - The raw request body (unknown type)
 * @returns A ValidationResult indicating success with parsed data or failure with error details
 */
export function validateGenerateRequest(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (body === null || body === undefined || typeof body !== "object") {
    return {
      valid: false,
      errors: [{ field: "body", message: "El cuerpo de la solicitud es requerido y debe ser un objeto JSON." }],
    };
  }

  const request = body as Record<string, unknown>;

  // --- Required field: title ---
  if (request.title === undefined || request.title === null) {
    errors.push({ field: "title", message: "El título es requerido." });
  } else if (typeof request.title !== "string") {
    errors.push({ field: "title", message: "El título debe ser una cadena de texto." });
  } else {
    const title = request.title.trim();
    if (title.length < 5) {
      errors.push({ field: "title", message: "El título debe tener al menos 5 caracteres." });
    } else if (title.length > 100) {
      errors.push({ field: "title", message: "El título no debe exceder 100 caracteres." });
    }
  }

  // --- Required field: context ---
  if (request.context === undefined || request.context === null) {
    errors.push({ field: "context", message: "El contexto es requerido." });
  } else if (typeof request.context !== "string") {
    errors.push({ field: "context", message: "El contexto debe ser una cadena de texto." });
  } else {
    const context = request.context.trim();
    if (context.length < 20) {
      errors.push({ field: "context", message: "El contexto debe tener al menos 20 caracteres." });
    } else if (context.length > 2000) {
      errors.push({ field: "context", message: "El contexto no debe exceder 2000 caracteres." });
    }
  }

  // --- Optional field: techStack ---
  if (request.techStack !== undefined && request.techStack !== null) {
    if (typeof request.techStack !== "string") {
      errors.push({ field: "techStack", message: "El stack tecnológico debe ser una cadena de texto." });
    } else if (request.techStack.length > 200) {
      errors.push({ field: "techStack", message: "El stack tecnológico no debe exceder 200 caracteres." });
    }
  }

  // --- Optional field: constraints ---
  if (request.constraints !== undefined && request.constraints !== null) {
    if (typeof request.constraints !== "string") {
      errors.push({ field: "constraints", message: "Las restricciones deben ser una cadena de texto." });
    } else if (request.constraints.length > 500) {
      errors.push({ field: "constraints", message: "Las restricciones no deben exceder 500 caracteres." });
    }
  }

  // --- Optional field: detailLevel ---
  if (request.detailLevel !== undefined && request.detailLevel !== null) {
    if (typeof request.detailLevel !== "string") {
      errors.push({ field: "detailLevel", message: "El nivel de detalle debe ser una cadena de texto." });
    } else if (!VALID_DETAIL_LEVELS.includes(request.detailLevel)) {
      errors.push({
        field: "detailLevel",
        message: `El nivel de detalle debe ser uno de: ${VALID_DETAIL_LEVELS.join(", ")}.`,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Build the validated request object
  const validatedData: GenerateADRRequest = {
    title: (request.title as string).trim(),
    context: (request.context as string).trim(),
  };

  // Only include optional fields if they have meaningful content
  const techStack = request.techStack as string | undefined;
  if (techStack && techStack.trim().length > 0) {
    validatedData.techStack = techStack.trim();
  }

  const constraints = request.constraints as string | undefined;
  if (constraints && constraints.trim().length > 0) {
    validatedData.constraints = constraints.trim();
  }

  const detailLevel = request.detailLevel as string | undefined;
  if (detailLevel) {
    validatedData.detailLevel = detailLevel as GenerateADRRequest["detailLevel"];
  }

  return { valid: true, data: validatedData };
}
