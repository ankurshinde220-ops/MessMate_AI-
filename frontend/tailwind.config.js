/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F4EFE6',
          300: '#EBE3D5',
        },
        navy: {
          950: '#070E1A',
          900: '#0B192C',
          800: '#14253D',
          700: '#1E3553',
          600: '#2C496F',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(11, 25, 44, 0.05)',
        'soft-md': '0 6px 18px -2px rgba(11, 25, 44, 0.07)',
        'soft-xl': '0 16px 36px -4px rgba(11, 25, 44, 0.1)',
        'emerald-glow': '0 8px 24px -4px rgba(5, 150, 105, 0.25)',
      }
    },
  },
  plugins: [],
};
