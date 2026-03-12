# ISB Website Edit Guide

이 사이트는 이제 `구조`와 `내용`이 분리되어 있습니다.

가장 쉬운 운영 방법은 [admin.html](./admin.html) 을 여는 것입니다.

## 가장 쉬운 수정 방법

1. `admin.html` 을 브라우저에서 엽니다.
2. 회사 정보, 대표 프로젝트, 프로젝트 카드를 수정합니다.
3. 같은 브라우저에서만 임시 확인할 때는 `브라우저 저장`을 누릅니다.
4. 실제 배포 사이트에 반영할 때는 `관리 토큰` 입력 후 `사이트 반영`을 누릅니다.
5. `index.html` 을 새로 열면 반영됩니다.

주의:

- `브라우저 저장`은 현재 브라우저의 로컬 저장소를 사용합니다.
- `사이트 반영`은 배포 환경의 API를 통해 실제 사이트 데이터에 저장됩니다.
- 같은 컴퓨터, 같은 브라우저에서는 편하게 쓸 수 있습니다.
- 다른 컴퓨터로 옮기려면 관리자 페이지의 `JSON 내보내기`를 사용하면 됩니다.
- 아주 큰 원본 이미지를 많이 넣으면 브라우저 저장 용량 한계에 걸릴 수 있으니, 메인용 이미지는 적당히 줄인 버전을 권장합니다.

## 가장 자주 수정하는 파일

- `site-data.js`
  - 회사명, 슬로건, 연락처
  - 메인 대표 프로젝트
  - 서비스 소개 문구
  - 프로젝트 카드
  - 지원 섹션 문구

- `index.html`
  - 사이트의 뼈대만 들어 있습니다.
  - 평소에는 거의 수정할 일이 없습니다.

- `styles.css`
  - 색상, 여백, 폰트, 레이아웃을 바꿀 때 수정합니다.

## 새 프로젝트 추가 방법

`site-data.js` 안의 `featuredProjects` 또는 `projects` 배열에 새 항목을 추가하면 됩니다.

### 메인에 크게 노출할 프로젝트

`featuredProjects`에 아래 형식으로 추가합니다.

```js
{
  label: "Featured Case",
  chipIndex: "06",
  chipTitle: "프로젝트 이름",
  chipSubtitle: "행사장 / 시스템 요약",
  title: "메인에 보여줄 전체 제목",
  meta: "카테고리 / 장소 / 시스템",
  summary: "짧은 설명",
  tags: ["Tag 1", "Tag 2", "Tag 3"],
  image: "이미지 URL 또는 경로",
  link: "블로그 글 링크"
}
```

### 아래쪽 프로젝트 카드 추가

`projects` 배열에 아래 형식으로 추가합니다.

```js
{
  category: "카테고리",
  title: "프로젝트명",
  description: "짧은 설명",
  link: "블로그 글 링크"
}
```

## 연락처 수정 방법

`site-data.js`의 `brand` 항목을 수정하면 됩니다.

```js
brand: {
  main: "ISB",
  sub: "Rigging Innovation, Design Collaboration",
  companyName: "인터내셔날 서비스 비지니스 (ISB)",
  phone: "02.525.3711",
  email: "ahn@e-isb.com",
  website: "www.e-isb.com",
  blog: "https://blog.naver.com/e_isb"
}
```

## 이미지 바꾸는 방법

현재는 블로그 공개 이미지 URL을 직접 사용하고 있습니다.

나중에 직접 업로드한 이미지로 바꾸고 싶다면:

1. 이미지를 `assets/source/` 아래에 넣습니다.
2. `site-data.js`의 `image` 값을 그 경로로 바꿉니다.

예시:

```js
image: "./assets/source/project-01.jpg"
```

## 운영 방식 추천

가장 쉬운 운영 방식은 아래 순서입니다.

1. 새 시공 사진 업로드
2. 블로그 글 작성
3. `site-data.js`에 프로젝트 1건 추가
4. 메인 대표 사례가 바뀌어야 하면 `featuredProjects`에도 추가

이렇게 하면 지금 구조에서는 `네이버 블로그 글 + 홈페이지 대표 사례`를 같이 운영하기 편합니다.
