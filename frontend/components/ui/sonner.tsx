"use client";

import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-none group-[.toaster]:text-xs group-[.toaster]:tracking-widest group-[.toaster]:uppercase group-[.toaster]:font-medium group-[.toaster]:p-4",
          description: "group-[.toast]:text-neutral-400 group-[.toast]:text-[10px] group-[.toast]:normal-case",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:rounded-none group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-300 group-[.toast]:rounded-none",
          success: "group-[.toaster]:border-white/40",
          error: "group-[.toaster]:border-red-600/50",
        },
      }}
      {...props}
    />
  );
};

export { toast } from "sonner";
