import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DateRequest = {
  date?: unknown;
  time?: unknown;
  activity?: unknown;
  food?: unknown;
  name?: unknown;
  note?: unknown;
  website?: unknown;
};

const clean = (value: unknown, max = 160) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const characters: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return characters[character];
  });

export async function POST(request: NextRequest) {
  let body: DateRequest;

  try {
    body = (await request.json()) as DateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const submission = {
    date: clean(body.date),
    time: clean(body.time),
    activity: clean(body.activity),
    food: clean(body.food),
    name: clean(body.name, 80),
    note: clean(body.note, 600),
  };

  if (!submission.date || !submission.time || !submission.activity || !submission.food || !submission.name) {
    return NextResponse.json({ error: "Please complete every step first." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.DATE_REQUEST_TO_EMAIL || "thinh.dutong00@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Date with Thinh <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email is not configured yet. Please tell Thinh 💌" }, { status: 503 });
  }

  const safe = Object.fromEntries(
    Object.entries(submission).map(([key, value]) => [key, escapeHtml(value)]),
  ) as typeof submission;

  const rows = [
    ["📅 When", safe.date],
    ["🕐 Time", safe.time],
    ["✨ Plan", safe.activity],
    ["🍽️ Food", safe.food],
  ];

  const html = `
    <div style="margin:0;background:#fff4fa;padding:40px 16px;font-family:Arial,sans-serif;color:#6e274a">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #f7c8dd;border-radius:28px;padding:34px;box-shadow:0 16px 44px rgba(171,42,101,.12)">
        <div style="font-size:42px;text-align:center">💌</div>
        <p style="margin:14px 0 4px;text-align:center;color:#d32a6c;font-size:12px;font-weight:800;letter-spacing:2px">NEW DATE REQUEST</p>
        <h1 style="margin:8px 0 26px;text-align:center;font-size:30px;color:#bd1f5f">${safe.name} said yes! 💖</h1>
        ${rows.map(([label, value]) => `
          <div style="display:flex;justify-content:space-between;gap:18px;border-top:1px solid #f8dce9;padding:14px 0">
            <span style="color:#a35d7c">${label}</span><strong style="text-align:right">${value}</strong>
          </div>`).join("")}
        ${safe.note ? `<div style="margin-top:22px;background:#fff3f8;border-radius:18px;padding:18px"><div style="color:#a35d7c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">A note for you</div><p style="margin:8px 0 0;line-height:1.6">${safe.note.replace(/\n/g, "<br>")}</p></div>` : ""}
        <p style="margin:28px 0 0;text-align:center;color:#c1819e;font-size:12px">Sent with datewiththinh 💕</p>
      </div>
    </div>`;

  const text = [
    `${submission.name} said yes! 💖`,
    "",
    `When: ${submission.date}`,
    `Time: ${submission.time}`,
    `Plan: ${submission.activity}`,
    `Food: ${submission.food}`,
    submission.note ? `\nNote: ${submission.note}` : "",
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [destination],
        subject: `💘 ${submission.name} said yes to a date!`,
        html,
        text,
        tags: [{ name: "source", value: "datewiththinh" }],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend error", response.status, detail);
      return NextResponse.json({ error: "The email could not be sent. Please try once more." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email delivery error", error);
    return NextResponse.json({ error: "The email could not be sent. Please try once more." }, { status: 502 });
  }
}
