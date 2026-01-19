/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ¡Esto es vital para que funcione el botón!
  theme: {
    extend: {
      colors: {
        // Conectamos Tailwind con tus variables de CSS (index.css)
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        'bg-main': 'var(--bg-main)',
        'bg-surface': 'var(--bg-surface)',
        'txt-main': 'var(--text-main)',
        'txt-muted': 'var(--text-muted)',
        border: 'var(--border-color)',
      }
    },
  },
  plugins: [],
}