import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DateRequest = {
  date?: unknown;
  time?: unknown;
  activity?: unknown;
  food?: unknown;
  name?: unknown;
  phonePrefix?: unknown;
  phone?: unknown;
  note?: unknown;
  language?: unknown;
  website?: unknown;
};

const languageNames = {
  en: "English",
  es: "Español",
  it: "Italiano",
  de: "Deutsch",
  pt: "Português",
  fr: "Français",
  zh: "中文",
  hi: "हिन्दी",
  ar: "العربية",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
} as const;

type Language = keyof typeof languageNames;

const localizedMessages: Record<Language, {
  incomplete: string;
  phone: string;
  unavailable: string;
  delivery: string;
}> = {
  en: {
    incomplete: "Please complete every step first.",
    phone: "Please enter a valid phone number.",
    unavailable: "Email is not configured yet. Please tell Thinh 💌",
    delivery: "The email could not be sent. Please try once more.",
  },
  es: {
    incomplete: "Completa todos los pasos antes de enviar.",
    phone: "Introduce un número de teléfono válido.",
    unavailable: "El correo todavía no está configurado. Avisa a Thinh 💌",
    delivery: "No se pudo enviar el correo. Inténtalo una vez más.",
  },
  it: {
    incomplete: "Completa tutti i passaggi prima di inviare.",
    phone: "Inserisci un numero di telefono valido.",
    unavailable: "L’email non è ancora configurata. Avvisa Thinh 💌",
    delivery: "Non è stato possibile inviare l’email. Riprova ancora una volta.",
  },
  de: {
    incomplete: "Bitte fülle zuerst alle Schritte aus.",
    phone: "Gib bitte eine gültige Telefonnummer ein.",
    unavailable: "E-Mail ist noch nicht eingerichtet. Sag bitte Thinh Bescheid 💌",
    delivery: "Die E-Mail konnte nicht gesendet werden. Versuche es bitte noch einmal.",
  },
  pt: {
    incomplete: "Complete todas as etapas antes de enviar.",
    phone: "Digite um número de telefone válido.",
    unavailable: "O e-mail ainda não está configurado. Avise o Thinh 💌",
    delivery: "Não foi possível enviar o e-mail. Tente mais uma vez.",
  },
  fr: {
    incomplete: "Complète toutes les étapes avant l’envoi.",
    phone: "Saisis un numéro de téléphone valide.",
    unavailable: "L’e-mail n’est pas encore configuré. Préviens Thinh 💌",
    delivery: "L’e-mail n’a pas pu être envoyé. Réessaie encore une fois.",
  },
  zh: {
    incomplete: "请先完成所有步骤。",
    phone: "请输入有效的电话号码。",
    unavailable: "邮件尚未配置，请告诉 Thinh 💌",
    delivery: "邮件发送失败，请再试一次。",
  },
  hi: {
    incomplete: "भेजने से पहले सभी चरण पूरे करें।",
    phone: "कृपया एक मान्य फ़ोन नंबर डालें।",
    unavailable: "ईमेल अभी सेट नहीं है। कृपया Thinh को बताएँ 💌",
    delivery: "ईमेल नहीं भेजा जा सका। कृपया एक बार फिर कोशिश करें।",
  },
  ar: {
    incomplete: "أكمل جميع الخطوات قبل الإرسال.",
    phone: "أدخل رقم هاتف صالحًا.",
    unavailable: "البريد الإلكتروني غير مُعد بعد. أخبر Thinh من فضلك 💌",
    delivery: "تعذر إرسال البريد الإلكتروني. حاول مرة أخرى.",
  },
  ja: {
    incomplete: "送信する前にすべてのステップを完了してください。",
    phone: "有効な電話番号を入力してください。",
    unavailable: "メールはまだ設定されていません。Thinh に知らせてください 💌",
    delivery: "メールを送信できませんでした。もう一度お試しください。",
  },
  ko: {
    incomplete: "전송하기 전에 모든 단계를 완료해 주세요.",
    phone: "올바른 전화번호를 입력해 주세요.",
    unavailable: "이메일이 아직 설정되지 않았어요. Thinh에게 알려 주세요 💌",
    delivery: "이메일을 보내지 못했어요. 한 번 더 시도해 주세요.",
  },
  ru: {
    incomplete: "Заполни все шаги перед отправкой.",
    phone: "Введи действительный номер телефона.",
    unavailable: "Почта ещё не настроена. Сообщи Thinh 💌",
    delivery: "Не удалось отправить письмо. Попробуй ещё раз.",
  },
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

  const requestedLanguage = clean(body.language, 2) as Language;
  const language = Object.hasOwn(languageNames, requestedLanguage) ? requestedLanguage : "en";
  const messages = localizedMessages[language];

  const submission = {
    date: clean(body.date),
    time: clean(body.time),
    activity: clean(body.activity),
    food: clean(body.food),
    name: clean(body.name, 80),
    phonePrefix: clean(body.phonePrefix, 8).replace(/[^\d+]/g, ""),
    phone: clean(body.phone, 32).replace(/[^\d\s().-]/g, ""),
    note: clean(body.note, 600),
    language,
  };

  if (!submission.date || !submission.time || !submission.activity || !submission.food || !submission.name) {
    return NextResponse.json({ error: messages.incomplete }, { status: 400 });
  }

  const phoneDigits = submission.phone.replace(/\D/g, "");
  if (
    !submission.phone
    || !/^\+\d{1,4}$/.test(submission.phonePrefix)
    || phoneDigits.length < 5
    || phoneDigits.length > 18
  ) {
    return NextResponse.json({ error: messages.phone }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.DATE_REQUEST_TO_EMAIL || "thinh.dutong00@gmail.com";
  const from = process.env.RESEND_FROM_EMAIL || "Date with Thinh <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: messages.unavailable }, { status: 503 });
  }

  const safe = Object.fromEntries(
    Object.entries(submission).map(([key, value]) => [key, escapeHtml(value)]),
  ) as typeof submission;

  const rows: Array<[string, string]> = [
    ["📅 When", safe.date],
    ["🕐 Time", safe.time],
    ["✨ Plan", safe.activity],
    ["🍽️ Food", safe.food],
  ];

  rows.push(["📞 Phone", `${safe.phonePrefix} ${safe.phone}`]);
  rows.push(["🌐 Language", languageNames[submission.language]]);

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
    `Phone: ${submission.phonePrefix} ${submission.phone}`,
    `Language: ${languageNames[submission.language]}`,
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
      return NextResponse.json({ error: messages.delivery }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email delivery error", error);
    return NextResponse.json({ error: messages.delivery }, { status: 502 });
  }
}
