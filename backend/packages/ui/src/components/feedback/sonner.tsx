"use client";

import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import { useAmoreTheme } from "../../theme/client.ts";

/** Sonner adapter that follows the resolved Amore theme without depending on next-themes. */
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useAmoreTheme();

  return (
    <Sonner
      {...props}
      className="toaster group"
      theme={resolvedTheme === "amore-dark" ? "dark" : "light"}
      toastOptions={{
        ...props.toastOptions,
        classNames: {
          toast: "group toast border-border bg-background text-foreground shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          ...props.toastOptions?.classNames,
        },
      }}
    />
  );
}

export { Toaster, toast };
