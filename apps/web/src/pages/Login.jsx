import React, { useState } from "react";

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
