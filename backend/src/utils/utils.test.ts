import { generateFilename } from "./slugify";
import { validateGenerateRequest } from "./validation";
import { buildPrompt } from "./promptBuilder";
import { buildMarkdownFile, formatDate } from "./markdownBuilder";

describe("slugify - generateFilename", () => {
  it("generates correct filename for simple title", () => {
    expect(generateFilename("001", "Usar DynamoDB")).toBe("001-usar-dynamodb.md");
  });

  it("removes accents", () => {
    expect(generateFilename("002", "Migración a microservicios")).toBe("002-migracion-a-microservicios.md");
  });

  it("handles special characters", () => {
    expect(generateFilename("003", "¿Qué base de datos usar?")).toBe("003-que-base-de-datos-usar.md");
  });

  it("truncates long titles at word boundary", () => {
    const longTitle = "Esta es una decisión muy larga que excede los cincuenta caracteres permitidos para el slug";
    const result = generateFilename("004", longTitle);
    const slug = result.replace("004-", "").replace(".md", "");
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug).not.toMatch(/-$/);
  });

  it("handles empty/whitespace title", () => {
    expect(generateFilename("005", "   ")).toBe("005-untitled.md");
  });
});

describe("validation - validateGenerateRequest", () => {
  const validBody = {
    title: "Usar PostgreSQL",
    context: "Necesitamos una base de datos relacional para el módulo de pagos",
  };

  it("accepts valid request", () => {
    const result = validateGenerateRequest(validBody);
    expect(result.valid).toBe(true);
  });

  it("rejects missing title", () => {
    const result = validateGenerateRequest({ context: validBody.context });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0].field).toBe("title");
    }
  });

  it("rejects short title", () => {
    const result = validateGenerateRequest({ ...validBody, title: "abc" });
    expect(result.valid).toBe(false);
  });

  it("rejects short context", () => {
    const result = validateGenerateRequest({ ...validBody, context: "corto" });
    expect(result.valid).toBe(false);
  });

  it("trims whitespace-only optional fields", () => {
    const result = validateGenerateRequest({ ...validBody, techStack: "   ", constraints: "  \t  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.techStack).toBeUndefined();
      expect(result.data.constraints).toBeUndefined();
    }
  });

  it("rejects invalid detailLevel", () => {
    const result = validateGenerateRequest({ ...validBody, detailLevel: "mega" });
    expect(result.valid).toBe(false);
  });

  it("accepts valid detailLevel", () => {
    const result = validateGenerateRequest({ ...validBody, detailLevel: "brief" });
    expect(result.valid).toBe(true);
  });

  it("rejects null body", () => {
    const result = validateGenerateRequest(null);
    expect(result.valid).toBe(false);
  });
});

describe("promptBuilder - buildPrompt", () => {
  it("includes title and context in prompt", () => {
    const prompt = buildPrompt({ title: "Usar Redis", context: "Necesitamos cache para mejorar la latencia" });
    expect(prompt).toContain("Usar Redis");
    expect(prompt).toContain("Necesitamos cache para mejorar la latencia");
  });

  it("includes techStack when provided", () => {
    const prompt = buildPrompt({ title: "Test", context: "Context suficiente para la validación", techStack: "Node.js, Lambda" });
    expect(prompt).toContain("Stack tecnológico: Node.js, Lambda");
  });

  it("includes 'Sin restricciones' when constraints empty", () => {
    const prompt = buildPrompt({ title: "Test", context: "Context suficiente para la validación" });
    expect(prompt).toContain("Sin restricciones específicas");
  });

  it("includes constraints when provided", () => {
    const prompt = buildPrompt({ title: "Test", context: "Context suficiente para la validación", constraints: "Budget bajo" });
    expect(prompt).toContain("Restricciones: Budget bajo");
    expect(prompt).not.toContain("Sin restricciones específicas");
  });

  it("defaults to standard detail level", () => {
    const prompt = buildPrompt({ title: "Test", context: "Context suficiente para la validación" });
    expect(prompt).toContain("Nivel de detalle: standard");
  });
});

describe("markdownBuilder", () => {
  describe("formatDate", () => {
    it("formats ISO date to DD/MM/YYYY", () => {
      expect(formatDate("2026-07-12T10:30:00.000Z")).toBe("12/07/2026");
    });

    it("pads single digit day and month", () => {
      expect(formatDate("2026-01-05T00:00:00.000Z")).toBe("05/01/2026");
    });
  });

  describe("buildMarkdownFile", () => {
    it("generates front matter and content", () => {
      const result = buildMarkdownFile({
        title: "Usar Redis",
        createdAt: "2026-07-12T10:30:00.000Z",
        status: "Propuesto",
        content: "## Título\nUsar Redis",
      });

      expect(result).toContain("---");
      expect(result).toContain('title: "Usar Redis"');
      expect(result).toContain('date: "2026-07-12"');
      expect(result).toContain('status: "Propuesto"');
      expect(result).toContain("## Título\nUsar Redis");
    });
  });
});
