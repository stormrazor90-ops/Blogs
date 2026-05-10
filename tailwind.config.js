module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50:  "#fdf8ee",
          100: "#f9edcc",
          200: "#f3d98a",
          300: "#ecc24d",
          400: "#e5ab28",
          500: "#D4A853",
          600: "#b8891e",
          700: "#956b18",
          800: "#7a5518",
          900: "#654619",
          950: "#3a270a",
        },
        editorial: {
          dark:  "#0C0C0A",
          card:  "#141410",
          mid:   "#1A1A16",
          red:   "#C0392B",
        },
      },
      backgroundImage: {
        "mesh-dark": "radial-gradient(ellipse at 20% 50%, rgba(229,29,29,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(249,115,22,0.1) 0%, transparent 50%)",
        "hero-gradient": "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      },
      keyframes: {
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(229,29,29,0.3)" },
          "50%":      { boxShadow: "0 0 40px rgba(229,29,29,0.6)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        slideIn:    "slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        fadeUp:     "fadeUp 0.5s ease-out both",
        fadeIn:     "fadeIn 0.4s ease-out both",
        scaleIn:    "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        marquee:    "marquee 30s linear infinite",
        shimmer:    "shimmer 2s linear infinite",
        float:      "float 3s ease-in-out infinite",
        glow:       "glow 2s ease-in-out infinite",
        ping:       "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      boxShadow: {
        "glow-red":    "0 0 30px rgba(229, 29, 29, 0.35)",
        "glow-indigo": "0 0 30px rgba(99, 102, 241, 0.35)",
        "card":        "0 4px 24px -4px rgba(0,0,0,0.08)",
        "card-hover":  "0 20px 48px -12px rgba(0,0,0,0.18)",
        "inner-glow":  "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
