import React from "react";
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
