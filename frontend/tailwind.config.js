/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New color palette
        papaya: {
          DEFAULT: '#FDEBD0', // Papaya Whip - base/background (corrected from FDEBDO)
          50: '#FDEBD0',
          100: '#FDEBD0',
          200: '#FDEBD0',
          300: '#FDEBD0',
          400: '#FDEBD0',
          500: '#FDEBD0',
          600: '#FDEBD0',
          700: '#FDEBD0',
          800: '#FDEBD0',
          900: '#FDEBD0',
        },
        cyan: {
          DEFAULT: '#309898', // Dark Cyan - buttons
          50: '#e6f7f7',
          100: '#b3e6e6',
          200: '#80d5d5',
          300: '#4dc4c4',
          400: '#309898', // Main dark cyan
          500: '#267878',
          600: '#1d5c5c',
          700: '#134040',
          800: '#0a2424',
          900: '#000808',
        },
        amber: {
          DEFAULT: '#FF9F00', // Amber Glow - welcome section
          50: '#fff5e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb84d',
          400: '#FF9F00', // Main amber glow
          500: '#cc7f00',
          600: '#995f00',
          700: '#663f00',
          800: '#331f00',
          900: '#1a0f00',
        },
        brick: {
          DEFAULT: '#C94444', // Blushed Brick - navigation, logout
          50: '#f9e6e6',
          100: '#f0b3b3',
          200: '#e78080',
          300: '#de4d4d',
          400: '#C94444', // Main blushed brick
          500: '#a13636',
          600: '#792929',
          700: '#511b1b',
          800: '#290e0e',
          900: '#140707',
        },
        // Keep primary for backward compatibility, map to dark cyan
        primary: {
          50: '#e6f7f7',
          100: '#b3e6e6',
          200: '#80d5d5',
          300: '#4dc4c4',
          400: '#309898',
          500: '#267878',
          600: '#1d5c5c',
          700: '#134040',
          800: '#0a2424',
          900: '#000808',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
