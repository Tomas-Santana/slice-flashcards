/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/App/style.css", "./src/**/Components/**/*.{js,ts,html}"],
  theme: {
    extend: {
      colors: {
        "font-primary": "var(--font-primary-color)",
        "font-secondary": "var(--font-secondary-color)",
        primary: "var(--primary-color)",
        "primary-rgb": "var(--primary-color-rgb)",
        "primary-contrast": "var(--primary-color-contrast)",
        "primary-bg": "var(--primary-background-color)",
        "primary-shade": "var(--primary-color-shade)",

        secondary: "var(--secondary-color)",
        "secondary-rgb": "var(--secondary-color-rgb)",
        "secondary-bg": "var(--secondary-background-color)",
        "secondary-contrast": "var(--secondary-color-contrast)",

        tertiary: "var(--tertiary-background-color)",

        success: "var(--success-color)",
        "success-contrast": "var(--success-contrast)",

        warning: "var(--warning-color)",
        "warning-contrast": "var(--warning-contrast)",

        danger: "var(--danger-color)",
        "danger-contrast": "var(--danger-contrast)",

        medium: "var(--medium-color)",
        "medium-contrast": "var(--medium-contrast)",

        disabled: "var(--disabled-color)",
      },
    },
  },
  plugins: [],
};
