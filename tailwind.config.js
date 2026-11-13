/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        optical: '#050505',
        phosphor: '#E2E8F0', // Crisp Aerospace HUD White / Silver
        project: '#F8FAFC',  // Clean High-Contrast Display White
        target: '#FF003C',   // Aerospace Target Red
        radar: '#FFB000',    // Telemetry Amber
        sensor: '#00E5FF'    // Luminous HUD Cyan
      },
      fontFamily: {
        sans: ['Share Tech Mono', 'monospace'],
        heading: ['Michroma', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
        origin: ['OriginTech', 'Michroma', 'sans-serif'],
        powershell: ['"Cascadia Code"', 'Consolas', '"Lucida Console"', '"Courier New"', 'monospace'],
      },
      cursor: {
        crosshair: 'crosshair',
      }
    },
  },
  plugins: [],
}

