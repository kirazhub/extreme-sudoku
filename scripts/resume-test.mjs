import { chromium } from 'playwright';

const base = 'https://sudodu.vercel.app';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Oyunu baslat
const startBtn = page.getByRole('button', { name: /ba[sş]la/i });
await startBtn.first().click();
await page.waitForTimeout(1400);

// Tahtada bir hucreye dokun (selectedIndex degisir -> otomatik kayit)
await page.mouse.click(195, 330);
await page.waitForTimeout(400);
// Bir rakam gir (alt palet bolgesi civari) — birkac kombinasyon dene
await page.mouse.click(70, 1560).catch(() => {});
await page.waitForTimeout(600);

// localStorage'da kayit olustu mu kontrol et
const saved = await page.evaluate(() => localStorage.getItem('sudoku-ahmet-saved'));
console.log('kayit var mi:', saved ? 'EVET (' + saved.length + ' karakter)' : 'HAYIR');

// Sayfayi yenile -> Devam Et karti gorunmeli
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
await page.screenshot({ path: 'docs/superpowers/web-LIVE-resume.png' });
console.log('web-LIVE-resume.png alindi (yenileme sonrasi)');

await browser.close();
