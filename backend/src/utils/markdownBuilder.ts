import { ADRStatus } from "../types";

/**
 * Represents the ADR data needed to build a markdown file.
 */
interface ADRMarkdownInput {
  title: string;
  createdAt: string;
  status: ADRStatus;
  content: string;
}

/**
 * Converts an ISO 8601 date string to DD/MM/YYYY format.
 *
 * @param isoString - An ISO 8601 date string (e.g. "2026-07-12T10:30:00.000Z")
 * @returns The date formatted as DD/MM/YYYY
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
}

/**
 * Builds a complete markdown file string for an ADR, including YAML front matter.
 *
 * The front matter includes the title, date (YYYY-MM-DD), and status.
 * The content body follows immediately after the closing front matter delimiter.
 *
 * @param adr - The ADR data to build the markdown from
 * @returns The full markdown string with YAML front matter and content body
 */
export function buildMarkdownFile(adr: ADRMarkdownInput): string {
  const date = adr.createdAt.substring(0, 10); // Extract YYYY-MM-DD from ISO string

  const frontMatter = [
    "---",
    `title: "${adr.title}"`,
    `date: "${date}"`,
    `status: "${adr.status}"`,
    "---",
  ].join("\n");

  return `${frontMatter}\n\n${adr.content}\n`;
}
