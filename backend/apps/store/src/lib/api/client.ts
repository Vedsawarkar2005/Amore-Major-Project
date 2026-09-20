"use client";

import { createApiClient } from "@amore/contracts/client";
import { clientEnv } from "@/lib/env/client";

/** Imperative API calls; React queries can also use useTRPC from @amore/contracts/react. */
export const apiClient = createApiClient({ baseUrl: clientEnv.NEXT_PUBLIC_API_URL });
