import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./deleteADR";

jest.mock("../services", () => ({
  deleteADR: jest.fn(),
}));

import { deleteADR } from "../services";

const mockedDeleteADR = deleteADR as jest.MockedFunction<typeof deleteADR>;

function makeEvent(id?: string): APIGatewayProxyEvent {
  return {
    pathParameters: id ? { id } : null,
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "DELETE",
    isBase64Encoded: false,
    path: `/adrs/${id ?? ""}`,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

describe("deleteADR handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with success message when ADR is deleted", async () => {
    mockedDeleteADR.mockResolvedValue(undefined);

    const result = await handler(makeEvent("001"));

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("ADR eliminado exitosamente.");
    expect(mockedDeleteADR).toHaveBeenCalledWith("001");
  });

  it("returns 400 when id path parameter is missing", async () => {
    const result = await handler(makeEvent(undefined));

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("VALIDATION_ERROR");
    expect(body.message).toContain("id");
    expect(mockedDeleteADR).not.toHaveBeenCalled();
  });

  it("returns 404 when ADR is not found", async () => {
    mockedDeleteADR.mockRejectedValue(new Error("ADR no encontrado"));

    const result = await handler(makeEvent("999"));

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("NOT_FOUND");
    expect(body.message).toBe("ADR no encontrado.");
  });

  it("returns 500 on unexpected error", async () => {
    mockedDeleteADR.mockRejectedValue(new Error("S3 connection failed"));

    const result = await handler(makeEvent("001"));

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe("DELETE_FAILED");
    expect(body.message).toBe("La eliminación no se completó.");
  });

  it("includes CORS headers in all responses", async () => {
    mockedDeleteADR.mockResolvedValue(undefined);

    const result = await handler(makeEvent("001"));

    expect(result.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    });
  });

  it("includes CORS headers on error responses", async () => {
    mockedDeleteADR.mockRejectedValue(new Error("ADR no encontrado"));

    const result = await handler(makeEvent("999"));

    expect(result.headers).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    });
  });
});
