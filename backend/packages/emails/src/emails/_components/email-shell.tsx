import { brandConfig } from "@amore/config/brand";
import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Preview, Text } from "react-email";
import { emailStyles } from "../../styles.ts";

export type EmailShellProps = {
  children: ReactNode;
  preview: string;
};

/** Shared document structure keeps branding and compatibility defaults consistent. */
export function EmailShell({ children, preview }: EmailShellProps) {
  return (
    <Html dir="ltr" lang={brandConfig.language}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={emailStyles.body}>
        <Container style={emailStyles.container}>
          <Text style={emailStyles.brand}>{brandConfig.name}</Text>
          {children}
          <Hr style={emailStyles.divider} />
          <Text style={emailStyles.footer}>
            This message was sent by {brandConfig.legalName}. Please do not share account links with
            anyone.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
