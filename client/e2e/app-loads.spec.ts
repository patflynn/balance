import { test, expect } from "@playwright/test";

const DEFAULT_METRIC_NAMES = [
  "Mood",
  "Stress",
  "Energy",
  "Anxiety",
  "Fatigue",
  "Tension",
  "Headache",
  "Brain Fog",
  "Sleepiness",
  "Water (Cups)",
  "Alcohol (Units)",
  "Caffeine (Cups)",
];

test.describe("App loads", () => {
  test("displays header and all default metrics", async ({ page }) => {
    await page.goto("/");

    // Wait for metrics to load (IndexedDB init)
    await expect(page.getByTestId("metric-m1")).toBeVisible();

    // Verify header
    await expect(page.getByTestId("app-header")).toHaveText("Balance");

    // Verify all 12 default metrics are visible
    for (const name of DEFAULT_METRIC_NAMES) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    await page.screenshot({ path: "test-results/app-loads.png", fullPage: true });
  });
});
