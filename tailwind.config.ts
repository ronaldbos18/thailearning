import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        modernThai: ['"Noto Sans Thai Looped"', '"Noto Sans Thai"', "sans-serif"],
        traditionalThai: ['"Noto Serif Thai"', '"Noto Sans Thai Looped"', "serif"]
      },
      colors: {
        thai: {
          ink: "#172033",
          saffron: "#f59e0b",
          lotus: "#d946ef",
          sky: "#0ea5e9",
          leaf: "#16a34a"
        }
      }
    }
  },
  plugins: []
};

export default config;
