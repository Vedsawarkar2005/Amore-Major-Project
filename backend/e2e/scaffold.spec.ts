import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// These smoke checks exercise both servers without credentials or third-party services.
test("serves the expected application", async ({ page }, testInfo) => {
  await page.goto("/");
  const heading = testInfo.project.name.startsWith("admin-")
    ? "Amore Cosmetics Admin"
    : testInfo.project.name.startsWith("store-")
      ? "Amore Cosmetics Store"
      : "Amore Cosmetics";
  await expect(page.getByRole("heading", { level: 1, name: heading, exact: true })).toBeVisible();
  await expect(page).toHaveTitle(heading);
});

test("landing navigation opens the local store", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("landing-"));
  await page.goto("/");
  await page.getByRole("link", { name: "Shop online" }).click();
  await expect(page).toHaveURL("http://store.localhost:3000/");
  await expect(
    page.getByRole("heading", { name: "Amore Cosmetics Store", exact: true }),
  ).toBeVisible();
});

test("landing cannot be switched by a forged routing header", async ({ request }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("landing-"));
  const response = await request.get("/", { headers: { "x-amore-routed-site": "store" } });
  expect(await response.text()).toContain("Discover Amore Cosmetics.");
});

test("store redirect preserves query parameters", async ({ request }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("landing-"));
  const response = await request.get("/store?campaign=launch", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("http://store.localhost:3000/?campaign=launch");
});

test("unknown pages provide a way back home", async ({ page }) => {
  const response = await page.goto("/not-a-real-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("home page has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");

  // Automated checks complement keyboard and assistive-technology testing; they do not replace it.
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(accessibility.violations).toEqual([]);
});
