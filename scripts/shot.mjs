import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.screenshot({ path: 'docs/superpowers/web-setup.png' });
console.log('web-setup.png alindi');

// "BAŞLA" benzeri butonu bul ve tıkla (büyük/küçük harf duyarsız)
const startBtn = page.getByRole('button', { name: /ba[sş]la/i });
if (await startBtn.count()) {
  await startBtn.first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/superpowers/web-game.png' });
  console.log('web-game.png alindi');

  // Bir kareye ve bir rakama dokunup giris test et (gorsel)
  try {
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'docs/superpowers/web-game2.png' });
  } catch (e) { console.log('ek adim atlandi:', e.message); }
} else {
  console.log('BASLA butonu bulunamadi — setup ekrani selektorleri farkli olabilir');
}

await browser.close();
