import { describe, expect, it } from "vitest";
import { publicSiteForHostname, storeOriginForHostname } from "./domain-routing.ts";

describe("public site domain routing", () => {
  it.each([
    ["store.localhost", "store"],
    ["store.amorecosmetics.in", "store"],
    ["localhost", "landing"],
    ["amorecosmetics.in", "landing"],
    ["preview.vercel.app", "landing"],
  ] as const)("maps %s to %s", (hostname, site) => {
    expect(publicSiteForHostname(hostname)).toBe(site);
  });

  it("uses the matching local or production store origin", () => {
    expect(storeOriginForHostname("localhost")).toBe("http://store.localhost:3000");
    expect(storeOriginForHostname("amorecosmetics.in")).toBe("https://store.amorecosmetics.in");
  });
});
