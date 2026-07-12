"use client";

import { useState } from "react";
import type { DetailLevel, GenerateADRRequest } from "@/lib/types";

interface ADRFormProps {
  onSubmit: (request: GenerateADRRequest) => void;
  isLoading: boolean;
}

interface FormErrors {
  title?: string;
  context?: string;
  techStack?: string;
  constraints?: string;
}

interface TouchedFields {
  title: boolean;
  context: boolean;
  techStack: boolean;
  constraints: boolean;
}

function validateField(
  name: keyof FormErrors,
  value: string
): string | undefined {
  const trimmed = value.trim();

  switch (name) {
    case "title":
      if (!trimmed) return "El título es obligatorio";
      if (trimmed.length < 5)
        return "El título debe tener al menos 5 caracteres";
      if (trimmed.length > 100)
        return "El título no puede superar los 100 caracteres";
      return undefined;

    case "context":
      if (!trimmed) return "El contexto es obligatorio";
      if (trimmed.length < 20)
        return "El contexto debe tener al menos 20 caracteres";
      if (trimmed.length > 2000)
        return "El contexto no puede superar los 2000 caracteres";
      return undefined;

    case "techStack":
      if (trimmed.length > 200)
        return "El stack tecnológico no puede superar los 200 caracteres";
      return undefined;

    case "constraints":
      if (trimmed.length > 500)
        return "Las restricciones no pueden superar los 500 caracteres";
      return undefined;

    default:
      return undefined;
  }
}

export default function ADRForm({ onSubmit, isLoading }: ADRFormProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [techStack, setTechStack] = useState("");
  const [constraints, setConstraints] = useState("");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("standard");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    title: false,
    context: false,
    techStack: false,
    constraints: false,
  });

  function handleBlur(field: keyof FormErrors, value: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  function handleChange(field: keyof FormErrors, value: string) {
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "context":
        setContext(value);
        break;
      case "techStack":
        setTechStack(value);
        break;
      case "constraints":
        setConstraints(value);
        break;
    }

    // Clear error on change if field was touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      title: validateField("title", title),
      context: validateField("context", context),
      techStack: validateField("techStack", techStack),
      constraints: validateField("constraints", constraints),
    };

    setErrors(newErrors);
    setTouched({
      title: true,
      context: true,
      techStack: true,
      constraints: true,
    });

    // If any errors, don't submit
    const hasErrors = Object.values(newErrors).some((err) => err !== undefined);
    if (hasErrors) return;

    // Trim whitespace-only optional fields
    const trimmedTechStack = techStack.trim() || undefined;
    const trimmedConstraints = constraints.trim() || undefined;

    const request: GenerateADRRequest = {
      title: title.trim(),
      context: context.trim(),
      detailLevel,
      ...(trimmedTechStack && { techStack: trimmedTechStack }),
      ...(trimmedConstraints && { constraints: trimmedConstraints }),
    };

    onSubmit(request);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Título */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={() => handleBlur("title", title)}
          placeholder="Ej: Usar PostgreSQL en vez de MongoDB para pagos"
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            errors.title && touched.title
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-200 focus:ring-blue-400 focus:border-blue-400"
          }`}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe brevemente la decisión tomada o por tomar
        </p>
        <div className="mt-1 flex justify-between">
          {errors.title && touched.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
          <p className={`text-xs ml-auto ${title.trim().length > 100 ? "text-red-500" : title.trim().length > 80 ? "text-amber-500" : "text-gray-400"}`}>
            {title.trim().length}/100
          </p>
        </div>
      </div>

      {/* Contexto */}
      <div>
        <label
          htmlFor="context"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Contexto <span className="text-red-500">*</span>
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => handleChange("context", e.target.value)}
          onBlur={() => handleBlur("context", context)}
          placeholder="Ej: Necesitamos una base de datos para el módulo de pagos..."
          rows={5}
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 resize-y ${
            errors.context && touched.context
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-200 focus:ring-blue-400 focus:border-blue-400"
          }`}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Explica: ¿Por qué se necesita tomar esta decisión? ¿Qué problema
          resuelve?
        </p>
        <div className="mt-1 flex justify-between">
          {errors.context && touched.context && (
            <p className="text-xs text-red-600">{errors.context}</p>
          )}
          <p className={`text-xs ml-auto ${context.trim().length > 2000 ? "text-red-500" : context.trim().length > 1800 ? "text-amber-500" : "text-gray-400"}`}>
            {context.trim().length}/2000
          </p>
        </div>
      </div>

      {/* Stack tecnológico */}
      <div>
        <label
          htmlFor="techStack"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Stack tecnológico
        </label>
        <input
          id="techStack"
          type="text"
          value={techStack}
          onChange={(e) => handleChange("techStack", e.target.value)}
          onBlur={() => handleBlur("techStack", techStack)}
          placeholder="Ej: React, Node.js, AWS Lambda, DynamoDB"
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            errors.techStack && touched.techStack
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-200 focus:ring-blue-400 focus:border-blue-400"
          }`}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Opcional: tecnologías relevantes
        </p>
        {errors.techStack && touched.techStack && (
          <p className="mt-1 text-xs text-red-600">{errors.techStack}</p>
        )}
      </div>

      {/* Restricciones */}
      <div>
        <label
          htmlFor="constraints"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Restricciones
        </label>
        <textarea
          id="constraints"
          value={constraints}
          onChange={(e) => handleChange("constraints", e.target.value)}
          onBlur={() => handleBlur("constraints", constraints)}
          placeholder="Ej: Presupuesto limitado, equipo de 3, deadline en 2 semanas"
          rows={3}
          className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 resize-y ${
            errors.constraints && touched.constraints
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-200 focus:ring-blue-400 focus:border-blue-400"
          }`}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Opcional: limitaciones que afectan la decisión
        </p>
        {errors.constraints && touched.constraints && (
          <p className="mt-1 text-xs text-red-600">{errors.constraints}</p>
        )}
      </div>

      {/* Nivel de detalle */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-900 mb-3">
          Nivel de detalle
        </legend>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="detailLevel"
              value="brief"
              checked={detailLevel === "brief"}
              onChange={() => setDetailLevel("brief")}
              className="mt-0.5 h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              disabled={isLoading}
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Breve</span>
              <p className="text-xs text-gray-500">
                ADR conciso, ~1 párrafo por sección
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="detailLevel"
              value="standard"
              checked={detailLevel === "standard"}
              onChange={() => setDetailLevel("standard")}
              className="mt-0.5 h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              disabled={isLoading}
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Estándar
              </span>
              <p className="text-xs text-gray-500">
                Contexto completo, 2-3 alternativas bien explicadas
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="detailLevel"
              value="detailed"
              checked={detailLevel === "detailed"}
              onChange={() => setDetailLevel("detailed")}
              className="mt-0.5 h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              disabled={isLoading}
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Detallado
              </span>
              <p className="text-xs text-gray-500">
                Análisis profundo con trade-offs y referencias
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generando..." : "Generar ADR"}
        </button>
      </div>
    </form>
  );
}
