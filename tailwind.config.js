/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grainient: {
          mint: "#BFEFE2",
          teal: "#3AC4AF",
          cyan: "#75C6F9",
          darkTeal: "#1A8A7A",
          deepTeal: "#0E564C",
          surface: "#F4FBF9",
        },
      },
      backgroundImage: {
        'grainient-main': 'linear-gradient(135deg, #BFEFE2 0%, #3AC4AF 50%, #75C6F9 100%)',
        'grainient-card': 'linear-gradient(145deg, rgba(191, 239, 226, 0.85) 0%, rgba(58, 196, 175, 0.75) 50%, rgba(117, 198, 249, 0.85) 100%)',
        'grainient-subtle': 'linear-gradient(180deg, #F0FAF7 0%, #E6F6F3 100%)',
        'grainient-button': 'linear-gradient(135deg, #3AC4AF 0%, #20A793 50%, #75C6F9 100%)',
        'grainient-hero': 'linear-gradient(125deg, #BFEFE2 0%, #3AC4AF 45%, #75C6F9 100%)',
      },
      boxShadow: {
        'grainient-glow': '0 8px 25px -4px rgba(58, 196, 175, 0.35)',
        'grainient-sm': '0 4px 14px 0 rgba(58, 196, 175, 0.2)',
        'cyan-glow': '0 8px 25px -4px rgba(117, 198, 249, 0.4)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
