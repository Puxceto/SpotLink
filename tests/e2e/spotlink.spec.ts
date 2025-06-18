/* eslint-disable @typescript-eslint/no-explicit-any */
import { chromium, expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extensionPath = path.join(__dirname, '../../dist/chrome');
const pagePath = path.join(__dirname, 'fixtures/longPage.html');


test('pin link scrolls to spot', async () => {
  const server = http.createServer((req, res) => {
    const data = fs.readFileSync(pagePath);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as any).port;
  const urlBase = `http://localhost:${port}`;

  const context = await chromium.launchPersistentContext(
    path.join(os.tmpdir(), 'spotlink-user1'),
    {
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    }
  );
  const page = await context.newPage();
  await page.goto(`${urlBase}/longPage.html`);
  const targetY = await page.evaluate(() => {
    const t = document.getElementById('target')!;
    window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY);
    return Math.round(window.scrollY);
  });
  await page.keyboard.press('Alt+KeyP');
  await page.waitForTimeout(200);
  const bg = context.serviceWorkers()[0];
  const url = await bg.evaluate(async () => {
    const { pins } = await chrome.storage.local.get('pins');
    return pins[pins.length - 1].url;
  });
  await context.close();

  const context2 = await chromium.launchPersistentContext(
    path.join(os.tmpdir(), 'spotlink-user2'),
    {
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    }
  );
  const page2 = await context2.newPage();
  await page2.goto(url);
  await page2.waitForTimeout(500);
  const scrollY = await page2.evaluate(() => Math.round(window.scrollY));
  expect(Math.abs(scrollY - targetY)).toBeLessThanOrEqual(5);
  await context2.close();
  server.close();
});
