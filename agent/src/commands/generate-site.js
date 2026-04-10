import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/** Run a shell command, streaming output to the console. */
function sh(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
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
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GitHub API ${method} ${endpoint} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

export async function runGenerateSite({ repo, defaultBranch, token, args }) {
  const siteName = args.name || "Skalfos";
  const leaderboardPrize = args.leaderboardPrize ?? 1000;
  const region = args.region || "worldwide";
  const mode = args.mode || "view-only";
  const theme = args.theme || { primary: "black", accent: "light" };

  const repoRoot = path.resolve(process.cwd(), "..");

  sh(`git config user.name "brand-builder-agent"`);
  sh(`git config user.email "actions@users.noreply.github.com"`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const branch = `agent/generate-site-${timestamp}`;
  sh(`git checkout -B ${branch}`, { cwd: repoRoot });

  // ── docs/spec.json ────────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "docs/spec.json"),
    JSON.stringify(
      {
        appName: "Brand Builder Dashboard",
        type: "dashboard",
        auth: true,
        entity: "Project",
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
        skalfos: {
          name: siteName,
          mode,
          region,
          leaderboardPrize,
          theme,
          brand: {
            palette: {
              background: "#0a0a0a",
              surface: "#111111",
              accent: "#e5e7eb",
              accentStrong: "#ffffff",
              muted: "#6b7280",
              border: "#1f2937",
            },
          },
          pages: [
            { path: "/", component: "Home", public: true },
            { path: "/leaderboard", component: "Leaderboard", public: true },
            { path: "/rules", component: "Rules", public: true },
            { path: "/about", component: "About", public: true },
          ],
          leaderboard: {
            topN: 100,
            prize: leaderboardPrize,
            currency: "USD",
            period: "monthly",
            scoring: "points",
            disclaimer: "For entertainment only. No real wagering or payments.",
          },
          disclaimers: [
            "This leaderboard is for entertainment purposes only.",
            "No real wagering, payments, or prizes of monetary value are involved.",
            "Must be 18+ to participate.",
            "Worldwide availability may vary; check local laws and regulations.",
          ],
        },
      },
      null,
      2
    ) + "\n"
  );

  // ── API: leaderboard route ────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/api/src/data/leaderboard.js"),
    `// Mock leaderboard data – replace with a real data store as needed.
const NAMES = [
  "ShadowWolf","NeonRider","CryptoKing","BlazeFury","StormBreaker",
  "IronFist","PhantomAce","DarkMatter","LegendX","ViperStrike",
  "CobraElite","ThunderBolt","GhostKnight","SilverFox","MysticRune",
  "BloodMoon","ArcaneForce","QuantumLeap","NovaRush","CyberEdge",
  "FrostByte","LavaKing","RiftWalker","StarForge","ZeroGravity",
  "InfinityX","SoulReaper","MindBend","TurboX","DeltaForce",
  "AlphaOne","BetaTwo","GammaThree","DeltaFour","EpsilonFive",
  "ZetaSix","EtaSeven","ThetaEight","IotaNine","KappaTen",
  "LambdaEleven","MuTwelve","NuThirteen","XiFourteen","OmicronFifteen",
  "PiSixteen","RhoSeventeen","SigmaEighteen","TauNineteen","UpsilonTwenty",
  "PhiTwentyOne","ChiTwentyTwo","PsiTwentyThree","OmegaTwentyFour","AlphaTwo",
  "BetaThree","GammaFour","DeltaFive","EpsilonSix","ZetaSeven",
  "EtaEight","ThetaNine","IotaTen","KappaEleven","LambdaTwelve",
  "MuThirteen","NuFourteen","XiFifteen","OmicronSixteen","PiSeventeen",
  "RhoEighteen","SigmaNineteen","TauTwenty","UpsilonTwentyOne",
  "PhiTwentyTwo","ChiTwentyThree","PsiTwentyFour","OmegaTwentyFive",
  "AlphaThree","BetaFour","GammaFive","DeltaSix","EpsilonSeven",
  "ZetaEight","EtaNine","ThetaTen","IotaEleven","KappaTwelve",
  "LambdaThirteen","MuFourteen","NuFifteen","XiSixteen","OmicronSeventeen",
  "PiEighteen","RhoNineteen","SigmaTwenty","TauTwentyOne","UpsilonTwentyTwo",
  "PhiTwentyThree","ChiTwentyFour","PsiTwentyFive","OmegaTwentySix",
];

function generateEntries(month) {
  return NAMES.slice(0, 100).map((name, i) => ({
    rank: i + 1,
    username: name,
    points: Math.max(1, 10000 - i * 97 - ((month.charCodeAt(5) * 13 + i) % 50)),
    wins: Math.max(1, 120 - i * 1 - (i % 7)),
    winRate: parseFloat((Math.max(30, 95 - i * 0.6 - (i % 5))).toFixed(1)),
    avatar: \`https://api.dicebear.com/7.x/pixel-art/svg?seed=\${encodeURIComponent(name)}\`,
  }));
}

const AVAILABLE_MONTHS = [
  "2025-01","2025-02","2025-03","2025-04","2025-05","2025-06",
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03","2026-04",
];

export function getLeaderboard(month) {
  const m = AVAILABLE_MONTHS.includes(month) ? month : AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1];
  return generateEntries(m);
}

export function getAvailableMonths() {
  return AVAILABLE_MONTHS;
}
`
  );

  writeFile(
    path.join(repoRoot, "apps/api/src/routes/leaderboard.js"),
    `import { Router } from "express";
import { getLeaderboard, getAvailableMonths } from "../data/leaderboard.js";

const router = Router();

// GET /api/leaderboard?month=YYYY-MM
router.get("/", (req, res) => {
  const month = req.query.month || "";
  const entries = getLeaderboard(month);
  res.json({ month, entries });
});

// GET /api/leaderboard/months
router.get("/months", (_req, res) => {
  res.json({ months: getAvailableMonths() });
});

export default router;
`
  );

  // ── Patch apps/api/src/server.js ──────────────────────────────────────────
  const serverPath = path.join(repoRoot, "apps/api/src/server.js");
  let serverSrc = fs.readFileSync(serverPath, "utf8");
  if (!serverSrc.includes("leaderboard")) {
    serverSrc = serverSrc.replace(
      `import meRouter from "./routes/me.js";`,
      `import meRouter from "./routes/me.js";\nimport leaderboardRouter from "./routes/leaderboard.js";`
    );
    serverSrc = serverSrc.replace(
      `app.use("/api/me", meRouter);`,
      `app.use("/api/me", meRouter);\napp.use("/api/leaderboard", leaderboardRouter);`
    );
    fs.writeFileSync(serverPath, serverSrc, "utf8");
  }

  // ── Web: tailwind theme ───────────────────────────────────────────────────
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
        // Skalfos brand palette
        sk: {
          bg: "#0a0a0a",
          surface: "#111111",
          card: "#161616",
          border: "#1f2937",
          accent: "#e5e7eb",
          strong: "#ffffff",
          muted: "#6b7280",
          gold: "#fbbf24",
        },
      },
    },
  },
  plugins: [],
};
`
  );

  // ── Web: shared components ────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/web/src/components/SkalfosHeader.jsx"),
    `import React, { useState } from "react";

const NAV_LINKS = [
  { href: "#/", label: "Home" },
  { href: "#/leaderboard", label: "Leaderboard" },
  { href: "#/about", label: "About" },
  { href: "#/rules", label: "Rules" },
];

export default function SkalfosHeader({ current }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-sk-surface border-b border-sk-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#/" className="flex items-center gap-2 group">
          <span className="text-sk-gold font-extrabold text-2xl tracking-tight group-hover:opacity-80 transition">
            ⚡ SKALFOS
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={\`text-sm font-medium transition \${
                current === label.toLowerCase()
                  ? "text-sk-strong border-b-2 border-sk-gold pb-0.5"
                  : "text-sk-accent hover:text-sk-strong"
              }\`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-sk-accent"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="sm:hidden bg-sk-surface border-t border-sk-border px-4 pb-4 flex flex-col gap-3 pt-2">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sk-accent hover:text-sk-strong text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
`
  );

  writeFile(
    path.join(repoRoot, "apps/web/src/components/SkalfosFooter.jsx"),
    `import React from "react";

export default function SkalfosFooter() {
  return (
    <footer className="bg-sk-surface border-t border-sk-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sk-gold font-bold text-lg">⚡ SKALFOS</span>
        <p className="text-sk-muted text-xs text-center sm:text-right max-w-sm">
          For entertainment purposes only. No real wagering or monetary prizes
          involved. Must be 18+. Worldwide availability may vary.
        </p>
        <div className="flex gap-4 text-sk-muted text-sm">
          <a href="#/rules" className="hover:text-sk-accent transition">Rules</a>
          <a href="#/about" className="hover:text-sk-accent transition">About</a>
        </div>
      </div>
      <div className="text-center text-sk-muted text-xs pb-4">
        © {new Date().getFullYear()} Skalfos. All rights reserved.
      </div>
    </footer>
  );
}
`
  );

  // ── Web: public pages ─────────────────────────────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/web/src/pages/skalfos/Home.jsx"),
    `import React from "react";
import SkalfosHeader from "../../components/SkalfosHeader.jsx";
import SkalfosFooter from "../../components/SkalfosFooter.jsx";

const SCHEDULE = [
  { day: "Monday", time: "8 PM EST", game: "Slots & Strategy" },
  { day: "Wednesday", time: "9 PM EST", game: "Live Table Games" },
  { day: "Friday", time: "7 PM EST", game: "High-Stakes Friday" },
  { day: "Saturday", time: "6 PM EST", game: "Community Night" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-sk-bg text-sk-accent flex flex-col">
      <SkalfosHeader current="home" />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sk-gold/5 via-transparent to-transparent pointer-events-none" />
        <span className="text-sk-gold text-5xl mb-4 select-none">⚡</span>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-sk-strong mb-4 tracking-tight">
          SKALFOS
        </h1>
        <p className="text-sk-muted text-lg sm:text-xl max-w-xl mb-8">
          Your home for entertainment gaming streams, epic moments, and
          community competition.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="#/leaderboard"
            className="bg-sk-gold text-sk-bg font-bold px-8 py-3 rounded-full hover:brightness-110 transition text-sm sm:text-base"
          >
            View Leaderboard
          </a>
          <a
            href="#/about"
            className="border border-sk-border text-sk-accent font-semibold px-8 py-3 rounded-full hover:border-sk-gold hover:text-sk-gold transition text-sm sm:text-base"
          >
            About Skalfos
          </a>
        </div>
      </section>

      {/* Prize Banner */}
      <section className="bg-sk-gold text-sk-bg py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-2xl font-extrabold">🏆 $1,000 Monthly Leaderboard Prize</p>
            <p className="text-sm font-medium opacity-80 mt-0.5">
              Top-ranked community member wins bragging rights each month.
              Entertainment only — see{" "}
              <a href="#/rules" className="underline">Rules</a> for details.
            </p>
          </div>
          <a
            href="#/leaderboard"
            className="bg-sk-bg text-sk-gold font-bold px-6 py-2 rounded-full hover:bg-sk-surface transition shrink-0"
          >
            See Rankings →
          </a>
        </div>
      </section>

      {/* Stream Schedule */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h2 className="text-2xl font-bold text-sk-strong mb-6">
          📅 Stream Schedule
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCHEDULE.map(({ day, time, game }) => (
            <div
              key={day}
              className="bg-sk-card border border-sk-border rounded-xl p-5 hover:border-sk-gold transition"
            >
              <p className="text-sk-gold font-bold text-sm mb-1">{day}</p>
              <p className="text-sk-strong font-semibold">{time}</p>
              <p className="text-sk-muted text-sm mt-1">{game}</p>
            </div>
          ))}
        </div>
        <p className="text-sk-muted text-xs mt-4">
          Schedule subject to change. Follow on socials for live updates.
        </p>
      </section>

      <SkalfosFooter />
    </div>
  );
}
`
  );

  writeFile(
    path.join(repoRoot, "apps/web/src/pages/skalfos/Leaderboard.jsx"),
    `import React, { useState, useEffect, useMemo } from "react";
import SkalfosHeader from "../../components/SkalfosHeader.jsx";
import SkalfosFooter from "../../components/SkalfosFooter.jsx";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Leaderboard() {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available months on mount
  useEffect(() => {
    fetch("/api/leaderboard/months")
      .then((r) => r.json())
      .then(({ months }) => {
        setMonths(months || []);
        if (months?.length) setSelectedMonth(months[months.length - 1]);
      })
      .catch(() => setError("Could not load leaderboard data."));
  }, []);

  // Reload entries when month changes
  useEffect(() => {
    if (!selectedMonth) return;
    setLoading(true);
    setError(null);
    fetch(\`/api/leaderboard?month=\${encodeURIComponent(selectedMonth)}\`)
      .then((r) => r.json())
      .then(({ entries }) => setEntries(entries || []))
      .catch(() => setError("Could not load leaderboard entries."))
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.username.toLowerCase().includes(q));
  }, [entries, search]);

  return (
    <div className="min-h-screen bg-sk-bg text-sk-accent flex flex-col">
      <SkalfosHeader current="leaderboard" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-sk-strong">
              🏆 Monthly Leaderboard
            </h1>
            <p className="text-sk-muted text-sm mt-1">
              Top 100 community members · $1,000 monthly prize ·{" "}
              <a href="#/rules" className="text-sk-gold hover:underline">
                Entertainment only
              </a>
            </p>
          </div>

          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-sk-card border border-sk-border text-sk-accent rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sk-gold"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 bg-sk-card border border-sk-border text-sk-accent rounded-lg px-4 py-2 text-sm mb-6 focus:outline-none focus:border-sk-gold placeholder:text-sk-muted"
        />

        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-sk-muted animate-pulse">Loading…</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-sk-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sk-surface text-sk-muted text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 text-left w-16">Rank</th>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">Wins</th>
                  <th className="py-3 px-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={\`border-t border-sk-border hover:bg-sk-surface/50 transition \${
                      entry.rank <= 3 ? "bg-sk-gold/5" : ""
                    }\`}
                  >
                    <td className="py-3 px-4 font-bold text-sk-muted">
                      {MEDAL[entry.rank] || (
                        <span className="text-sk-muted">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={entry.avatar}
                          alt=""
                          className="w-7 h-7 rounded-full bg-sk-surface"
                          loading="lazy"
                        />
                        <span
                          className={\`font-medium \${
                            entry.rank <= 3 ? "text-sk-gold" : "text-sk-strong"
                          }\`}
                        >
                          {entry.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-sk-strong">
                      {entry.points.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sk-accent">
                      {entry.wins}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                          entry.winRate >= 70
                            ? "bg-green-900/50 text-green-400"
                            : entry.winRate >= 50
                            ? "bg-yellow-900/50 text-yellow-400"
                            : "bg-red-900/50 text-red-400"
                        }\`}
                      >
                        {entry.winRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sk-muted">
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sk-muted text-xs mt-6 text-center">
          Leaderboard is for entertainment only. No real wagering or monetary
          value is involved. Must be 18+ to participate.
        </p>
      </main>

      <SkalfosFooter />
    </div>
  );
}
`
  );

  writeFile(
    path.join(repoRoot, "apps/web/src/pages/skalfos/Rules.jsx"),
    `import React from "react";
import SkalfosHeader from "../../components/SkalfosHeader.jsx";
import SkalfosFooter from "../../components/SkalfosFooter.jsx";

const SECTIONS = [
  {
    title: "1. Entertainment Only",
    body: "The Skalfos leaderboard and all associated activities are for entertainment purposes only. No real money, cryptocurrency, or items of monetary value are wagered, staked, or won at any time. Participation does not constitute gambling under any jurisdiction.",
  },
  {
    title: "2. No Real Wagering or Payments",
    body: "This platform does not process any financial transactions. The '$1,000 monthly prize' referenced on site is a simulated, community recognition award and does not represent a real monetary payout unless explicitly stated otherwise in a separate, verifiable official announcement.",
  },
  {
    title: "3. Age Requirement",
    body: "You must be 18 years of age or older to participate in leaderboard competitions or engage with community features on this platform.",
  },
  {
    title: "4. Worldwide Availability",
    body: "While this site is accessible worldwide, local laws and regulations regarding online entertainment, streaming, and simulated gaming activities may vary. It is your responsibility to ensure that accessing this content is lawful in your jurisdiction.",
  },
  {
    title: "5. Leaderboard Rules",
    body: "Rankings are based on community points accumulated through viewing streams, participating in community events, and other engagement activities. Points have no real-world monetary value. The leaderboard resets on the first day of each calendar month.",
  },
  {
    title: "6. Fair Play",
    body: "Any attempt to manipulate, cheat, or exploit leaderboard systems will result in immediate disqualification and a permanent ban from community features. Skalfos reserves the right to modify or reset any scores at its discretion.",
  },
  {
    title: "7. Changes to Rules",
    body: "These rules may be updated at any time. Continued participation constitutes acceptance of the latest version of these rules.",
  },
  {
    title: "8. Contact",
    body: "For questions about these rules or to report an issue, reach out via the community Discord or social media channels listed on the About page.",
  },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-sk-bg text-sk-accent flex flex-col">
      <SkalfosHeader current="rules" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        <h1 className="text-3xl font-extrabold text-sk-strong mb-2">
          Rules &amp; Terms
        </h1>
        <p className="text-sk-muted text-sm mb-10">
          Last updated: April 2026 · Please read carefully before participating.
        </p>

        {/* Disclaimer banner */}
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 mb-10 flex gap-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="text-yellow-400 font-semibold text-sm mb-1">
              Entertainment Only — No Real Wagering
            </p>
            <p className="text-yellow-300/70 text-xs leading-relaxed">
              This platform contains no real gambling, wagering, or financial
              transactions. All leaderboard activity is simulated and for
              community entertainment. Must be 18+ to participate.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-sk-strong font-bold text-lg mb-2">{title}</h2>
              <p className="text-sk-muted leading-relaxed text-sm">{body}</p>
            </section>
          ))}
        </div>
      </main>

      <SkalfosFooter />
    </div>
  );
}
`
  );

  writeFile(
    path.join(repoRoot, "apps/web/src/pages/skalfos/About.jsx"),
    `import React from "react";
import SkalfosHeader from "../../components/SkalfosHeader.jsx";
import SkalfosFooter from "../../components/SkalfosFooter.jsx";

const SOCIALS = [
  { label: "Twitch", href: "https://twitch.tv/skalfos", icon: "🎮" },
  { label: "YouTube", href: "https://youtube.com/@skalfos", icon: "▶️" },
  { label: "Twitter / X", href: "https://x.com/skalfos", icon: "🐦" },
  { label: "Discord", href: "https://discord.gg/skalfos", icon: "💬" },
  { label: "Instagram", href: "https://instagram.com/skalfos", icon: "📸" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-sk-bg text-sk-accent flex flex-col">
      <SkalfosHeader current="about" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        {/* Hero bio */}
        <div className="flex flex-col sm:flex-row gap-8 items-start mb-12">
          <div className="w-32 h-32 rounded-full bg-sk-surface border-4 border-sk-gold flex items-center justify-center text-5xl shrink-0">
            ⚡
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-sk-strong mb-2">
              Skalfos
            </h1>
            <p className="text-sk-gold text-sm font-semibold mb-4">
              Streamer · Content Creator · Community Builder
            </p>
            <p className="text-sk-muted leading-relaxed text-sm max-w-xl">
              Skalfos is a live-streaming content creator focused on bringing
              entertainment, excitement, and community to every stream. Known for
              high-energy gameplay, viewer interaction, and monthly leaderboard
              competitions that keep the community engaged and coming back for
              more.
            </p>
            <p className="text-sk-muted leading-relaxed text-sm max-w-xl mt-3">
              With a global audience and a passion for creating memorable
              moments, Skalfos streams regularly across multiple platforms.
              Join the community and climb the leaderboard every month!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Monthly Viewers", value: "50K+" },
            { label: "Community Members", value: "12K+" },
            { label: "Streams / Month", value: "16+" },
            { label: "Monthly Prize Pool", value: "$1,000" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-sk-card border border-sk-border rounded-xl p-4 text-center"
            >
              <p className="text-sk-gold font-extrabold text-2xl">{value}</p>
              <p className="text-sk-muted text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Socials */}
        <h2 className="text-xl font-bold text-sk-strong mb-4">
          🔗 Follow &amp; Connect
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOCIALS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-sk-card border border-sk-border rounded-xl px-4 py-3 hover:border-sk-gold hover:bg-sk-gold/5 transition group"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sk-accent group-hover:text-sk-gold font-medium transition">
                {label}
              </span>
              <span className="ml-auto text-sk-muted text-xs group-hover:text-sk-gold transition">
                →
              </span>
            </a>
          ))}
        </div>

        <p className="text-sk-muted text-xs mt-10 text-center">
          Social links are placeholders. Replace with actual profile URLs.
        </p>
      </main>

      <SkalfosFooter />
    </div>
  );
}
`
  );

  // ── Web: App.jsx (hash-based client routing) ──────────────────────────────
  writeFile(
    path.join(repoRoot, "apps/web/src/App.jsx"),
    `import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/skalfos/Home.jsx";
import Leaderboard from "./pages/skalfos/Leaderboard.jsx";
import Rules from "./pages/skalfos/Rules.jsx";
import About from "./pages/skalfos/About.jsx";

/** Minimal hash-based router. Returns the current hash path. */
function useHashRouter() {
  const getPath = () => window.location.hash.replace(/^#/, "") || "/";
  const [path, setPath] = useState(getPath);
  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return path;
}

// Public Skalfos site paths
const PUBLIC_PATHS = ["/", "/leaderboard", "/rules", "/about"];

export default function App() {
  const path = useHashRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Public Skalfos pages — no auth needed
  if (PUBLIC_PATHS.includes(path)) {
    if (path === "/leaderboard") return <Leaderboard />;
    if (path === "/rules") return <Rules />;
    if (path === "/about") return <About />;
    return <Home />;
  }

  // Auth-gated dashboard
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={() => setUser(null)} />
  ) : (
    <Login onLogin={(u) => setUser(u)} />
  );
}
`
  );

  // ── Commit + push + PR ────────────────────────────────────────────────────
  sh(`git add -A`, { cwd: repoRoot });
  sh(
    `git commit -m "feat: add Skalfos public marketing site with view-only leaderboard"`,
    { cwd: repoRoot }
  );

  const [owner, repoName] = repo.split("/");
  const remoteUrl = `https://x-access-token:${token}@github.com/${repo}.git`;
  sh(`git push "${remoteUrl}" HEAD:refs/heads/${branch}`, { cwd: repoRoot });

  const pr = await ghApi("POST", `/repos/${owner}/${repoName}/pulls`, token, {
    title: `feat: Skalfos public marketing site + view-only leaderboard`,
    head: branch,
    base: defaultBranch,
    body: `## Skalfos Public Marketing Site

Generated by \`/agent generate-site\` command.

### What's included

**Agent**
- New \`generate-site\` (alias \`site\`) command in the agent runner
- Command supports args: \`name\`, \`theme\`, \`leaderboardPrize\`, \`region\`, \`mode\`

**API** (\`apps/api\`)
- \`GET /api/leaderboard?month=YYYY-MM\` — returns top-100 leaderboard entries
- \`GET /api/leaderboard/months\` — returns available months
- In-memory mock data (no DB required)

**Web** (\`apps/web\`)
- Public pages (no auth required):
  - \`/\` — Home (hero, CTA, $1K prize banner, stream schedule)
  - \`/leaderboard\` — Top 100 table with month selector, search, win-rate badges
  - \`/rules\` — Rules & Terms (entertainment only, no real wagering, 18+, worldwide)
  - \`/about\` — Bio, stats, socials placeholders
- Consistent header/nav/footer across all pages
- Black/light Skalfos theme (Tailwind \`sk-*\` colors)
- Hash-based client-side routing (no extra router dependency)

**Docs**
- \`docs/spec.json\` updated with Skalfos site spec
- \`README.md\` updated with new run instructions and agent command docs

### Trigger with

\`\`\`
/agent generate-site {"name":"Skalfos","mode":"view-only","leaderboardPrize":1000,"region":"worldwide"}
\`\`\`
`,
  });

  console.log(`[agent] PR opened: ${pr.html_url}`);
}

