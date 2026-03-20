const storage = window.siteStorage;
const runtimeConfig = window.siteRuntimeConfig || {};
const isLocalFile = window.location.protocol === "file:";

const statusText = document.querySelector("#status-text");
const statusDetail = document.querySelector("#status-detail");
const draftSaveButton = document.querySelector("#draft-save-button");
const publishButton = document.querySelector("#publish-button");
const exportButton = document.querySelector("#export-button");
const importButton = document.querySelector("#import-button");
const importFile = document.querySelector("#import-file");
const resetButton = document.querySelector("#reset-button");
const adminTokenInput = document.querySelector("#admin-token");
const toggleTokenVisibilityButton = document.querySelector("#toggle-token-visibility");

const sessionTokenKey = "isb-admin-token";
const MAX_IMAGE_DIMENSION = 2200;
const IMAGE_EXPORT_QUALITY = 0.9;
const EMBEDDED_IMAGE_RECOMPRESS_THRESHOLD = 450 * 1024;
const MAX_PUBLISH_PAYLOAD_BYTES = Math.round(4.5 * 1024 * 1024);
const MAX_ASSET_UPLOAD_BYTES = Math.round(4.2 * 1024 * 1024);

const clone = (value) => JSON.parse(JSON.stringify(value));

const toObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const toStringValue = (value, fallback = "") => (typeof value === "string" ? value : fallback);

const normalizeFeaturedProject = (item, index) => {
  const project = toObject(item);

  return {
    label: toStringValue(project.label, "Featured Case"),
    chipIndex: toStringValue(project.chipIndex, String(index + 1).padStart(2, "0")),
    chipTitle: toStringValue(project.chipTitle),
    chipSubtitle: toStringValue(project.chipSubtitle),
    title: toStringValue(project.title),
    meta: toStringValue(project.meta),
    summary: toStringValue(project.summary),
    tags: Array.isArray(project.tags)
      ? project.tags.map((tag) => toStringValue(tag)).filter(Boolean)
      : [],
    image: toStringValue(project.image),
    link: toStringValue(project.link),
  };
};

const normalizeAboutValue = (item) => {
  const value = toObject(item);

  return {
    title: toStringValue(value.title),
    description: toStringValue(value.description),
  };
};

const normalizeSolution = (item, index) => {
  const value = toObject(item);

  return {
    index: toStringValue(value.index, String(index + 1).padStart(2, "0")),
    title: toStringValue(value.title),
    description: toStringValue(value.description),
  };
};

const normalizeProject = (item, index) => {
  const project = toObject(item);

  return {
    index: toStringValue(project.index, String(index + 1).padStart(2, "0")),
    category: toStringValue(project.category),
    detail: toStringValue(project.detail),
    title: toStringValue(project.title),
    description: toStringValue(project.description),
    image: toStringValue(project.image),
    link: toStringValue(project.link),
  };
};

const normalizeSupportItem = (item) => {
  const value = toObject(item);

  return {
    title: toStringValue(value.title),
    description: toStringValue(value.description),
  };
};

const ensureStateShape = (value) => {
  const base = storage ? storage.getDefaultData() : clone(window.defaultSiteData || {});
  const merged = storage?.mergeData ? storage.mergeData(base, value || {}) : { ...base, ...(value || {}) };

  merged.brand = toObject(merged.brand);
  merged.brand.main = toStringValue(merged.brand.main);
  merged.brand.sub = toStringValue(merged.brand.sub);
  merged.brand.companyName = toStringValue(merged.brand.companyName);
  merged.brand.companyIntro = toStringValue(merged.brand.companyIntro);
  merged.brand.phone = toStringValue(merged.brand.phone);
  merged.brand.email = toStringValue(merged.brand.email);
  merged.brand.website = toStringValue(merged.brand.website);
  merged.brand.blog = toStringValue(merged.brand.blog);

  merged.hero = toObject(merged.hero);
  merged.hero.eyebrow = toStringValue(merged.hero.eyebrow);
  merged.hero.title = toStringValue(merged.hero.title);
  merged.hero.description = toStringValue(merged.hero.description);

  merged.featuredProjects = Array.isArray(merged.featuredProjects)
    ? merged.featuredProjects.map(normalizeFeaturedProject)
    : [];
  merged.solutions = Array.isArray(merged.solutions) ? merged.solutions.map(normalizeSolution) : [];
  merged.projects = Array.isArray(merged.projects) ? merged.projects.map(normalizeProject) : [];

  merged.introBand = toStringValue(merged.introBand);

  merged.about = toObject(merged.about);
  merged.about.title = toStringValue(merged.about.title);
  merged.about.description = toStringValue(merged.about.description);
  merged.about.values = Array.isArray(merged.about.values) ? merged.about.values.map(normalizeAboutValue) : [];

  merged.support = toObject(merged.support);
  merged.support.title = toStringValue(merged.support.title);
  merged.support.description = toStringValue(merged.support.description);
  merged.support.items = Array.isArray(merged.support.items)
    ? merged.support.items.map(normalizeSupportItem)
    : [];

  return merged;
};

let state = ensureStateShape(storage ? storage.loadSiteData() : window.defaultSiteData || {});

if (adminTokenInput) {
  adminTokenInput.value = window.sessionStorage.getItem(sessionTokenKey) || "";
  adminTokenInput.addEventListener("input", (event) => {
    window.sessionStorage.setItem(sessionTokenKey, event.target.value);
  });
}

const syncTokenVisibilityLabel = () => {
  if (!adminTokenInput || !toggleTokenVisibilityButton) {
    return;
  }

  const isVisible = adminTokenInput.type === "text";
  toggleTokenVisibilityButton.textContent = isVisible ? "숨기기" : "보기";
  toggleTokenVisibilityButton.setAttribute("aria-pressed", String(isVisible));
};

toggleTokenVisibilityButton?.addEventListener("click", () => {
  if (!adminTokenInput) {
    return;
  }

  adminTokenInput.type = adminTokenInput.type === "password" ? "text" : "password";
  syncTokenVisibilityLabel();
});

syncTokenVisibilityLabel();

const defaultFeaturedProject = () => ({
  label: "Featured Case",
  chipIndex: String((state.featuredProjects?.length || 0) + 1).padStart(2, "0"),
  chipTitle: "새 대표 사례",
  chipSubtitle: "행사명 / 시스템",
  title: "대표 시공 사례 제목",
  meta: "카테고리 / 장소 / 시스템",
  summary: "대표 사례 설명을 입력해주세요.",
  tags: ["New Project", "ISB"],
  image: "",
  link: "",
});

const defaultAboutValue = () => ({
  title: "새 강점",
  description: "강점 설명을 입력해주세요.",
});

const defaultSolution = () => ({
  index: String((state.solutions?.length || 0) + 1).padStart(2, "0"),
  title: "새 서비스",
  description: "서비스 설명을 입력해주세요.",
});

const defaultProject = () => ({
  category: "프로젝트 분류",
  title: "프로젝트명",
  description: "프로젝트 설명을 입력해주세요.",
  link: "",
});

const defaultSupportItem = () => ({
  title: "새 지원 카드",
  description: "지원 카드 설명을 입력해주세요.",
});

const setStatus = (title, detail) => {
  if (statusText) {
    statusText.textContent = title;
  }

  if (statusDetail) {
    statusDetail.textContent = detail;
  }
};

const markDirty = () => {
  setStatus("수정 중", "이 PC에만 저장하거나 공개 사이트 반영을 진행해주세요.");
};

const markDraftSaved = () => {
  setStatus("이 PC에만 저장 완료", "현재 브라우저에만 임시 저장되었습니다. 공개 사이트 반영은 별도로 진행해주세요.");
};

const markPublished = () => {
  setStatus("공개 사이트 반영 완료", "배포된 사이트 데이터에 저장되었습니다. 홈페이지에서 Ctrl+F5로 새로고침해 확인해주세요.");
};

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0KB";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
};

const estimateUtf8Bytes = (value) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return new TextEncoder().encode(text).length;
};

const getDataUrlMimeType = (dataUrl = "") => {
  const start = "data:";
  const separatorIndex = dataUrl.indexOf(";");

  if (!dataUrl.startsWith(start) || separatorIndex <= start.length) {
    return "";
  }

  return dataUrl.slice(start.length, separatorIndex);
};

const estimateDataUrlBinaryBytes = (dataUrl = "") => {
  const base64Marker = ";base64,";
  const markerIndex = dataUrl.indexOf(base64Marker);

  if (markerIndex < 0) {
    return 0;
  }

  const base64Body = dataUrl.slice(markerIndex + base64Marker.length);
  const padding = base64Body.endsWith("==") ? 2 : base64Body.endsWith("=") ? 1 : 0;

  return Math.max(0, Math.floor((base64Body.length * 3) / 4) - padding);
};

const extensionFromMimeType = (mimeType = "") => {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("jpeg")) {
    return "jpg";
  }

  if (normalized.includes("png")) {
    return "png";
  }

  if (normalized.includes("webp")) {
    return "webp";
  }

  if (normalized.includes("gif")) {
    return "gif";
  }

  if (normalized.includes("avif")) {
    return "avif";
  }

  if (normalized.includes("svg")) {
    return "svg";
  }

  return "bin";
};

const sanitizeAssetStem = (value = "image") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "image";

const dataUrlToFile = async (dataUrl, fileStem = "image") => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = extensionFromMimeType(blob.type);
  return new File([blob], `${sanitizeAssetStem(fileStem)}.${extension}`, { type: blob.type || "application/octet-stream" });
};

const uploadAssetFile = async (file, adminToken, fileStem = "image") => {
  if (!runtimeConfig.adminAssetUploadEndpoint) {
    throw new Error("이미지 업로드 경로가 아직 설정되지 않았습니다.");
  }

  if (!file || file.size <= 0) {
    throw new Error("업로드할 이미지 파일을 찾지 못했습니다.");
  }

  if (file.size > MAX_ASSET_UPLOAD_BYTES) {
    throw new Error(
      `이미지 한 장이 너무 큽니다. 현재 파일 크기: ${formatBytes(file.size)}. 한 장 기준 ${formatBytes(MAX_ASSET_UPLOAD_BYTES)} 이하 이미지를 사용해주세요.`,
    );
  }

  const preparedFile =
    file.name && /\.[a-z0-9]+$/i.test(file.name)
      ? file
      : new File([file], `${sanitizeAssetStem(fileStem)}.${extensionFromMimeType(file.type)}`, {
          type: file.type || "application/octet-stream",
        });

  const formData = new FormData();
  formData.append("file", preparedFile, preparedFile.name);

  const response = await fetch(runtimeConfig.adminAssetUploadEndpoint, {
    method: "POST",
    headers: {
      "x-admin-token": adminToken,
    },
    body: formData,
  });

  const rawText = await response.text();
  let result = {};

  try {
    result = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    result = {};
  }

  if (!response.ok || !result?.url) {
    throw new Error(result.message || `이미지 업로드에 실패했습니다. (${response.status})`);
  }

  return result.url;
};

const uploadAssetSource = async (dataUrl, adminToken, fileStem = "image") => {
  const binaryBytes = estimateDataUrlBinaryBytes(dataUrl);

  if (binaryBytes > MAX_ASSET_UPLOAD_BYTES) {
    throw new Error(
      `이미지 한 장이 너무 큽니다. 현재 파일 크기: ${formatBytes(binaryBytes)}. 관리자 업로드는 ${formatBytes(
        MAX_ASSET_UPLOAD_BYTES,
      )} 안쪽 파일이 가장 안정적입니다. 큰 원본이나 GIF는 정적 파일 경로 방식이 더 적합합니다.`,
    );
  }

  const response = await fetch(runtimeConfig.adminAssetUploadEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": adminToken,
    },
    body: JSON.stringify({
      dataUrl,
      fileName: `${sanitizeAssetStem(fileStem)}.${extensionFromMimeType(getDataUrlMimeType(dataUrl) || "image/jpeg")}`,
    }),
  });

  const rawText = await response.text();
  let result = {};

  try {
    result = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    result = {};
  }

  if (!response.ok || !result?.url) {
    throw new Error(result.message || `이미지 업로드에 실패했습니다. (${response.status})`);
  }

  return result.url;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = src;
  });

const compressImageSource = async (src, force = false) => {
  if (!src?.startsWith("data:image/")) {
    return src;
  }

  if (src.startsWith("data:image/gif") || src.startsWith("data:image/svg+xml")) {
    return src;
  }

  const sourceBytes = estimateUtf8Bytes(src);
  if (!force && sourceBytes < EMBEDDED_IMAGE_RECOMPRESS_THRESHOLD) {
    return src;
  }

  const image = await loadImageElement(src);
  const longestSide = Math.max(image.naturalWidth || 0, image.naturalHeight || 0) || 1;
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / longestSide);
  const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    return src;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let optimized = canvas.toDataURL("image/webp", IMAGE_EXPORT_QUALITY);
  if (!optimized || optimized === "data:,") {
    optimized = canvas.toDataURL("image/jpeg", IMAGE_EXPORT_QUALITY);
  }

  if (!optimized || optimized === "data:,") {
    return src;
  }

  const optimizedBytes = estimateUtf8Bytes(optimized);
  if (!force && optimizedBytes >= sourceBytes) {
    return src;
  }

  return optimized;
};

const optimizeStateImagesForPublish = async (currentState) => {
  const nextState = ensureStateShape(clone(currentState));

  for (const project of nextState.featuredProjects) {
    project.image = await compressImageSource(project.image);
  }

  for (const project of nextState.projects) {
    project.image = await compressImageSource(project.image);
  }

  return nextState;
};

const collectImageTargets = (currentState) => [
  ...currentState.featuredProjects.map((project, index) => ({
    owner: project,
    key: "image",
    label: project.chipTitle || project.title || `featured-${index + 1}`,
  })),
  ...currentState.projects.map((project, index) => ({
    owner: project,
    key: "image",
    label: project.title || `project-${index + 1}`,
  })),
];

const uploadEmbeddedImagesForPublish = async (currentState, adminToken) => {
  const nextState = ensureStateShape(clone(currentState));
  const uploadCache = new Map();
  const targets = collectImageTargets(nextState).filter(({ owner, key }) => owner[key]?.startsWith("data:image/"));

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    const source = target.owner[target.key];

    if (uploadCache.has(source)) {
      target.owner[target.key] = uploadCache.get(source);
      continue;
    }

    setStatus(
      "이미지 업로드 중",
      `반영용 이미지를 서버 저장소에 올리고 있습니다. ${index + 1}/${targets.length}`,
    );

    const uploadedUrl = await uploadAssetSource(source, adminToken, target.label);

    uploadCache.set(source, uploadedUrl);
    target.owner[target.key] = uploadedUrl;
  }

  return nextState;
};

const createField = ({ label, value, type = "text", full = false, onChange, help }) => {
  const wrapper = document.createElement("div");
  wrapper.className = `field${full ? " full" : ""}`;

  const labelElement = document.createElement("label");
  labelElement.textContent = label;
  wrapper.appendChild(labelElement);

  let input;

  if (type === "textarea") {
    input = document.createElement("textarea");
    input.value = value || "";
  } else {
    input = document.createElement("input");
    input.type = type === "tags" ? "text" : type;
    input.value = value || "";
  }

  input.addEventListener("input", (event) => {
    onChange(event.target.value);
    markDirty();
  });

  wrapper.appendChild(input);

  if (help) {
    const helpElement = document.createElement("div");
    helpElement.className = "form-help";
    helpElement.textContent = help;
    wrapper.appendChild(helpElement);
  }

  return wrapper;
};

const createImageField = ({ label, value, onChange }) => {
  const wrapper = document.createElement("div");
  wrapper.className = "field full";

  const labelElement = document.createElement("label");
  labelElement.textContent = label;
  wrapper.appendChild(labelElement);

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.value = value || "";
  urlInput.placeholder = "이미지 URL 또는 업로드한 데이터";
  wrapper.appendChild(urlInput);

  const helpElement = document.createElement("div");
  helpElement.className = "form-help";
  helpElement.textContent = "컴퓨터 사진은 업로드 시 자동으로 용량을 줄여 저장합니다. 원본이 크면 몇 초 정도 걸릴 수 있습니다.";
  wrapper.appendChild(helpElement);
  helpElement.textContent =
    "컴퓨터 사진은 여기서 미리보기로 들어가고, 공개 사이트 반영할 때 서버에 개별 업로드됩니다. 큰 원본 사진은 이 방식이 더 안정적입니다.";

  const preview = document.createElement("div");
  preview.className = "image-preview";
  const previewImage = document.createElement("img");
  previewImage.alt = label;
  previewImage.src = value || "";
  preview.appendChild(previewImage);

  urlInput.addEventListener("input", (event) => {
    onChange(event.target.value);
    previewImage.src = event.target.value;
    markDirty();
  });

  const tools = document.createElement("div");
  tools.className = "image-tools";

  const uploadButton = document.createElement("label");
  uploadButton.className = "admin-button ghost upload-button";
  uploadButton.textContent = "컴퓨터에서 이미지 올리기";

  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setStatus("이미지 최적화 중", `${file.name} 파일을 반영용 크기로 정리하고 있습니다.`);

    try {
      const original = await readFileAsDataUrl(file);
      const optimized = file.type === "image/gif" ? original : await compressImageSource(original);
      const keptOriginal = estimateUtf8Bytes(optimized) >= estimateUtf8Bytes(original);

      urlInput.value = optimized;
      onChange(optimized);
      previewImage.src = optimized;
      markDirty();
      setStatus(
        file.type === "image/gif" ? "GIF 준비 완료" : "이미지 준비 완료",
        file.type === "image/gif"
          ? `${file.name} GIF는 애니메이션 유지를 위해 원본으로 저장했습니다. 용량이 크면 공개 사이트 반영 단계에서 실패할 수 있습니다.`
          : keptOriginal
            ? `${file.name} 이미지는 현재 크기 ${formatBytes(
                estimateUtf8Bytes(original),
              )}로 유지했습니다. 공개 사이트 반영을 눌러주세요.`
            : `${file.name} 이미지를 ${formatBytes(estimateUtf8Bytes(original))}에서 ${formatBytes(
                estimateUtf8Bytes(optimized),
              )}로 정리했습니다. 공개 사이트 반영을 눌러주세요.`,
      );
      if (file.size > MAX_ASSET_UPLOAD_BYTES) {
        setStatus(
          "대용량 이미지 안내",
          `${file.name} 파일 크기 ${formatBytes(
            file.size,
          )}는 관리자 업로드 권장 한도를 넘습니다. 미리보기는 되지만 공개 사이트 반영 단계에서는 실패할 수 있습니다.`,
        );
      }
    } catch (error) {
      setStatus("이미지 처리 실패", error.message || "이미지 파일을 처리하지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  });

  uploadButton.appendChild(uploadInput);
  tools.appendChild(uploadButton);

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "admin-button ghost";
  clearButton.textContent = "이미지 비우기";
  clearButton.addEventListener("click", () => {
    urlInput.value = "";
    onChange("");
    previewImage.src = "";
    markDirty();
  });
  tools.appendChild(clearButton);

  wrapper.appendChild(tools);
  wrapper.appendChild(preview);

  return wrapper;
};

const renderSimpleFields = (containerSelector, fields) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    return;
  }

  container.innerHTML = "";
  fields.forEach((field) => container.appendChild(createField(field)));
};

const createItemCard = ({ title, subtitle, onMoveUp, onMoveDown, onDelete }) => {
  const card = document.createElement("article");
  card.className = "item-card";

  const head = document.createElement("div");
  head.className = "item-card-head";

  const titleWrap = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = title;
  titleWrap.appendChild(strong);

  if (subtitle) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = subtitle;
    titleWrap.appendChild(hint);
  }

  const actions = document.createElement("div");
  actions.className = "item-card-actions";

  [
    { text: "위로", onClick: onMoveUp },
    { text: "아래로", onClick: onMoveDown },
    { text: "삭제", onClick: onDelete, danger: true },
  ].forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mini-button${action.danger ? " danger" : ""}`;
    button.textContent = action.text;
    button.addEventListener("click", action.onClick);
    actions.appendChild(button);
  });

  head.appendChild(titleWrap);
  head.appendChild(actions);
  card.appendChild(head);
  return card;
};

const swapItems = (list, first, second) => {
  if (!list || first < 0 || second < 0 || first >= list.length || second >= list.length) {
    return;
  }

  [list[first], list[second]] = [list[second], list[first]];
  markDirty();
};

const createTextFieldsForItem = (card, item, fields) => {
  const grid = document.createElement("div");
  grid.className = "form-grid";

  fields.forEach((field) => {
    if (field.type === "image") {
      grid.appendChild(
        createImageField({
          label: field.label,
          value: item[field.key],
          onChange: (value) => {
            item[field.key] = value;
          },
        }),
      );
      return;
    }

    grid.appendChild(
      createField({
        label: field.label,
        type: field.type,
        full: field.full,
        value: field.type === "tags" ? (item[field.key] || []).join(", ") : item[field.key],
        onChange: (value) => {
          item[field.key] =
            field.type === "tags"
              ? value
                  .split(",")
                  .map((token) => token.trim())
                  .filter(Boolean)
              : value;
        },
        help: field.help,
      }),
    );
  });

  card.appendChild(grid);
};

const renderFeaturedProjects = () => {
  const container = document.querySelector("#featured-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.featuredProjects.forEach((project, index) => {
    const card = createItemCard({
      title: project.chipTitle || `대표 사례 ${index + 1}`,
      subtitle: project.chipSubtitle || project.meta || "",
      onMoveUp: () => {
        swapItems(state.featuredProjects, index, index - 1);
        renderAll();
      },
      onMoveDown: () => {
        swapItems(state.featuredProjects, index, index + 1);
        renderAll();
      },
      onDelete: () => {
        state.featuredProjects.splice(index, 1);
        markDirty();
        renderAll();
      },
    });

    createTextFieldsForItem(card, project, [
      { key: "chipIndex", label: "번호" },
      { key: "label", label: "상단 라벨" },
      { key: "chipTitle", label: "카드 제목" },
      { key: "chipSubtitle", label: "카드 부제", full: true },
      { key: "title", label: "상세 제목", full: true },
      { key: "meta", label: "메타 정보", full: true },
      { key: "summary", label: "요약 설명", type: "textarea", full: true },
      {
        key: "tags",
        label: "태그",
        type: "tags",
        full: true,
        help: "쉼표로 구분합니다. 예: Truss Rigging, G-TLD, KINTEX",
      },
      { key: "image", label: "대표 이미지", type: "image", full: true },
      { key: "link", label: "관련 링크", full: true },
    ]);

    container.appendChild(card);
  });
};

const renderAboutValues = () => {
  const container = document.querySelector("#about-values-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.about.values.forEach((item, index) => {
    const card = createItemCard({
      title: item.title || `강점 ${index + 1}`,
      onMoveUp: () => {
        swapItems(state.about.values, index, index - 1);
        renderAll();
      },
      onMoveDown: () => {
        swapItems(state.about.values, index, index + 1);
        renderAll();
      },
      onDelete: () => {
        state.about.values.splice(index, 1);
        markDirty();
        renderAll();
      },
    });

    createTextFieldsForItem(card, item, [
      { key: "title", label: "제목" },
      { key: "description", label: "설명", type: "textarea", full: true },
    ]);

    container.appendChild(card);
  });
};

const renderSolutions = () => {
  const container = document.querySelector("#solutions-list-admin");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.solutions.forEach((item, index) => {
    const card = createItemCard({
      title: item.title || `서비스 ${index + 1}`,
      subtitle: item.index || "",
      onMoveUp: () => {
        swapItems(state.solutions, index, index - 1);
        renderAll();
      },
      onMoveDown: () => {
        swapItems(state.solutions, index, index + 1);
        renderAll();
      },
      onDelete: () => {
        state.solutions.splice(index, 1);
        markDirty();
        renderAll();
      },
    });

    createTextFieldsForItem(card, item, [
      { key: "index", label: "번호" },
      { key: "title", label: "제목" },
      { key: "description", label: "설명", type: "textarea", full: true },
    ]);

    container.appendChild(card);
  });
};

const renderProjects = () => {
  const container = document.querySelector("#projects-list-admin");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.projects.forEach((item, index) => {
    const card = createItemCard({
      title: item.title || `프로젝트 ${index + 1}`,
      subtitle: item.category || "",
      onMoveUp: () => {
        swapItems(state.projects, index, index - 1);
        renderAll();
      },
      onMoveDown: () => {
        swapItems(state.projects, index, index + 1);
        renderAll();
      },
      onDelete: () => {
        state.projects.splice(index, 1);
        markDirty();
        renderAll();
      },
    });

    createTextFieldsForItem(card, item, [
      { key: "category", label: "카테고리" },
      { key: "title", label: "제목" },
      { key: "description", label: "설명", type: "textarea", full: true },
      { key: "link", label: "관련 링크", full: true },
    ]);

    container.appendChild(card);
  });
};

const renderSupportItems = () => {
  const container = document.querySelector("#support-items-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.support.items.forEach((item, index) => {
    const card = createItemCard({
      title: item.title || `지원 카드 ${index + 1}`,
      onMoveUp: () => {
        swapItems(state.support.items, index, index - 1);
        renderAll();
      },
      onMoveDown: () => {
        swapItems(state.support.items, index, index + 1);
        renderAll();
      },
      onDelete: () => {
        state.support.items.splice(index, 1);
        markDirty();
        renderAll();
      },
    });

    createTextFieldsForItem(card, item, [
      { key: "title", label: "제목" },
      { key: "description", label: "설명", type: "textarea", full: true },
    ]);

    container.appendChild(card);
  });
};

const renderTopFields = () => {
  renderSimpleFields("#brand-fields", [
    {
      label: "브랜드명",
      value: state.brand.main,
      onChange: (value) => {
        state.brand.main = value;
      },
    },
    {
      label: "슬로건",
      value: state.brand.sub,
      onChange: (value) => {
        state.brand.sub = value;
      },
    },
    {
      label: "회사명",
      value: state.brand.companyName,
      onChange: (value) => {
        state.brand.companyName = value;
      },
    },
    {
      label: "전화번호",
      value: state.brand.phone,
      onChange: (value) => {
        state.brand.phone = value;
      },
    },
    {
      label: "이메일",
      value: state.brand.email,
      onChange: (value) => {
        state.brand.email = value;
      },
    },
    {
      label: "웹사이트",
      value: state.brand.website,
      onChange: (value) => {
        state.brand.website = value;
      },
    },
    {
      label: "블로그 링크",
      value: state.brand.blog,
      onChange: (value) => {
        state.brand.blog = value;
      },
      full: true,
    },
    {
      label: "회사 소개 짧은 설명",
      value: state.brand.companyIntro,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.brand.companyIntro = value;
      },
    },
  ]);

  renderSimpleFields("#hero-fields", [
    {
      label: "상단 영문 라벨",
      value: state.hero.eyebrow,
      onChange: (value) => {
        state.hero.eyebrow = value;
      },
    },
    {
      label: "메인 제목",
      value: state.hero.title,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.hero.title = value;
      },
    },
    {
      label: "메인 설명",
      value: state.hero.description,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.hero.description = value;
      },
    },
  ]);

  renderSimpleFields("#about-fields", [
    {
      label: "About 제목",
      value: state.about.title,
      onChange: (value) => {
        state.about.title = value;
      },
      full: true,
    },
    {
      label: "About 설명",
      value: state.about.description,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.about.description = value;
      },
    },
  ]);

  renderSimpleFields("#intro-fields", [
    {
      label: "중간 소개 문구",
      value: state.introBand,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.introBand = value;
      },
    },
  ]);

  renderSimpleFields("#support-fields", [
    {
      label: "Support 제목",
      value: state.support.title,
      onChange: (value) => {
        state.support.title = value;
      },
      full: true,
    },
    {
      label: "Support 설명",
      value: state.support.description,
      type: "textarea",
      full: true,
      onChange: (value) => {
        state.support.description = value;
      },
    },
  ]);
};

const renderAll = () => {
  renderTopFields();
  renderFeaturedProjects();
  renderAboutValues();
  renderSolutions();
  renderProjects();
  renderSupportItems();
};

const saveDraftLocally = () => {
  if (!storage) {
    setStatus("저장 불가", "이 브라우저에서는 로컬 저장을 사용할 수 없습니다.");
    return;
  }

  storage.saveSiteData(state);
  markDraftSaved();
};

const loadPublishedData = async () => {
  if (isLocalFile || !runtimeConfig.siteDataEndpoint || !window.fetch) {
    if (isLocalFile) {
      setStatus("로컬 편집 모드", "로컬 파일에서는 브라우저 저장과 JSON 백업 위주로 사용해주세요.");
    }
    return;
  }

  try {
    const response = await fetch(runtimeConfig.siteDataEndpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    const remoteData = result?.data || result;

    if (storage?.hasLikelyEncodingCorruption?.(remoteData)) {
      storage?.resetSiteData?.();
      state = ensureStateShape(storage?.getDefaultData ? storage.getDefaultData() : window.defaultSiteData || {});
      storage?.saveSiteData(state);
      renderAll();
      setStatus(
        "원격 데이터 복구 필요",
        "배포 저장소 데이터가 깨져 기본 데이터로 복원했습니다. 토큰을 입력한 뒤 사이트 반영을 다시 눌러 주세요.",
      );
      return;
    }

    state = ensureStateShape(remoteData);
    renderAll();
    setStatus("사이트 데이터 로드 완료", "현재 배포된 사이트 데이터를 불러왔습니다.");
  } catch (error) {
    setStatus("원격 데이터 로드 실패", "기본 데이터로 편집 중입니다. 네트워크 또는 함수 배포 상태를 확인해주세요.");
  }
};

const publishToSite = async () => {
  if (isLocalFile || !runtimeConfig.adminPublishEndpoint) {
    setStatus("사이트 반영 불가", "배포된 환경에서만 사이트 반영이 가능합니다.");
    return;
  }

  const adminToken = adminTokenInput?.value?.trim();
  if (!adminToken) {
    setStatus("관리자 토큰 필요", "사이트 반영을 위해 관리자 토큰을 입력해주세요.");
    return;
  }

  publishButton.disabled = true;
  setStatus("이미지와 데이터를 점검 중", "업로드한 이미지 크기와 반영 데이터를 정리하고 있습니다.");

  try {
    state = ensureStateShape(state);
    renderAll();

    const optimizedState = await optimizeStateImagesForPublish(state);
    const publishState = runtimeConfig.adminAssetUploadEndpoint
      ? await uploadEmbeddedImagesForPublish(optimizedState, adminToken)
      : optimizedState;
    const payloadJson = JSON.stringify({ data: publishState });
    const payloadBytes = estimateUtf8Bytes(payloadJson);

    if (payloadBytes > MAX_PUBLISH_PAYLOAD_BYTES) {
      throw new Error(
        `업로드한 이미지가 너무 커서 반영할 수 없습니다. 현재 반영 데이터 크기: ${formatBytes(payloadBytes)}. 대표 시공 이미지 수를 줄이거나 더 작은 사진을 사용해주세요.`,
      );
    }

    state = ensureStateShape(publishState);
    renderAll();
    setStatus("공개 사이트 반영 중", `서버 저장소에 데이터를 업로드하고 있습니다. 현재 크기 ${formatBytes(payloadBytes)}`);

    const response = await fetch(runtimeConfig.adminPublishEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
      },
      body: payloadJson,
    });

    const rawText = await response.text();
    let result = {};
    try {
      result = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
      result = {};
    }

    if (!response.ok) {
      throw new Error(result.message || `사이트 반영에 실패했습니다. (${response.status})`);
    }

    storage?.saveSiteData(state);
    markPublished();
  } catch (error) {
    setStatus("사이트 반영 실패", error.message || "관리자 토큰 또는 서버 설정을 확인해주세요.");
  } finally {
    publishButton.disabled = false;
  }
};

document.querySelector("#add-featured-button")?.addEventListener("click", () => {
  state.featuredProjects.push(defaultFeaturedProject());
  markDirty();
  renderAll();
});

document.querySelector("#add-about-value-button")?.addEventListener("click", () => {
  state.about.values.push(defaultAboutValue());
  markDirty();
  renderAll();
});

document.querySelector("#add-solution-button")?.addEventListener("click", () => {
  state.solutions.push(defaultSolution());
  markDirty();
  renderAll();
});

document.querySelector("#add-project-button")?.addEventListener("click", () => {
  state.projects.push(defaultProject());
  markDirty();
  renderAll();
});

document.querySelector("#add-support-item-button")?.addEventListener("click", () => {
  state.support.items.push(defaultSupportItem());
  markDirty();
  renderAll();
});

draftSaveButton?.addEventListener("click", saveDraftLocally);
publishButton?.addEventListener("click", publishToSite);

resetButton?.addEventListener("click", () => {
  const ok = window.confirm("로컬 저장 내용과 현재 편집값을 기본값으로 되돌릴까요?");
  if (!ok) {
    return;
  }

  storage?.resetSiteData();
  state = ensureStateShape(window.defaultSiteData || {});
  renderAll();
  setStatus("초기값 복원", "기본 데이터로 되돌렸습니다. 필요하면 사이트 반영을 다시 진행해주세요.");
});

exportButton?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "isb-site-data.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("내보내기 완료", "현재 편집 데이터를 JSON 파일로 저장했습니다.");
});

importButton?.addEventListener("click", () => importFile?.click());

importFile?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state = ensureStateShape(parsed);
    renderAll();
    markDirty();
    setStatus("가져오기 완료", "불러온 데이터를 검토한 뒤 브라우저 저장 또는 사이트 반영을 진행해주세요.");
  } catch (error) {
    setStatus("가져오기 실패", "JSON 형식이 올바른지 확인해주세요.");
  }

  event.target.value = "";
});

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveDraftLocally();
  }
});

renderAll();
loadPublishedData();
