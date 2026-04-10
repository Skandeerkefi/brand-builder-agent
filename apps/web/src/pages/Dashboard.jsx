import React from "react";

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
