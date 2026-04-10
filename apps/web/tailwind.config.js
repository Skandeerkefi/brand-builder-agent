/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#22c55e",
        // Skalfos brand palette
        sk: {
          bg: "#0a0a0a",
          surface: "#111111",
          card: "#161616",
          border: "#1f2937",
          accent: "#e5e7eb",
          strong: "#ffffff",
          muted: "#6b7280",
          gold: "#fbbf24",
        },
      },
    },
  },
  plugins: [],
};
