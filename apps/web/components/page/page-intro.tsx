import type { ReactNode } from "react";

type PageIntroProps = {
  title: ReactNode;
  children?: ReactNode;
};

/** Opening block for inner pages: a display headline and an optional lead. */
export function PageIntro({ title, children }: PageIntroProps) {
  return (
    <header className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:pt-32">
      <h1 className="max-w-5xl text-balance text-display">{title}</h1>
      {children ? (
        <div className="mt-8 max-w-2xl text-lead text-muted-foreground">
          {children}
        </div>
      ) : null}
    </header>
  );
}
