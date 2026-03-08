import { test, expect } from "@playwright/test";

test.describe("Sync settings UI", () => {
  test("settings panel opens and closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("metric-m1")).toBeVisible();

    // Settings panel should not be visible initially
    await expect(page.getByTestId("settings-panel")).not.toBeVisible();

    // Click gear icon to open settings
    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).toBeVisible();

    await page.screenshot({
      path: "test-results/settings-panel-open.png",
      fullPage: true,
    });

    // Close with X button
    await page.getByTestId("settings-close").click();
    await expect(page.getByTestId("settings-panel")).not.toBeVisible();
  });

  test("shows Connect Google Sheets button when not connected", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("metric-m1")).toBeVisible();

    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).toBeVisible();

    // Should show not connected status
    await expect(page.getByTestId("sync-status")).toHaveText("Not connected");

    // Should show connect button
    await expect(page.getByTestId("connect-google-button")).toBeVisible();
    await expect(page.getByTestId("connect-google-button")).toHaveText(
      "Connect Google Sheets",
    );

    // Should NOT show disconnect or sync now buttons
    await expect(page.getByTestId("disconnect-button")).not.toBeVisible();
    await expect(page.getByTestId("sync-now-button")).not.toBeVisible();

    await page.screenshot({
      path: "test-results/settings-not-connected.png",
      fullPage: true,
    });
  });

  test("settings panel toggles via gear icon", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("metric-m1")).toBeVisible();

    // Open
    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).toBeVisible();

    // Click gear again to close
    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).not.toBeVisible();
  });
});
