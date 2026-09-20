import { betterAuth } from "better-auth";

// CLI-only config used to generate the standard Better Auth Drizzle schema.
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
});
