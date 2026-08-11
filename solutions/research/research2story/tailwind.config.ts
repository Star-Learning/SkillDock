import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#15251f", paper: "#f8f6f0", moss: "#315f4c", mint: "#dceade", line: "#deddd6" },
      boxShadow: { soft: "0 20px 60px rgba(21, 37, 31, 0.08)", card: "0 10px 30px rgba(21, 37, 31, 0.06)" },
    },
  },
  plugins: [],
} satisfies Config;
