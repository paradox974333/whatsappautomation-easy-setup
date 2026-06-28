/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1d1d1f',
        graphite: '#707070',
        slate: '#474747',
        ash: '#333333',
        fog: '#f5f5f7',
        snow: '#ffffff',
        obsidian: '#000000',
        'silver-mist': '#e8e8ed',
        azure: '#0071e3',
        cobalt: '#0066cc',
        caution: '#b64400',
        wa: '#25d366',
      },
      borderRadius: {
        card: '28px',
      },
      fontFamily: {
        display: [
          'SF Pro Display',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        text: [
          'SF Pro Text',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
