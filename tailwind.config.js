module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}", // Ensures Tailwind scans all files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFDE6E",
        secondary: "#F5F3FF",
        font: "#000000",
        placeholder: "#9BA2AE",
        background: "#F9FAFB",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
