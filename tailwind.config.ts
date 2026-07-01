import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nebula: {
          50: "#f3e8ff",
          100: "#e9d5ff",
          200: "#d8b4fe",
          300: "#c084fc",
          400: "#a855f7",
          500: "#9333ea",
          600: "#7e22ce",
          700: "#6b21a8",
          800: "#581c87",
          900: "#3b0764"
        },
        cosmic: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        sun: "#fdb813",
        mars: "#c1440e",
        saturn: "#d4a373"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        twinkle: { "0%,100%": { opacity: "0.2" }, "50%": { opacity: "1" } },
        spinSlow: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        spinReverse: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(-360deg)" } },
        pulseGlow: { "0%,100%": { opacity: "0.4", transform: "scale(1)" }, "50%": { opacity: "1", transform: "scale(1.05)" } },
        driftX: { "0%": { transform: "translateX(-10%)" }, "100%": { transform: "translateX(10%)" } },
        scrollLeft: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
        spinSlow: "spinSlow 60s linear infinite",
        spinReverse: "spinReverse 80s linear infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        driftX: "driftX 20s ease-in-out infinite alternate",
        scrollLeft: "scrollLeft 30s linear infinite"
      },
      backgroundImage: {
        "stars": "radial-gradient(2px 2px at 20px 30px, white, transparent), radial-gradient(1px 1px at 60px 80px, white, transparent), radial-gradient(1.5px 1.5px at 130px 40px, white, transparent), radial-gradient(1px 1px at 200px 90px, white, transparent), radial-gradient(2px 2px at 250px 60px, white, transparent)",
        "nebula": "radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4), transparent 50%), radial-gradient(circle at 80% 60%, rgba(99,102,241,0.35), transparent 50%), radial-gradient(circle at 50% 80%, rgba(236,72,153,0.25), transparent 50%)"
      }
    }
  },
  plugins: []
};
export default config;
