import { gaMeasurementIdSchema, optionalValue, publicEnvSchema } from "../shared.ts";

// GA4 is a storefront concern; the admin schema never includes it.
export const storeClientSchema = {
  ...publicEnvSchema,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalValue(gaMeasurementIdSchema),
};
