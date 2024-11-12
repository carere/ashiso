import type { Config } from "tailwindcss";
import UiPreset from "./ui.preset";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{tsx,css}"],
  theme: {
    extend: {
      colors: {
        brand: "#F35758",
      },
      keyframes: {
        pop: {
          "0%": {
            transform: "scale(var(0.98))",
          },
          "40%": {
            transform: "scale(1.02)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "button-pop": "pop 0.3s ease-out",
      },
    },
  },
  presets: [UiPreset],
} satisfies Config;
