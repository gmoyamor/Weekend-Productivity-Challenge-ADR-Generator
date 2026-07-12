/**
 * ADR Section Validator
 *
 * Validates that Bedrock-generated ADR content contains all required sections.
 */

export interface SectionValidationResult {
  valid: boolean;
  missingSections: string[];
}

/**
 * Required sections for a valid ADR document.
 */
const REQUIRED_SECTIONS = [
  "Título",
  "Fecha",
  "Estado",
  "Contexto",
  "Decisión",
  "Alternativas Consideradas",
  "Consecuencias",
] as const;

/**
 * Validates that the given markdown content contains all required ADR section headings.
 *
 * The check is case-insensitive and looks for `## SectionName` patterns.
 *
 * @param content - The markdown content to validate
 * @returns A result indicating whether all sections are present, and which are missing
 */
export function validateADRSections(content: string): SectionValidationResult {
  const missingSections: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    // Build a case-insensitive regex that matches "## <section>" as a heading.
    // We normalize the section name to remove accents for comparison purposes,
    // but also check the original accented version.
    const escapedSection = escapeRegExp(section);
    const pattern = new RegExp(`^##\\s+${escapedSection}\\s*$`, "im");

    // Also build a pattern without accents to allow for accent-free headings
    const normalizedSection = removeAccents(section);
    const escapedNormalized = escapeRegExp(normalizedSection);
    const normalizedPattern = new RegExp(
      `^##\\s+${escapedNormalized}\\s*$`,
      "im"
    );

    if (!pattern.test(content) && !normalizedPattern.test(content)) {
      missingSections.push(section);
    }
  }

  return {
    valid: missingSections.length === 0,
    missingSections,
  };
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Removes accents/diacritics from a string using NFD normalization.
 */
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
