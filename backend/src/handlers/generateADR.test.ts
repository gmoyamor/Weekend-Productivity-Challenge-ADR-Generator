import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./generateADR";
import { ErrorCode } from "../types";

// Mock the services module
jest.mock("../services", () => ({
  createADR: jest.fn(),
  SaveFailedError: jest.requireActual("../services").SaveFailedError,
}));

import { createADR, SaveFailedError } from "../services";
const mockCreateADR = createADR as jest.MockedFunction<typeof createADR>;

/**
 * Helper to build a minimal APIGatewayProxyEvent for testing.
 */
function buildEvent(body: string | null): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/adrs",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

describe("generateADR handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validation errors (400)", () => {
    it("returns 400 when event.body is null", async () => {
      const event = buildEvent(null);
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body.details).toBeDefined();
    });

    it("returns 400 when body is not valid JSON", async () => {
      const event = buildEvent("not json {{{");
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body.message).toContain("JSON válido");
    });

    it("returns 400 when required fields are missing", async () => {
      const event = buildEvent(JSON.stringify({}));
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body.details.length).toBeGreaterThan(0);
    });

    it("returns 400 when title is too short", async () => {
      const event = buildEvent(
        JSON.stringify({ title: "abc", context: "A".repeat(20) })
      );
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body.details.some((d: { field: string }) => d.field === "title")).toBe(true);
    });
  });

  describe("success path (201)", () => {
    it("returns 201 with ADR response on valid input", async () => {
      const mockResponse = {
        id: "001",
        title: "Usar PostgreSQL para pagos",
        filename: "001-usar-postgresql-para-pagos.md",
        content: "---\ntitle: ...\n---\n# ADR content",
        createdAt: "2025-01-15T10:00:00.000Z",
        status: "Propuesto" as const,
      };
      mockCreateADR.mockResolvedValue(mockResponse);

      const event = buildEvent(
        JSON.stringify({
          title: "Usar PostgreSQL para pagos",
          context: "Necesitamos una base de datos para el módulo de pagos del sistema.",
        })
      );
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.id).toBe("001");
      expect(body.title).toBe("Usar PostgreSQL para pagos");
      expect(body.filename).toBe("001-usar-postgresql-para-pagos.md");
      expect(body.status).toBe("Propuesto");
    });

    it("calls createADR with validated data", async () => {
      mockCreateADR.mockResolvedValue({
        id: "002",
        title: "Migrar a microservicios",
        filename: "002-migrar-a-microservicios.md",
        content: "# content",
        createdAt: "2025-01-15T10:00:00.000Z",
        status: "Propuesto",
      });

      const event = buildEvent(
        JSON.stringify({
          title: "Migrar a microservicios",
          context: "El monolito se ha vuelto difícil de mantener y escalar.",
          techStack: "Node.js, Docker, AWS ECS",
          detailLevel: "detailed",
        })
      );
      await handler(event);

      expect(mockCreateADR).toHaveBeenCalledWith({
        title: "Migrar a microservicios",
        context: "El monolito se ha vuelto difícil de mantener y escalar.",
        techStack: "Node.js, Docker, AWS ECS",
        detailLevel: "detailed",
      });
    });
  });

  describe("CORS headers", () => {
    it("includes CORS headers on success response", async () => {
      mockCreateADR.mockResolvedValue({
        id: "001",
        title: "Test",
        filename: "001-test.md",
        content: "# content",
        createdAt: "2025-01-15T10:00:00.000Z",
        status: "Propuesto",
      });

      const event = buildEvent(
        JSON.stringify({
          title: "Decisión de testing",
          context: "Necesitamos elegir un framework de testing adecuado.",
        })
      );
      const result = await handler(event);

      expect(result.headers).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        })
      );
    });

    it("includes CORS headers on error response", async () => {
      const event = buildEvent(null);
      const result = await handler(event);

      expect(result.headers).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        })
      );
    });
  });

  describe("error and partial failure paths", () => {
    const validBody = JSON.stringify({
      title: "Usar PostgreSQL para pagos",
      context: "Necesitamos una base de datos para el módulo de pagos del sistema.",
    });

    it("returns 207 with ADR content when SaveFailedError is thrown", async () => {
      const adrResponse = {
        id: "001",
        title: "Usar PostgreSQL para pagos",
        filename: "001-usar-postgresql-para-pagos.md",
        content: "# ADR content",
        createdAt: "2025-01-15T10:00:00.000Z",
        status: "Propuesto" as const,
      };
      mockCreateADR.mockRejectedValue(
        new SaveFailedError("S3 PutObject failed", adrResponse)
      );

      const event = buildEvent(validBody);
      const result = await handler(event);

      expect(result.statusCode).toBe(207);
      const body = JSON.parse(result.body);
      expect(body.adr).toEqual(adrResponse);
      expect(body.error).toBe("SAVE_FAILED");
      expect(body.message).toBe("El ADR se generó correctamente pero no se pudo guardar.");
      expect(result.headers).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Origin": "*",
        })
      );
    });

    it("returns 504 when error message contains 'timed out'", async () => {
      mockCreateADR.mockRejectedValue(new Error("Request timed out after 30000ms"));

      const event = buildEvent(validBody);
      const result = await handler(event);

      expect(result.statusCode).toBe(504);
      const body = JSON.parse(result.body);
      expect(body.error).toBe("TIMEOUT");
      expect(body.message).toBe("La solicitud excedió el tiempo de espera de 30 segundos.");
      expect(result.headers).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Origin": "*",
        })
      );
    });

    it("returns 500 on generic generation failure", async () => {
      mockCreateADR.mockRejectedValue(new Error("Bedrock invocation failed"));

      const event = buildEvent(validBody);
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error).toBe("GENERATION_FAILED");
      expect(body.message).toBe("La generación del ADR falló. Por favor reintente.");
      expect(result.headers).toEqual(
        expect.objectContaining({
          "Access-Control-Allow-Origin": "*",
        })
      );
    });

    it("returns 500 when a non-Error object is thrown", async () => {
      mockCreateADR.mockRejectedValue("unexpected string error");

      const event = buildEvent(validBody);
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error).toBe("GENERATION_FAILED");
    });
  });
});
