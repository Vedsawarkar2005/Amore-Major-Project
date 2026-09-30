import { Metadata } from "next";
import { Checkout } from "@/components/shop/Checkout";

export const metadata: Metadata = {
  title: "Checkout · Amore Cosmetics",
  description: "Complete your luxury lip care order with complimentary express shipping.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Checkout />
    </main>
  );
}
