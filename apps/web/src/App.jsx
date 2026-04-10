import React, { useState, useEffect } from "react";
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

