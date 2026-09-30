import { SwatchReveal } from "@/components/motion/swatch-reveal";
import { CtaLink } from "@/components/page/cta-link";
import { FaqList } from "@/components/page/faq-list";
import { siteConfig } from "@/config/site";
import { getFaqs } from "@/content/site-copy";

/**
 * The most-asked questions: a short note and the way to everything else on
 * the left, the questions themselves on the right under one large title.
 */
export async function FaqPreview() {
  const faqs = await getFaqs();

  return (
    <section
      aria-labelledby="faq-preview-title"
      className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-28 md:grid-cols-12 md:gap-8"
    >
      <div className="flex flex-col items-start gap-6 md:col-span-4 md:pt-4">
        <p className="max-w-xs text-lead text-muted-foreground">
          Quick answers to what people ask most. Anything else, write to{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href={siteConfig.contact.emailHref}
          >
            {siteConfig.contact.email}
          </a>
          .
        </p>
        <CtaLink href="/faq" variant="outline">
          All questions
        </CtaLink>
      </div>

      <div className="md:col-span-8">
        <SwatchReveal>
          <h2 className="text-display text-shade-ink" id="faq-preview-title">
            Good to know
          </h2>
        </SwatchReveal>
        <FaqList className="mt-12" faqs={faqs.slice(0, 5)} />
      </div>
    </section>
  );
}
