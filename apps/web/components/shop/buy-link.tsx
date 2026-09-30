import { CtaLink } from "@/components/page/cta-link";
import { siteConfig } from "@/config/site";
import type { Shade } from "@/content/hydravelvet";

type BuyLinkProps = { shade: Shade; className?: string };

/** Buys from the store when one is configured; otherwise opens an email. */
export function BuyLink({ shade, className }: BuyLinkProps) {
  if (siteConfig.storeUrl) {
    return (
      <CtaLink
        className={className}
        href={`${siteConfig.storeUrl}/${shade.slug}`}
      >
        Buy {shade.name}
      </CtaLink>
    );
  }

  const subject = encodeURIComponent(`Order: Hydravelvet ${shade.name}`);
  return (
    <CtaLink
      className={className}
      href={`${siteConfig.contact.emailHref}?subject=${subject}`}
    >
      Order {shade.name} by email
    </CtaLink>
  );
}
