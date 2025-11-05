import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Figtree', sans-serif` },
        body: { value: `'Figtree', sans-serif` },
      },
      colors: {
        brand: {
          50: { value: "#ffe5e5" },
          100: { value: "#ffb3b3" },
          200: { value: "#ff8080" },
          300: { value: "#ff4d4d" },
          400: { value: "#ff1a1a" },
          500: { value: "#e60000" },
          600: { value: "#cc0000" },
          700: { value: "#990000" },
          800: { value: "#660000" },
          900: { value: "#330000" },
        },
      },
    },
    semanticTokens: {
      colors: {
        primary: { value: "{colors.brand.600}" },
        "primary.contrast": { value: "white" },
      },
    },
  },
});
