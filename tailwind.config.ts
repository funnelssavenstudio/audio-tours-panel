import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          primary: {
            DEFAULT: "#05d9e8",
            foreground: "#000000",
          },
          secondary: {
            DEFAULT: "#6300ff",
            foreground: "#ffffff",
          },
          focus: "#05d9e8",
        },
      },
      light: {
        colors: {
          primary: {
            DEFAULT: "#6300ff",
            foreground: "#ffffff",
          },
          focus: "#6300ff",
        },
      },
    },
  })],
};
export default config;
