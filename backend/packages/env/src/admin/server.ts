import "server-only";

import { loadAdminEnv } from "./validation.ts";

// The server-only marker makes importing this module from a Client Component a build error.
// Never serialize serverEnv into props, logs, or next.config.ts's public env option.
export const serverEnv = loadAdminEnv();
