import { validateADRSections } from "./sectionValidator";

describe("validateADRSections", () => {
  const validADR = `## Título
Usar PostgreSQL para pagos

## Fecha
12/07/2026

## Estado
Propuesto

## Contexto
Necesitamos una base de datos para el módulo de pagos.

## Decisión
Usaremos PostgreSQL.

## Alternativas Consideradas
- MongoDB
- DynamoDB

## Consecuencias
- Mayor consistencia transaccional
- Requiere administración de servidor
`;

  it("returns valid when all sections are present", () => {
    const result = validateADRSections(validADR);
    expect(result.valid).toBe(true);
    expect(result.missingSections).toEqual([]);
  });

  it("returns invalid with missing sections listed", () => {
    const incomplete = `## Título
Test ADR

## Fecha
12/07/2026

## Estado
Propuesto

## Contexto
Some context here.
`;
    const result = validateADRSections(incomplete);
    expect(result.valid).toBe(false);
    expect(result.missingSections).toEqual([
      "Decisión",
      "Alternativas Consideradas",
      "Consecuencias",
    ]);
  });

  it("performs case-insensitive matching", () => {
    const uppercaseADR = `## TÍTULO
Test

## FECHA
12/07/2026

## ESTADO
Propuesto

## CONTEXTO
Context

## DECISIÓN
Decision

## ALTERNATIVAS CONSIDERADAS
Alt 1

## CONSECUENCIAS
Consequences
`;
    const result = validateADRSections(uppercaseADR);
    expect(result.valid).toBe(true);
    expect(result.missingSections).toEqual([]);
  });

  it("matches headings without accents", () => {
    const noAccentsADR = `## Titulo
Test

## Fecha
12/07/2026

## Estado
Propuesto

## Contexto
Context

## Decision
Decision made

## Alternativas Consideradas
Alt 1

## Consecuencias
Consequences
`;
    const result = validateADRSections(noAccentsADR);
    expect(result.valid).toBe(true);
    expect(result.missingSections).toEqual([]);
  });

  it("returns all sections as missing for empty content", () => {
    const result = validateADRSections("");
    expect(result.valid).toBe(false);
    expect(result.missingSections).toEqual([
      "Título",
      "Fecha",
      "Estado",
      "Contexto",
      "Decisión",
      "Alternativas Consideradas",
      "Consecuencias",
    ]);
  });

  it("does not match headings at wrong level", () => {
    const wrongLevel = `# Título
Test

### Fecha
12/07/2026

## Estado
Propuesto

## Contexto
Context

## Decisión
Decision

## Alternativas Consideradas
Alt 1

## Consecuencias
Consequences
`;
    const result = validateADRSections(wrongLevel);
    expect(result.valid).toBe(false);
    expect(result.missingSections).toContain("Título");
    expect(result.missingSections).toContain("Fecha");
  });

  it("handles mixed case headings", () => {
    const mixedCase = `## título
Test

## fecha
12/07/2026

## estado
Propuesto

## contexto
Context

## decisión
Decision

## alternativas consideradas
Alt 1

## consecuencias
Consequences
`;
    const result = validateADRSections(mixedCase);
    expect(result.valid).toBe(true);
    expect(result.missingSections).toEqual([]);
  });
});
