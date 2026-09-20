import { createEnv } from "@t3-oss/env-core";
import { onValidationError } from "../shared.ts";
import { storeClientRuntimeEnv } from "./runtime-client.ts";
import { storeClientSchema } from "./schema.ts";

// Literal access lets Next.js inline public values and keeps private keys out of this module.
export const clientEnv = createEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: storeClientSchema,
  runtimeEnvStrict: storeClientRuntimeEnv,
  emptyStringAsUndefined: true,
  onValidationError,
});
