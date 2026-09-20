import type { CSSProperties } from "react";

/** Email-client-safe presentation tokens; avoid relying on application CSS or unsupported layout. */
export const emailStyles = {
  body: {
    backgroundColor: "#f6f3ef",
    color: "#2b2422",
    fontFamily: "Arial, Helvetica, sans-serif",
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e9e1db",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "40px 32px",
  },
  brand: {
    color: "#743d43",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "0 0 28px",
    textTransform: "uppercase",
  },
  heading: {
    color: "#2b2422",
    fontSize: "28px",
    fontWeight: 600,
    lineHeight: "36px",
    margin: "0 0 16px",
  },
  text: {
    color: "#5b504c",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 20px",
  },
  button: {
    backgroundColor: "#743d43",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "13px 22px",
    textDecoration: "none",
  },
  divider: {
    borderColor: "#e9e1db",
    margin: "32px 0 20px",
  },
  footer: {
    color: "#827570",
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  },
} satisfies Record<string, CSSProperties>;
