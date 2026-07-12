import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

/**
 * Determines whether the configured model is a Claude (Anthropic) model.
 */
function isClaudeModel(modelId: string): boolean {
  return modelId.startsWith("anthropic.");
}

/**
 * Builds the request body for the configured Bedrock model.
 */
function buildRequestBody(prompt: string, modelId: string): string {
  if (isClaudeModel(modelId)) {
    return JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
  }

  // Amazon Nova models (messages format)
  return JSON.stringify({
    messages: [{ role: "user", content: [{ text: prompt }] }],
    inferenceConfig: {
      maxTokens: 4096,
      temperature: 0.7,
    },
  });
}

/**
 * Parses the response body from Bedrock based on the model type.
 */
function parseResponseBody(responseBody: string, modelId: string): string {
  let parsed: unknown;

  try {
    parsed = JSON.parse(responseBody);
  } catch {
    throw new Error(
      "Failed to parse Bedrock response: invalid JSON returned by the model"
    );
  }

  if (isClaudeModel(modelId)) {
    const claudeResponse = parsed as {
      content?: Array<{ type: string; text: string }>;
    };

    if (
      !claudeResponse.content ||
      !Array.isArray(claudeResponse.content) ||
      claudeResponse.content.length === 0
    ) {
      throw new Error(
        "Failed to parse Bedrock response: unexpected Claude response structure"
      );
    }

    const textBlock = claudeResponse.content.find(
      (block) => block.type === "text"
    );
    if (!textBlock || !textBlock.text) {
      throw new Error(
        "Failed to parse Bedrock response: no text content in Claude response"
      );
    }

    return textBlock.text;
  }

  // Amazon Nova models (messages format response)
  const novaResponse = parsed as {
    output?: { message?: { content?: Array<{ text?: string }> } };
  };

  if (
    !novaResponse.output ||
    !novaResponse.output.message ||
    !novaResponse.output.message.content ||
    novaResponse.output.message.content.length === 0
  ) {
    throw new Error(
      "Failed to parse Bedrock response: unexpected Nova response structure"
    );
  }

  const outputText = novaResponse.output.message.content[0].text;
  if (!outputText) {
    throw new Error(
      "Failed to parse Bedrock response: no text in Nova response"
    );
  }

  return outputText;
}

/**
 * Invokes Amazon Bedrock to generate ADR content from a prompt.
 *
 * @param prompt - The full prompt to send to the model
 * @returns The generated text content
 * @throws Error with descriptive message on timeout, service errors, or parse failures
 */
export async function generateADRContent(prompt: string): Promise<string> {
  const body = buildRequestBody(prompt, MODEL_ID);

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  try {
    const response = await bedrockClient.send(command);

    const responseBody = new TextDecoder().decode(response.body);

    if (!responseBody) {
      throw new Error("Bedrock returned an empty response");
    }

    return parseResponseBody(responseBody, MODEL_ID);
  } catch (error: unknown) {
    // Re-throw our own parse/empty errors
    if (error instanceof Error && error.message.startsWith("Failed to parse")) {
      throw error;
    }
    if (
      error instanceof Error &&
      error.message === "Bedrock returned an empty response"
    ) {
      throw error;
    }

    // Handle AWS SDK specific errors
    if (error && typeof error === "object" && "name" in error) {
      const awsError = error as { name: string; message?: string };

      if (
        awsError.name === "TimeoutError" ||
        awsError.name === "RequestTimeoutException"
      ) {
        throw new Error(
          "Bedrock request timed out: the model took too long to respond"
        );
      }

      if (awsError.name === "ThrottlingException") {
        throw new Error(
          "Bedrock service is throttling requests: please retry later"
        );
      }

      if (awsError.name === "ModelTimeoutException") {
        throw new Error(
          "Bedrock model timed out: the model took too long to respond"
        );
      }

      if (
        awsError.name === "AccessDeniedException" ||
        awsError.name === "UnauthorizedException"
      ) {
        throw new Error(
          "Bedrock access denied: check IAM permissions for the configured model"
        );
      }

      throw new Error(
        `Bedrock invocation failed: ${awsError.name} - ${awsError.message || "unknown error"}`
      );
    }

    throw new Error(
      `Bedrock invocation failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}
