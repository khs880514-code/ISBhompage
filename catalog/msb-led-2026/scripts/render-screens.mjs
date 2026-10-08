// LED 배너 화면에 넣을 예시 이미지를 HTML에서 PNG로 만듭니다.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'build');
mkdirSync(outDir, { recursive: true });
const sizes = { sign: { width: 840, height: 1880 }, photo: { width: 760, height: 3080 } };

const browser = await chromium.launch();
for (const version of ['it', 'factory']) {
  for (const [kind, size] of Object.entries(sizes)) {
    const page = await browser.newPage({ viewport: size });
    await page.goto(pathToFileURL(path.join(root, 'src/screens', `${version}-${kind}.html`)).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(outDir, `screen-${version}-${kind}.png`) });
    await page.close();
  }
}
await browser.close();
