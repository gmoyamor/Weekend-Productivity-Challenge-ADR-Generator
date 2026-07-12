import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { listADRs } from "../services";
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
 * Lambda handler for GET /adrs — lists all ADRs sorted by creation date descending.
 *
 * Success path: returns 200 with { adrs: [...] }.
 * Error path: returns 500 with LIST_FAILED error.
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const adrs = await listADRs();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ adrs }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: ErrorCode.LIST_FAILED,
        message: "No se pudo cargar la lista de ADRs.",
      }),
    };
  }
}
