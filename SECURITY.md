# Security Notes

## 민감 정보는 저장소에 직접 넣지 않습니다

아래 값은 코드나 문서 예시 외의 실제 값이 저장소에 들어가면 안 됩니다.

- `ADMIN_WRITE_TOKEN`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- 실제 `.env` 파일

## 공개해도 되는 값

- `turnstileSiteKey`
  - Cloudflare Turnstile Site Key 는 공개값입니다.

## 배포 전 확인

- `.env` 파일이 git에 잡히지 않는지 확인
- 관리자 토큰이 코드에 하드코딩되지 않았는지 확인
- 테스트용 메일 주소가 운영용으로 남아있지 않은지 확인

## 문의 폼 보안 원칙

- Turnstile 적용
- 서버 측 검증
- 입력값 검증
- 허니팟 필드 유지
- 과도한 개인정보 수집 금지

## 계정 보안 원칙

- GitHub, Netlify, Cloudflare, Microsoft 365 또는 Google Workspace 계정에 MFA 적용
- 비밀번호는 서비스별로 다르게 사용
- 최소 2명 이상이 핵심 계정 복구 가능
