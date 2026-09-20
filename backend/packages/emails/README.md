# `@amore/emails`

Shared transactional email templates for Amore Cosmetics. The package owns presentation and
rendering only; delivery providers, credentials, retries, and queues belong to the calling service.

Start the local React Email preview at `http://localhost:3002`:

```sh
bun run email:dev
```

Applications can import a template and render both transport formats at send time:

```tsx
import { renderEmail, WelcomeEmail } from "@amore/emails";

const content = await renderEmail(
  <WelcomeEmail customerName="Aarohi" signInUrl="https://store.amorecosmetics.in/sign-in" />,
);
```

Use `content.html` and `content.text` with the selected email provider. URLs passed to templates
must be absolute because recipients open them outside the application.
