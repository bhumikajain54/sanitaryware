/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                'dark-bg': {
                    primary: '#1e293b',   // Slate-800 - Main background
                    secondary: '#334155', // Slate-700 - Cards/sections
                    tertiary: '#475569',  // Slate-600 - Hover states
                },
                'dark-text': {
                    primary: '#f1f5f9',   // Slate-100 - Main text
                    secondary: '#cbd5e1', // Slate-300 - Secondary text
                    muted: '#94a3b8',     // Slate-400 - Muted text
                }
            }
        },
    },
    plugins: [],
}
