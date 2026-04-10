import React, { useState } from "react";

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
              className={`text-sm font-medium transition ${
                current === label.toLowerCase()
                  ? "text-sk-strong border-b-2 border-sk-gold pb-0.5"
                  : "text-sk-accent hover:text-sk-strong"
              }`}
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
