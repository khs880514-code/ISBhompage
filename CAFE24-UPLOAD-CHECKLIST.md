# CAFE24 업로드 체크리스트

카페24 웹루트는 `/www` 입니다.

먼저 할 일:
- `/www` 전체를 로컬 PC에 백업
- 특히 `index.php`, `index.html`, `.htaccess`, `adm`, `bbs`, `data` 존재 여부 확인

새 사이트 업로드 대상:
- `index.html`
- `styles.css`
- `script.js`
- `site-data.js`
- `site-storage.js`
- `site-config.js`
- `admin.html`
- `admin.css`
- `admin.js`
- `robots.txt`
- `sitemap.xml`
- `.htaccess`
- `assets/`

업로드 위치:
- 위 파일과 폴더를 모두 `/www` 바로 아래에 업로드

주의:
- `adm`, `bbs`, `data`, `extend`, `img`, `js`, `lib`, `mobile`, `plugin`, `skin`, `theme` 같은 기존 폴더는 바로 삭제하지 말 것
- 먼저 새 파일만 올리고 접속 확인
- 문제가 있으면 백업한 기존 `index.php`로 복구

전환 확인:
- `https://www.e-isb.com/`
- `Ctrl+F5` 강력 새로고침

문제 시 우선 확인:
- `.htaccess` 가 `/www/.htaccess` 로 올라갔는지
- `index.html` 이 `/www/index.html` 인지
- 이미지 폴더가 `/www/assets/featured/...` 인지
