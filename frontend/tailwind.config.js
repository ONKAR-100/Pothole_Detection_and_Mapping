export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:           "#e74c3c",
        "severity-high":   "#dc3545",
        "severity-medium": "#fd7e14",
        "severity-low":    "#28a745",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
