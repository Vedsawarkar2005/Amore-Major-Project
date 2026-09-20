import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy.ts";

function route(path: string, host: string, headers: Record<string, string> = {}) {
  return proxy(new NextRequest(`http://127.0.0.1:3100${path}`, { headers: { host, ...headers } }));
}

describe("public hostname routing", () => {
  it("rewrites the shop on the original host and preserves search", () => {
    const response = route("/products/lip.gloss?q=red", "store.amorecosmetics.in");
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://store.amorecosmetics.in/store/products/lip.gloss?q=red",
    );
  });

  it("does not allow clients to select an internal site through a header", () => {
    const response = route("/", "amorecosmetics.in", { "x-amore-routed-site": "store" });
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("redirects the internal prefix to the shop while retaining query parameters", () => {
    const response = route("/store/products?q=red", "amorecosmetics.in");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://store.amorecosmetics.in/products?q=red");
  });

  it("does not resolve path contents into an external redirect host", () => {
    const response = route("/store//evil.example", "amorecosmetics.in");
    expect(new URL(response.headers.get("location") ?? "").hostname).toBe(
      "store.amorecosmetics.in",
    );
  });

  it("keeps the shop reachable in Vercel previews without leaving the deployment", () => {
    const response = route("/store/products", "amore-preview.vercel.app");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not recursively prefix an already rewritten shop request", () => {
    const response = route("/store/products", "store.localhost:3000");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
