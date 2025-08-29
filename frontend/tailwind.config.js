export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brandGold: '#D4AF37',
      },
      fontSize: {
        body: "clamp(1.2rem,3.8vw,1.35rem)",
        subheader: "clamp(1.8rem,5.8vw,3rem)",
        header: "clamp(2.2rem,7vw,4.2rem)",
        caption: "clamp(0.95rem,3.2vw,1.1rem",
      }
    },
  },
  plugins: [],
};
