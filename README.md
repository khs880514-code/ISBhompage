# ISB Website

ISB 회사 소개 및 시공 사례 중심 홍보용 웹사이트입니다.

## 주요 구성

- 정적 프론트 페이지
- 브라우저 기반 관리자 페이지
- Netlify Functions 기반 문의 폼
- Netlify Blobs 기반 사이트 데이터 발행 구조
- Cloudflare Turnstile 스팸 방지 대응

## 주요 파일

- [index.html](./index.html)
  - 공개 홈페이지
- [admin.html](./admin.html)
  - 내부용 관리자 페이지
- [site-data.js](./site-data.js)
  - 기본 콘텐츠 데이터
- [site-config.js](./site-config.js)
  - 런타임 설정
- [netlify.toml](./netlify.toml)
  - 배포 및 헤더 설정

## 운영 문서

- [EDIT-GUIDE.md](./EDIT-GUIDE.md)
- [DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)
- [GITHUB-QUICKSTART.md](./GITHUB-QUICKSTART.md)
- [SECURITY.md](./SECURITY.md)
- [ISB-운영-매뉴얼.md](./docs/ISB-운영-매뉴얼.md)
- [ISB-문의-운영-보안안.md](./docs/ISB-문의-운영-보안안.md)
- [ISB-도메인-배포-예산안.md](./docs/ISB-도메인-배포-예산안.md)
- [ISB-실행-로드맵-상세.md](./docs/ISB-실행-로드맵-상세.md)

## 환경변수

예시는 [.env.example](./.env.example) 참고

- `ADMIN_WRITE_TOKEN`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `TURNSTILE_SECRET_KEY`

## 배포 순서 요약

1. GitHub 저장소 생성
2. Netlify 연결
3. 환경변수 설정
4. Cloudflare DNS 연결
5. 회사 메일 연결
6. 문의 폼 테스트
7. 관리자 페이지 발행 테스트

## 주의

- 로컬 파일(`file://`)로 열면 문의 전송과 서버 저장 발행은 동작하지 않습니다.
- 실제 API 테스트는 Netlify 배포 후 진행해야 합니다.
