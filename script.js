const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const storage = window.siteStorage;
const runtimeConfig = window.siteRuntimeConfig || {};
const isLocalFile = window.location.protocol === "file:";

const getBaseSiteData = () => {
  if (storage) {
    return storage.loadSiteData();
  }

  return window.defaultSiteData || {};
};

let siteData = getBaseSiteData();
let effectiveRuntimeConfig = { ...runtimeConfig };

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && typeof value === "string") {
    element.textContent = value;
  }
};

const applyBrand = () => {
  const brand = siteData.brand || {};
  document.title = `${brand.main || "ISB"} | ${brand.sub || "Rigging Innovation, Design Collaboration"}`;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && brand.companyIntro) {
    metaDescription.setAttribute("content", brand.companyIntro);
  }

  setText("#brand-main", brand.main);
  setText("#brand-sub", brand.sub);
  setText("#hero-eyebrow", siteData.hero?.eyebrow);
  setText("#hero-title", siteData.hero?.title);
  setText("#hero-description", siteData.hero?.description);
  setText("#intro-band-text", siteData.introBand);
  setText("#about-title", siteData.about?.title);
  setText("#about-description", siteData.about?.description);
  setText("#support-title", siteData.support?.title);
  setText("#support-description", siteData.support?.description);

  const emailLink = document.querySelector("#contact-email-link");
  if (emailLink && brand.email) {
    emailLink.href = `mailto:${brand.email}`;
  }

  const blogLink = document.querySelector("#contact-blog-link");
  if (blogLink && brand.blog) {
    blogLink.href = brand.blog;
  }
};

const renderAboutValues = () => {
  const container = document.querySelector("#about-values");
  const values = siteData.about?.values || [];

  if (!container) {
    return;
  }

  container.innerHTML = values
    .map(
      (value, index) => `
        <article class="value-card reveal">
          <span class="value-card-index">${value.index || String(index + 1).padStart(2, "0")}</span>
          <strong>${value.title}</strong>
          <p>${value.description}</p>
        </article>
      `,
    )
    .join("");
};

const projectChipsContainer = document.querySelector("#project-selector");
const heroStage = document.querySelector("#hero-stage");
const heroCaseLabel = document.querySelector("#hero-case-label");
const heroCaseTitle = document.querySelector("#hero-case-title");
const heroCaseMeta = document.querySelector("#hero-case-meta");
const heroCaseSummary = document.querySelector("#hero-case-summary");
const heroCaseTags = document.querySelector("#hero-case-tags");
const heroCaseLink = document.querySelector("#hero-case-link");
const heroVisualLabel = document.querySelector("#hero-visual-label");
const heroVisualTitle = document.querySelector("#hero-visual-title");
const heroImageBadge = document.querySelector(".hero-image-badge");

const buildHeroImageValue = (image) =>
  `linear-gradient(180deg, rgba(6, 8, 10, 0.02), rgba(6, 8, 10, 0.22)), url('${image || ""}')`;

const buildProjectChip = (project, index) => {
  const button = document.createElement("button");
  button.className = `project-chip${index === 0 ? " is-active" : ""}`;
  button.type = "button";
  button.dataset.label = project.label || "Featured Case";
  button.dataset.title = project.title || "";
  button.dataset.meta = project.meta || "";
  button.dataset.summary = project.summary || "";
  button.dataset.tags = (project.tags || []).join("|");
  button.dataset.visualTitle = project.chipTitle || project.title || "";
  button.dataset.image = buildHeroImageValue(project.image);
  button.dataset.link = project.link || "#";
  button.innerHTML = `
    <div class="project-chip-media">
      <img src="${project.image || ""}" alt="${project.chipTitle || project.title || "Project image"}" loading="lazy" />
      <span>${project.chipIndex || String(index + 1).padStart(2, "0")}</span>
    </div>
    <div class="project-chip-copy">
      <strong>${project.chipTitle || project.title || ""}</strong>
      <small>${project.chipSubtitle || project.meta || ""}</small>
    </div>
  `;
  return button;
};

const updateHeroProject = (chip) => {
  if (
    !chip ||
    !heroStage ||
    !heroCaseLabel ||
    !heroCaseTitle ||
    !heroCaseMeta ||
    !heroCaseSummary ||
    !heroCaseTags ||
    !heroCaseLink
  ) {
    return;
  }

  document.querySelectorAll(".project-chip").forEach((item) => item.classList.remove("is-active"));
  chip.classList.add("is-active");

  heroStage.style.setProperty("--hero-image", chip.dataset.image);
  heroCaseLabel.textContent = chip.dataset.label || "Featured Case";
  heroCaseTitle.textContent = chip.dataset.title || "";
  heroCaseMeta.textContent = chip.dataset.meta || "";
  heroCaseSummary.textContent = chip.dataset.summary || "";
  heroCaseLink.href = chip.dataset.link || "#";

  if (heroVisualLabel) {
    heroVisualLabel.textContent = chip.dataset.label || "Featured Case";
  }

  if (heroVisualTitle) {
    heroVisualTitle.textContent = chip.dataset.visualTitle || chip.dataset.title || "";
  }

  if (heroImageBadge) {
    heroImageBadge.classList.add("is-visible");
    window.setTimeout(() => heroImageBadge.classList.remove("is-visible"), 1400);
  }

  const tags = (chip.dataset.tags || "")
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean);

  heroCaseTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join("");
};

const renderFeaturedProjects = () => {
  const projects = siteData.featuredProjects || [];

  if (!projectChipsContainer) {
    return;
  }

  projectChipsContainer.innerHTML = "";

  projects.forEach((project, index) => {
    const chip = buildProjectChip(project, index);
    chip.addEventListener("click", () => updateHeroProject(chip));
    chip.addEventListener("mouseenter", () => updateHeroProject(chip));
    chip.addEventListener("focus", () => updateHeroProject(chip));
    projectChipsContainer.appendChild(chip);
  });

  const firstChip = projectChipsContainer.querySelector(".project-chip");
  if (firstChip) {
    updateHeroProject(firstChip);
  }
};

const renderSolutions = () => {
  const container = document.querySelector("#solutions-list");
  const solutions = siteData.solutions || [];

  if (!container) {
    return;
  }

  container.innerHTML = solutions
    .map(
      (solution) => `
        <article class="card reveal">
          <p class="card-index">${solution.index}</p>
          <h3>${solution.title}</h3>
          <p>${solution.description}</p>
        </article>
      `,
    )
    .join("");
};

const renderProjects = () => {
  const container = document.querySelector("#projects-list");
  const projects = siteData.projects || [];

  if (!container) {
    return;
  }

  container.innerHTML = projects
    .map(
      (project, index) => `
        <article
          class="portfolio-card reveal"
          style="--project-image: linear-gradient(180deg, rgba(6, 8, 10, 0.08), rgba(6, 8, 10, 0.22)), url('${project.image || ""}');"
        >
          <div class="portfolio-card-body">
            <div class="portfolio-card-top">
              <span>${project.category}</span>
              <strong class="portfolio-card-index">${project.index || String(index + 1).padStart(2, "0")}</strong>
            </div>
            <p class="portfolio-card-detail">${project.detail || ""}</p>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <a class="portfolio-card-link" href="${project.link}" target="_blank" rel="noreferrer">관련 글 열기</a>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderSupport = () => {
  const container = document.querySelector("#support-list");
  const items = siteData.support?.items || [];

  if (!container) {
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <article class="reveal">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `,
    )
    .join("");
};

const renderContact = () => {
  const brand = siteData.brand || {};
  const container = document.querySelector("#contact-meta");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div>
      <span>Company</span>
      <strong>${brand.companyName || ""}</strong>
    </div>
    <div>
      <span>Slogan</span>
      <strong>${brand.sub || ""}</strong>
    </div>
    <div>
      <span>Phone</span>
      <strong><a href="tel:${(brand.phone || "").replace(/\./g, "-")}">${brand.phone || ""}</a></strong>
    </div>
    <div>
      <span>Email</span>
      <strong><a href="mailto:${brand.email || ""}">${brand.email || ""}</a></strong>
    </div>
    <div>
      <span>Website</span>
      <strong>${brand.website || ""}</strong>
    </div>
    <div>
      <span>Blog</span>
      <strong><a href="${brand.blog || "#"}" target="_blank" rel="noreferrer">${brand.blog || ""}</a></strong>
    </div>
  `;
};

let revealObserver;

const setupRevealObserver = () => {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
  }

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
};

let turnstileWidgetId = null;
let turnstileToken = "";

const loadExternalScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });

const updateContactStatus = (message, state = "") => {
  const status = document.querySelector("#contact-form-status");
  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.remove("is-error", "is-success");
  if (state) {
    status.classList.add(state);
  }
};

const initializeTurnstile = async () => {
  const container = document.querySelector("#turnstile-container");
  const note = document.querySelector("#contact-form-note");
  const siteKey = effectiveRuntimeConfig.turnstileSiteKey;

  if (!container || !note) {
    return;
  }

  if (!siteKey || isLocalFile) {
    note.textContent = isLocalFile
      ? "로컬 파일로 열어본 상태라 문의 전송은 동작하지 않습니다. 배포 후 테스트해주세요."
      : "Turnstile 사이트 키를 설정하면 스팸 방지 검증이 함께 동작합니다.";
    return;
  }

  try {
    await loadExternalScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");

    container.hidden = false;
    turnstileWidgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: (token) => {
        turnstileToken = token;
      },
      "expired-callback": () => {
        turnstileToken = "";
      },
      "error-callback": () => {
        turnstileToken = "";
      },
      theme: "dark",
    });

    note.textContent = "문의 폼에는 Cloudflare Turnstile 스팸 방지가 적용됩니다.";
  } catch (error) {
    note.textContent = "보안 위젯을 불러오지 못했습니다. 네트워크 또는 설정을 확인해주세요.";
  }
};

const initializeContactForm = () => {
  const form = document.querySelector("#contact-form");
  const submitButton = document.querySelector("#contact-submit");

  if (!form || !submitButton) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isLocalFile) {
      updateContactStatus("로컬 파일에서는 문의 전송이 되지 않습니다. Netlify 배포 후 테스트해주세요.", "is-error");
      return;
    }

    if (!effectiveRuntimeConfig.contactEndpoint) {
      updateContactStatus("문의 전송 엔드포인트가 설정되지 않았습니다.", "is-error");
      return;
    }

    if (!form.reportValidity()) {
      updateContactStatus("필수 항목을 확인해주세요.", "is-error");
      return;
    }

    submitButton.disabled = true;
    updateContactStatus("문의 내용을 전송하고 있습니다.");

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name")?.toString().trim() || "",
      phone: formData.get("phone")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      inquiryType: formData.get("inquiryType")?.toString().trim() || "",
      projectName: formData.get("projectName")?.toString().trim() || "",
      projectSchedule: formData.get("projectSchedule")?.toString().trim() || "",
      message: formData.get("message")?.toString().trim() || "",
      companyWebsite: formData.get("companyWebsite")?.toString().trim() || "",
      turnstileToken,
      pageUrl: window.location.href,
      userAgent: window.navigator.userAgent,
    };

    try {
      const response = await fetch(effectiveRuntimeConfig.contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "문의 전송에 실패했습니다.");
      }

      form.reset();
      turnstileToken = "";

      if (window.turnstile && turnstileWidgetId !== null) {
        window.turnstile.reset(turnstileWidgetId);
      }

      updateContactStatus(
        "문의가 정상적으로 접수되었습니다. 확인 후 빠르게 연락드리겠습니다.",
        "is-success",
      );
    } catch (error) {
      updateContactStatus(error.message || "문의 전송 중 오류가 발생했습니다.", "is-error");
    } finally {
      submitButton.disabled = false;
    }
  });
};

const renderPage = () => {
  applyBrand();
  renderAboutValues();
  renderFeaturedProjects();
  renderSolutions();
  renderProjects();
  renderSupport();
  renderContact();
  setupRevealObserver();
};

const hydrateSiteDataFromServer = async () => {
  if (isLocalFile || !effectiveRuntimeConfig.siteDataEndpoint || !window.fetch) {
    return;
  }

  try {
    const response = await fetch(effectiveRuntimeConfig.siteDataEndpoint, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    const remoteData = result?.data || result;

    if (storage?.mergeData) {
      siteData = storage.mergeData(siteData, remoteData);
    } else {
      siteData = remoteData;
    }

    storage?.saveSiteData(siteData);
  } catch (error) {
    // Keep default data when remote loading fails.
  }
};

const hydrateRuntimeConfig = async () => {
  if (isLocalFile || !runtimeConfig.runtimeConfigEndpoint || !window.fetch) {
    return;
  }

  try {
    const response = await fetch(runtimeConfig.runtimeConfigEndpoint, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    effectiveRuntimeConfig = {
      ...runtimeConfig,
      ...(result?.data || {}),
    };
  } catch (error) {
    // Keep static runtime config when remote config loading fails.
  }
};

const initialize = async () => {
  try {
    await hydrateRuntimeConfig();
    await hydrateSiteDataFromServer();
    renderPage();
    initializeContactForm();
    initializeTurnstile();
  } finally {
    document.body.classList.remove("page-pending");
  }
};

initialize();
