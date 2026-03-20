import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const MAX_ASSET_UPLOAD_BYTES = Math.round(4.2 * 1024 * 1024);
const ASSET_STORE_NAME = "isb-site-assets";
const ASSET_PREFIX = "uploads";

const getAdminToken = (request) =>
  request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

const sanitizeFileStem = (value = "image") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "image";

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

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers,
  });

export const config = {
  path: "/api/admin/assets",
};

export default async (request) => {
  if (request.method !== "POST") {
    return json(405, {
      ok: false,
      message: "POST 요청만 지원합니다.",
    });
  }

  const expectedToken = process.env.ADMIN_WRITE_TOKEN;
  const providedToken = getAdminToken(request);

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return json(401, {
      ok: false,
      message: "관리자 토큰이 올바르지 않습니다.",
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function" || typeof file.type !== "string") {
      return json(400, {
        ok: false,
        message: "업로드할 이미지 파일이 없습니다.",
      });
    }

    if (!file.type?.startsWith("image/")) {
      return json(400, {
        ok: false,
        message: "이미지 파일만 업로드할 수 있습니다.",
      });
    }

    if (file.size <= 0) {
      return json(400, {
        ok: false,
        message: "비어 있는 파일은 업로드할 수 없습니다.",
      });
    }

    if (file.size > MAX_ASSET_UPLOAD_BYTES) {
      return json(413, {
        ok: false,
        message: `이미지 한 장이 너무 큽니다. ${Math.round(file.size / 1024 / 1024)}MB 대신 4MB 안쪽 이미지를 사용해주세요.`,
      });
    }

    const extension = extensionFromMimeType(file.type);
    const datePrefix = new Date().toISOString().slice(0, 10);
    const fileStem = sanitizeFileStem(file.name?.replace(/\.[^.]+$/, "") || "image");
    const assetKey = `${ASSET_PREFIX}/${datePrefix}/${Date.now()}-${crypto.randomUUID()}-${fileStem}.${extension}`;
    const store = getStore(ASSET_STORE_NAME);
    const buffer = await file.arrayBuffer();

    await store.set(assetKey, new Uint8Array(buffer));

    return json(200, {
      ok: true,
      key: assetKey,
      size: file.size,
      url: `/api/assets/${assetKey}`,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      message: "이미지 업로드 중 오류가 발생했습니다.",
    });
  }
};
