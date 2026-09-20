import type { z } from "zod";
import type { clientEnv as adminClientEnv } from "./admin/client.ts";
import type { validateAdminEnv } from "./admin/validation.ts";
import type { appEnvSchema, nodeEnvSchema } from "./shared.ts";
import type { clientEnv as storeClientEnv } from "./store/client.ts";
import type { validateStoreEnv } from "./store/validation.ts";

// The root entry point exports types only; runtime environments require explicit client/server paths.
export type NodeEnv = z.infer<typeof nodeEnvSchema>;
export type AppEnv = z.infer<typeof appEnvSchema>;
export type StoreClientEnv = typeof storeClientEnv;
export type StoreServerEnv = ReturnType<typeof validateStoreEnv>;
export type AdminClientEnv = typeof adminClientEnv;
export type AdminServerEnv = ReturnType<typeof validateAdminEnv>;
