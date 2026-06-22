import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const browser = await chromium.launch();

// 1) Açık tema — güncel setup (günlük bulmaca kartı dahil)
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.screenshot({ path: 'docs/superpowers/web-setup-v2.png', fullPage: true });
console.log('web-setup-v2.png alindi');

await browser.close();

// 2) Koyu tema — localStorage'a dark yazıp yeniden yükle
const b2 = await chromium.launch();
const ctx = await b2.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  try { localStorage.setItem('extreme-sudoku-theme', 'dark'); } catch (e) {}
});
const p2 = await ctx.newPage();
await p2.goto(base, { waitUntil: 'networkidle' });
await p2.waitForTimeout(900);
await p2.screenshot({ path: 'docs/superpowers/web-setup-dark.png', fullPage: true });
console.log('web-setup-dark.png alindi');

// Koyu temada bir oyun baslat
const startBtn = p2.getByRole('button', { name: /ba[sş]la/i });
if (await startBtn.count()) {
  await startBtn.first().click();
  await p2.waitForTimeout(1200);
  await p2.screenshot({ path: 'docs/superpowers/web-game-dark.png' });
  console.log('web-game-dark.png alindi');
}
await b2.close();
