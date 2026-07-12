import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { ADRIndex } from "../types";

const BUCKET_NAME = process.env.ADR_BUCKET_NAME || "";

const s3Client = new S3Client({});

/**
 * Reads the ADR index from S3 (index.json).
 * If the file does not exist yet (first use), returns a default empty index.
 */
export async function getIndex(): Promise<ADRIndex> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "index.json",
    });
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();

    if (!body) {
      return { nextId: 1, entries: [] };
    }

    return JSON.parse(body) as ADRIndex;
  } catch (error: unknown) {
    if (isNoSuchKeyError(error)) {
      return { nextId: 1, entries: [] };
    }
    throw error;
  }
}

/**
 * Gets the markdown content of an ADR file from S3.
 * @param filename - The ADR filename (e.g., "001-usar-dynamodb.md")
 * @returns The markdown content as a string
 * @throws Error if the file is not found or S3 fails
 */
export async function getADRFile(filename: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `adrs/${filename}`,
    });
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();

    if (!body) {
      throw new Error(`ADR file "${filename}" is empty`);
    }

    return body;
  } catch (error: unknown) {
    if (isNoSuchKeyError(error)) {
      throw new Error(`ADR file "${filename}" not found`);
    }
    throw error;
  }
}

/**
 * Checks if an error is an S3 NoSuchKey error.
 */
function isNoSuchKeyError(error: unknown): boolean {
  if (error && typeof error === "object" && "name" in error) {
    return (error as { name: string }).name === "NoSuchKey";
  }
  return false;
}
