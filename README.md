# Brand Builder Dashboard

An agent-driven MERN-style monorepo. A GitHub Actions workflow runs the agent,
which scaffolds and iterates on the codebase via pull requests.

## Triggering the agent

### Manual (workflow_dispatch)
1. Go to **Actions → Brand Builder Agent → Run workflow**
2. Enter a command (e.g. `init`) and optional JSON args
3. Click **Run workflow**

### Via issue comment
Open any repository **issue** (not a PR) and post:

```
/agent init
```

Optional args:
```
/agent init {"appName":"My Dashboard","entity":"Campaign"}
```

The agent will open a pull request with the scaffolded changes. Review and
merge the PR to apply them.

## Supported commands

| Command | Description |
|---------|-------------|
| `init`  | Scaffold the full MERN monorepo (web, api, shared, spec) |

## Repository structure

```
.github/workflows/agent.yml  # Agent workflow
agent/                        # Agent Node.js project (runs in CI)
apps/
  web/                        # React + Vite + Tailwind dashboard
  api/                        # Node + Express API
    .env.example              # Environment variable template
packages/
  shared/                     # Shared types and validators
docs/
  spec.json                   # Source-of-truth app spec
```

## Running locally

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas cluster (or local MongoDB instance)

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Then edit `apps/api/.env` and fill in the required values:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string (e.g. Atlas URI) |
| `JWT_SECRET` | ✅ | Long random string used to sign JWT tokens |
| `CORS_ORIGIN` | ✅ | Origin of the web app (default: `http://localhost:5173`) |
| `COOKIE_SECURE` | ❌ | Set to `"true"` in production (HTTPS). Default: `false` |
| `PORT` | ❌ | Port the API listens on. Default: `4000` |

> **Never commit your `.env` file.** It is already in `.gitignore`.

### Start the API

```bash
npm run dev:api
# API runs on http://localhost:4000
# Health check: http://localhost:4000/api/health
```

### Start the web app

```bash
npm run dev:web
# App runs on http://localhost:5173
```

The web app proxies `/api` requests to `localhost:4000`, so start both
servers together for full functionality.

## Authentication

The app uses **JWT stored in an httpOnly cookie** for secure session management.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register a new user → sets session cookie |
| `POST` | `/api/auth/login` | Log in → sets session cookie |
| `POST` | `/api/auth/logout` | Log out → clears session cookie |
| `GET`  | `/api/me` | Returns current user (protected) |

### First login

1. Open `http://localhost:5173`
2. Click **Register** (or use the Register form) to create an account
3. On subsequent visits, use **Sign In**

## Secrets required

| Secret | Description |
|--------|-------------|
| `AGENT_GH_TOKEN` | Fine-grained PAT with Contents + Pull requests write access |

