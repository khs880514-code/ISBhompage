# ISB Deploy Checklist

## 1. GitHub

1. 이 프로젝트를 GitHub 저장소로 올립니다.
2. 저장소는 가능하면 회사용 계정 또는 Organization으로 만듭니다.
3. `main` 브랜치를 배포 브랜치로 사용합니다.

## 2. Netlify

1. Netlify에서 새 프로젝트를 GitHub 저장소와 연결합니다.
2. Publish directory는 `.` 그대로 둡니다.
3. Functions directory는 `netlify/functions` 입니다.
4. `netlify.toml` 이 자동으로 설정을 읽습니다.

## 3. Netlify 환경변수

Netlify Site settings -> Environment variables 에 아래 값을 넣습니다.

- `ADMIN_WRITE_TOKEN`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `TURNSTILE_SECRET_KEY`

값 형식은 [.env.example](./.env.example) 를 참고하면 됩니다.

## 4. Cloudflare Turnstile

1. Cloudflare Turnstile에서 사이트를 등록합니다.
2. 발급받은 `Site Key` 는 [site-config.js](./site-config.js) 의 `turnstileSiteKey` 에 넣습니다.
3. 발급받은 `Secret Key` 는 Netlify 환경변수 `TURNSTILE_SECRET_KEY` 로 넣습니다.

## 5. Resend

1. Resend에서 발신 도메인을 인증합니다.
2. `website@e-isb.com` 같은 발신 주소를 준비합니다.
3. API 키를 Netlify 환경변수 `RESEND_API_KEY` 로 넣습니다.

## 6. 문의 수신 메일

- `CONTACT_TO_EMAIL`
  - 실제로 문의를 받을 주소
  - 예: `contact@e-isb.com`
- `CONTACT_FROM_EMAIL`
  - 사이트가 발신자로 사용할 주소
  - 예: `website@e-isb.com`

## 7. 관리자 페이지 반영

1. 배포된 `admin.html` 을 엽니다.
2. 우측 상단 `관리 토큰` 입력란에 `ADMIN_WRITE_TOKEN` 값을 넣습니다.
3. 내용 수정
4. `사이트 반영` 클릭

이후 배포된 `index.html` 은 `/api/site-data` 에 저장된 최신 내용을 읽습니다.

## 8. 도메인 연결

1. Netlify에 `www.e-isb.com` 추가
2. Cloudflare DNS 에서 CNAME/A 레코드 연결
3. `e-isb.com` 은 `www.e-isb.com` 으로 리디렉션
4. `e-isb.co.kr` 도 확보 시 동일하게 메인 주소로 리디렉션

## 9. 공개 전 최종 체크

- 문의 폼 테스트 3회
- Turnstile 정상 동작 확인
- 메일 수신 확인
- 관리자 페이지로 저장 후 메인 반영 확인
- 모바일 확인
- 도메인 HTTPS 확인
- 네이버 서치어드바이저 등록
- Google Search Console 등록
