"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { createApiClient } from "../client/transport.ts";
import type { AppRouter } from "../server/root.ts";
import { createQueryClient } from "./query-client.ts";

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

export type ApiProviderProps = {
  apiUrl: string;
  children: ReactNode;
};

/** Provide one stable tRPC transport and TanStack Query cache for the browser lifecycle. */
export function ApiProvider({ apiUrl, children }: ApiProviderProps) {
  const [queryClient] = useState(createQueryClient);
  const [trpcClient] = useState(() => createApiClient({ baseUrl: apiUrl }));

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
