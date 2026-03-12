const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export const config = {
  path: "/api/runtime-config",
};

export default async () =>
  new Response(
    JSON.stringify({
      ok: true,
      data: {
        turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
      },
    }),
    {
      status: 200,
      headers,
    },
  );
