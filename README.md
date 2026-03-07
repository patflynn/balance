# Measure

A web-based tracking app.

## Project Structure

```
measure/
├── client/          # React + TypeScript frontend (Vite)
│   └── src/
│       ├── App.tsx
│       └── main.tsx
├── server/          # Fastify + TypeScript backend
│   └── src/
│       └── index.ts
├── package.json     # Root workspace config
└── CLAUDE.md        # AI assistant conventions
```

## Getting Started

```bash
npm install
npm run dev
```

This starts both the Vite dev server (http://localhost:5173) and the Fastify API server (http://localhost:3001) concurrently. The Vite dev server proxies `/api` requests to the backend.

## Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start client and server in dev mode |
| `npm run build`       | Build both client and server        |
| `npm run lint`        | Run ESLint                          |
| `npm run format`      | Format code with Prettier           |
| `npm run format:check`| Check formatting without writing    |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Fastify 5, TypeScript
- **Tooling:** ESLint, Prettier, npm workspaces
