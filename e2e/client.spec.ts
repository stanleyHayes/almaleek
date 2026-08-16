import { expect, test } from "@playwright/test";

const client = "http://127.0.0.1:3102";

test.describe("Circle client", () => {
  test("sign-in enters onboarding and completes the guided setup", async ({
    page,
  }) => {
    await page.goto(`${client}/sign-in`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel("Email address").fill("adjoa@example.test");
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
    await password.fill("strong-password");
    await page.getByRole("button", { name: /^Sign in/ }).click();
    await expect(page).toHaveURL(`${client}/onboarding`);
    await expect(
      page.getByRole("heading", { name: "Welcome, Adjoa Nartey." }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Brand partner/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Enter my Circle/ }).click();
    await expect(page).toHaveURL(`${client}/`);
    await expect(page.getByText("Brand partner access")).toBeVisible();
  });

  const authenticate = async (page: import("@playwright/test").Page) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("alm.client.auth"))
        localStorage.setItem("alm.client.auth", "true");
      if (!localStorage.getItem("alm.client.onboarded"))
        localStorage.setItem("alm.client.onboarded", "true");
      if (!localStorage.getItem("alm.client.role"))
        localStorage.setItem("alm.client.role", "Creator");
      if (!localStorage.getItem("alm.client.verifiedRoles"))
        localStorage.setItem(
          "alm.client.verifiedRoles",
          JSON.stringify(["Creator", "Academy member"]),
        );
    });
  };

  test("account menu dismisses, profile/preferences save, and logo is visible", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto(client);
    const logo = page.locator(".portal-brand img");
    await expect(logo).toBeVisible();
    expect(
      await logo.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 20 && box.height > 20;
      }),
    ).toBeTruthy();
    await page.getByRole("button", { name: "Open account menu" }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    const menuRows = await menu.getByRole("menuitem").all();
    for (const row of menuRows) {
      const rowBox = await row.boundingBox();
      expect(rowBox!.width).toBeGreaterThan(menuBox!.width * 0.8);
      expect(rowBox!.height).toBeGreaterThanOrEqual(60);
    }
    await page.getByRole("main").click({ position: { x: 20, y: 200 } });
    await expect(page.getByRole("menu")).toBeHidden();
    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("menuitem", { name: /My profile/ }).click();
    await page.getByLabel("Display name").fill("Adjoa E2E");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("saved");
    await page.goto(`${client}/preferences`);
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByRole("status")).toContainText("saved");
  });

  test("sidebar collapse persists", async ({ page }) => {
    await authenticate(page);
    await page.goto(client);
    const before = await page.locator(".portal-content").boundingBox();
    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    const collapseBox = await collapse.boundingBox();
    const arrowBox = await collapse.locator("svg").boundingBox();
    expect(
      Math.abs(
        arrowBox!.x +
          arrowBox!.width / 2 -
          (collapseBox!.x + collapseBox!.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(
        arrowBox!.y +
          arrowBox!.height / 2 -
          (collapseBox!.y + collapseBox!.height / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await collapse.click();
    const after = await page.locator(".portal-content").boundingBox();
    const sidebar = await page.locator(".portal-sidebar").boundingBox();
    const main = await page.locator(".portal-main").boundingBox();
    expect(after!.width).toBeGreaterThan(before!.width);
    expect(
      Math.abs(main!.x - (sidebar!.x + sidebar!.width)),
    ).toBeLessThanOrEqual(1);
    await expect(
      page.getByRole("button", { name: "Expand sidebar" }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Expand sidebar" }),
    ).toBeVisible();
  });

  test("role switch persists the selected access view", async ({ page }) => {
    await authenticate(page);
    await page.goto(client);
    await page
      .getByRole("button", { name: /Creator.*Switch access view/ })
      .click();
    await page.getByRole("option", { name: /Academy member/ }).click();
    await expect(page.locator(".access-ribbon")).toContainText(
      "Academy member access",
    );
    await page.reload();
    await expect(page.locator(".access-ribbon")).toContainText(
      "Academy member access",
    );
  });

  test("unknown and nested client routes return a real 404", async ({
    request,
  }) => {
    expect(
      (await request.get(`${client}/definitely-not-a-circle-route`)).status(),
    ).toBe(404);
    expect((await request.get(`${client}/profile/nested`)).status()).toBe(404);
  });
});
