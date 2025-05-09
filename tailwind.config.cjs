/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            textAlign: 'left',
            h1: {
              textAlign: 'left',
            },
            h2: {
              textAlign: 'left',
            },
            h3: {
              textAlign: 'left',
            },
            h4: {
              textAlign: 'left',
            },
            p: {
              textAlign: 'left',
            },
            li: {
              textAlign: 'left',
            },
            blockquote: {
              textAlign: 'left',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbarWidth': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
        },
        '.scrollbar-thumb-slate-700': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#334155',
            borderRadius: '3px',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 