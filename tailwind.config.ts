import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    screens: {
      h650: { raw: "(max-height: 650px)" },
      h780: { raw: "(min-height: 780px)" },
      h1050: { raw: "(min-height: 1050px)" },
      "max-sm": { raw: "(max-width: 495px)" },
      "max-md": { raw: "(max-width: 650px)" },
      "max-lg": { raw: "(min-width: 780px)" },
    },
  },
  plugins: [],
} satisfies Config;
