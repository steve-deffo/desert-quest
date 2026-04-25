import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* UAE palette */
        gold:          "#C9A84C",
        "gold-light":  "#E8D08A",
        "uae-green":   "#00732F",
        "uae-red":     "#FF0000",
        correct:       "#4CAF50",
        wrong:         "#F44336",
        /* Day theme surfaces */
        parchment:     "#FDF6E3",
        sand:          "#E8D5A3",
        dune:          "#C4A96A",
        ink:           "#1A1208",
        "dune-brown":  "#8B6914",
        /* Sky */
        "sky-day":     "#87CEEB",
        "sky-night":   "#0A0F1E",
        /* Night theme surfaces */
        "night-bg":    "#0D1B2A",
        "night-card":  "#162032",
      },
      fontFamily: {
        amiri: ["Amiri", "serif"],
      },
    },
  },
};

export default config;
