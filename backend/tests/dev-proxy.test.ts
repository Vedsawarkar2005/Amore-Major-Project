import { describe, expect, it } from "vitest";
import { localDevelopment } from "../scripts/dev-config.ts";
import { applicationForHost } from "../scripts/dev-proxy.ts";

describe("local development host routing", () => {
  it("keeps local URLs centralized", () => {
    expect(localDevelopment.proxyPort).toBe(3000);
    expect(localDevelopment.applications.store.url).toBe("http://store.localhost:3000");
    expect(localDevelopment.applications.store.landingUrl).toBe("http://localhost:3000");
    expect(localDevelopment.applications.admin.url).toBe("http://admin.localhost:3000");
    expect(localDevelopment.services.api.url).toBe("http://127.0.0.1:8787");
  });
  // Production and unknown hosts must never silently fall through to the storefront.
  it.each([
    ["store.localhost:3000", "store"],
    ["STORE.LOCALHOST:3000", "store"],
    ["localhost:3000", "store"],
    ["127.0.0.1:3000", "store"],
    ["admin.localhost:3000", "admin"],
    ["ADMIN.LOCALHOST:3000", "admin"],
    ["example.com", undefined],
    ["admin.example.com", undefined],
    ["admin.localhost.evil.test:3000", undefined],
    ["store.localhost.evil.test:3000", undefined],
    [undefined, undefined],
  ])("routes %s to %s", (host, application) => {
    expect(applicationForHost(host)).toBe(application);
  });
});
