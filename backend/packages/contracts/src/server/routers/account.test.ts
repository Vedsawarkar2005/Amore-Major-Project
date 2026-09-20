import type { AmoreSession } from "@amore/auth/server";
import { createDatabase } from "@amore/database";
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "../root.ts";

const user = {
  id: "user-a",
  name: "Customer",
  email: "customer@example.com",
  emailVerified: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const session = {
  user,
  session: {
    id: "session-a",
    userId: user.id,
    token: "private-session-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
  },
} satisfies AmoreSession;

function setup(authenticated: boolean) {
  const db = createDatabase({ url: "postgresql://test:test@localhost/test" });
  const query = vi.spyOn(db.query.user, "findFirst").mockResolvedValue(user);
  const caller = appRouter.createCaller({
    db,
    request: new Request("https://api.amorecosmetics.in/trpc/account.profile"),
    getSession: async () => (authenticated ? session : null),
  });
  return { caller, query, db };
}

describe("account profile", () => {
  it("rejects unauthenticated requests before touching the database", async () => {
    const { caller, query } = setup(false);
    await expect(caller.account.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(query).not.toHaveBeenCalled();
  });

  it("scopes the database query to the verified user and selects only profile fields", async () => {
    const { caller, query } = setup(true);
    await caller.account.profile();
    const options = query.mock.calls[0]?.[0];
    expect(options?.columns).toEqual({
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
    });
    // Inspect generated SQL using the real Drizzle query builder, without making a network call.
    const db = createDatabase({ url: "postgresql://test:test@localhost/test" });
    const sql = db.query.user.findFirst(options).toSQL();
    expect(sql.params).toContain("user-a");
    expect(sql.sql).toContain('"user"."id" =');
  });

  it("returns NOT_FOUND when the authenticated user's profile was removed", async () => {
    const { caller, query } = setup(true);
    query.mockResolvedValue(undefined);
    await expect(caller.account.profile()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
