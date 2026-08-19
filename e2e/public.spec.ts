import { expect, test } from "@playwright/test";

test.describe("public website", () => {
  test("primary navigation reaches distinct public routes", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AL Maleek/i);
    const navigation = page.getByRole("navigation").first();
    await navigation
      .getByRole("link", { name: "Community", exact: true })
      .click();
    await expect(page).toHaveURL(/\/community$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await navigation.getByRole("link", { name: "Media", exact: true }).click();
    await expect(page).toHaveURL(/\/media$/);
  });

  test("academy waitlist stores a completed conversion", async ({ page }) => {
    await page.goto("/academy");
    const form = page
      .getByRole("heading", { name: "Join the waitlist" })
      .locator("..");
    await form.getByLabel("Name").fill("E2E Learner");
    await form.getByLabel("Email").fill("learner@example.test");
    await form.getByLabel("Focus area").click();
    await page.getByRole("option", { name: "Content strategy" }).click();
    await form.getByRole("button", { name: "Get access info" }).click();
    await expect(page.getByRole("status")).toContainText("Academy list");
  });

  test("partnership proposal completes with confirmation", async ({ page }) => {
    await page.goto("/partnerships");
    const form = page
      .getByRole("heading", { name: "Pitch your opportunity" })
      .locator("..");
    await form.getByLabel("Company").fill("E2E Brand");
    await form.getByLabel("Email").fill("brand@example.test");
    await form.getByLabel("Goal").fill("Build a creator-led Accra campaign.");
    await form.getByRole("button", { name: "Submit proposal" }).click();
    await expect(page.getByRole("status")).toContainText("partnerships desk");
  });
});
