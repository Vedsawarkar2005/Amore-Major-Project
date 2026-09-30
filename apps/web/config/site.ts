const contact = {
  email: "info@amorecosmetics.in",
  phone: "+91 95589 07807",
} as const;

export const siteConfig = {
  name: "Amore Cosmetics",
  description:
    "Hydravelvet velvet-finish lipsticks with Blueberry Butter, Avocado Oil and Vitamin E, created by two cosmetologists. 12 shades.",
  url: "https://amorecosmetics.in",
  locale: "en_IN",
  /**
   * Where "Buy" links point, e.g. "https://shop.amorecosmetics.in/product".
   * Unset until the store moves off this domain; pages fall back to an email
   * enquiry instead of a dead link.
   */
  storeUrl: undefined as `https://${string}` | undefined,
  contact: {
    ...contact,
    emailHref: `mailto:${contact.email}`,
    phoneHref: `tel:${contact.phone.replaceAll(" ", "")}`,
  },
} as const;

type NavLink = { href: string; label: string };

export const mainNav = [
  { href: "/hydravelvet", label: "Hydravelvet" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/shade-finder", label: "Shade finder" },
  { href: "/try-on", label: "Virtual try-on" },
  { href: "/about", label: "About" },
] as const satisfies readonly NavLink[];

/** Whether `href` is the page at `pathname`, or a section it contains. */
export function isCurrentPage(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const footerNav = {
  explore: mainNav,
  help: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/shipping", label: "Shipping & delivery" },
    { href: "/refunds", label: "Cancellation & refunds" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms & conditions" },
  ],
} as const satisfies Record<string, readonly NavLink[]>;
