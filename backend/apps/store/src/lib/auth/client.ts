"use client";

import { createAmoreAuthClient } from "@amore/auth/client";
import { clientEnv } from "@/lib/env/client";

/** Client auth API; the server secret is never imported into this module. */
export const authClient = createAmoreAuthClient({ baseURL: clientEnv.NEXT_PUBLIC_API_URL });
