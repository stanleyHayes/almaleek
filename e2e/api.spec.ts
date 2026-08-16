import { expect, test } from "@playwright/test";

const api = "http://127.0.0.1:18080";
const adminHeaders = { Authorization: "Bearer e2e-admin-key" };

test.describe("API lifecycle", () => {
  test("health, invitation, event, and intake lifecycle", async ({
    request,
  }) => {
    const health = await request.get(`${api}/health`);
    expect(health.ok()).toBeTruthy();
    await expect(health.json()).resolves.toMatchObject({
      status: "ok",
      service: "almaleek",
    });

    const unique = Date.now();
    const issued = await request.post(`${api}/api/invitations`, {
      headers: adminHeaders,
      data: {
        name: "E2E Collaborator",
        email: `collab-${unique}@example.test`,
        role: "collaborator",
      },
    });
    expect(issued.status()).toBe(201);
    const invitation = await issued.json();
    expect(invitation.token).toBeTruthy();
    expect(invitation.status).toBe("pending");
    const fetched = await request.get(
      `${api}/api/invitations/${invitation.token}`,
    );
    expect((await fetched.json()).id).toBe(invitation.id);
    const accepted = await request.post(
      `${api}/api/invitations/${invitation.token}/accept`,
    );
    expect(accepted.ok()).toBeTruthy();
    expect((await accepted.json()).status).toBe("accepted");

    const event = await request.post(`${api}/api/events`, {
      headers: adminHeaders,
      data: {
        name: `E2E Live ${unique}`,
        starts_at: "2030-09-18T18:30:00Z",
        venue: "National Theatre",
        capacity: 500,
        status: "on_sale",
      },
    });
    expect(event.status()).toBe(201);
    const createdEvent = await event.json();
    expect(createdEvent.id).toMatch(/^evt_/);
    const events = await request.get(`${api}/api/events`, {
      headers: adminHeaders,
    });
    expect(
      (await events.json()).some(
        (item: { id: string }) => item.id === createdEvent.id,
      ),
    ).toBeTruthy();

    const intake = await request.post(`${api}/api/intakes`, {
      data: {
        kind: "partnership",
        name: "E2E Brand",
        email: `brand-${unique}@example.test`,
        organization: "Circle Labs",
        message: "Campaign enquiry",
      },
    });
    expect(intake.status()).toBe(201);
    const createdIntake = await intake.json();
    expect(createdIntake.status).toBe("new");
    const intakes = await request.get(`${api}/api/intakes`, {
      headers: adminHeaders,
    });
    expect(
      (await intakes.json()).some(
        (item: { id: string }) => item.id === createdIntake.id,
      ),
    ).toBeTruthy();
  });

  test("issued API token produces a usable client invite URL", async ({
    request,
    page,
  }) => {
    const issued = await request.post(`${api}/api/invitations`, {
      headers: adminHeaders,
      data: {
        name: "Cross App Guest",
        email: `guest-${Date.now()}@example.test`,
        role: "creator",
      },
    });
    const invitation = await issued.json();
    await page.goto(`http://127.0.0.1:3102/invite/${invitation.token}`);
    await expect(
      page.getByRole("heading", { name: "You have a place in the circle." }),
    ).toBeVisible();
    await expect(page.getByText("Cross App Guest")).toBeVisible();
    await page.getByRole("button", { name: /Accept invitation/ }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3102/onboarding");
    await expect(page.getByText("Cross App Guest")).toBeVisible();
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByRole("button", { name: /Creator/ })).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: /Brand partner/ }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: /Continue/ }).click();
    await page.getByRole("button", { name: /Enter my Circle/ }).click();
    await expect(page).toHaveURL("http://127.0.0.1:3102/");
    const accepted = await request.get(
      `${api}/api/invitations/${invitation.token}`,
    );
    expect((await accepted.json()).status).toBe("accepted");
  });
});
