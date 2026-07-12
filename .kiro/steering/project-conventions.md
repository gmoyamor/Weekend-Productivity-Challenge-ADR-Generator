---
inclusion: always
---

# ADR Generator — Convenciones del Proyecto

## Estructura del Proyecto

- `backend/` — Lambda handlers, servicios y utilidades (TypeScript)
- `frontend/` — App Next.js con App Router (TypeScript + Tailwind CSS)
- `.kiro/specs/adr-generator/` — Spec del proyecto (requirements, design, tasks)

## Stack Tecnológico

- Frontend: Next.js (App Router) desplegado en AWS Amplify
- Backend: 1 Lambda con 4 handlers, API Gateway REST
- IA: Amazon Bedrock (soporta Claude y Nova)
- Storage: S3 (archivos markdown + index.json)
- Sin autenticación (herramienta personal)

## Convenciones de Código

### TypeScript
- Strict mode habilitado
- Target ES2020, CommonJS modules
- Tipos centralizados en `backend/src/types/index.ts`
- Frontend types mirror en `frontend/src/lib/types.ts`

### Estructura Backend
- `src/handlers/` — Lambda entry points (un archivo por ruta)
- `src/services/` — Lógica de negocio y clientes AWS
- `src/utils/` — Funciones puras y utilitarias
- `src/types/` — Interfaces y enums
- Barrel exports en cada `index.ts`

### Estilo Frontend
- Minimalista, flat design, moderno
- Paleta reducida: fondo blanco/gris claro, texto oscuro, acento azul
- Tailwind CSS para estilos
- Sin sombras, sin gradientes, bordes sutiles
- Responsivo desde 768px

### Manejo de Errores
- Errores descriptivos en español para el usuario
- ErrorCode enum para tipado de errores
- SaveFailedError para fallo parcial (Bedrock OK, S3 falla)
- Siempre propagar el contenido generado si la IA tuvo éxito

### Testing
- Jest + ts-jest para unit tests
- fast-check para property-based tests
- Tests en archivos `.test.ts` junto al código que testean
- Mocks para servicios AWS (S3, Bedrock)

## Comandos Útiles

```bash
# Backend
cd backend && npm test          # Correr tests
cd backend && npm run build     # Compilar a dist/
cd backend && npx tsc --noEmit  # Verificar tipos

# Frontend
cd frontend && npm run dev      # Dev server (localhost:3000)
cd frontend && npm run build    # Build de producción
```

## Variables de Entorno (Backend)

- `ADR_BUCKET_NAME` — Nombre del bucket S3
- `BEDROCK_MODEL_ID` — ID del modelo (default: amazon.nova-lite-v1:0)
- `AWS_REGION` — Región AWS (default: us-east-1)
