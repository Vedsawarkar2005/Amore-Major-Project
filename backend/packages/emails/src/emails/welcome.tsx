import { storeSiteConfig } from "@amore/config/site";
import { Button, Heading, Text } from "react-email";
import { emailStyles } from "../styles.ts";
import { EmailShell } from "./_components/email-shell.tsx";

export type WelcomeEmailProps = {
  customerName: string;
  signInUrl: string;
};

/** Welcome message used after a customer creates an Amore Cosmetics account. */
export function WelcomeEmail({ customerName, signInUrl }: WelcomeEmailProps) {
  return (
    <EmailShell preview={`Welcome to ${storeSiteConfig.name}`}>
      <Heading style={emailStyles.heading}>Welcome, {customerName}</Heading>
      <Text style={emailStyles.text}>
        Your {storeSiteConfig.name} account is ready. Sign in to continue exploring your beauty
        essentials.
      </Text>
      <Button href={signInUrl} style={emailStyles.button}>
        Sign in to your account
      </Button>
    </EmailShell>
  );
}

WelcomeEmail.PreviewProps = {
  customerName: "Aarohi",
  signInUrl: `${storeSiteConfig.productionUrl}/sign-in`,
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
