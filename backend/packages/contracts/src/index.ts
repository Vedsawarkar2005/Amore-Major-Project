// The root is intentionally type-only so browser consumers cannot pull server runtime code in by accident.
export type { TRPCContext } from "./server/context.ts";
export type { AppRouter } from "./server/root.ts";
