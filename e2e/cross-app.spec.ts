import { expect, test, type Page } from "@playwright/test";

const web = "http://127.0.0.1:3100",
  admin = "http://127.0.0.1:3101",
  client = "http://127.0.0.1:3102";
async function signInAdmin(page: Page) {
  await page.goto(`${admin}/sign-in`);
  await page.getByLabel("Email").fill("ama@almaleekgh.com");
  await page.getByLabel("Password", { exact: true }).fill("e2e-demo-password");
  await page.getByRole("button", { name: /Sign in securely/ }).click();
  await expect(page).toHaveURL(`${admin}/`);
}

test("public intake appears in the live admin Community queue", async ({
  page,
}) => {
  const unique = Date.now(),
    name = `E2E Learner ${unique}`,
    email = `learner-${unique}@example.test`;
  await page.goto(`${web}/academy`);
  const form = page
    .getByRole("heading", { name: "Join the waitlist" })
    .locator("..");
  await form.getByLabel("Name").fill(name);
  await form.getByLabel("Email").fill(email);
  await form
    .getByLabel("Focus area")
    .selectOption({ label: "Content strategy" });
  await form.getByRole("button", { name: "Get access info" }).click();
  await expect(page.getByRole("status")).toContainText("Academy list");
  await signInAdmin(page);
  await page.goto(`${admin}/community`);
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});

test("admin Community invitation opens and accepts in Circle", async ({
  page,
  request,
}) => {
  const unique = Date.now(),
    name = `Circle Guest ${unique}`,
    email = `circle-${unique}@example.test`;
  await signInAdmin(page);
  await page.goto(`${admin}/community`);
  await page.getByRole("button", { name: /Invite privileged access/ }).click();
  const dialog = page.getByRole("dialog", { name: "Invite privileged access" });
  await dialog.getByLabel("Full name").fill(name);
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Access role").selectOption("collaborator");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toContainText(
    `Invitation created for ${name}`,
  );
  const output = page.locator(".invite-output");
  await expect(output).toContainText("Invitation link ready");
  const text = await output.locator("p").nth(1).textContent();
  const inviteUrl = text?.match(/https?:\/\/\S+\/invite\/\S+/)?.[0];
  expect(inviteUrl).toBeTruthy();
  await page.goto(inviteUrl!);
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Accept invitation/ }).click();
  await expect(page).toHaveURL(`${client}/onboarding`);
  await expect(page.getByText(name, { exact: false })).toBeVisible();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("button", { name: /Collaborator/ })).toHaveCount(
    1,
  );
  await expect(page.getByRole("button", { name: /Creator/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: /Enter my Circle/ }).click();
  await expect(page).toHaveURL(`${client}/`);
  await expect(page.locator(".access-ribbon")).toContainText(
    "Collaborator access",
  );
  const token = inviteUrl!.split("/").pop()!;
  const verified = await request.get(
    `http://127.0.0.1:18080/api/invitations/${token}`,
  );
  expect((await verified.json()).status).toBe("accepted");
});

test("community self-join activates paid entitlements and appears in admin", async ({
  page,
}) => {
  const unique = Date.now(),
    name = `Self Join Member ${unique}`,
    email = `member-${unique}@example.test`;
  await page.goto(`${web}/community`);
  const form = page.locator("#join-community");
  await form.getByLabel("Name").fill(name);
  await form.getByLabel("Email").fill(email);
  await form.getByRole("button", { name: /Membership Circle Free/ }).click();
  await form.getByRole("option", { name: /Insiders/ }).click();
  await form.getByRole("button", { name: "Start membership" }).click();
  await expect(form.getByRole("status")).toContainText("Insiders");
  await form.getByRole("link", { name: /Enter your Circle/ }).click();
  await expect(page).toHaveURL(/\/community\?member=/);
  await expect(page.locator(".membership-pass")).toContainText("Insiders");
  await expect(
    page.getByRole("heading", { name: "Behind the work" }).locator(".."),
  ).not.toHaveClass(/locked/);
  await signInAdmin(page);
  await page.goto(`${admin}/community`);
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toBeVisible();
});
