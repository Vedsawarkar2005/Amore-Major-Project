/** Values supported by both PostHog event properties and GA4 event parameters. */
export type AnalyticsValue = string | number | boolean | null;

/** Keep event payloads serializable so adapters can safely forward the same event. */
export type AnalyticsProperties = Readonly<Record<string, AnalyticsValue>>;

/** Vendor-neutral event shape used by application code. */
export interface AnalyticsEvent<
  Name extends string = string,
  Properties extends AnalyticsProperties = AnalyticsProperties,
> {
  name: Name;
  properties?: Properties;
}
