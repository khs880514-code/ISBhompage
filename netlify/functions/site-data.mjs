import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export const config = {
  path: "/api/site-data",
};

export default async () => {
  try {
    const store = getStore("isb-site-content");
    const saved = await store.get("site-data", { type: "json" });

    return new Response(
      JSON.stringify({
        ok: true,
        data: saved || {},
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "사이트 데이터를 불러오지 못했습니다.",
      }),
      {
        status: 500,
        headers,
      },
    );
  }
};
