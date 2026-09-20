import type { ReactElement } from "react";
import { render, toPlainText } from "react-email";

export type RenderedEmail = {
  html: string;
  text: string;
};

/** Render provider-neutral HTML and plain text together at the point an email is sent. */
export async function renderEmail(template: ReactElement): Promise<RenderedEmail> {
  const html = await render(template);
  return { html, text: toPlainText(html) };
}
