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
      },
    },
  },
  plugins: [],
};
