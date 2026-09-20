import { createServer, request, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDevProxy, isApiPath } from "../scripts/dev-proxy.ts";

// Ephemeral ports keep these tests independent of a developer's running application stack.
const servers: Server[] = [];
async function listen(server: Server) {
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

let proxyUrl: string;
// Send a request through the proxy while overriding Host, as a browser would for subdomains.
function send(host: string, path = "/", body = "") {
  return new Promise<{ status: number | undefined; body: string; location: string | undefined }>(
    (resolve, reject) => {
      const req = request(
        new URL(path, proxyUrl),
        {
          method: body ? "POST" : "GET",
          headers: { host, "content-type": "text/plain" },
        },
        (response) => {
          let text = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            text += chunk;
          });
          response.on("end", () =>
            resolve({
              status: response.statusCode,
              body: text,
              location: response.headers.location,
            }),
          );
          response.on("error", reject);
        },
      );
      req.on("error", reject);
      req.end(body);
    },
  );
}

beforeAll(async () => {
  const targets = {} as Record<"store" | "admin" | "api", string>;
  for (const app of ["store", "admin", "api"] as const) {
    targets[app] = await listen(
      createServer(async (req, res) => {
        if (req.url === "/redirect") {
          res.writeHead(307, { location: "/destination" }).end();
          return;
        }
        let body = "";
        for await (const chunk of req) body += chunk;
        res.end(
          JSON.stringify({ app, path: req.url, method: req.method, host: req.headers.host, body }),
        );
      }),
    );
  }
  proxyUrl = await listen(createDevProxy(targets));
});

afterAll(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
          server.closeAllConnections();
        }),
    ),
  );
});

describe("development proxy HTTP forwarding", () => {
  it.each(["store.localhost:3000", "admin.localhost:3000", "localhost:3000"])(
    "forwards auth requests from %s to the Worker",
    async (host) => {
      const response = await send(host, "/auth/sign-in/email", "credentials");
      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        app: "api",
        path: "/auth/sign-in/email",
        method: "POST",
        body: "credentials",
      });
    },
  );
  it.each([
    ["store.localhost:3000", "store"],
    ["localhost:3000", "store"],
    ["admin.localhost:3000", "admin"],
  ])("routes %s", async (host, app) => {
    const response = await send(host as string, "/products?q=lipstick", "sample payload");
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      app,
      path: "/products?q=lipstick",
      method: "POST",
      host,
      body: "sample payload",
    });
  });

  it("preserves redirect status and location", async () => {
    const response = await send("admin.localhost:3000", "/redirect");
    expect(response.status).toBe(307);
    expect(response.location).toBe("/destination");
  });

  it("rejects unrelated hosts before forwarding", async () => {
    expect((await send("example.com")).status).toBe(421);
  });
});

describe("development proxy API path matching", () => {
  it.each(["/auth", "/auth/session", "/health?probe=readiness", "/trpc/account.me", "/v1/orders"])(
    "matches %s",
    (path) => {
      expect(isApiPath(path)).toBe(true);
    },
  );

  it.each(["/api/health", "/authorize", "/healthy", "/trpcology", "/v10/orders"])(
    "does not match %s",
    (path) => {
      expect(isApiPath(path)).toBe(false);
    },
  );
});
