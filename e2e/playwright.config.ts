import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'dotnet run --project ../backend/SMR.Api/SMR.Api.csproj --urls http://localhost:5000',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 60000,
    },
    {
      command: 'npm run dev -- --port 5173',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env['CI'],
      timeout: 30000,
    },
  ],
});
