const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const buildMailHtml = ({
  name,
  phone,
  email,
  inquiryType,
  projectName,
  projectSchedule,
  message,
  pageUrl,
}) => `
  <h2>ISB 문의 접수</h2>
  <p><strong>이름/회사명:</strong> ${escapeHtml(name)}</p>
  <p><strong>연락처:</strong> ${escapeHtml(phone)}</p>
  <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
  <p><strong>문의 유형:</strong> ${escapeHtml(inquiryType)}</p>
  <p><strong>프로젝트명:</strong> ${escapeHtml(projectName || "-")}</p>
  <p><strong>행사 장소/일정:</strong> ${escapeHtml(projectSchedule || "-")}</p>
  <p><strong>문의 내용:</strong></p>
  <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
  <p><strong>문의 페이지:</strong> ${escapeHtml(pageUrl || "-")}</p>
`;

const verifyTurnstile = async (token, remoteIp) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: remoteIp || "",
    }),
  });

  const result = await response.json();
  return Boolean(result?.success);
};

const sendMail = async ({
  to,
  from,
  replyTo,
  subject,
  html,
}) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("메일 발송 키가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error("메일 발송 서비스 호출에 실패했습니다.");
  }
};

export const config = {
  path: "/api/contact",
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
        headers: jsonHeaders,
      },
    );
  }

  try {
    const body = await request.json();

    const payload = {
      name: clean(body?.name),
      phone: clean(body?.phone),
      email: clean(body?.email),
      inquiryType: clean(body?.inquiryType),
      projectName: clean(body?.projectName),
      projectSchedule: clean(body?.projectSchedule),
      message: clean(body?.message),
      companyWebsite: clean(body?.companyWebsite),
      turnstileToken: clean(body?.turnstileToken),
      pageUrl: clean(body?.pageUrl),
    };

    if (payload.companyWebsite) {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "문의가 접수되었습니다.",
        }),
        {
          status: 200,
          headers: jsonHeaders,
        },
      );
    }

    if (!payload.name || !payload.phone || !payload.email || !payload.inquiryType || !payload.message) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "필수 항목을 모두 입력해주세요.",
        }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    if (!isValidEmail(payload.email)) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "이메일 형식이 올바르지 않습니다.",
        }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    if (payload.message.length > 5000) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "문의 내용은 5000자 이내로 작성해주세요.",
        }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    const remoteIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("client-ip") || "";

    const turnstilePassed = await verifyTurnstile(payload.turnstileToken, remoteIp);
    if (!turnstilePassed) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "보안 확인에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }),
        {
          status: 400,
          headers: jsonHeaders,
        },
      );
    }

    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!to || !from) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "문의 수신 메일 설정이 완료되지 않았습니다.",
        }),
        {
          status: 500,
          headers: jsonHeaders,
        },
      );
    }

    await sendMail({
      to,
      from,
      replyTo: payload.email,
      subject: `[ISB 문의] ${payload.inquiryType} / ${payload.name}`,
      html: buildMailHtml(payload),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: "문의가 정상적으로 접수되었습니다.",
      }),
      {
        status: 200,
        headers: jsonHeaders,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "문의 처리 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
};
