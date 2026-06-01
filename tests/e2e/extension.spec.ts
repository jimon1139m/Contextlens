/* eslint-disable no-empty-pattern, react-hooks/rules-of-hooks */
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
  context: async ({}, use, testInfo) => {
    let pathToExtension = path.join(__dirname, '../../dist');
    // Force forward slashes for Windows Chromium extension loading
    pathToExtension = pathToExtension.replace(/\\/g, '/');
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-'));
    let context: BrowserContext | undefined;

    try {
      context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
          `--headless=new`,
          `--no-sandbox`,
          `--disable-gpu`,
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
        ],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('spawn EPERM')) {
        testInfo.skip(true, 'Chromium launch is blocked by this Windows sandbox.');
        return;
      }
      throw error;
    }

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // For manifest v3, we need to find the background service worker
    let background = context.serviceWorkers()[0];
    if (!background) {
      try {
        background = await context.waitForEvent('serviceworker', { timeout: 5000 });
      } catch {
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
      } catch {
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

  test('Intercepts and compresses prompt on ChatGPT', async ({ page }) => {
    // Intercept network requests to chat.openai.com and serve mock HTML
    await page.route('https://chat.openai.com/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <textarea id="prompt-textarea"></textarea>
              <button data-testid="send-button">Send</button>
              <div id="result"></div>
              <script>
                document.querySelector('[data-testid="send-button"]').addEventListener('click', () => {
                  document.querySelector('#result').textContent = document.querySelector('#prompt-textarea').value;
                });
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    setTimeout(() => {
                      document.querySelector('#result').textContent = document.querySelector('#prompt-textarea').value;
                    }, 200);
                  }
                }, true);
              </script>
            </body>
          </html>
        `
      });
    });

    // Navigate to the matched domain
    await page.goto('https://chat.openai.com/');

    const textarea = page.locator('#prompt-textarea');
    await textarea.fill('Hello    world, this is a prompt with    too many spaces.');
    
    // Press Enter to submit (which calls onSubmit adapter)
    await textarea.press('Enter');

    // Wait for the adapter to process and update DOM
    await expect(page.locator('#result')).toHaveText('Hello world, this is a prompt with too many spaces.', { timeout: 10000 });
  });

  test('Intercepts and compresses prompt on Claude', async ({ page }) => {
    // Intercept network requests to claude.ai and serve mock HTML
    await page.route('https://claude.ai/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <div contenteditable="true" id="editor"></div>
              <div id="result"></div>
              <script>
                document.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    document.querySelector('#result').textContent = document.querySelector('#editor').textContent;
                  }
                }, true);
              </script>
            </body>
          </html>
        `
      });
    });

    // Navigate to Claude
    await page.goto('https://claude.ai/');

    const editor = page.locator('[contenteditable="true"]');
    await editor.focus();
    await editor.fill('Testing    Claude     interception   system.');
    
    // Press Enter
    await editor.press('Enter');

    // Verify optimized text
    await expect(page.locator('#result')).toHaveText('Testing Claude interception system.', { timeout: 10000 });
  });
});
