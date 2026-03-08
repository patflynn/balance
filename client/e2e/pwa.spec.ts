import { test, expect } from "@playwright/test";

test.describe("PWA", () => {
  test("has manifest link and serves valid manifest", async ({ page }) => {
    await page.goto("/");

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();

    const href = await manifestLink.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);

    const manifest = await response.json();
    expect(manifest.name).toBe("Balance");
  });

  test("has theme-color meta tag", async ({ page }) => {
    await page.goto("/");

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toBeAttached();

    await page.screenshot({
      path: "test-results/pwa-meta.png",
      fullPage: true,
    });
  });
});
