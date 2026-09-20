import { describe, expect, it } from "vitest";
import { WelcomeEmail } from "./emails/welcome.tsx";
import { renderEmail } from "./render.ts";

describe("email rendering", () => {
  it("renders matching HTML and plain-text welcome messages", async () => {
    const output = await renderEmail(
      <WelcomeEmail customerName="Aarohi" signInUrl="https://store.amorecosmetics.in/sign-in" />,
    );
    // React may place empty hydration comments between adjacent static and dynamic text nodes.
    const normalizedHtml = output.html.replaceAll("<!-- -->", "");

    expect(normalizedHtml).toContain("Welcome, Aarohi");
    expect(normalizedHtml).toContain("https://store.amorecosmetics.in/sign-in");
    expect(output.text).toMatch(/welcome, aarohi/i);
    expect(output.text).toContain("Sign in to your account");
  });
});
