import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email");
    const password = fd.get("password");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        onLogin(data.user);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-4 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white">Brand Builder</h1>
        <p className="text-gray-400 text-sm">
          {mode === "login" ? "Sign in to access your dashboard" : "Create a new account"}
        </p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
        <p className="text-center text-gray-400 text-sm">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className="text-indigo-400 hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-indigo-400 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

