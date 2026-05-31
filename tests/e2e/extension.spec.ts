import { test as base, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend base test to include the extension background page and popup
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    let pathToExtension = path.join(__dirname, '../../dist');
    // Force forward slashes for Windows Chromium extension loading
    pathToExtension = pathToExtension.replace(/\\/g, '/');
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-'));
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--headless=new`,
        `--no-sandbox`,
        `--disable-gpu`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // For manifest v3, we need to find the background service worker
    let background = context.serviceWorkers()[0];
    if (!background) {
      try {
        background = await context.waitForEvent('serviceworker', { timeout: 5000 });
      } catch (e) {
        background = context.serviceWorkers()[0];
      }
    }

    // Polling fallback to eliminate race conditions
    let attempts = 0;
    while (!background && attempts < 20) {
      await new Promise(r => setTimeout(r, 500));
      background = context.serviceWorkers()[0];
      attempts++;
    }

    if (!background) {
      throw new Error('Background service worker not found!');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

test.describe('ContextLens Extension E2E', () => {
  test('Popup UI loads and renders correctly', async ({ page, extensionId }) => {
    // Navigate directly to the extension popup page
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    // Verify main header
    await expect(page.locator('text=ContextLens')).toBeVisible();
    await expect(page.locator('text=Token Optimizer')).toBeVisible();

    // Verify tabs are present
    await expect(page.locator('text=📚 Knowledge')).toBeVisible();
    await expect(page.locator('text=⚙️ Settings')).toBeVisible();
  });

  test('Background worker initializes', async ({ context }) => {
    let background = context.serviceWorkers()[0];
    if (!background) {
      try {
        background = await context.waitForEvent('serviceworker', { timeout: 5000 });
      } catch (e) {
        background = context.serviceWorkers()[0];
      }
    }

    let attempts = 0;
    while (!background && attempts < 20) {
      await new Promise(r => setTimeout(r, 500));
      background = context.serviceWorkers()[0];
      attempts++;
    }

    expect(background).toBeTruthy();
    expect(background.url()).toContain('service-worker.js');
  });
});
