import {
  ADRIndex,
  ADRIndexEntry,
  ADRResponse,
  ADRStatus,
  GenerateADRRequest,
} from "../types";
import {
  getIndex,
  updateIndex,
  putADRFile,
  getADRFile,
  deleteADRFile,
} from "./s3Service";
import { generateADRContent } from "./bedrockService";
import { buildPrompt, buildMarkdownFile, generateFilename } from "../utils";

/**
 * Custom error class for when S3 persistence fails after successful generation.
 */
export class SaveFailedError extends Error {
  /** The generated ADR response (content was produced successfully). */
  public readonly adrResponse: ADRResponse;

  constructor(message: string, adrResponse: ADRResponse) {
    super(message);
    this.name = "SaveFailedError";
    this.adrResponse = adrResponse;
  }
}

/**
 * Orchestrates the full ADR creation flow:
 * 1. Gets current index from S3
 * 2. Generates next sequential ID (zero-padded to 3 digits)
 * 3. Builds prompt and invokes Bedrock
 * 4. Builds markdown file with front matter
 * 5. Persists to S3 and updates the index
 *
 * If Bedrock succeeds but S3 save fails, throws SaveFailedError
 * which contains the generated ADR content so the caller can still
 * return it to the user.
 *
 * @param request - The ADR generation request
 * @returns The full ADR response
 * @throws SaveFailedError if persistence fails after successful generation
 * @throws Error if Bedrock invocation or index retrieval fails
 */
export async function createADR(
  request: GenerateADRRequest
): Promise<ADRResponse> {
  // 1. Get current index to determine next ID
  const index: ADRIndex = await getIndex();
  const nextIdNumber = index.nextId;
  const id = String(nextIdNumber).padStart(3, "0");

  // 2. Build prompt and invoke Bedrock
  const prompt = buildPrompt(request);
  const generatedContent = await generateADRContent(prompt);

  // 3. Build the full markdown file
  const createdAt = new Date().toISOString();
  const status: ADRStatus = "Propuesto";

  const markdownContent = buildMarkdownFile({
    title: request.title,
    createdAt,
    status,
    content: generatedContent,
  });

  // 4. Generate filename
  const filename = generateFilename(id, request.title);

  // 5. Build the response object
  const adrResponse: ADRResponse = {
    id,
    title: request.title,
    filename,
    content: markdownContent,
    createdAt,
    status,
  };

  // 6. Persist to S3: save file and update index
  try {
    await putADRFile(filename, markdownContent);

    const newEntry: ADRIndexEntry = {
      id,
      title: request.title,
      filename,
      createdAt,
      status,
    };

    const updatedIndex: ADRIndex = {
      nextId: nextIdNumber + 1,
      entries: [...index.entries, newEntry],
    };

    await updateIndex(updatedIndex);
  } catch (error: unknown) {
    // Bedrock succeeded but S3 failed — throw SaveFailedError with the content
    const message =
      error instanceof Error ? error.message : "Unknown S3 error";
    throw new SaveFailedError(
      `ADR generated successfully but failed to save: ${message}`,
      adrResponse
    );
  }

  return adrResponse;
}

/**
 * Lists all ADRs sorted by creation date descending (newest first).
 *
 * @returns Array of ADR index entries sorted by createdAt descending
 */
export async function listADRs(): Promise<ADRIndexEntry[]> {
  const index = await getIndex();

  const sorted = [...index.entries].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return sorted;
}

/**
 * Retrieves a single ADR by its ID.
 *
 * Looks up the entry in the index, then fetches the full markdown content
 * from S3.
 *
 * @param id - The ADR ID (e.g., "001")
 * @returns The full ADR response including content
 * @throws Error if the ADR is not found in the index
 */
export async function getADR(id: string): Promise<ADRResponse> {
  const index = await getIndex();
  const entry = index.entries.find((e) => e.id === id);

  if (!entry) {
    throw new Error("ADR no encontrado");
  }

  const content = await getADRFile(entry.filename);

  return {
    id: entry.id,
    title: entry.title,
    filename: entry.filename,
    content,
    createdAt: entry.createdAt,
    status: entry.status,
  };
}

/**
 * Deletes an ADR by its ID.
 *
 * Removes the markdown file from S3 and updates the index to remove
 * the entry. The nextId is never decremented — IDs are never reused.
 *
 * @param id - The ADR ID to delete (e.g., "001")
 * @throws Error if the ADR is not found in the index
 * @throws Error if S3 deletion or index update fails
 */
export async function deleteADR(id: string): Promise<void> {
  const index = await getIndex();
  const entry = index.entries.find((e) => e.id === id);

  if (!entry) {
    throw new Error("ADR no encontrado");
  }

  // Delete the file from S3
  await deleteADRFile(entry.filename);

  // Remove entry from the index (don't change nextId — IDs are never reused)
  const updatedIndex: ADRIndex = {
    nextId: index.nextId,
    entries: index.entries.filter((e) => e.id !== id),
  };

  await updateIndex(updatedIndex);
}
