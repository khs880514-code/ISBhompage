# ISB 도메인, 배포, 예산안

기준일: 2026-03-12  
환산 기준: `1 USD ≈ 1,481 KRW`  
환산 출처: [Wise USD/KRW](https://wise.com/us/currency-converter/usd-to-krw-rate/history)

## 전제

- ISB 사이트는 회사 소개와 시공 사례 중심의 홍보용 사이트다.
- 개인이 운영하되 회사 자산으로 남아야 한다.
- 너무 싸구려 느낌은 피하되, 불필요하게 무거운 시스템은 쓰지 않는다.

## 추천 운영 구조

### 권장안

- 도메인 등록
  - 한국 등록기관에서 회사 명의 또는 회사 통제 계정으로 관리
- DNS / 보안 / 프록시
  - Cloudflare
- 코드 저장소
  - GitHub
- 배포
  - Netlify
- 회사 메일
  - Microsoft 365 Business Basic 또는 Google Workspace Starter
- 문의 전송
  - Resend
- 문의 스팸 방지
  - Cloudflare Turnstile
- 검색/노출 관리
  - 네이버 서치어드바이저
  - Google Search Console

## 왜 이 구성이 좋은가

### 도메인

- 한국 사업 운영 기준으로 `.com` 단독보다 `.co.kr` 보조 도메인을 같이 잡는 것이 안정적이다.
- 기존 `e-isb.com`을 메인으로 유지하더라도 `e-isb.co.kr`를 확보해 리디렉션하는 편이 좋다.

### GitHub

- 사이트 변경 이력 관리가 쉽다.
- 실수 시 이전 버전으로 복구하기 좋다.
- 디자이너/개발자 협업이 쉬워진다.

### Netlify

- 정적 사이트 배포가 매우 쉽다.
- GitHub 연결 시 `push -> 자동 배포`가 가능하다.
- 미리보기 배포와 간단한 서버리스 함수 운영이 가능하다.

### Cloudflare

- DNS와 SSL, 캐시, 기본 보안 계층을 제공한다.
- 필요 시 Pro 요금제로 WAF/보안 기능을 강화할 수 있다.
- 내부 관리자 URL 보호를 위해 Cloudflare Access를 붙일 수도 있다.

### Microsoft 365 / Google Workspace

- 회사 도메인 메일 운영에 적합하다.
- 개인 메일 대신 회사 메일 체계를 만들 수 있다.
- 문의, 견적, 관리 메일을 분리하기 좋다.

## 도메인 전략

### 권장 도메인 세트

- 메인: `www.e-isb.com`
- 리디렉션: `e-isb.com`
- 보조 확보: `e-isb.co.kr`

### 권장 규칙

- 메인 접속 주소는 하나로 통일한다.
  - 예: `www.e-isb.com`
- 다른 도메인은 전부 메인으로 301 리디렉션
- 도메인 만료 알림은 운영 책임자 + 백업 관리자 둘 다 받게 설정
- 도메인 등록자 정보, 결제 정보, 인증 메일은 회사가 통제 가능한 상태로 유지

## 배포 전략

### 저장소 구조

- GitHub Organization 또는 회사용 GitHub 계정
- 저장소 1개
  - production branch: `main`
  - test branch: `staging`

### 배포 흐름

1. 로컬 또는 관리자 데이터 수정
2. GitHub에 반영
3. Netlify가 자동 배포
4. Cloudflare를 통해 사용자에게 제공

### 관리자 페이지 처리

현재 관리자 페이지는 `브라우저 로컬 저장 방식`입니다.

중요:

- 공개 사이트 메뉴에 관리자 링크를 두지 않는다.
- 현재 관리자 페이지는 `내부용 편집 도구`로 보는 것이 맞다.
- 향후 온라인 관리자처럼 쓰려면 별도 인증 체계를 붙여야 한다.

## 홍보용 사이트를 효율적으로 쓰는 방법

### 꼭 해야 할 것

- 네이버 서치어드바이저 등록
- Google Search Console 등록
- 대표 페이지별 고유 제목/설명/대표 이미지 관리
- 문의 버튼을 명확히 배치
- 대표 시공 사례를 월 1회 이상 갱신

### ISB에 특히 중요한 것

- 행사장 이름
  - KINTEX, COEX, BEXCO 등
- 시스템명
  - G-TLD, HASTATI, SYMA
- 실제 시공 사진
- 시공 범위
  - 트러스 리깅, 라이팅 박스, 복층, 로비 구조물 등

이 키워드가 페이지 제목, 설명, 프로젝트 카드에 잘 들어가야 검색과 신뢰 둘 다 좋아집니다.

### 검색/노출 팁

- 네이버는 사이트 등록과 수집/진단 관리가 중요합니다.
- 네이버는 IndexNow를 지원하므로 페이지 업데이트를 더 빠르게 알릴 수 있습니다.
- 각 페이지의 대표 이미지 품질과 고유성이 중요합니다.

## 예산안

### 1. 최소 운영형

용도:

- 사이트 운영비를 매우 낮게 유지
- 개인 운영 중심
- 기본 홍보/문의 체계만 확보

구성:

- 도메인: `.com` 1개
- GitHub Free
- Netlify Free
- Cloudflare Free
- 회사 메일 1~2계정
- Resend Free

예상 연간 비용:

- `.com` 1개: `23,000원 + VAT` = 약 `25,300원`
- Microsoft 365 Business Basic 1계정: `8,100원/월 + VAT`
- 1계정 연간: 약 `106,920원`

합계 예시:

- 1메일 계정 기준 약 `132,220원/년`
- 2메일 계정 기준 약 `239,140원/년`

주의:

- 무료 호스팅은 충분히 가능하지만, 운영 알림/지원/추가 기능은 제한적일 수 있습니다.

### 2. 권장 운영형

용도:

- 회사 사이트다운 안정성과 운영 편의 확보
- 과하지 않은 비용
- 실제 실무 운영에 가장 현실적

구성:

- 도메인: `.com` + `.co.kr`
- GitHub Free
- Netlify Personal
- Cloudflare Pro
- Microsoft 365 Business Basic 2계정
- Resend Free
- Cloudflare Turnstile Free

예상 연간 비용:

- `.com`: 약 `25,300원/년` (VAT 포함 가정)
- `.co.kr`: 약 `22,000원/년` (VAT 포함 가정)
- Netlify Personal: `$9/월` ≈ `13,329원/월` ≈ `159,948원/년`
- Cloudflare Pro: `$240/년` ≈ `355,440원/년`
- Microsoft 365 Business Basic 2계정: `8,100원 x 2 x 12 = 194,400원 + VAT`
- VAT 포함 약 `213,840원/년`

합계 예시:

- 약 `776,528원/년`

월 환산:

- 약 `64,700원/월`

평가:

- ISB 규모의 홍보 사이트에 가장 균형이 좋음
- 너무 무료 티가 나지 않으면서 과투자도 아님

### 3. 회사형 강화 운영

용도:

- 운영 이력과 협업 권한까지 조금 더 체계화
- 백업 운영자 포함

구성:

- 권장 운영형 전체
- GitHub Team 2석
- Resend Pro

추가 비용:

- GitHub Team 2석: `$4 x 2 x 12` ≈ `142,176원/년`
  - 현재 GitHub 가격 페이지 기준 `첫 12개월` 가격 표기
- Resend Pro: `$20/월` ≈ `29,620원/월` ≈ `355,440원/년`

총합 예시:

- 약 `1,274,144원/년`

월 환산:

- 약 `106,200원/월`

## 제가 추천하는 최종안

### 지금 바로 실행할 권장안

- 기존 `e-isb.com` 소유권과 만료일 확인
- `e-isb.co.kr` 추가 확보
- 도메인은 한국 등록기관에서 관리
- DNS는 Cloudflare
- 저장소는 GitHub
- 배포는 Netlify Personal
- 메일은 Microsoft 365 Business Basic 2계정
  - 예: `contact@`, `admin@`
- 문의는 Turnstile + Resend Free로 시작
- 관리자 페이지는 내부용으로만 사용

이 구성이 좋은 이유:

- 운영비가 크지 않음
- 회사 사이트로서 부족해 보이지 않음
- 보안/복구/이관이 쉬움
- 추후 확장도 간단함

## 30일 실행 계획

### 1주차

- 도메인 실소유자와 만료일 확인
- GitHub 조직 생성
- Netlify 연결
- Cloudflare DNS 연결

### 2주차

- 회사 메일 2계정 개설
- 문의 수신 주소 확정
- SPF / DKIM / DMARC 설정

### 3주차

- 문의폼 구현
- Turnstile 적용
- 테스트 문의 3회 이상 수행

### 4주차

- 네이버 서치어드바이저 등록
- Google Search Console 등록
- 대표 프로젝트 4~6건 정리
- 운영 문서 및 백업 폴더 정리

## 참고 자료

- [Hosting.kr 도메인 가격 변경 안내 (2026-01-05 적용)](https://help.hosting.kr/hc/ko/articles/53213298419353--%EC%A4%91%EC%9A%94%EA%B3%B5%EC%A7%80-%EB%8F%84%EB%A9%94%EC%9D%B8-%EA%B0%80%EA%B2%A9%EC%9D%B8%EC%83%81-%EC%95%88%EB%82%B4)
- [GitHub Pricing](https://github.com/pricing)
- [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- [GitHub domain verification docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Netlify Pricing](https://www.netlify.com/pricing/)
- [Cloudflare pricing update (Pro $25/mo, $240/yr)](https://blog.cloudflare.com/adjusting-pricing-introducing-annual-plans-and-accelerating-innovation/)
- [Cloudflare Access pricing](https://www.cloudflare.com/en-gb/teams/access/)
- [Cloudflare Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Microsoft 365 Business Basic](https://www.microsoft.com/ko-kr/microsoft-365/business/microsoft-365-business-basic)
- [Google Workspace Pricing](https://workspace.google.com/intl/ko_kr/pricing.html)
- [Resend Pricing](https://resend.com/pricing)
- [네이버 서치어드바이저 시작하기](https://searchadvisor.naver.com/start)
- [네이버 IndexNow 소개](https://searchadvisor.naver.com/guide/indexnow-about)
- [네이버 콘텐츠 마크업 가이드](https://searchadvisor.naver.com/guide/markup-content)
