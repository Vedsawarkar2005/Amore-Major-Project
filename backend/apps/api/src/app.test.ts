import { describe, expect, it } from "vitest";
import { app } from "./app.ts";

const bindings = {
  APP_ENV: "development",
  API_URL: "http://127.0.0.1:8787",
  LANDING_URL: "http://localhost:3000",
  STORE_URL: "http://store.localhost:3000",
  ADMIN_URL: "http://admin.localhost:3000",
  DATABASE_URL: "postgresql://amore:amore@localhost:5432/amore",
  BETTER_AUTH_SECRET: "development-only-secret-change-before-production",
} satisfies CloudflareBindings;

describe("API worker", () => {
  it("serves a dependency-free health check", async () => {
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      service: "Amore Cosmetics API",
      status: "ok",
    });
  });

  it("returns a JSON response for unknown routes", async () => {
    const response = await app.request("/missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });

  it("does not expose the removed /api prefix", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(404);
  });

  it("serves the portable tRPC router through the Worker adapter", async () => {
    const response = await app.request(
      "/trpc/system.health",
      { headers: { Origin: bindings.STORE_URL } },
      bindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      result: { data: { service: "Amore Cosmetics API", status: "ok" } },
    });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(bindings.STORE_URL);
  });

  it("rejects protected tRPC procedures without a session", async () => {
    const response = await app.request("/trpc/account.me", undefined, bindings);

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("exposes the Better Auth handler with credentialed CORS", async () => {
    const response = await app.request(
      "/auth/ok",
      { headers: { Origin: bindings.STORE_URL } },
      bindings,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(bindings.STORE_URL);
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("allows configured applications without using backend services", async () => {
    const response = await app.request(
      "/v1/example",
      {
        method: "OPTIONS",
        headers: {
          Origin: bindings.STORE_URL,
          "Access-Control-Request-Method": "GET",
        },
      },
      bindings,
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(bindings.STORE_URL);
    expect(response.status).toBe(204);
  });

  it("allows the configured landing-page origin", async () => {
    const response = await app.request(
      "/v1/example",
      {
        method: "OPTIONS",
        headers: {
          Origin: bindings.LANDING_URL,
          "Access-Control-Request-Method": "GET",
        },
      },
      bindings,
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(bindings.LANDING_URL);
    expect(response.status).toBe(204);
  });

  it("does not grant CORS access to unknown origins", async () => {
    const response = await app.request(
      "/v1/example",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.invalid",
          "Access-Control-Request-Method": "GET",
        },
      },
      bindings,
    );

    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });
});
