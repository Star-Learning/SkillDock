import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "./skills/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18181b",
        paper: "#f7f7fa",
        moss: "#5755d9",
        mint: "#eeedff",
        apricot: "#f59e76",
        line: "#e4e4e7",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(24, 24, 27, 0.10)",
        card: "0 12px 35px rgba(24, 24, 27, 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
