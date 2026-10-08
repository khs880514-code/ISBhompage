// 카탈로그 PDF를 만듭니다.
//   node scripts/build.mjs
// 결과물:
//   MSB-LED-카탈로그_우편용_인쇄소용(재단여백3mm).pdf  216×303mm, 사방 3mm 재단 여백 포함
//   MSB-LED-카탈로그_우편용_A4출력용.pdf               210×297mm, 사무실 프린터용
//   MSB-LED-카탈로그_이메일용.pdf                      16:9 화면용, 링크 클릭 가능
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
if (!existsSync(path.join(fontDir, 'WantedSans-Regular.ttf'))) {
  const tmp = mkdtempSync(path.join(tmpdir(), 'wanted-'));
  execFileSync('npm', ['pack', 'wanted-sans@1.0.3', '--pack-destination', tmp], { stdio: 'ignore' });
  execFileSync('tar', ['xzf', path.join(tmp, 'wanted-sans-1.0.3.tgz'), '-C', tmp]);
  mkdirSync(fontDir, { recursive: true });
  for (const w of ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']) {
    cpSync(path.join(tmp, 'package/fonts/ttf', `WantedSans-${w}.ttf`), path.join(fontDir, `WantedSans-${w}.ttf`));
  }
  cpSync(path.join(tmp, 'package/fonts/OFL.txt'), path.join(fontDir, 'OFL.txt'));
  rmSync(tmp, { recursive: true, force: true });
}

const jobs = [
  {
    file: 'print.html',
    out: 'MSB-LED-카탈로그_우편용_인쇄소용(재단여백3mm).pdf',
    css: '@page { size: 216mm 303mm; margin: 0 }',
  },
  {
    file: 'print.html',
    out: 'MSB-LED-카탈로그_우편용_A4출력용.pdf',
    css: ':root { --b: 0mm } @page { size: 210mm 297mm; margin: 0 }',
  },
  {
    file: 'email.html',
    out: 'MSB-LED-카탈로그_이메일용.pdf',
    css: '@page { size: 1280px 720px; margin: 0 }',
  },
];

const only = process.argv[2];
const browser = await chromium.launch();
for (const job of jobs) {
  if (only && !job.out.includes(only) && job.file !== only) continue;
  const page = await browser.newPage();
  await page.goto(src(job.file), { waitUntil: 'load' });
  await page.addStyleTag({ content: job.css });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(root, job.out),
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });
  await page.close();
  console.log('만듦:', job.out);
}
await browser.close();
