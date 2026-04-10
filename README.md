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
packages/
  shared/                     # Shared types and validators
docs/
  spec.json                   # Source-of-truth app spec
```

## Running locally

### Prerequisites
- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

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

## Authentication (placeholder)

The dashboard uses a simple client-side auth placeholder. Sign in with any
email + password. Real authentication (JWT / sessions) is added by a future
agent command.

## Secrets required

| Secret | Description |
|--------|-------------|
| `AGENT_GH_TOKEN` | Fine-grained PAT with Contents + Pull requests write access |
