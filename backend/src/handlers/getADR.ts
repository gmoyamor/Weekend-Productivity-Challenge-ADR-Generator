import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getADR } from "../services";
import { ErrorCode } from "../types";

/**
 * CORS headers included in all responses.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

/**
 * Lambda handler for GET /adrs/{id} — retrieves a single ADR by ID.
 *
 * Success path: returns 200 with full ADRResponse.
 * Missing id: returns 400 with VALIDATION_ERROR.
 * Not found: returns 404 with NOT_FOUND error.
 * Other errors: returns 500 with LIST_FAILED error.
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.VALIDATION_ERROR,
        message: "El parámetro 'id' es requerido.",
      }),
    };
  }

  try {
    const adr = await getADR(id);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(adr),
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("no encontrado")) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: ErrorCode.NOT_FOUND,
          message: "ADR no encontrado.",
        }),
      };
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.LIST_FAILED,
        message: "No se pudo obtener el ADR.",
      }),
    };
  }
}
