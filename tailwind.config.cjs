/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,mdx}'],
  theme: {
    extend: {
      spacing: {
        '9/16': '56.25%',
      },
      fontFamily: {
        party: 'Grandstander, sans-serif',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
