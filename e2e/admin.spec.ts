import { expect, test } from "@playwright/test";

const admin = "http://127.0.0.1:3101";

test.describe("admin operations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${admin}/sign-in`);
    await page.getByLabel("Email").fill("ama@almaleek.com");
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
    await password.fill("e2e-demo-password");
    await page.getByRole("button", { name: /Sign in securely/ }).click();
    await expect(page).toHaveURL(`${admin}/`);
    await expect(page.getByText("Operations workspace")).toBeVisible();
  });

  test("admin API proxy rejects requests without a signed session", async ({
    request,
  }) => {
    const response = await request.get(`${admin}/api/admin/events`);
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Admin session required.",
    });
  });

  test("account and notification popovers dismiss on click-away", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Open account menu" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("main").click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole("menu")).toBeHidden();
    await page
      .getByRole("button", { name: /Notifications, 3 unread/i })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Notifications" }),
    ).toBeVisible();
    await page.getByRole("link", { name: /View activity centre/i }).click();
    await expect(page).toHaveURL(`${admin}/notifications`);
    await expect(
      page.getByRole("heading", { name: "Notifications", level: 1 }),
    ).toBeVisible();
  });

  test("sidebar collapse persists after reload", async ({ page }) => {
    const collapse = page.getByRole("button", {
      name: /Collapse sidebar|Expand sidebar/,
    });
    const initial = await collapse.getAttribute("aria-label");
    await collapse.click();
    await expect(collapse).toHaveAttribute(
      "aria-label",
      initial === "Collapse sidebar" ? "Expand sidebar" : "Collapse sidebar",
    );
    const changed = await collapse.getAttribute("aria-label");
    await page.reload();
    await expect(page.getByRole("button", { name: changed! })).toBeVisible();
  });

  test("creates an event and invites a user", async ({ page }) => {
    const unique = Date.now();
    const eventName = `E2E Circle Live ${unique}`;
    await page.goto(`${admin}/events`);
    await page.getByRole("button", { name: /Create event/ }).click();
    const eventDialog = page.getByRole("dialog", { name: "Create event" });
    await eventDialog.getByLabel("Event name").fill(eventName);
    await eventDialog.getByLabel("Date").fill("2030-09-18");
    await eventDialog.getByLabel("Start time").fill("18:30");
    await eventDialog.getByLabel("Venue").fill("National Theatre");
    await eventDialog.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Event saved to the live roster.",
    );
    await page.reload();
    await expect(
      page.getByRole("heading", { name: eventName, exact: true }),
    ).toBeVisible();

    await page.goto(`${admin}/users`);
    await page.getByRole("button", { name: "Invite user" }).click();
    const invite = page.getByRole("dialog", { name: "Invite user" });
    await invite.getByLabel("Full name").fill("E2E Operator");
    await invite.getByLabel("Email").fill("operator@example.test");
    await invite.getByLabel("Role").selectOption({ label: "Analyst" });
    await invite.getByRole("button", { name: "Send invitation" }).click();
    await expect(page.getByRole("status")).toContainText("Invitation sent");
    await expect(page.getByText("operator@example.test")).toBeVisible();
  });
});
