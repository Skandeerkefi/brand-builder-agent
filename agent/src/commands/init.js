import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/** Run a shell command, streaming output to the console. */
function sh(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: "inherit", ...opts });
}

/** Write a file, creating parent directories as needed. */
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

/** Call the GitHub REST API. Returns parsed JSON. */
async function ghApi(method, endpoint, token, body) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `GitHub API ${method} ${endpoint} → ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

export async function runInit({ repo, defaultBranch, token, args }) {
  const appName = args.appName || "Brand Builder Dashboard";
  const entity = args.entity || "Project";

  // Work from the repo root (parent of agent/)
  const repoRoot = path.resolve(process.cwd(), "..");

  // ── Git identity ──────────────────────────────────────────────────────────
  sh(`git config user.name "brand-builder-agent"`);
  sh(`git config user.email "actions@users.noreply.github.com"`);

  // ── Create feature branch ─────────────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const branch = `agent/init-${timestamp}`;
  sh(`git checkout -B ${branch}`, { cwd: repoRoot });

  // ── Root workspace package.json ───────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "package.json"),
    JSON.stringify(
      {
        name: "brand-builder-agent-app",
        private: true,
        workspaces: ["apps/*", "packages/*"],
        scripts: {
          "dev:web": "npm run dev -w @app/web",
          "dev:api": "npm run dev -w @app/api",
          build: "npm run build -w @app/web",
        },
      },
      null,
      2
    ) + "\n"
  );

  // ── packages/shared ───────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "packages/shared/package.json"),
    JSON.stringify(
      { name: "@app/shared", private: true, version: "0.0.1", type: "module" },
      null,
      2
    ) + "\n"
  );
  writeFile(
    path.join(repoRoot, "packages/shared/src/index.js"),
    `/** @typedef {{ id: string; name: string; createdAt: string }} ${entity} */

export const APP_NAME = ${JSON.stringify(appName)};

/**
 * Validates that an object has the required ${entity} fields.
 * @param {unknown} obj
 * @returns {boolean}
 */
export function isValid${entity}(obj) {
  return (
    obj != null &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.createdAt === "string"
  );
}
`
  );

  // ── apps/api ──────────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/api/package.json"),
    JSON.stringify(
      {
        name: "@app/api",
        private: true,
        version: "0.0.1",
        type: "module",
        scripts: {
          dev: "node --watch src/server.js",
          start: "node src/server.js",
        },
        dependencies: {
          cors: "^2.8.5",
          express: "^4.21.1",
        },
      },
      null,
      2
    ) + "\n"
  );
  writeFile(
    path.join(repoRoot, "apps/api/src/server.js"),
    `import express from "express";
import cors from "cors";

const app = express();

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// TODO: auth + CRUD routes are added by subsequent agent commands.

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(\`API listening on http://localhost:\${port}\`);
});
`
  );

  // ── apps/web ──────────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/web/package.json"),
    JSON.stringify(
      {
        name: "@app/web",
        private: true,
        version: "0.0.1",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.4",
          autoprefixer: "^10.4.20",
          postcss: "^8.4.47",
          tailwindcss: "^3.4.14",
          vite: "^6.4.2",
        },
      },
      null,
      2
    ) + "\n"
  );
  writeFile(
    path.join(repoRoot, "apps/web/index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/vite.config.js"),
    `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:4000" },
  },
});
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/tailwind.config.js"),
    `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#22c55e",
      },
    },
  },
  plugins: [],
};
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/postcss.config.js"),
    `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/src/index.css"),
    `@tailwind base;
@tailwind components;
@tailwind utilities;
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/src/main.jsx"),
    `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/src/App.jsx"),
    `import React, { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  const [authed, setAuthed] = useState(false);
  return authed ? (
    <Dashboard onLogout={() => setAuthed(false)} />
  ) : (
    <Login onLogin={() => setAuthed(true)} />
  );
}
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/src/pages/Login.jsx"),
    `import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get("email") && fd.get("password")) {
      onLogin();
    } else {
      setError("Please enter your email and password.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white">Brand Builder</h1>
        <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
`
  );
  writeFile(
    path.join(repoRoot, "apps/web/src/pages/Dashboard.jsx"),
    `import React from "react";

const CARDS = ["Projects", "Campaigns", "Assets"];

export default function Dashboard({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-400">Brand Builder</span>
        <button
          onClick={onLogout}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Sign out
        </button>
      </nav>
      <main className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Welcome! Use{" "}
          <code className="bg-gray-800 px-1 rounded font-mono">/agent</code>{" "}
          commands to scaffold features into this project.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARDS.map((item) => (
            <div
              key={item}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition"
            >
              <h2 className="text-lg font-semibold mb-1">{item}</h2>
              <p className="text-gray-400 text-sm">
                Coming soon — scaffold with the agent.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
`
  );

  // ── docs/spec.json ─────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "docs/spec.json"),
    JSON.stringify(
      {
        appName,
        type: "dashboard",
        auth: true,
        entity,
        theme: {
          primary: "#4f46e5",
          secondary: "#22c55e",
          background: "#0b1020",
          text: "#e5e7eb",
        },
        routes: [
          { path: "/", redirect: "/dashboard" },
          { path: "/login", public: true, component: "Login" },
          { path: "/dashboard", protected: true, component: "Dashboard" },
        ],
      },
      null,
      2
    ) + "\n"
  );

  // ── .gitignore ─────────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, ".gitignore"),
    `node_modules/
dist/
.env
.env.local
`
  );

  // ── README ─────────────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "README.md"),
    `# ${appName}

An agent-driven MERN-style monorepo. A GitHub Actions workflow runs the agent,
which scaffolds and iterates on the codebase via pull requests.

## Triggering the agent

### Manual (workflow_dispatch)
1. Go to **Actions → Brand Builder Agent → Run workflow**
2. Enter a command (e.g. \`init\`) and optional JSON args
3. Click **Run workflow**

### Via issue comment
Open any repository **issue** (not a PR) and post:

\`\`\`
/agent init
\`\`\`

Optional args:
\`\`\`
/agent init {"appName":"My Dashboard","entity":"Campaign"}
\`\`\`

The agent will open a pull request with the scaffolded changes. Review and
merge the PR to apply them.

## Supported commands

| Command | Description |
|---------|-------------|
| \`init\`  | Scaffold the full MERN monorepo (web, api, shared, spec) |

## Repository structure

\`\`\`
.github/workflows/agent.yml  # Agent workflow
agent/                        # Agent Node.js project (runs in CI)
apps/
  web/                        # React + Vite + Tailwind dashboard
  api/                        # Node + Express API
packages/
  shared/                     # Shared types and validators
docs/
  spec.json                   # Source-of-truth app spec
\`\`\`

## Running locally

### Prerequisites
- Node.js 20+
- npm 10+

### Install dependencies

\`\`\`bash
npm install
\`\`\`

### Start the API

\`\`\`bash
npm run dev:api
# API runs on http://localhost:4000
# Health check: http://localhost:4000/api/health
\`\`\`

### Start the web app

\`\`\`bash
npm run dev:web
# App runs on http://localhost:5173
\`\`\`

The web app proxies \`/api\` requests to \`localhost:4000\`, so start both
servers together for full functionality.

## Authentication (placeholder)

The dashboard uses a simple client-side auth placeholder. Sign in with any
email + password. Real authentication (JWT / sessions) is added by a future
agent command.

## Secrets required

| Secret | Description |
|--------|-------------|
| \`AGENT_GH_TOKEN\` | Fine-grained PAT with Contents + Pull requests write access |
`
  );

  // ── Commit & push ─────────────────────────────────────────────────────────
  sh(`git add -A`, { cwd: repoRoot });

  // Check if there is anything new to commit
  const status = execSync(`git status --porcelain`, {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();

  if (!status) {
    console.log("[agent] Nothing changed — scaffold already up to date.");
    return;
  }

  sh(
    `git commit -m "chore: scaffold monorepo — web/api/shared + spec.json"`,
    { cwd: repoRoot }
  );

  const remoteUrl = `https://x-access-token:${token}@github.com/${repo}.git`;
  sh(`git remote set-url origin "${remoteUrl}"`, { cwd: repoRoot });
  sh(`git push -u origin ${branch}`, { cwd: repoRoot });

  // ── Open PR via GitHub API ─────────────────────────────────────────────────
  const pr = await ghApi("POST", `/repos/${repo}/pulls`, token, {
    title: "chore: scaffold MERN monorepo (web / api / shared)",
    body: `## Agent \`init\` scaffold

This PR was opened automatically by the \`brand-builder-agent\`.

### What's included
- \`apps/web\` — React + Vite + Tailwind dashboard with login & protected dashboard route
- \`apps/api\` — Express API with \`GET /api/health\` endpoint
- \`packages/shared\` — shared types and validators
- \`docs/spec.json\` — source-of-truth app spec
- Root \`package.json\` with npm workspaces

### Next steps
Merge this PR, then use \`/agent\` commands to add features (auth, CRUD, theming, …).
`,
    head: branch,
    base: defaultBranch,
  });

  console.log(`[agent] PR opened: ${pr.html_url}`);
}
