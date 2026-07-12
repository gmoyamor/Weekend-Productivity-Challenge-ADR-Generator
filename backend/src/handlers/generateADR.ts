import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateGenerateRequest } from "../utils";
import { createADR, SaveFailedError } from "../services";
import { ErrorCode } from "../types";

/**
 * CORS headers included in all responses.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Lambda handler for POST /adrs — generates a new ADR.
 *
 * Validates the request body, calls the ADR creation service,
 * and returns the generated ADR on success.
 *
 * Success path: returns 201 with ADRResponse JSON.
 * Validation failure: returns 400 with error details.
 *
 * Error handling for 500/504/207 is added separately (task 4.2).
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Handle missing body
  if (!event.body) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.VALIDATION_ERROR,
        message: "El cuerpo de la solicitud es requerido.",
        details: [{ field: "body", message: "El cuerpo de la solicitud es requerido y debe ser un objeto JSON." }],
      }),
    };
  }

  // Parse JSON body
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.VALIDATION_ERROR,
        message: "El cuerpo de la solicitud no es un JSON válido.",
        details: [{ field: "body", message: "El cuerpo de la solicitud no es un JSON válido." }],
      }),
    };
  }

  // Validate request fields
  const validation = validateGenerateRequest(parsedBody);

  if (!validation.valid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.VALIDATION_ERROR,
        message: "Error de validación en los datos enviados.",
        details: validation.errors,
      }),
    };
  }

  // Call service to create ADR
  try {
    const adrResponse = await createADR(validation.data);

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(adrResponse),
    };
  } catch (error: unknown) {
    // Partial success: ADR generated but S3 save failed
    if (error instanceof SaveFailedError) {
      return {
        statusCode: 207,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          adr: error.adrResponse,
          error: ErrorCode.SAVE_FAILED,
          message: "El ADR se generó correctamente pero no se pudo guardar.",
        }),
      };
    }

    // Timeout error
    if (error instanceof Error && error.message.includes("timed out")) {
      return {
        statusCode: 504,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: ErrorCode.TIMEOUT,
          message: "La solicitud excedió el tiempo de espera de 30 segundos.",
        }),
      };
    }

    // Generic generation failure
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.GENERATION_FAILED,
        message: "La generación del ADR falló. Por favor reintente.",
      }),
    };
  }
}
