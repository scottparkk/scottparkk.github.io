// postcss.config.cjs
// Use the standard tailwindcss + autoprefixer plugins so PostCSS will
// run Tailwind properly with the version installed in package.json.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};