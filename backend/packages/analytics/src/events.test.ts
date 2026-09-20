import { describe, expect, expectTypeOf, it } from "vitest";
import { defineAnalyticsEvent } from "./events.ts";

describe("analytics events", () => {
  it("preserves a serializable event payload", () => {
    const event = defineAnalyticsEvent("product_viewed", { productId: "sku-1", price: 499 });

    expect(event).toEqual({
      name: "product_viewed",
      properties: { productId: "sku-1", price: 499 },
    });
    expectTypeOf(event.name).toEqualTypeOf<"product_viewed">();
  });
});
