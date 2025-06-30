# Autonomous Agents API

A Node.js/Express API for portfolio and resume enhancement, powered by autonomous agents and LangChain. This API provides endpoints for interacting with a portfolio chatbot, retrieving developer information, and generating cover letters.

**Demo:** [agentic-api.ksoftdev.site](https://agentic-api.ksoftdev.site/api-docs)

---

## Features

- Portfolio chatbot agent for Q&A about projects, skills, experience, and more
- Cover letter generation agent
- Endpoints for listing experiences, services, projects, certificates, and skills
- Session management with PostgreSQL
- Rate limiting and security best practices
- OpenAPI/Swagger documentation

---

## API Endpoints

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/v1/agents` | GET | List all available agents | - |
| `/api/v1/agents/:agent` | POST | Interact with a specific agent (e.g., portfolio) | `{ "message": "...", "history": [...] }` |


## Usage Example

**Chat with the Portfolio Agent:**
```bash
curl -X POST https://agentic-api.ksoftdev.site/api/v1/agents/portfolio \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your frontend projects?", "history": []}'
```

**Generate a Cover Letter:**
```bash
curl -X POST https://agentic-api.ksoftdev.site/api/v1/agents/cover-letter \
  -H "Content-Type: application/json" \
  -d '{"message": "I am applying for a frontend developer role at Company X."}'
```

---

## Documentation

- **Swagger UI:** [https://agentic-api.ksoftdev.site/api-docs](https://agentic-api.ksoftdev.site/api-docs)
- **Swagger JSON:** [https://agentic-api.ksoftdev.site/swagger.json](https://agentic-api.ksoftdev.site/swagger.json)

---

## Tech Stack

- Node.js, Express
- TypeScript
- LangChain/LangGraph
- Swagger/OpenAPI

---

## Development

Install dependencies:
```bash
npm install
```

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run tests:
```bash
npm run test:e2e
```
