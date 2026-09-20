import type { Socket } from "node:net";
import { localDevelopment } from "./dev-config.ts";
import { createDevProxy } from "./dev-proxy.ts";

// Turbo owns app processes and their separate logs. This task only routes local traffic.
// App dev:local scripts override URLs in-process; no deployment env files are rewritten.
const server = createDevProxy({
  api: localDevelopment.services.api.url,
  store: `http://127.0.0.1:${localDevelopment.applications.store.port}`,
  admin: `http://127.0.0.1:${localDevelopment.applications.admin.port}`,
});
const sockets = new Set<Socket>();
let stopping = false;
server.on("connection", (socket) => {
  sockets.add(socket);
  socket.once("close", () => sockets.delete(socket));
});

function shutdown() {
  if (stopping) return;
  stopping = true;
  server.close(() => {
    clearTimeout(deadline);
    process.exitCode = 0;
  });
  // Allow active requests to finish, then close HTTP and upgraded HMR sockets explicitly.
  const deadline = setTimeout(() => {
    for (const socket of sockets) socket.destroy();
  }, 1000);
  deadline.unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
server.on("error", (error) => {
  console.error("Local proxy failed; check whether port 3000 is already in use.", error);
  process.exit(1);
});

server.listen(localDevelopment.proxyPort, "127.0.0.1", () => {
  console.log(`Landing:    ${localDevelopment.applications.store.landingUrl}`);
  console.log(`Storefront: ${localDevelopment.applications.store.url}`);
  console.log(`Admin:      ${localDevelopment.applications.admin.url}`);
  console.log(`API:        ${localDevelopment.services.api.url}`);
  console.log("App startup and request logs appear in their own Turbo tasks.");
});
