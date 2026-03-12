# ISB 실행 로드맵 상세

## 목표

이 문서는 ISB 사이트를 실제 운영 가능한 상태로 만드는 순서를 `도메인`, `배포`, `문의`, `검색 노출`, `관리 운영` 기준으로 정리한 실행 로드맵입니다.

## 최종 구조

- 소스 관리: GitHub
- 배포: Netlify
- DNS / SSL / 보안: Cloudflare
- 문의 전송: Netlify Functions + Resend
- 스팸 방지: Cloudflare Turnstile
- 회사 메일: Microsoft 365 Business Basic 또는 Google Workspace
- 검색 등록: 네이버 서치어드바이저, Google Search Console

## 권장 순서

### 1단계. 도메인 정리

#### 해야 할 일

- 현재 `e-isb.com` 소유자, 만료일, 결제계정 확인
- `e-isb.co.kr` 추가 확보 여부 결정
- 도메인 등록기관 계정을 회사 통제 계정으로 정리

#### 실무 팁

- `www.e-isb.com` 을 메인 주소로 추천
- `e-isb.com`, `e-isb.co.kr`는 전부 메인 주소로 리디렉션
- 도메인 만료 알림 메일은 최소 2명에게 수신되게 설정

#### 완료 기준

- 누가 도메인을 소유하는지 명확함
- 결제와 만료 관리가 회사 기준으로 정리됨

## 2단계. GitHub 저장소 준비

#### 해야 할 일

- 회사용 GitHub Organization 또는 회사 통제 계정 생성
- 현재 프로젝트 업로드
- `main` 브랜치를 운영 브랜치로 사용

#### 권장 규칙

- 배포용: `main`
- 실험용: `staging`
- 이미지 원본은 너무 무겁다면 별도 보관 후 웹용만 반영

#### 완료 기준

- 저장소에서 버전 이력 관리 가능
- 최소 2명이 복구 가능

## 3단계. Netlify 연결

#### 해야 할 일

- GitHub 저장소를 Netlify에 연결
- `netlify.toml` 기준으로 배포/함수 설정 반영
- 배포 URL에서 사이트 확인

#### 이 프로젝트에서 이미 준비된 파일

- [netlify.toml](../netlify.toml)
- [netlify/functions/site-data.mjs](../netlify/functions/site-data.mjs)
- [netlify/functions/admin-site-data.mjs](../netlify/functions/admin-site-data.mjs)
- [netlify/functions/contact.mjs](../netlify/functions/contact.mjs)

#### 완료 기준

- Netlify 기본 도메인에서 홈페이지 정상 표시
- `/api/site-data` 응답 확인
- `/api/contact` 함수 배포 확인

## 4단계. Cloudflare 연결

#### 해야 할 일

- 도메인을 Cloudflare에 추가
- 네임서버 또는 DNS 관리 연결
- Netlify에서 요구하는 DNS 레코드 반영
- SSL 정상 발급 확인

#### 권장 설정

- SSL/TLS 모드: `Full` 또는 문서 기준 권장값
- Always Use HTTPS 켜기
- 캐시는 기본값으로 시작
- 향후 관리자 보호가 필요하면 Cloudflare Access 검토

#### 완료 기준

- `https://www.e-isb.com` 정상 접속
- 리디렉션 정상 동작
- 브라우저 경고 없음

## 5단계. 회사 메일 연결

#### 해야 할 일

- `contact@e-isb.com`
- `website@e-isb.com`
- 필요 시 `admin@e-isb.com`

#### 권장 운영

- 문의 수신: `contact@`
- 사이트 발신: `website@`
- 관리자/복구용: `admin@`

#### 완료 기준

- 회사 도메인 메일 송수신 가능
- 담당자 부재 시 백업 수신 가능

## 6단계. 문의 기능 활성화

#### 해야 할 일

- Resend 도메인 인증
- Turnstile 사이트 등록
- Netlify 환경변수 설정
- 문의 테스트 3회

#### 필요한 환경변수

- `ADMIN_WRITE_TOKEN`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

#### 완료 기준

- 실제 메일 수신 확인
- 스팸 방지 위젯 표시
- 실패 메시지/성공 메시지 확인

## 7단계. 관리자 발행 기능 활성화

#### 해야 할 일

- Netlify 환경변수 `ADMIN_WRITE_TOKEN` 설정
- 배포된 `admin.html` 에서 토큰 입력
- 내용 수정 후 `사이트 반영`

#### 운영 팁

- 토큰은 비밀번호 관리자에 저장
- 토큰은 운영 책임자와 백업 관리자만 공유
- 공개 사이트 메뉴에는 관리자 링크를 두지 않음

#### 완료 기준

- 관리자에서 수정 -> 사이트 반영 -> 메인 페이지 새로고침 시 변경 반영

## 8단계. 검색 노출 준비

#### 이번 프로젝트에 이미 추가된 기본 파일

- [robots.txt](../robots.txt)
- [sitemap.xml](../sitemap.xml)
- [index.html](../index.html) 의 canonical / OG / JSON-LD

#### 해야 할 일

- 네이버 서치어드바이저 등록
- Google Search Console 등록
- 사이트맵 제출
- 대표 도메인 확인
- 주요 프로젝트 키워드 정리

#### 완료 기준

- 네이버/구글에서 사이트 소유권 확인
- 사이트맵 제출 완료
- 색인 상태 확인 가능

## 9단계. 콘텐츠 운영 루틴

### 월 1회

- 대표 시공 사례 업데이트
- 문의 테스트
- 오래된 프로젝트 정리
- 메타 정보와 이미지 점검

### 분기 1회

- 보안 계정 점검
- 도메인/배포/메일 권한 점검
- 백업 복원 테스트

## 현실적인 일정안

### Day 1

- 도메인 소유권 확인
- GitHub 저장소 생성
- Netlify 연결

### Day 2

- Cloudflare 연결
- HTTPS 확인

### Day 3

- Microsoft 365 또는 Google Workspace 연결
- 메일 주소 생성

### Day 4

- Resend, Turnstile 설정
- 환경변수 입력

### Day 5

- 문의 테스트
- 관리자 발행 테스트
- 최종 검수

## 이 프로젝트에서 먼저 수정해야 하는 파일

- [site-data.js](../site-data.js)
  - 초기 브랜드/프로젝트 데이터
- [.env.example](../.env.example)
  - 실제 배포 환경변수 목록 참고

## 공식 문서

- [GitHub Organizations](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations)
- [Netlify Git-based Deploys](https://docs.netlify.com/get-started/git-overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/get-started/)
- [Netlify Functions Overview](https://docs.netlify.com/build/functions/overview/)
- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Netlify Custom Domains with External DNS](https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/)
- [Cloudflare DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Cloudflare CNAME Flattening](https://developers.cloudflare.com/dns/cname-flattening/)
- [Cloudflare Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Cloudflare Turnstile Get Started](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Turnstile Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [네이버 서치어드바이저 시작하기](https://searchadvisor.naver.com/start)
