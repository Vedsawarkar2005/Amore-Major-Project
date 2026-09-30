import { SequenceProgress } from "@/components/motion/sequence-progress";

type StepsProps = { steps: readonly string[] };

/**
 * Numbered application steps; numbering reflects a real sequence. On scroll,
 * a rose-gold rule fills across the steps and each number lights up in turn.
 */
export function Steps({ steps }: StepsProps) {
  return (
    <SequenceProgress>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-0.5 bg-rose-gold"
          data-progress
        />
        <ol className="grid gap-px border-border border-y bg-border md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              className="flex flex-col gap-6 bg-background py-8 md:px-8"
              key={step}
            >
              <span
                aria-hidden="true"
                className="font-heading text-5xl text-rose-gold tabular-nums"
                data-step
              >
                {index + 1}
              </span>
              <p className="max-w-xs text-lg">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </SequenceProgress>
  );
}
