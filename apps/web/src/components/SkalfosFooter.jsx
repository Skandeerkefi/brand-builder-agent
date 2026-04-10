import React from "react";

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
