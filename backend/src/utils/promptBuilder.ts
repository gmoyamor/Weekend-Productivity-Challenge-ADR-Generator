import { GenerateADRRequest } from "../types";

/**
 * Builds the Bedrock prompt dynamically based on the ADR generation request parameters.
 *
 * Constructs a Spanish-language prompt for an AI architect to generate a complete ADR
 * with all required sections, incorporating optional parameters like techStack and constraints.
 *
 * @param request - The ADR generation request with title, context, and optional parameters
 * @returns The constructed prompt string for Bedrock invocation
 */
export function buildPrompt(request: GenerateADRRequest): string {
  const { title, context, techStack, constraints } = request;
  const detailLevel = request.detailLevel ?? "standard";

  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(2, "0")}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentDate.getFullYear()}`;

  const techStackLine = techStack
    ? `Stack tecnológico: ${techStack}`
    : "";

  const constraintsLine = constraints
    ? `Restricciones: ${constraints}`
    : "Sin restricciones específicas";

  const contextSection = [
    `Basándote en la siguiente descripción: "${context}"`,
    techStackLine,
    constraintsLine,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `Eres un arquitecto de software senior. Genera un Architecture Decision Record (ADR)
con las siguientes secciones en markdown:

## Título
${title}

## Fecha
${formattedDate}

## Estado
Propuesto

## Contexto
${contextSection}

## Decisión
[Genera la decisión tomada]

## Alternativas Consideradas
[Genera mínimo 2 alternativas con pros y contras]

## Consecuencias
[Genera consecuencias positivas y negativas]

Nivel de detalle: ${detailLevel}
- Breve: ~1 párrafo por sección, conciso
- Estándar: contexto completo, 2-3 alternativas bien explicadas
- Detallado: análisis profundo, trade-offs explícitos, referencias`;

  return prompt;
}
