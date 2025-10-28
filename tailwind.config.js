/** @type {import('tailwindcss').Config} */
export default {
  // Broaden content globs so all template literals/classes are picked up
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "font-primary": "var(--font-primary-color)",
        "font-secondary": "var(--font-secondary-color)",
        // Common border color token used by classes like `border-border`
        border: "var(--medium-color)",
        primary: "var(--primary-color)",
        "primary-rgb": "var(--primary-color-rgb)",
        "primary-contrast": "var(--primary-color-contrast)",
        "primary-bg": "var(--primary-background-color)",
        "primary-shade": "var(--primary-color-shade)",
        "primary-accent": "var(--primary-color-accent)",

        secondary: "var(--secondary-color)",
        "secondary-rgb": "var(--secondary-color-rgb)",
        "secondary-bg": "var(--secondary-background-color)",
        "secondary-contrast": "var(--secondary-color-contrast)",
        "secondary-accent": "var(--secondary-color-accent)",

        tertiary: "var(--tertiary-background-color)",

        success: "var(--success-color)",
        "success-contrast": "var(--success-contrast)",

        warning: "var(--warning-color)",
        "warning-contrast": "var(--warning-contrast)",

        danger: "var(--danger-color)",
        "danger-contrast": "var(--danger-contrast)",
        "danger-accent": "var(--danger-color-accent)",

        medium: "var(--medium-color)",
        "medium-contrast": "var(--medium-contrast)",

        disabled: "var(--disabled-color)",
      },
    },
  },
  // Ensure critical utilities are included even if a file gets missed during scanning
  safelist: ["justify-between", "aspect-square"],
  plugins: [],
};
