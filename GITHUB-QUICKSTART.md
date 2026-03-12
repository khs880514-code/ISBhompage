# GitHub Quickstart

## 1. GitHub에서 새 저장소 만들기

권장 저장소 이름:

- `isb-website`

초기화 옵션은 비워두는 편이 안전합니다.

- `README` 생성 안 함
- `.gitignore` 생성 안 함
- License 생성 안 함

이 프로젝트 안에 이미 필요한 파일이 들어 있습니다.

## 2. 로컬에서 업로드하기

PowerShell 기준:

```powershell
git status
git add .
git commit -m "Initial ISB website setup"
git remote add origin https://github.com/<org-or-user>/isb-website.git
git push -u origin main
```

## 3. 업로드 전에 꼭 확인할 것

- `.env` 파일이 저장소에 포함되지 않는지 확인
- `ADMIN_WRITE_TOKEN` 같은 민감한 값이 코드에 직접 들어가 있지 않은지 확인
- `site-config.js` 의 `turnstileSiteKey` 만 공개값인지 확인
- `skills`, `prompts`, `tools`, `.codex` 같은 로컬 보조 폴더가 git에 안 잡히는지 확인

## 4. 업로드 후 바로 할 일

1. GitHub 저장소 Settings 확인
2. Netlify에서 저장소 연결
3. 환경변수 입력
4. Cloudflare 도메인 연결
5. 문의 폼 테스트
6. 관리자 페이지 발행 테스트

## 5. 권장 Git 운영 규칙

- 운영 배포 브랜치: `main`
- 실험/수정 브랜치: `staging` 또는 기능별 브랜치
- 큰 디자인 변경이나 문의 기능 수정은 바로 `main` 에 넣지 않고 한 번 확인 후 반영

## 6. 첫 업로드 후 확인 명령

```powershell
git remote -v
git branch
git status
```

출력 기준:

- `origin` 이 정상 등록되어 있어야 함
- 현재 브랜치가 `main` 이어야 함
- `git status` 가 깨끗해야 함
