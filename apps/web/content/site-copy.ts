export interface Faq {
  question: string;
  answer: string;
}

export type PolicySlug = "privacy" | "terms" | "shipping" | "refunds";

export interface Policy {
  title: string;
  description: string;
  updated: string;
  paragraphs: (string | { heading: string; items?: string[]; text?: string })[];
}

export const foundersNote = {
  title: "Two cosmetologists, one beautiful idea",
  quote: "We refuse to choose between care and colour.",
  paragraphs: [
    "Amore was born from a quiet yet powerful belief — that beauty should feel as good as it looks. In a world saturated with excess, we envisioned something more intimate, more intentional: products that become part of your everyday ritual, not just your routine.",
    "The idea began with a simple observation. Colour on the lips was often too harsh, too artificial, or too compromising on care. We wanted to create something that lived in between — where colour meets comfort, and elegance meets safety. Products that enhance rather than mask. Something you can wear all day, every day, without a second thought.",
    "Amore is more than a cosmetic brand. It is a reflection of modern femininity — effortless, confident and quietly powerful. Every detail, from formulation to aesthetic, is guided by a philosophy of understated luxury. We believe true beauty is not loud; it is felt.",
    "This is our beginning — thoughtful, refined and deeply personal. With Amore, we invite you to experience beauty that is not just seen, but lived.",
  ],
};

export const faqs: Faq[] = [
  {
    question: "How much does the Hydravelvet Lipstick cost?",
    answer: "Every shade is ₹349, inclusive of all taxes.",
  },
  {
    question: "How many shades are there?",
    answer:
      "12 shades, all in the same velvet finish: Barely Chestnut, Brick Brown, Caramel Mocha, Cinnamon Mauve, Crimson Charm, Dusty Truffle, Misty Rose, Mulberry Wine, Pink Berry, Red Ember, Soft Peach, Wine Stain.",
  },
  {
    question: "What's in the formula?",
    answer:
      "Blueberry Butter to nourish, Avocado Oil to help protect against dryness, and Vitamin E to soothe and hydrate.",
  },
  {
    question: "How do I apply it?",
    answer:
      "Apply evenly from the centre of the lips outward. For a more defined look, outline the lips first, then fill in. Reapply as desired.",
  },
  {
    question: "How soon will my order ship?",
    answer:
      "Orders are handed to the courier within 0–7 days of order and payment, or by the delivery date agreed when your order is confirmed.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Cancellation requests are considered within 15 days of placing the order, unless the order has already been sent for shipping.",
  },
  {
    question: "What if my lipstick arrives damaged?",
    answer:
      "Report it to customer service within 15 days of delivery. Recording an unboxing video when you open the package helps us resolve it quickly. Approved refunds take up to 15 days to process.",
  },
];

export const policies: Record<PolicySlug, Policy> = {
  privacy: {
    title: "Privacy Policy",
    description: "How Amore Cosmetics collects, uses and protects your information.",
    updated: "2025-07-22",
    paragraphs: [
      "This privacy policy sets out how AMORE COSMETICS uses and protects any information that you give AMORE COSMETICS when you visit the website and/or agree to purchase from us.",
      "AMORE COSMETICS is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.",
      "AMORE COSMETICS may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.",
      {
        heading: "What we collect",
        items: [
          "Name",
          "Contact information including email address",
          "Demographic information such as postcode, preferences and interests, if required",
          "Other information relevant to customer surveys and/or offers",
        ],
      },
      {
        heading: "What we do with the information we gather",
        text: "We require this information to understand your needs and provide you with a better service, and in particular for internal record keeping, improving products and services, and promotional communications.",
        items: [
          "Internal record keeping.",
          "We may use the information to improve our products and services.",
          "We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting.",
        ],
      },
      {
        heading: "How we use cookies",
        text: "A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file helps analyse web traffic or lets you know when you visit a particular site.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    description: "The terms that govern use of this website and purchases from Amore Cosmetics.",
    updated: "2025-07-22",
    paragraphs: [
      "For the purpose of these Terms and Conditions, the terms 'we', 'us' and 'our' used anywhere on this page mean AMORE COSMETICS. 'You', 'your', 'user' and 'visitor' mean any natural or legal person who is visiting our website and/or agreed to purchase from us.",
      "The content of the pages of this website is subject to change without notice.",
      "Your use of any information or materials on our website is entirely at your own risk, for which we shall not be liable.",
      "Any dispute arising out of use of our website and/or purchase with us is subject to the laws of India.",
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    description: "How and when Amore Cosmetics orders are shipped.",
    updated: "2025-07-22",
    paragraphs: [
      "For international and domestic buyers, orders are shipped through registered courier companies and/or Speed Post only.",
      "Orders are shipped within 0–7 days from the date of the order and payment, or as per the delivery date agreed at confirmation.",
      "Delivery of all orders will be to the address provided by the buyer.",
      "For any issues in utilising our services, contact our helpdesk at amorecosmetics.vs@gmail.com.",
    ],
  },
  refunds: {
    title: "Cancellation & Refunds",
    description: "When orders can be cancelled and how refunds are processed.",
    updated: "2025-07-22",
    paragraphs: [
      "Cancellations will be considered within 15 days of placing the order, unless shipping has already initiated.",
      "In case of receipt of damaged or defective items, please report within 15 days of delivery with an unboxing video.",
      "In case of any refunds approved by AMORE COSMETICS, it will take up to 15 days for the refund to be processed.",
    ],
  },
};

export async function getFoundersNote() {
  return foundersNote;
}

export async function getFaqs() {
  return faqs;
}

export async function getPolicy(slug: PolicySlug) {
  const policy = policies[slug];
  if (!policy) throw new Error(`Policy not found: ${slug}`);
  return policy;
}
