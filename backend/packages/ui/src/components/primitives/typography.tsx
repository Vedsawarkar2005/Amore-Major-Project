import { cn } from "cn";
import type * as React from "react";

type TypographyProps<T extends React.ElementType> = {
  /** Override the rendered element when a heading needs different document semantics. */
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Shared shadcn-style type scale. Components use semantic theme tokens so both Amore themes
 * remain consistent and applications do not need to repeat heading utility classes.
 */
function Typography<T extends React.ElementType = "p">({
  as,
  className,
  children,
  ...props
}: TypographyProps<T>) {
  const Component = (as ?? "p") as React.ElementType;

  return (
    <Component className={cn("text-foreground", className)} {...props}>
      {children}
    </Component>
  );
}

function TypographyH1({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn("scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl", className)}
      {...props}
    />
  );
}

function TypographyH2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight", className)}
      {...props}
    />
  );
}

function TypographyH3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("scroll-m-20 font-semibold text-2xl tracking-tight", className)} {...props} />
  );
}

function TypographyH4({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4 className={cn("scroll-m-20 font-semibold text-xl tracking-tight", className)} {...props} />
  );
}

function TypographyP({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("not-first:mt-6 leading-7", className)} {...props} />;
}

function TypographyLead({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-xl", className)} {...props} />;
}

function TypographyLarge({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-semibold text-lg", className)} {...props} />;
}

function TypographySmall({ className, ...props }: React.ComponentProps<"small">) {
  return <small className={cn("font-medium text-sm leading-none", className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export {
  Typography,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
  TypographyLead,
  TypographyMuted,
  TypographyP,
  TypographySmall,
};
