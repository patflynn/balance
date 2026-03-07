# Measure — Project Conventions

## Architecture

- **Monorepo** using npm workspaces: `client/` and `server/`.
- **Client:** React + TypeScript, bundled with Vite. Dev server on port 5173.
- **Server:** Fastify + TypeScript, run with tsx. Dev server on port 3001.
- Vite proxies `/api/*` to the backend in development.

## Commands

- `npm run dev` — start both client and server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Code Style

- TypeScript strict mode everywhere.
- Prettier for formatting (double quotes, semicolons, trailing commas).
- Named exports preferred over default exports.
- React components are function components with hooks.
- **Tailwind CSS v4** for styling via `@tailwindcss/vite` plugin. Custom theme colors (sage, cream, sand, forest, mint) defined in `client/src/index.css` using `@theme`. Prefer Tailwind utility classes over custom CSS.

## File Organization

- Client source in `client/src/`. Entry point: `main.tsx`.
- Server source in `server/src/`. Entry point: `index.ts`.
- API routes go under `/api/` prefix.

## Testing

- Run `npm run lint` and `npm run build` before committing.
- Test API endpoints manually or with integration tests (not yet set up).

## Git

- Never commit directly to main — use PR branches.
- Keep commits focused and atomic.
