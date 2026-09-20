// Next.js 16.2+ Turbopack supports TypeScript PostCSS configs.
// Keep tooling app-local so this workspace can deploy independently on Vercel.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
