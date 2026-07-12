# Implementation Plan: ADR Generator

## Overview

Implementación incremental de un generador de ADRs impulsado por IA. Se construye primero la infraestructura backend (Lambda handlers, servicios, utilidades), luego el frontend Next.js, y finalmente se conectan todas las piezas. TypeScript en ambos lados. Cada paso produce código funcional que se integra con los anteriores.

## Tasks

- [x] 1. Set up project structure and core types
  - [x] 1.1 Initialize backend project configuration
    - Create `backend/` directory with `package.json` and `tsconfig.json`
    - Install dependencies: `@aws-sdk/client-s3`, `@aws-sdk/client-bedrock-runtime`, `uuid`
    - Install dev dependencies: `typescript`, `jest`, `ts-jest`, `@types/jest`, `fast-check`, `@types/aws-lambda`
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Create backend directory structure
    - Create directory structure: `src/handlers/`, `src/services/`, `src/utils/`, `src/types/`
    - Add placeholder `index.ts` files for each module
    - _Requirements: 1.1, 1.5_

  - [x] 1.3 Define TypeScript types and interfaces
    - Create `backend/src/types/index.ts` with all interfaces: `ADRIndexEntry`, `ADRIndex`, `GenerateADRRequest`, `ADRResponse`, `ADRStatus`, `ErrorCode` enum
    - Include request validation types and API response types
    - _Requirements: 1.1, 1.5, 2.2, 3.2_

  - [x] 1.4 Initialize frontend Next.js project
    - Create Next.js app with App Router in `frontend/` directory
    - Configure TypeScript and Tailwind CSS for styling
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 1.5 Set up frontend directory structure and shared types
    - Create directory structure: `app/`, `components/`, `lib/`
    - Create shared types file `lib/types.ts` mirroring backend response types
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 2. Implement backend utility functions
  - [x] 2.1 Implement slugify utility
    - Create `backend/src/utils/slugify.ts` with `generateFilename(id, title)` function
    - Handle accent removal via NFD normalization, special character stripping, kebab-case conversion
    - Enforce 50-char max for slug portion, avoid trailing hyphens, avoid mid-word truncation
    - _Requirements: 3.2_

  - [ ]* 2.2 Write property test for filename generation (Property 1)
    - **Property 1: Filename generation produces valid kebab-case filenames**
    - **Validates: Requirements 3.2**
    - Use fast-check to generate arbitrary strings (5-100 chars), verify output matches `NNN-[a-z0-9-]+\.md`, slug ≤50 chars, no trailing hyphens, no accented chars

  - [x] 2.3 Implement input validation — field length checks
    - Create `backend/src/utils/validation.ts` with `validateGenerateRequest(body)` function
    - Validate title (5-100 chars), context (20-2000 chars), optional fields max lengths
    - _Requirements: 1.5, 4.5_

  - [x] 2.4 Implement input validation — whitespace sanitization and error formatting
    - Implement whitespace-only detection: treat whitespace-only optional fields as empty
    - Return structured validation errors with field-level messages
    - _Requirements: 1.5, 4.5_

  - [ ]* 2.5 Write property tests for input validation (Properties 2 and 3)
    - **Property 2: Input validation correctly enforces length constraints**
    - **Property 3: Whitespace-only optional fields are treated as empty**
    - **Validates: Requirements 1.5, 4.5**

  - [x] 2.6 Implement prompt builder
    - Create `backend/src/utils/promptBuilder.ts` with `buildPrompt(request)` function
    - Construct Bedrock prompt dynamically based on title, context, detailLevel, techStack, constraints
    - Include "Sin restricciones específicas" when constraints empty
    - _Requirements: 4.3, 4.4_

  - [ ]* 2.7 Write property test for prompt builder (Property 7)
    - **Property 7: Prompt builder includes user-provided context parameters**
    - **Validates: Requirements 4.3**

  - [x] 2.8 Implement markdown builder
    - Create `backend/src/utils/markdownBuilder.ts` with `buildMarkdownFile(adr)` function
    - Generate YAML front matter (title, date, status) and assemble full markdown content
    - _Requirements: 3.3, 1.1_

  - [x] 2.9 Implement date formatter
    - Create `formatDate(isoString)` function in `markdownBuilder.ts`
    - Format dates as DD/MM/YYYY for display
    - _Requirements: 2.2_

  - [ ]* 2.10 Write property tests for markdown builder (Properties 5 and 6)
    - **Property 5: Date formatting produces valid DD/MM/YYYY strings**
    - **Property 6: Front matter YAML round-trip preserves ADR metadata**
    - **Validates: Requirements 2.2, 3.3**

- [x] 3. Implement backend services
  - [x] 3.1 Implement S3 service — read operations
    - Create `backend/src/services/s3Service.ts`
    - Implement `getIndex()` and `getADRFile(filename)` functions
    - Handle S3 errors gracefully, use environment variable for bucket name
    - _Requirements: 1.3, 2.1_

  - [x] 3.2 Implement S3 service — write and delete operations
    - Implement `updateIndex(index)`, `putADRFile(filename, content)`, and `deleteADRFile(filename)`
    - Handle S3 errors gracefully with typed error responses
    - _Requirements: 1.3, 6.2_

  - [x] 3.3 Implement Bedrock service
    - Create `backend/src/services/bedrockService.ts`
    - Implement `generateADRContent(prompt)` function using `InvokeModelCommand`
    - Configure model ID via environment variable (Claude or Nova)
    - _Requirements: 1.1, 1.4_

  - [x] 3.4 Implement ADR business logic — create and list
    - Create `backend/src/services/adrService.ts`
    - Implement `createADR(request)`: orchestrates validation → prompt build → Bedrock invoke → markdown build → S3 persist → index update
    - Implement `listADRs()`: get index, sort descending by date
    - _Requirements: 1.1, 1.3, 1.6, 2.1_

  - [x] 3.5 Implement ADR business logic — get, delete, and partial failure handling
    - Implement `getADR(id)`: lookup in index, fetch from S3
    - Implement `deleteADR(id)`: remove from S3, update index
    - Handle partial success (Bedrock OK but S3 save fails → return content with error flag)
    - _Requirements: 2.1, 6.2, 6.4_

  - [ ]* 3.6 Write property tests for list sorting and index deletion (Properties 4 and 9)
    - **Property 4: ADR list is sorted by creation date descending**
    - **Property 9: Deleting an ADR removes it from the index**
    - **Validates: Requirements 2.1, 6.4**

- [x] 4. Implement Lambda handlers
  - [x] 4.1 Implement generateADR handler — success and validation paths
    - Create `backend/src/handlers/generateADR.ts`
    - Parse and validate request body, call adrService.createADR
    - Return 201 on success, 400 on validation error
    - _Requirements: 1.1, 1.3, 1.5_

  - [x] 4.2 Implement generateADR handler — error and partial failure paths
    - Handle 500 on generation failure, 504 on timeout
    - Handle 207 partial success (ADR generated but save failed)
    - Add CORS headers to all responses
    - _Requirements: 1.4, 1.6_

  - [x] 4.3 Implement listADRs and getADR handlers
    - Create `backend/src/handlers/listADRs.ts` — GET /adrs, return sorted list or 500
    - Create `backend/src/handlers/getADR.ts` — GET /adrs/{id}, return ADR or 404
    - Add CORS headers to all responses
    - _Requirements: 2.1, 2.3, 2.5_

  - [x] 4.4 Implement deleteADR handler
    - Create `backend/src/handlers/deleteADR.ts` — DELETE /adrs/{id}, return 200 or 404/500
    - Add CORS headers to all responses
    - _Requirements: 6.2, 6.5_

  - [ ]* 4.5 Write unit tests for generateADR and listADRs handlers
    - Mock S3 and Bedrock services
    - Test generateADR: valid request, validation error, Bedrock failure, timeout, save failure
    - Test listADRs: success, empty list, S3 error
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 2.1_

  - [ ]* 4.6 Write unit tests for getADR and deleteADR handlers
    - Mock S3 service
    - Test getADR: found, not found
    - Test deleteADR: success, not found, delete error
    - _Requirements: 2.5, 6.2, 6.5_

- [x] 5. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement frontend components
  - [x] 6.1 Implement API client
    - Create `frontend/lib/api.ts` with functions: `generateADR()`, `listADRs()`, `getADR(id)`, `deleteADR(id)`, `downloadADR(id)`
    - Handle errors, timeouts, and network failures with user-friendly messages
    - _Requirements: 5.2, 5.4_

  - [x] 6.2 Implement Navbar component
    - Create `frontend/components/Navbar.tsx` with persistent navigation (Generar, Mis ADRs)
    - Style with Tailwind CSS, ensure responsive layout
    - _Requirements: 5.2_

  - [x] 6.3 Implement ADRForm component — field rendering and validation
    - Create `frontend/components/ADRForm.tsx`
    - Fields: título (required, 5-100), contexto (required, 20-2000), stack tecnológico (optional, max 200), restricciones (optional, max 500)
    - Client-side validation with inline error messages
    - _Requirements: 1.5, 4.1, 4.2, 4.5, 5.1_

  - [x] 6.4 Implement ADRForm component — detail level and submission
    - Add nivel de detalle (radio: Breve/Estándar/Detallado with descriptions, default Estándar)
    - Trim whitespace-only optional fields before submission
    - Wire form submission to API client
    - _Requirements: 4.1, 4.2, 4.5, 5.1_

  - [x] 6.5 Implement LoadingIndicator component
    - Create `frontend/components/LoadingIndicator.tsx` with elapsed time counter (updates every second)
    - Show timeout error after 30 seconds
    - _Requirements: 5.3, 5.4_

  - [x] 6.6 Implement ADRViewer component
    - Create `frontend/components/ADRViewer.tsx` to render markdown as formatted HTML
    - Style sections with proper hierarchy and readability
    - _Requirements: 1.2_

  - [x] 6.7 Implement ADRList component
    - Create `frontend/components/ADRList.tsx` — displays ADRs with title, date (DD/MM/YYYY), status
    - Show empty state with link to create first ADR
    - _Requirements: 2.2, 2.4_

  - [x] 6.8 Implement DeleteModal component
    - Create `frontend/components/DeleteModal.tsx` — shows ADR title, confirm/cancel buttons
    - Implement processing state during deletion and success/error feedback
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Implement frontend pages and wire everything together
  - [x] 7.1 Implement home page
    - Create `frontend/app/page.tsx` — landing with prominent CTA to generate ADR (above the fold)
    - Style with clear visual hierarchy and call-to-action button
    - _Requirements: 5.1_

  - [x] 7.2 Implement generate page
    - Create `frontend/app/generate/page.tsx` — ADRForm + LoadingIndicator + ADRViewer for result display
    - Handle success (show rendered ADR + save confirmation), partial failure (show ADR + save error + retry), and full error states
    - _Requirements: 1.2, 1.3, 1.4, 1.6_

  - [x] 7.3 Implement ADR list page
    - Create `frontend/app/adrs/page.tsx` — ADRList with error/retry handling
    - Wire to API client with loading and error states
    - _Requirements: 2.1, 2.5_

  - [x] 7.4 Implement ADR detail page
    - Create `frontend/app/adrs/[id]/page.tsx` — ADRViewer with download button and delete button
    - Implement download: generate file with front matter, filename pattern NNN-titulo-kebab.md
    - Wire DeleteModal with confirmation flow and success notification (3+ seconds)
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 6.1, 6.4, 6.5_

  - [x] 7.5 Add responsive layout and global styles
    - Apply responsive design: usable from 768px width, no horizontal scroll
    - Add layout.tsx with Navbar, consistent spacing, and readable typography
    - Ensure all interactive elements are accessible (keyboard nav, aria labels)
    - _Requirements: 5.2, 5.5_

- [ ] 8. Implement ADR section validation
  - [ ] 8.1 Implement ADR section validator utility
    - Create `backend/src/utils/sectionValidator.ts`
    - Validate that Bedrock output contains all required sections: Título, Fecha, Estado, Contexto, Decisión, Alternativas Consideradas, Consecuencias
    - Return list of missing sections if invalid
    - _Requirements: 1.1_

  - [ ]* 8.2 Write property test for section validator (Property 8)
    - **Property 8: ADR section validator identifies required sections**
    - **Validates: Requirements 1.1**

- [ ] 9. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (9 properties total)
- Unit tests validate specific examples and edge cases
- The backend is designed as a single Lambda with multiple handlers for reduced cold starts
- Frontend uses Next.js App Router with client components for interactive elements
- All API calls include CORS headers for Amplify ↔ API Gateway communication

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.5"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["2.1", "2.3", "2.6", "2.8"] },
    { "id": 4, "tasks": ["2.2", "2.4", "2.5", "2.7", "2.9", "2.10", "3.1", "3.3"] },
    { "id": 5, "tasks": ["3.2", "3.4"] },
    { "id": 6, "tasks": ["3.5", "3.6", "8.1"] },
    { "id": 7, "tasks": ["4.1", "4.3", "4.4", "8.2"] },
    { "id": 8, "tasks": ["4.2", "4.5", "4.6"] },
    { "id": 9, "tasks": ["6.1", "6.2", "6.3", "6.5", "6.6", "6.7", "6.8"] },
    { "id": 10, "tasks": ["6.4", "7.1", "7.3", "7.5"] },
    { "id": 11, "tasks": ["7.2", "7.4"] }
  ]
}
```
