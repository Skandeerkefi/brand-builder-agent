import React, { useState, useEffect, useMemo } from "react";
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
    fetch(`/api/leaderboard?month=${encodeURIComponent(selectedMonth)}`)
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
                    className={`border-t border-sk-border hover:bg-sk-surface/50 transition ${
                      entry.rank <= 3 ? "bg-sk-gold/5" : ""
                    }`}
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
                          className={`font-medium ${
                            entry.rank <= 3 ? "text-sk-gold" : "text-sk-strong"
                          }`}
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
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.winRate >= 70
                            ? "bg-green-900/50 text-green-400"
                            : entry.winRate >= 50
                            ? "bg-yellow-900/50 text-yellow-400"
                            : "bg-red-900/50 text-red-400"
                        }`}
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
