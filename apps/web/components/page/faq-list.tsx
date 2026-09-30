import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/primitives/accordion";
import { cn } from "@/lib/utils";

type Faq = { question: string; answer: string };

type FaqListProps = {
  faqs: readonly Faq[];
  className?: string;
};

/**
 * Questions as an accordion (shadcn, on Base UI): keyboard and
 * screen-reader ready, several can be open at once. Closed answers stay in
 * the page (`hiddenUntilFound`), so search engines and the browser's find
 * still reach them.
 */
export function FaqList({ faqs, className }: FaqListProps) {
  return (
    <Accordion className={cn("border-border border-t", className)} multiple>
      {faqs.map((faq) => (
        <AccordionItem
          className="border-border border-b"
          key={faq.question}
          value={faq.question}
        >
          <AccordionTrigger className="items-center py-6 font-heading font-normal text-xl tracking-tight hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-rose-gold md:text-2xl">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-2xl pb-8" hiddenUntilFound>
            <p className="text-lead text-muted-foreground">{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
