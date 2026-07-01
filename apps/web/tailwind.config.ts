import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2421',
        thread: '#b83b5e',
        leaf: '#2f6f5e',
        linen: '#f7f0e8'
      }
    }
  },
  plugins: []
};

export default config;
