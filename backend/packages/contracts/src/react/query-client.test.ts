import { describe, expect, it } from "vitest";
import { createQueryClient } from "./query-client.ts";

describe("createQueryClient", () => {
  it("creates isolated caches with conservative production defaults", () => {
    const first = createQueryClient();
    const second = createQueryClient();

    expect(first).not.toBe(second);
    expect(first.getDefaultOptions()).toMatchObject({
      mutations: { retry: 0 },
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
    });
  });
});
