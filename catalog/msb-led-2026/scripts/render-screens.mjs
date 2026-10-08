// LED 배너 화면에 넣을 예시 이미지를 HTML에서 PNG로 만듭니다.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[2] ?? path.join(root, 'build');
const screens = [
  { name: 'lobby', width: 840, height: 1880 },
  { name: 'lounge', width: 760, height: 3080 },
];

const browser = await chromium.launch();
for (const s of screens) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  await page.goto(pathToFileURL(path.join(root, 'src/screens', `${s.name}.html`)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outDir, `screen-${s.name}.png`) });
  await page.close();
}
await browser.close();
