import React from "react";
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
