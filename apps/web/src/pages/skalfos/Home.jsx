import React from "react";
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
