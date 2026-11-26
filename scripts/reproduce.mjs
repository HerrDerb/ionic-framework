// Automated version of the manual steps in README.md.
// Run: npm run build && npm run reproduce
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const www = join(import.meta.dirname, '..', 'www', 'browser');
const root = existsSync(www) ? www : join(import.meta.dirname, '..', 'www');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml' };
const W = 400;
const H = 800;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(name, steps) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.route('http://repro.test/**', (route) => {
    const p = new URL(route.request().url()).pathname;
    let file = join(root, p);
    if (p === '/' || !existsSync(file)) file = join(root, 'index.html');
    route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? 'application/octet-stream' });
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://repro.test/home');
  await page.locator('#open-later').waitFor();
  await sleep(500);
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, x = 0, y = 0) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const drag = async (x0, y, dx) => {
    for (let i = 1; i <= 6; i++) {
      await touch('touchMove', x0 + (dx * i) / 6, y);
      await sleep(16);
    }
  };
  const tap = (sel) => page.locator(sel).tap();
  const isOpen = () => page.evaluate(() => document.querySelector('ion-menu').isOpen());
  await steps({ touch, drag, tap, isOpen });
  await sleep(800);
  console.log(`\n${name}\n  menu open at the end: ${await isOpen()}`);
  console.log(errors.length ? errors.map((e) => `  uncaught: ${e}`).join('\n') : '  no uncaught error');
  await browser.close();
  return errors.length;
}

// 1. Touch starts before menu.open() runs, finger moves after it.
const a = await run('1. finger down, menu.open() from code, finger drags', async ({ touch, drag, tap }) => {
  await tap('#open-later');
  await sleep(1500);
  await touch('touchStart', W - 10, 400);
  await sleep(700);
  await drag(W - 10, 400, -60);
  await touch('touchEnd');
});

// 2. Menu is open, touch starts before menu.close() runs, finger moves after it.
const b = await run('2. menu open, finger down, menu.close() from code, finger drags', async ({ touch, drag, tap }) => {
  await tap('#open-later');
  await sleep(2800);
  await tap('#close-later');
  await sleep(1500);
  await touch('touchStart', 60, 400);
  await sleep(700);
  await drag(60, 400, 60);
  await touch('touchEnd');
});

// Control: the touch starts only after menu.open() has started, so canStart() sees isAnimating.
const c = await run('control: menu.open() from code first, then finger down and drag', async ({ touch, drag, tap }) => {
  await tap('#open-later');
  await sleep(2050);
  await touch('touchStart', W - 10, 400);
  await drag(W - 10, 400, -60);
  await touch('touchEnd');
});

process.exitCode = a && b && !c ? 0 : 1;
console.log(process.exitCode === 0 ? '\nReproduced: 1 and 2 throw, the control does not.' : '\nNot reproduced as expected.');
