import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { Amore: "amore", "Amore Dark": "amore-dark" },
      defaultTheme: "Amore",
    }),
  ],
  parameters: {
    layout: "centered",
    // Fail Storybook test runs when a rendered story has an automated accessibility violation.
    a11y: { test: "error" },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
};

export default preview;
