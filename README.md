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
| `generate-site` (alias `site`) | Generate the Skalfos public marketing site with view-only leaderboard |

### generate-site command

```
/agent generate-site {"name":"Skalfos","mode":"view-only","leaderboardPrize":1000,"region":"worldwide"}
```

**Args:**

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `name` | string | `"Skalfos"` | Site/brand name |
| `theme` | object | `{"primary":"black","accent":"light"}` | Brand theme |
| `leaderboardPrize` | number | `1000` | Monthly prize amount (USD) |
| `region` | string | `"worldwide"` | Target region |
| `mode` | string | `"view-only"` | Site mode (no wagering logic) |

## Repository structure

```
.github/workflows/agent.yml  # Agent workflow
agent/                        # Agent Node.js project (runs in CI)
  src/
    commands/
      init.js                 # init command
      generate-site.js        # generate-site command
apps/
  web/                        # React + Vite + Tailwind
    src/
      pages/
        skalfos/              # Public Skalfos site pages
          Home.jsx
          Leaderboard.jsx
          Rules.jsx
          About.jsx
      components/
        SkalfosHeader.jsx
        SkalfosFooter.jsx
  api/                        # Node + Express API
    src/
      routes/
        leaderboard.js        # GET /api/leaderboard, GET /api/leaderboard/months
      data/
        leaderboard.js        # Mock leaderboard data
    .env.example              # Environment variable template
packages/
  shared/                     # Shared types and validators
docs/
  spec.json                   # Source-of-truth app spec (includes Skalfos section)
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
# Leaderboard: http://localhost:4000/api/leaderboard?month=2026-04
# Months: http://localhost:4000/api/leaderboard/months
```

### Start the web app

```bash
npm run dev:web
# App runs on http://localhost:5173
```

The web app proxies `/api` requests to `localhost:4000`, so start both
servers together for full functionality.

### Skalfos public pages (no login required)

| URL | Page |
|-----|------|
| `http://localhost:5173/#/` | Home — hero, CTA, prize banner, stream schedule |
| `http://localhost:5173/#/leaderboard` | Leaderboard — top 100, month selector, search |
| `http://localhost:5173/#/rules` | Rules & Terms — disclaimers, age 18+, worldwide |
| `http://localhost:5173/#/about` | About — bio, stats, social links |

## Authentication

The dashboard (accessed when hash path is not a public page) uses **JWT stored in an httpOnly cookie** for secure session management.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register a new user → sets session cookie |
| `POST` | `/api/auth/login` | Log in → sets session cookie |
| `POST` | `/api/auth/logout` | Log out → clears session cookie |
| `GET`  | `/api/me` | Returns current user (protected) |
| `GET`  | `/api/leaderboard?month=YYYY-MM` | Leaderboard entries for a month (public) |
| `GET`  | `/api/leaderboard/months` | Available months (public) |

### First login

1. Open `http://localhost:5173/#/dashboard`
2. You'll be redirected to the login page
3. Click **Register** to create an account, then **Sign In**

## Secrets required

| Secret | Description |
|--------|-------------|
| `AGENT_GH_TOKEN` | Fine-grained PAT with Contents + Pull requests write access |

