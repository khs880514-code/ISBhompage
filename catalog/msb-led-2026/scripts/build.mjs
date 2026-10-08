// 카탈로그 PDF를 만듭니다.
//   node scripts/build.mjs
// IT오피스용/, 공장용/ 폴더에 각각 세 파일을 만듭니다.
//   ..._우편용_인쇄소용(재단여백3mm).pdf  216×303mm, 사방 3mm 재단 여백 포함
//   ..._우편용_A4출력용.pdf               210×297mm, 사무실 프린터용
//   ..._이메일용.pdf                      16:9 화면용, 링크 클릭 가능
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => pathToFileURL(path.join(root, 'src', f)).href;

// 1) 폰트(Wanted Sans, OFL)가 없으면 npm에서 받아 옴
const fontDir = path.join(root, 'fonts');
if (!existsSync(path.join(fontDir, 'WantedSans-Black.ttf'))) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'wanted-'));
  execFileSync('npm', ['pack', 'wanted-sans@1.0.3', '--pack-destination', tmp], { stdio: 'ignore' });
  execFileSync('tar', ['xzf', path.join(tmp, 'wanted-sans-1.0.3.tgz'), '-C', tmp]);
  mkdirSync(fontDir, { recursive: true });
  for (const w of ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black']) {
    cpSync(path.join(tmp, 'package/fonts/ttf', `WantedSans-${w}.ttf`), path.join(fontDir, `WantedSans-${w}.ttf`));
  }
  cpSync(path.join(tmp, 'package/fonts/OFL.txt'), path.join(fontDir, 'OFL.txt'));
  rmSync(tmp, { recursive: true, force: true });
}

const versions = [
  { v: 'it', folder: 'IT오피스용', name: 'IT오피스' },
  { v: 'factory', folder: '공장용', name: '공장' },
];
const kinds = [
  { file: 'print.html', suffix: '우편용_인쇄소용(재단여백3mm)', css: '@page { size: 216mm 303mm; margin: 0 }' },
  { file: 'print.html', suffix: '우편용_A4출력용', css: ':root { --b: 0mm } @page { size: 210mm 297mm; margin: 0 }' },
  { file: 'email.html', suffix: '이메일용', css: '@page { size: 1280px 720px; margin: 0 }' },
];

// node scripts/build.mjs [it|factory] [print|email]  — 일부만 다시 만들 때
const [onlyVersion, onlyFile] = process.argv.slice(2);
const browser = await chromium.launch();
for (const ver of versions) {
  if (onlyVersion && onlyVersion !== ver.v) continue;
  mkdirSync(path.join(root, ver.folder), { recursive: true });
  for (const kind of kinds) {
    if (onlyFile && !kind.file.startsWith(onlyFile)) continue;
    const out = path.join(ver.folder, `MSB-LED-카탈로그_${ver.name}_${kind.suffix}.pdf`);
    const page = await browser.newPage();
    await page.goto(src(kind.file), { waitUntil: 'load' });
    await page.evaluate((v) => { document.documentElement.dataset.v = v; }, ver.v);
    await page.addStyleTag({ content: kind.css });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    await page.pdf({ path: path.join(root, out), printBackground: true, preferCSSPageSize: true, tagged: true });
    await page.close();
    console.log('만듦:', out);
  }
}
await browser.close();
