/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        neonBlue: '#00f3ff',
        neonGreen: '#39ff14',
        neonPurple: '#b967ff',
        darkBg: '#0a0a1a',
        darkCard: '#12122a'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        robotoMono: ['Roboto Mono', 'monospace']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00f3ff, 0 0 20px #00f3ff' },
          'to': { boxShadow: '0 0 10px #fff, 0 0 15px #00f3ff, 0 0 20px #00f3ff, 0 0 25px #00f3ff, 0 0 30px #00f3ff' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: [],
}