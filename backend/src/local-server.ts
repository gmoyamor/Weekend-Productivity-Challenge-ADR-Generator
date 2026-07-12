/**
 * Local development server that wraps Lambda handlers as Express endpoints.
 * Run with: npx ts-node src/local-server.ts
 *
 * Requires environment variables:
 *   ADR_BUCKET_NAME - S3 bucket name
 *   BEDROCK_MODEL_ID - Bedrock model ID (optional, defaults to amazon.nova-lite-v1:0)
 *   AWS_REGION - AWS region (optional, defaults to us-east-1)
 */

import express from "express";
import cors from "cors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler as generateADRHandler } from "./handlers/generateADR";
import { handler as listADRsHandler } from "./handlers/listADRs";
import { handler as getADRHandler } from "./handlers/getADR";
import { handler as deleteADRHandler } from "./handlers/deleteADR";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Converts an Express request to a minimal APIGatewayProxyEvent.
 */
function toApiGatewayEvent(
  req: express.Request,
  pathParams?: Record<string, string>
): APIGatewayProxyEvent {
  return {
    body: req.body ? JSON.stringify(req.body) : null,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    httpMethod: req.method,
    isBase64Encoded: false,
    path: req.path,
    pathParameters: pathParams || null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

/**
 * Sends the Lambda response through Express.
 */
function sendLambdaResponse(res: express.Response, result: APIGatewayProxyResult) {
  res.status(result.statusCode).json(JSON.parse(result.body));
}

// POST /adrs — Generate ADR
app.post("/adrs", async (req, res) => {
  try {
    const event = toApiGatewayEvent(req);
    const result = await generateADRHandler(event);
    sendLambdaResponse(res, result);
  } catch (error) {
    console.error("Error in generateADR:", error);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
});

// GET /adrs — List ADRs
app.get("/adrs", async (req, res) => {
  try {
    const event = toApiGatewayEvent(req);
    const result = await listADRsHandler(event);
    sendLambdaResponse(res, result);
  } catch (error) {
    console.error("Error in listADRs:", error);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
});

// GET /adrs/:id — Get single ADR
app.get("/adrs/:id", async (req, res) => {
  try {
    const event = toApiGatewayEvent(req, { id: req.params.id });
    const result = await getADRHandler(event);
    sendLambdaResponse(res, result);
  } catch (error) {
    console.error("Error in getADR:", error);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
});

// DELETE /adrs/:id — Delete ADR
app.delete("/adrs/:id", async (req, res) => {
  try {
    const event = toApiGatewayEvent(req, { id: req.params.id });
    const result = await deleteADRHandler(event);
    sendLambdaResponse(res, result);
  } catch (error) {
    console.error("Error in deleteADR:", error);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ADR Generator backend running at http://localhost:${PORT}`);
  console.log(`   ADR_BUCKET_NAME: ${process.env.ADR_BUCKET_NAME || "(not set)"}`);
  console.log(`   BEDROCK_MODEL_ID: ${process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0"}`);
  console.log(`   AWS_REGION: ${process.env.AWS_REGION || "us-east-1"}`);
});
