import { basename } from "node:path";

// Node preloads this module before the normal Next CLI, without another child-process wrapper.
// Workspace scripts run from their app directory. These overrides never touch env files.
const app = basename(process.cwd());
if (app !== "store" && app !== "admin") {
  throw new Error("Run local development through the store or admin workspace script.");
}
const application = {
  store: { label: "Storefront", url: "http://store.localhost:3000" },
  admin: { label: "Admin", url: "http://admin.localhost:3000" },
}[app];
const url = application.url;
Object.assign(process.env, {
  NODE_ENV: "development",
  NEXT_PUBLIC_APP_ENV: "development",
  NEXT_PUBLIC_APP_URL: url,
  NEXT_PUBLIC_API_URL: url,
  BETTER_AUTH_URL: "http://127.0.0.1:8787",
});

// Forked Next workers inherit the preload; print the banner only in the original CLI.
if (process.argv[1]?.endsWith("/next/dist/bin/next")) {
  console.log(`\n${application.label} → ${url}`);
  console.log("Use this URL; Next.js shows the internal proxy target below.\n");
}
