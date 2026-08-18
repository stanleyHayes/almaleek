import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: isCI ? [["line"], ["html", { open: "never" }]] : [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 NEXT_PUBLIC_CLIENT_URL=http://127.0.0.1:3102 npm run build:web && NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 NEXT_PUBLIC_CLIENT_URL=http://127.0.0.1:3102 npm --workspace apps/web run start -- -p 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command:
        "API_URL=http://127.0.0.1:18080 ADMIN_API_KEY=e2e-admin-key ADMIN_SESSION_SECRET=e2e-session-secret-at-least-32-characters ADMIN_EMAIL=ama@almaleekgh.com ADMIN_PASSWORD=e2e-demo-password NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 NEXT_PUBLIC_CLIENT_URL=http://127.0.0.1:3102 npm run build:admin && API_URL=http://127.0.0.1:18080 ADMIN_API_KEY=e2e-admin-key ADMIN_SESSION_SECRET=e2e-session-secret-at-least-32-characters ADMIN_EMAIL=ama@almaleekgh.com ADMIN_PASSWORD=e2e-demo-password NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 NEXT_PUBLIC_CLIENT_URL=http://127.0.0.1:3102 npm --workspace apps/admin run start -- -p 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command:
        "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 npm run build:client && NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18080 NEXT_PUBLIC_API_URL=http://127.0.0.1:18080 npm --workspace apps/client run start -- -p 3102",
      url: "http://127.0.0.1:3102/sign-in",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command:
        "cd services/api && PORT=18080 BASE_URL=http://127.0.0.1:18080 APP_ENV=test DATA_STORE=memory ADMIN_API_KEY=e2e-admin-key ALLOWED_ORIGINS=http://127.0.0.1:3100,http://127.0.0.1:3101,http://127.0.0.1:3102,http://localhost:3100,http://localhost:3101,http://localhost:3102 RESEND_FROM_EMAIL=e2e@almaleek.test go run ./cmd/server",
      url: "http://127.0.0.1:18080/health",
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
