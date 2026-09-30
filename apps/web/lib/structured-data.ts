import { siteConfig } from "@/config/site";
import {
  hydravelvet,
  type Shade,
  shadePath,
  shades,
} from "@/content/hydravelvet";
import type { Faq } from "@/content/site-copy";

// schema.org documents for search engines; render them with <JsonLd />.

const context = "https://schema.org";
const brand = { "@type": "Brand", name: siteConfig.name };

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export const organizationSchema = {
  "@context": context,
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.phone,
};

function shadeProduct(shade: Shade) {
  const url = absoluteUrl(shadePath(shade.slug));
  return {
    "@type": "Product",
    name: `${hydravelvet.name} – ${shade.name}`,
    description: hydravelvet.description,
    brand,
    color: shade.name,
    url,
    offers: {
      "@type": "Offer",
      price: hydravelvet.priceInr,
      priceCurrency: "INR",
      url,
    },
  };
}

/** A single shade, for its own page. */
export function productSchema(shade: Shade) {
  return { "@context": context, ...shadeProduct(shade) };
}

/** The whole range, with each shade as a colour variant. */
export const productGroupSchema = {
  "@context": context,
  "@type": "ProductGroup",
  name: hydravelvet.name,
  description: hydravelvet.description,
  brand,
  url: absoluteUrl("/hydravelvet"),
  variesBy: "https://schema.org/color",
  hasVariant: shades.map(shadeProduct),
};

export const faqPageSchema = (faqs: readonly Faq[]) => ({
  "@context": context,
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});
