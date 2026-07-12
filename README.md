# ADR Generator

An AI-powered tool that generates complete Architecture Decision Records (ADRs) from a brief description. Built with Amazon Bedrock, AWS Lambda, and Next.js for the AWS Builder Center Weekend Productivity Challenge.

## What It Does

ADR Generator turns a short description of an architectural decision into a complete, well-structured ADR document in seconds. You provide:

- A title (e.g., "Use PostgreSQL instead of MongoDB for payments")
- Context explaining why the decision is needed
- Optionally: tech stack and constraints

The AI generates a full ADR with: Title, Date, Status, Context, Decision, Alternatives Considered, and Consequences — ready to download as a `.md` file.

## Architecture

```
Browser → AWS Amplify (Next.js)
              ↓
         API Gateway (REST)
              ↓
         AWS Lambda (Node.js 20)
           ├── POST /adrs → Amazon Bedrock + S3
           ├── GET /adrs → S3
           ├── GET /adrs/{id} → S3
           └── DELETE /adrs/{id} → S3
```

## AWS Services Used

| Service | Role |
|---------|------|
| AWS Amplify | Frontend hosting (Next.js with SSR) |
| AWS Lambda | Backend logic (1 function, 4 handlers) |
| Amazon API Gateway | REST API with CORS and rate limiting |
| Amazon S3 | ADR storage (markdown files + index) |
| Amazon Bedrock | AI generation (Nova Lite model) |

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Node.js 20, TypeScript, AWS SDK v3
- **AI Model:** Amazon Nova Lite (via Bedrock)
- **Infrastructure:** AWS SAM (Infrastructure as Code)
- **Testing:** Jest, fast-check (property-based testing)

## Getting Started

### Prerequisites

- Node.js 20+
- AWS CLI configured with credentials
- AWS SAM CLI
- Access to Amazon Bedrock (Nova Lite model enabled)

### Deploy Backend

```bash
cd backend
npm install
npm run build
sam build
sam deploy --guided
```

### Run Frontend Locally

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=https://YOUR_API_GATEWAY_URL/prod" > .env.local
npm run dev
```

Open `http://localhost:3000`

### Deploy Frontend (Amplify)

1. Push code to GitHub
2. Connect repo in AWS Amplify console
3. Set monorepo root: `frontend`
4. Add env variable: `NEXT_PUBLIC_API_URL` = your API Gateway URL
5. Deploy

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── handlers/    # Lambda handlers (generateADR, listADRs, getADR, deleteADR)
│   │   ├── services/    # Business logic (S3, Bedrock, ADR orchestration)
│   │   ├── utils/       # Utilities (slugify, validation, prompt builder, markdown)
│   │   └── types/       # TypeScript interfaces
│   ├── template.yaml    # SAM infrastructure template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (home, generate, adrs, adrs/[id])
│   │   ├── components/  # React components (Form, List, Viewer, Modal, etc.)
│   │   └── lib/         # API client, shared types
│   └── package.json
└── README.md
```

## Features

- Generate ADRs with 3 detail levels (Brief, Standard, Detailed)
- List all generated ADRs sorted by date
- View rendered markdown with proper formatting
- Download ADRs as `.md` files with YAML front matter
- Delete ADRs with confirmation modal
- Rate limiting and input sanitization for security
- Responsive dark theme with AWS branding

## Security

- API Gateway throttling (2 req/s, burst 5)
- Input sanitization against prompt injection
- S3 bucket with public access blocked
- Server-side encryption (AES-256)

## License

MIT
