import type { AnalyticsEvent, AnalyticsProperties } from "./types.ts";

/**
 * Define an event without losing literal names or property types.
 * Product-specific event catalogs can build on this helper as the applications grow.
 */
export function defineAnalyticsEvent<
  const Name extends string,
  const Properties extends AnalyticsProperties,
>(name: Name, properties?: Properties): AnalyticsEvent<Name, Properties> {
  return properties ? { name, properties } : { name };
}
