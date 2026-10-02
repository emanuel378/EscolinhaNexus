/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        status: {
          verde: "#16a34a",
          amarelo: "#ca8a04",
          vermelho: "#dc2626",
        },
        nexus: {
          bg: "#050B14",
          primary: "#00B4FF",
          highlight: "#7ED8FF",
          gold: "#FFD200",
          surface: "#1A1F2B",
          // Superfície elevada (popovers, botões secundários) e fundo de inputs
          raised: "#232A3B",
          input: "#0B1220",
        },
      },
      boxShadow: {
        "nexus-glow": "0 0 24px 0 rgba(0, 180, 255, 0.35)",
        "nexus-gold": "0 0 20px 0 rgba(255, 210, 0, 0.30)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Rajdhani", "system-ui", "sans-serif"],
        // Títulos e números do painel do admin
        chivo: ["Chivo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
