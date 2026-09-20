import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import { apiRoutes } from "@amore/config/service";
import { createProxyMiddleware } from "http-proxy-middleware";

/** The only application names understood by the local reverse proxy. */
export type LocalApplication = "store" | "admin";

// Keep this allowlist explicit: unknown hosts should receive a 421, never a fallback app.
const hostToApplication: Record<string, LocalApplication> = {
  "admin.localhost": "admin",
  "store.localhost": "store",
  localhost: "store",
  "127.0.0.1": "store",
};
const apiRoutePrefixes: readonly string[] = Object.values(apiRoutes);

/** Resolve only the hostnames intentionally supported by the local proxy. */
export function applicationForHost(host: string | undefined): LocalApplication | undefined {
  const hostname = host?.split(":")[0]?.toLowerCase();
  return hostname ? hostToApplication[hostname] : undefined;
}

/** Match only the API's configured path roots, never similarly prefixed application pages. */
export function isApiPath(url: string | undefined): boolean {
  const pathname = url?.split("?", 1)[0] ?? "";
  return apiRoutePrefixes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Create a streaming HTTP/WebSocket proxy without owning the app processes. */
export function createDevProxy(targets: Record<LocalApplication, string> & { api?: string }) {
  const apiProxy = targets.api
    ? createProxyMiddleware<IncomingMessage, ServerResponse>({
        target: targets.api,
        changeOrigin: true,
      })
    : undefined;
  const proxy = createProxyMiddleware<IncomingMessage, ServerResponse>({
    target: targets.store,
    router: (request) => targets[applicationForHost(request.headers.host) ?? "store"],
    // Keep the browser's Host/Origin aligned for Next.js server actions and cookies.
    changeOrigin: false,
    xfwd: true,
  });
  const server = createServer((request, response) => {
    if (!applicationForHost(request.headers.host)) {
      response.writeHead(421).end("Use localhost, store.localhost, or admin.localhost.");
      return;
    }
    // Keep browser auth cookies on the app host during local development.
    if (apiProxy && isApiPath(request.url)) {
      void apiProxy(request, response);
      return;
    }
    void proxy(request, response);
  });
  // Forward HMR WebSockets even when the upgrade precedes any ordinary HTTP request.
  server.on("upgrade", (request, socket, head) => {
    if (!applicationForHost(request.headers.host) || !(socket instanceof Socket)) {
      socket.destroy();
      return;
    }
    void proxy.upgrade(request, socket, head);
  });
  return server;
}
