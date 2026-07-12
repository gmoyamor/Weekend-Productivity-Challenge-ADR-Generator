import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteADR } from "../services";
import { ErrorCode } from "../types";

/**
 * CORS headers included in all responses.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
};

/**
 * Lambda handler for DELETE /adrs/{id} — deletes an existing ADR.
 *
 * Extracts the ADR ID from path parameters, calls the delete service,
 * and returns appropriate success or error responses.
 *
 * Success: returns 200 with confirmation message.
 * Missing ID: returns 400 with validation error.
 * Not found: returns 404.
 * Other errors: returns 500.
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
    await deleteADR(id);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: "ADR eliminado exitosamente.",
      }),
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("no encontrado")) {
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
        error: ErrorCode.DELETE_FAILED,
        message: "La eliminación no se completó.",
      }),
    };
  }
}
