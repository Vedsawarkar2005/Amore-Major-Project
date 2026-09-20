import { createServer } from "node:net";
import { localPorts } from "./dev-config.ts";

// A finite Turbo dependency checks the whole local stack before persistent tasks start.
// Keep listeners reserved until every check completes; release them before Next/proxy bind.
// This is diagnostic, not a lock: a different process could still take a port afterwards.
const servers = localPorts.map((port) => ({ port, server: createServer() }));
try {
  await Promise.all(
    servers.map(
      ({ port, server }) =>
        new Promise<void>((resolve, reject) => {
          server.once("error", (error: NodeJS.ErrnoException) => {
            reject(
              new Error(
                `Cannot bind local port ${port} (${error.code}). Stop existing dev servers and retry.`,
              ),
            );
          });
          server.listen(port, "127.0.0.1", resolve);
        }),
    ),
  );
  console.log(`Local ports ${localPorts.join(", ")} are available.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Local port check failed.");
  process.exitCode = 1;
} finally {
  // close() also cancels pending listen calls, including when another check failed first.
  for (const { server } of servers) server.close();
}
