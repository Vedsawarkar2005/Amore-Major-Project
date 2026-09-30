// Product facts sourced from the current amorecosmetics.in listings.
export const hydravelvet = {
  name: "Hydravelvet Lipstick",
  priceInr: 349,
  finish: "Velvet",
  description:
    "A veil of care, a touch of colour. Infused with nourishing Blueberry Butter, protective Avocado Oil and Vitamin E for a soft, velvety finish with effortless comfort.",
  ingredients: [
    {
      slug: "blueberry-butter",
      name: "Blueberry Butter",
      summary: "Nourishes and brings antioxidant care to every wear.",
      detail:
        "Blueberry's strong antioxidant properties support the lips' natural beauty and bring out a healthy-looking appearance over time.",
    },
    {
      slug: "avocado-oil",
      name: "Avocado Oil",
      summary: "Helps protect lips against dryness.",
      detail:
        "A protective oil that helps lips stay soft and comfortable while the colour is worn.",
    },
    {
      slug: "vitamin-e",
      name: "Vitamin E",
      summary: "Soothes and hydrates.",
      detail:
        "Helps soothe and hydrate, so the formula stays gentle and comfortable on the lips all day.",
    },
  ],
  /** Benefit labels shown around the 3D lipstick, in scroll order. */
  benefits: [
    {
      title: "Blueberry Butter",
      body: "Nourishing and rich in antioxidants for a healthy-looking lip.",
    },
    {
      title: "Avocado Oil",
      body: "Helps protect lips against dryness.",
    },
    {
      title: "Vitamin E",
      body: "Soothes and hydrates with every wear.",
    },
    {
      title: "Velvet finish",
      body: "A soft, velvety finish with effortless, all-day comfort.",
    },
  ],
  /**
   * The open lipstick, part by part from bullet to base, framed on the home
   * stage. Finishes are as seen in the product photography; replace with
   * the manufacturer's material names when confirmed.
   */
  materials: [
    {
      part: "Bullet",
      material: "Hydravelvet formula",
      detail: "Blueberry Butter, Avocado Oil and Vitamin E",
    },
    {
      part: "Sleeve",
      material: "Rose-gold metallic",
      detail: "Mirror-polished, cut on a slant",
    },
    {
      part: "Collar",
      material: "Gloss-black lacquer",
      detail: "Square, with softly rounded shoulders",
    },
    {
      part: "Base",
      material: "Lacquered plinth",
      detail: "Stepped, where the cap comes to rest",
    },
  ],
  /** Application steps — a real sequence, so the UI numbers them. */
  steps: [
    "Apply evenly from the centre of the lips outward.",
    "For a more defined look, outline the lips first, then fill in.",
    "Reapply as desired.",
  ],
} as const;

/**
 * `color` is the median bullet colour sampled from each shade's product
 * photograph on amorecosmetics.in. It's a close on-screen match, not a
 * calibrated value — replace with lab values if the brand has them.
 * `family` groups shades by their names, to help people browse.
 */
export const shades = [
  {
    slug: "barely-chestnut",
    name: "Barely Chestnut",
    color: "#72332e",
    family: "Nudes & browns",
  },
  {
    slug: "brick-brown",
    name: "Brick Brown",
    color: "#6c4138",
    family: "Nudes & browns",
  },
  {
    slug: "caramel-mocha",
    name: "Caramel Mocha",
    color: "#763021",
    family: "Nudes & browns",
  },
  {
    slug: "cinnamon-mauve",
    name: "Cinnamon Mauve",
    color: "#8d4e4a",
    family: "Roses & mauves",
  },
  {
    slug: "crimson-charm",
    name: "Crimson Charm",
    color: "#722427",
    family: "Reds",
  },
  {
    slug: "dusty-truffle",
    name: "Dusty Truffle",
    color: "#764c45",
    family: "Nudes & browns",
  },
  {
    slug: "misty-rose",
    name: "Misty Rose",
    color: "#8f4f44",
    family: "Roses & mauves",
  },
  {
    slug: "mulberry-wine",
    name: "Mulberry Wine",
    color: "#7b4b4b",
    family: "Berries & wines",
  },
  {
    slug: "pink-berry",
    name: "Pink Berry",
    color: "#8c4246",
    family: "Berries & wines",
  },
  { slug: "red-ember", name: "Red Ember", color: "#783d3c", family: "Reds" },
  {
    slug: "soft-peach",
    name: "Soft Peach",
    color: "#87483d",
    family: "Nudes & browns",
  },
  {
    slug: "wine-stain",
    name: "Wine Stain",
    color: "#672f31",
    family: "Berries & wines",
  },
] as const;

export type IngredientSlug = (typeof hydravelvet.ingredients)[number]["slug"];
export type Shade = (typeof shades)[number];
export type ShadeSlug = Shade["slug"];
export type ShadeFamily = Shade["family"];

/** Shades grouped by family, families in order of their first shade. */
export const shadeFamilies = shades.reduce<
  { name: ShadeFamily; shades: Shade[] }[]
>((families, shade) => {
  const family = families.find((entry) => entry.name === shade.family);
  if (family) family.shades.push(shade);
  else families.push({ name: shade.family, shades: [shade] });
  return families;
}, []);

const shadesBySlug = new Map<string, Shade>(
  shades.map((shade) => [shade.slug, shade]),
);

export function getShade(slug: string): Shade | undefined {
  return shadesBySlug.get(slug);
}

/** The shade's own page, e.g. `/hydravelvet/wine-stain`. */
export function shadePath(slug: ShadeSlug) {
  return `/hydravelvet/${slug}` as const;
}

/** The shade shown on the 3D lipstick before a visitor picks one. */
export const defaultShade: Shade = shades[4];

/** Previous and next shade, wrapping around, for shade-page navigation. */
export function getAdjacentShades(slug: string) {
  const index = shades.findIndex((shade) => shade.slug === slug);
  const at = (offset: number) =>
    shades[(index + offset + shades.length) % shades.length] as Shade;
  return { previous: at(-1), next: at(1) };
}
