import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const getAdminToken = (request) =>
  request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

const isValidPayload = (data) =>
  Boolean(
    data &&
      typeof data === "object" &&
      data.brand &&
      data.hero &&
      Array.isArray(data.featuredProjects) &&
      Array.isArray(data.projects),
  );

export const config = {
  path: "/api/admin/site-data",
};

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "POST 요청만 허용됩니다.",
      }),
      {
        status: 405,
        headers,
      },
    );
  }

  const expectedToken = process.env.ADMIN_WRITE_TOKEN;
  const providedToken = getAdminToken(request);

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "관리 토큰이 올바르지 않습니다.",
      }),
      {
        status: 401,
        headers,
      },
    );
  }

  try {
    const body = await request.json();
    const data = body?.data;

    if (!isValidPayload(data)) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "저장할 데이터 형식이 올바르지 않습니다.",
        }),
        {
          status: 400,
          headers,
        },
      );
    }

    const store = getStore("isb-site-content");
    await store.setJSON("site-data", data);

    return new Response(
      JSON.stringify({
        ok: true,
        message: "사이트 데이터가 저장되었습니다.",
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
        message: "사이트 데이터 저장 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers,
      },
    );
  }
};
