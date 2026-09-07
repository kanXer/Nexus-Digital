import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          "blue-light": "#3B82F6",
          "blue-dark": "#1D4ED8",
          "blue-glow": "rgba(37, 99, 235, 0.3)",
        },
        dark: {
          900: "#000000",
          800: "#0A0A0A",
          700: "#111111",
          600: "#1A1A1A",
          500: "#222222",
          400: "#333333",
          300: "#444444",
        },
        glass: {
          white: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(59,130,246,0.05) 100%)",
        "gradient-dark": "linear-gradient(180deg, #000000 0%, #0A0A0A 100%)",
        "gradient-hero": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.25) 0%, transparent 70%)",
        "gradient-glow": "radial-gradient(circle at center, rgba(37,99,235,0.4) 0%, transparent 70%)",
        "gradient-text": "linear-gradient(135deg, #ffffff 0%, #93C5FD 50%, #2563EB 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "spin-slow": "spin 8s linear infinite",
        "counter-up": "counter-up 2s ease-out forwards",
        "border-glow": "border-glow 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(37,99,235,0.3)" },
          "50%": { borderColor: "rgba(37,99,235,0.8)" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(37, 99, 235, 0.2)",
        "glow": "0 0 30px rgba(37, 99, 235, 0.3)",
        "glow-lg": "0 0 60px rgba(37, 99, 235, 0.4)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.6)",
        "card-hover": "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(37, 99, 235, 0.2)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
