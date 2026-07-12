/**
 * Utility for generating ADR filenames from titles.
 * Converts titles to kebab-case slugs with accent removal and length constraints.
 */

const MAX_SLUG_LENGTH = 50;

/**
 * Generates a filename for an ADR given its sequential ID and title.
 *
 * @param id - Zero-padded sequential ID (e.g., "001", "012")
 * @param title - The ADR title (5-100 characters)
 * @returns Filename in the format `{id}-{slug}.md`
 *
 * @example
 * generateFilename("001", "Usar DynamoDB para sesiones")
 * // => "001-usar-dynamodb-para-sesiones.md"
 */
export function generateFilename(id: string, title: string): string {
  const slug = slugify(title);
  if (!slug) {
    return `${id}-untitled.md`;
  }
  return `${id}-${slug}.md`;
}

/**
 * Converts a title string into a kebab-case slug.
 *
 * Steps:
 * 1. NFD normalization to decompose accented characters
 * 2. Strip combining diacritical marks (accents)
 * 3. Lowercase
 * 4. Remove all non-alphanumeric, non-space, non-hyphen characters
 * 5. Trim whitespace
 * 6. Replace whitespace sequences with single hyphens
 * 7. Truncate to MAX_SLUG_LENGTH avoiding mid-word cuts
 * 8. Remove trailing hyphens
 */
function slugify(title: string): string {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumerics, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens

  const truncated = truncateAtWordBoundary(normalized, MAX_SLUG_LENGTH);

  return truncated.replace(/-$/, ""); // No trailing hyphen
}

/**
 * Truncates a kebab-case string to maxLength, preferring to break
 * at word boundaries (hyphens) to avoid mid-word cuts.
 *
 * If the string is already within maxLength, returns it as-is.
 * If no hyphen exists before maxLength, falls back to hard truncation.
 */
function truncateAtWordBoundary(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }

  // Look for the last hyphen at or before maxLength
  const candidate = slug.substring(0, maxLength);
  const lastHyphen = candidate.lastIndexOf("-");

  // If there's a hyphen and it's not at the very start, break there
  if (lastHyphen > 0) {
    return candidate.substring(0, lastHyphen);
  }

  // No word boundary found — hard truncate
  return candidate;
}
