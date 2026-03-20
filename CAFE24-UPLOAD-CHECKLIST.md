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
- `studio/`
- `api/`
- `storage/`
- `robots.txt`
- `sitemap.xml`
- `.htaccess`
- `assets/`

업로드 위치:
- 위 파일과 폴더를 모두 `/www` 바로 아래에 업로드

관리자 주소:
- `https://www.e-isb.com/studio/`
- 보조 주소로 `https://www.e-isb.com/admin.html` 도 사용 가능

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
- PHP API 파일이 `/www/api/...` 에 있는지
- 관리자 저장 파일이 `/www/storage/site-data.json` 에 있는지
- 관리자 저장이 안 되면 `/www/storage` 와 `/www/assets/uploads` 의 쓰기 권한을 확인하기
