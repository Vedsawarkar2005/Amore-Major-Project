/** Shared local ports and browser-facing URLs for the development stack. */
export const localDevelopment = {
  proxyPort: 3000,
  applications: {
    store: {
      port: 3100,
      url: "http://store.localhost:3000",
      landingUrl: "http://localhost:3000",
    },
    admin: { port: 3101, url: "http://admin.localhost:3000" },
  },
  services: {
    // The Worker runs directly through Wrangler and does not need the browser host proxy.
    api: { port: 8787, url: "http://127.0.0.1:8787" },
  },
} as const;

/** Every port that must be free before Turbo starts persistent tasks. */
export const localPorts = [
  localDevelopment.proxyPort,
  ...Object.values(localDevelopment.applications).map((application) => application.port),
  ...Object.values(localDevelopment.services).map((service) => service.port),
] as const;
