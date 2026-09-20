"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "@/components/ui/sonner";

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WishlistProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </WishlistProvider>
  );
};
