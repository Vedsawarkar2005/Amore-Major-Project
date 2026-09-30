import { Badge } from "@/components/primitives/badge";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/primitives/item";

import { CtaLink } from "./cta-link";
import { PageIntro } from "./page-intro";

type ComingSoonPageProps = {
  title: string;
  description: string;
  points: readonly string[];
};

/** Shared layout for features that are announced but not yet live. */
export function ComingSoonPage({
  title,
  description,
  points,
}: ComingSoonPageProps) {
  return (
    <>
      <PageIntro title={title}>
        <p>{description}</p>
        <Badge className="mt-4" variant="secondary">
          Coming soon
        </Badge>
      </PageIntro>
      <ItemGroup className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3">
        {points.map((point, index) => (
          <Item
            className="items-start rounded-2xl p-8"
            key={point}
            // ItemGroup is a list; each item is one of its entries.
            role="listitem"
            variant="outline"
          >
            <ItemMedia className="font-heading text-3xl text-shade-ink">
              {index + 1}
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="font-normal text-lg">{point}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      <div className="mx-auto max-w-7xl px-4 py-24">
        <CtaLink href="/hydravelvet">Browse all shades meanwhile</CtaLink>
      </div>
    </>
  );
}
