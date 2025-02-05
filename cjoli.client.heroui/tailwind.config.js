import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        cjoli: {
          extend: "light", // <- inherit default values from dark theme
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              100: "#DBE1F5",
              200: "#BAC5EC",
              300: "#8794C6",
              400: "#56608E",
              500: "#202644",
              600: "#171C3A",
              700: "#101430",
              800: "#0A0D27",
              900: "#060820",
              DEFAULT: "#202644",
              foreground: "#FFFFFF",
            },
            secondary: {
              100: "#F9E1D5",
              200: "#F4BFAD",
              300: "#DE8D7D",
              400: "#BD5E56",
              500: "#922829",
              600: "#7D1D26",
              700: "#691423",
              800: "#540C20",
              900: "#46071E",
              DEFAULT: "#922829",
              foreground: "#FFFFFF",
            },
            danger: {
              100: "#FAE3CF",
              200: "#F5C1A0",
              300: "#E2916D",
              400: "#C56345",
              500: "#A02B16",
              600: "#891910",
              700: "#730B0B",
              800: "#5C070D",
              900: "#4C040F",
              DEFAULT: "#A02B16",
              foreground: "#FFFFFF",
            },
            focus: "#202644",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),
  ],
};
