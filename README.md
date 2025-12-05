# TOPCIT Review App

Full-stack, animated practice environment for TOPCIT/ITCS preparation. The frontend ships as a Vite + React dashboard, while an Express API backed by Prisma + SQLite manages authentication, categories, questions, progress, and practice test sessions seeded from `tests/test1.csv.txt`.

## Stack

- **Client** – React 18, TypeScript, Vite, Axios, Framer Motion, Chart.js, React Hook Form.
- **Server** – Express, Prisma, SQLite (swap to Postgres/MySQL later), Zod validation, JWT auth, bcrypt password hashing.
- **Shared niceties** – Theming via CSS custom properties, `/api` proxy in dev, seed script that colors categories and creates demo credentials.

## Getting Started

1. **Install dependencies**
	```bash
	cd client && npm install
	cd ../server && npm install
	```
2. **Configure environment**
	```bash
	cd server
	copy .env.example .env   # Windows PowerShell
	# tweak DATABASE_URL or JWT_SECRET if needed
	```
3. **Generate database + Prisma client**
	```bash
	npm run prisma:generate
	npm run prisma:migrate --name init
	npm run seed
	```
4. **Run dev servers**
	 - One command from the repo root spins up both API + client:
		 ```bash
		 npm run dev
		 ```
		 This uses `concurrently` to run the Express API (`:4000`) and Vite client (`:5173`).
	 - Prefer separate terminals? Use the workspace scripts:
		 ```bash
		 npm run dev:server   # runs from server/
		 npm run dev:client   # runs from client/
		 ```

Demo account after seeding: `demo@topcit.dev / password123`.

## Scripts reference

| Location | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start Vite dev server |
|  | `npm run build` | Production build output in `dist/` |
|  | `npm run lint` | ESLint across `src/` |
| `server` | `npm run dev` | Nodemon + ts-node watcher |
|  | `npm run build` | Compile to `dist/` |
|  | `npm run prisma:migrate` | Apply schema migrations |
|  | `npm run prisma:generate` | Rebuild Prisma Client |
|  | `npm run seed` | Populate DB from CSV + demo user |

## Extra notes

- The Vite dev server proxies `/api` → `http://localhost:4000`. Override by setting `VITE_API_URL` if needed.
- Dark/light preference, auth token, and user profile persist in `localStorage` so refresh keeps context.
- Practice tests use `/api/tests/session` which also upserts progress records for each category.
- Flashcards pull from `/api/categories/flashcards/all`; editing `tests/test1.csv.txt` + rerunning the seed script updates the content everywhere.
