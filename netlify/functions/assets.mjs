import { getStore } from "@netlify/blobs";

const ASSET_STORE_NAME = "isb-site-assets";
const ASSET_ROUTE_PREFIX = "/api/assets/";

const contentTypeFromKey = (key = "") => {
  const extension = key.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "gif") {
    return "image/gif";
  }

  if (extension === "avif") {
    return "image/avif";
  }

  if (extension === "svg") {
    return "image/svg+xml";
  }

  return "application/octet-stream";
};

export const config = {
  path: "/api/assets/*",
};

export default async (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET, HEAD",
      },
    });
  }

  const pathname = new URL(request.url).pathname;
  const assetKey = decodeURIComponent(pathname.replace(ASSET_ROUTE_PREFIX, ""));

  if (!assetKey) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const store = getStore(ASSET_STORE_NAME);
    const asset = await store.get(assetKey, { type: "arrayBuffer" });

    if (!asset) {
      return new Response("Not Found", { status: 404 });
    }

    const headers = {
      "Content-Type": contentTypeFromKey(assetKey),
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (request.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers,
      });
    }

    return new Response(asset, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};
