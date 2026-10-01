"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Language = "en" | "it";
type AnswerKey = "date" | "time" | "activity" | "food";
type LocalizedText = Record<Language, string>;
type Choice = { emoji: string; label: LocalizedText; value: string };
type Step = {
  key: AnswerKey;
  icon: string;
  title: LocalizedText;
  choices: Choice[];
};

type Answers = {
  date: string;
  time: string;
  activity: string;
  food: string;
  name: string;
  phonePrefix: string;
  phone: string;
  note: string;
};

const copy = {
  en: {
    importantQuestion: "A VERY IMPORTANT QUESTION",
    introTitle: ["Will you go on a", "date with me?"],
    prettyPlease: "Pretty please?",
    yes: "Yes!! 💖",
    no: "No 😔",
    noAria: "No — are you sure?",
    sentKicker: "DATE REQUEST SENT",
    successTitle: "It’s a date!",
    successBody: "Your answers are on their way to Thinh. Now comes the best part ✨",
    step: "STEP",
    of: "OF",
    progress: "Step",
    back: "Go back",
    chooseDate: "Choose a date",
    specificDate: "Pick a specific date instead",
    next: "Next 💕",
    finalTitle: "One last little thing…",
    summary: { date: "When", time: "Time", activity: "Plan", food: "Food" },
    name: "Your name",
    namePlaceholder: "So I know who said yes 💕",
    phone: "Phone number",
    phonePlaceholder: "Your number",
    prefix: "Country calling code",
    note: "A note for Thinh",
    notePlaceholder: "Anything else you’d like to add?",
    optional: "optional",
    nameError: "Tell me your name first 💗",
    phoneError: "Please enter a valid phone number.",
    genericError: "Something went wrong.",
    tryAgain: "Please try again.",
    sending: "Sending…",
    send: "Send my answer 💘",
    privacy: "Your answers are sent privately to Thinh.",
    language: "Choose language",
  },
  it: {
    importantQuestion: "UNA DOMANDA MOLTO IMPORTANTE",
    introTitle: ["Vuoi venire ad un", "appuntamento con me?"],
    prettyPlease: "Per favore?",
    yes: "Sì!! 💖",
    no: "No 😔",
    noAria: "No — sei proprio sicura?",
    sentKicker: "RICHIESTA INVIATA",
    successTitle: "È un appuntamento!",
    successBody: "Le tue risposte stanno arrivando a Thinh. Ora viene il bello ✨",
    step: "PASSAGGIO",
    of: "DI",
    progress: "Passaggio",
    back: "Torna indietro",
    chooseDate: "Scegli una data",
    specificDate: "Scegli una data specifica",
    next: "Avanti 💕",
    finalTitle: "Un’ultima piccola cosa…",
    summary: { date: "Quando", time: "Orario", activity: "Programma", food: "Cibo" },
    name: "Il tuo nome",
    namePlaceholder: "Così so chi ha detto sì 💕",
    phone: "Numero di telefono",
    phonePlaceholder: "Il tuo numero",
    prefix: "Prefisso internazionale",
    note: "Un messaggio per Thinh",
    notePlaceholder: "Vuoi aggiungere qualcos’altro?",
    optional: "facoltativo",
    nameError: "Prima dimmi come ti chiami 💗",
    phoneError: "Inserisci un numero di telefono valido.",
    genericError: "Qualcosa è andato storto.",
    tryAgain: "Riprova.",
    sending: "Invio in corso…",
    send: "Invia la mia risposta 💘",
    privacy: "Le tue risposte vengono inviate privatamente a Thinh.",
    language: "Scegli la lingua",
  },
} as const;

const steps: Step[] = [
  {
    key: "date",
    icon: "📅",
    title: { en: "When should our date be?", it: "Quando facciamo il nostro appuntamento?" },
    choices: [
      { emoji: "🌼", label: { en: "This weekend", it: "Questo weekend" }, value: "This weekend" },
      { emoji: "🌌", label: { en: "Friday night", it: "Venerdì sera" }, value: "Friday night" },
      { emoji: "☀️", label: { en: "Sunday brunch", it: "Brunch domenicale" }, value: "Sunday brunch" },
      { emoji: "🎁", label: { en: "A surprise!", it: "Una sorpresa!" }, value: "A surprise!" },
    ],
  },
  {
    key: "time",
    icon: "🕐",
    title: { en: "What time feels right?", it: "Qual è l’orario perfetto?" },
    choices: [
      { emoji: "🌅", label: { en: "Morning", it: "Mattina" }, value: "Morning" },
      { emoji: "☀️", label: { en: "Afternoon", it: "Pomeriggio" }, value: "Afternoon" },
      { emoji: "🌇", label: { en: "Evening", it: "Sera" }, value: "Evening" },
      { emoji: "🌙", label: { en: "Night", it: "Notte" }, value: "Night" },
    ],
  },
  {
    key: "activity",
    icon: "✨",
    title: { en: "What should we do?", it: "Cosa ti andrebbe di fare?" },
    choices: [
      { emoji: "☕", label: { en: "Coffee & a walk", it: "Caffè e passeggiata" }, value: "Coffee & a walk" },
      { emoji: "🍷", label: { en: "Dinner date", it: "Cena romantica" }, value: "Dinner date" },
      { emoji: "🎬", label: { en: "Movie night", it: "Serata cinema" }, value: "Movie night" },
      { emoji: "🎲", label: { en: "Surprise me", it: "Sorprendimi" }, value: "Surprise me" },
    ],
  },
  {
    key: "food",
    icon: "🍽️",
    title: { en: "What are we eating?", it: "Cosa mangiamo?" },
    choices: [
      { emoji: "🍕", label: { en: "Pizza", it: "Pizza" }, value: "Pizza" },
      { emoji: "🍣", label: { en: "Sushi", it: "Sushi" }, value: "Sushi" },
      { emoji: "🍝", label: { en: "Pasta", it: "Pasta" }, value: "Pasta" },
      { emoji: "🍨", label: { en: "Something sweet", it: "Qualcosa di dolce" }, value: "Something sweet" },
    ],
  },
];

const phonePrefixes = [
  { dial: "+39", flag: "🇮🇹", name: { en: "Italy", it: "Italia" } },
  { dial: "+1", flag: "🇺🇸", name: { en: "USA / Canada", it: "USA / Canada" } },
  { dial: "+44", flag: "🇬🇧", name: { en: "United Kingdom", it: "Regno Unito" } },
  { dial: "+33", flag: "🇫🇷", name: { en: "France", it: "Francia" } },
  { dial: "+34", flag: "🇪🇸", name: { en: "Spain", it: "Spagna" } },
  { dial: "+49", flag: "🇩🇪", name: { en: "Germany", it: "Germania" } },
  { dial: "+41", flag: "🇨🇭", name: { en: "Switzerland", it: "Svizzera" } },
  { dial: "+43", flag: "🇦🇹", name: { en: "Austria", it: "Austria" } },
  { dial: "+32", flag: "🇧🇪", name: { en: "Belgium", it: "Belgio" } },
  { dial: "+31", flag: "🇳🇱", name: { en: "Netherlands", it: "Paesi Bassi" } },
  { dial: "+351", flag: "🇵🇹", name: { en: "Portugal", it: "Portogallo" } },
  { dial: "+353", flag: "🇮🇪", name: { en: "Ireland", it: "Irlanda" } },
  { dial: "+30", flag: "🇬🇷", name: { en: "Greece", it: "Grecia" } },
  { dial: "+45", flag: "🇩🇰", name: { en: "Denmark", it: "Danimarca" } },
  { dial: "+46", flag: "🇸🇪", name: { en: "Sweden", it: "Svezia" } },
  { dial: "+47", flag: "🇳🇴", name: { en: "Norway", it: "Norvegia" } },
  { dial: "+358", flag: "🇫🇮", name: { en: "Finland", it: "Finlandia" } },
  { dial: "+48", flag: "🇵🇱", name: { en: "Poland", it: "Polonia" } },
  { dial: "+40", flag: "🇷🇴", name: { en: "Romania", it: "Romania" } },
  { dial: "+420", flag: "🇨🇿", name: { en: "Czechia", it: "Repubblica Ceca" } },
  { dial: "+385", flag: "🇭🇷", name: { en: "Croatia", it: "Croazia" } },
  { dial: "+386", flag: "🇸🇮", name: { en: "Slovenia", it: "Slovenia" } },
  { dial: "+381", flag: "🇷🇸", name: { en: "Serbia", it: "Serbia" } },
  { dial: "+355", flag: "🇦🇱", name: { en: "Albania", it: "Albania" } },
  { dial: "+380", flag: "🇺🇦", name: { en: "Ukraine", it: "Ucraina" } },
  { dial: "+90", flag: "🇹🇷", name: { en: "Turkey", it: "Turchia" } },
  { dial: "+972", flag: "🇮🇱", name: { en: "Israel", it: "Israele" } },
  { dial: "+971", flag: "🇦🇪", name: { en: "UAE", it: "Emirati Arabi Uniti" } },
  { dial: "+91", flag: "🇮🇳", name: { en: "India", it: "India" } },
  { dial: "+86", flag: "🇨🇳", name: { en: "China", it: "Cina" } },
  { dial: "+81", flag: "🇯🇵", name: { en: "Japan", it: "Giappone" } },
  { dial: "+82", flag: "🇰🇷", name: { en: "South Korea", it: "Corea del Sud" } },
  { dial: "+61", flag: "🇦🇺", name: { en: "Australia", it: "Australia" } },
  { dial: "+64", flag: "🇳🇿", name: { en: "New Zealand", it: "Nuova Zelanda" } },
  { dial: "+55", flag: "🇧🇷", name: { en: "Brazil", it: "Brasile" } },
  { dial: "+52", flag: "🇲🇽", name: { en: "Mexico", it: "Messico" } },
  { dial: "+54", flag: "🇦🇷", name: { en: "Argentina", it: "Argentina" } },
  { dial: "+27", flag: "🇿🇦", name: { en: "South Africa", it: "Sudafrica" } },
] as const;

const initialAnswers: Answers = {
  date: "",
  time: "",
  activity: "",
  food: "",
  name: "",
  phonePrefix: "+39",
  phone: "",
  note: "",
};

const decorations = [
  ["🌹", "decor decor--rose"],
  ["💕", "decor decor--hearts"],
  ["💖", "decor decor--sparkle"],
  ["🌷", "decor decor--tulip"],
  ["⭐", "decor decor--star"],
  ["🦋", "decor decor--butterfly"],
] as const;

function localizedAnswer(key: AnswerKey, value: string, language: Language) {
  if (!value) return "";

  if (key === "date" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat(language === "it" ? "it-IT" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  const step = steps.find((item) => item.key === key);
  return step?.choices.find((choice) => choice.value === value)?.label[language] ?? value;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [specificDate, setSpecificDate] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const noAttempts = useRef(0);

  const t = copy[language];
  const current = steps[step];
  const isReview = step === 4;
  const selected = current ? answers[current.key] : "";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const summary = useMemo(
    () =>
      steps.map((item, index) => ({
        emoji: item.icon,
        label: t.summary[item.key],
        value: localizedAnswer(item.key, answers[item.key], language),
        index,
      })),
    [answers, language, t],
  );

  function choose(value: string) {
    if (!current) return;
    setAnswers((previous) => ({ ...previous, [current.key]: value }));
    if (current.key === "date") setSpecificDate(false);
  }

  function next() {
    if (!selected) return;
    setStep((value) => Math.min(value + 1, 4));
  }

  function back() {
    if (step === 0) {
      setStarted(false);
      return;
    }
    setStep((value) => value - 1);
    setStatus("idle");
  }

  function dodgeNo() {
    noAttempts.current += 1;
    const angle = noAttempts.current * 2.15;
    const distance = Math.min(44 + noAttempts.current * 4, 76);
    setNoPosition({
      x: Math.round(Math.cos(angle) * distance),
      y: Math.round(Math.sin(angle) * 22),
    });
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setErrorMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answers.name.trim()) {
      setErrorMessage(t.nameError);
      return;
    }

    const phoneDigits = answers.phone.replace(/\D/g, "");
    if (answers.phone && (phoneDigits.length < 5 || phoneDigits.length > 18)) {
      setErrorMessage(t.phoneError);
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/date-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...answers, language }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || t.genericError);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : t.tryAgain);
    }
  }

  return (
    <main className="page-shell" lang={language}>
      <div className="soft-orb soft-orb--one" />
      <div className="soft-orb soft-orb--two" />
      {decorations.map(([symbol, className]) => (
        <span className={className} aria-hidden="true" key={className}>
          {symbol}
        </span>
      ))}

      <div className="language-picker">
        <span aria-hidden="true">🌐</span>
        <label className="sr-only" htmlFor="language-select">{t.language}</label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => changeLanguage(event.target.value as Language)}
          aria-label={t.language}
        >
          <option value="en">English</option>
          <option value="it">Italiano</option>
        </select>
      </div>

      <section className={`experience ${started ? "experience--started" : ""}`}>
        {!started ? (
          <div className="intro" aria-labelledby="intro-title">
            <div className="bear" aria-hidden="true">🐻</div>
            <p className="kicker"><span>💛</span> {t.importantQuestion} <span>💛</span></p>
            <h1 id="intro-title">{t.introTitle[0]}<br />{t.introTitle[1]}</h1>
            <p className="pretty">🌷 {t.prettyPlease} 🌷</p>
            <div className="intro-actions">
              <button className="yes-button" onClick={() => setStarted(true)}>
                {t.yes}
              </button>
              <button
                className="no-button"
                onMouseEnter={dodgeNo}
                onClick={dodgeNo}
                style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
                aria-label={t.noAria}
              >
                {t.no}
              </button>
            </div>
          </div>
        ) : status === "success" ? (
          <div className="success-card" role="status">
            <div className="success-burst" aria-hidden="true">💖</div>
            <p className="kicker">{t.sentKicker}</p>
            <h1>{t.successTitle}</h1>
            <p>{t.successBody}</p>
            <div className="celebration" aria-hidden="true">🌷 💕 🥂 💕 🌷</div>
          </div>
        ) : (
          <div className="wizard-wrap">
            <nav className="progress" aria-label={`${t.progress} ${step + 1} ${t.of.toLowerCase()} 5`}>
              {[0, 1, 2, 3, 4].map((value) => (
                <span key={value} className={value <= step ? "progress-heart progress-heart--active" : "progress-heart"}>
                  ♥
                </span>
              ))}
            </nav>

            <div className="form-card">
              <button className="back-button" onClick={back} aria-label={t.back}>←</button>

              {!isReview && current ? (
                <>
                  <div className="step-icon" aria-hidden="true">{current.icon}</div>
                  <p className="step-label">{`${t.step} ${step + 1} ${t.of} 5`}</p>
                  <h2>{current.title[language]}</h2>
                  <div className="choice-grid">
                    {current.choices.map((choice) => (
                      <button
                        key={choice.value}
                        className={`choice ${selected === choice.value ? "choice--selected" : ""}`}
                        onClick={() => choose(choice.value)}
                        aria-pressed={selected === choice.value}
                      >
                        <span aria-hidden="true">{choice.emoji}</span>
                        {choice.label[language]}
                      </button>
                    ))}
                  </div>

                  {current.key === "date" && (
                    <div className="specific-date-wrap">
                      {specificDate ? (
                        <label className="date-field">
                          <span>{t.chooseDate}</span>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={answers.date.match(/^\d{4}-/) ? answers.date : ""}
                            onChange={(event) => setAnswers((previous) => ({ ...previous, date: event.target.value }))}
                            autoFocus
                          />
                        </label>
                      ) : (
                        <button className="specific-date" onClick={() => { setSpecificDate(true); setAnswers((previous) => ({ ...previous, date: "" })); }}>
                          ✏️ {t.specificDate}
                        </button>
                      )}
                    </div>
                  )}

                  <button className="next-button" disabled={!selected} onClick={next}>
                    {t.next}
                  </button>
                </>
              ) : (
                <form onSubmit={submit}>
                  <div className="step-icon" aria-hidden="true">💌</div>
                  <p className="step-label">{`${t.step} 5 ${t.of} 5`}</p>
                  <h2>{t.finalTitle}</h2>

                  <div className="summary-grid">
                    {summary.map((item) => (
                      <button
                        type="button"
                        className="summary-item"
                        key={item.label}
                        onClick={() => setStep(item.index)}
                      >
                        <span aria-hidden="true">{item.emoji}</span>
                        <span><small>{item.label}</small><strong>{item.value}</strong></span>
                      </button>
                    ))}
                  </div>

                  <label className="text-field">
                    <span>{t.name}</span>
                    <input
                      value={answers.name}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder={t.namePlaceholder}
                      maxLength={80}
                      autoComplete="name"
                    />
                  </label>

                  <div className="text-field">
                    <span>{t.phone} <small>({t.optional})</small></span>
                    <div className="phone-field">
                      <label className="sr-only" htmlFor="phone-prefix">{t.prefix}</label>
                      <select
                        id="phone-prefix"
                        value={answers.phonePrefix}
                        onChange={(event) => setAnswers((previous) => ({ ...previous, phonePrefix: event.target.value }))}
                        aria-label={t.prefix}
                        autoComplete="tel-country-code"
                      >
                        {phonePrefixes.map((prefix) => (
                          <option value={prefix.dial} key={prefix.dial}>
                            {prefix.flag} {prefix.name[language]} ({prefix.dial})
                          </option>
                        ))}
                      </select>
                      <label className="sr-only" htmlFor="phone-number">{t.phone}</label>
                      <input
                        id="phone-number"
                        type="tel"
                        inputMode="tel"
                        value={answers.phone}
                        onChange={(event) => {
                          const phone = event.currentTarget.value.replace(/[^\d\s().-]/g, "").slice(0, 24);
                          setAnswers((previous) => ({ ...previous, phone }));
                        }}
                        placeholder={t.phonePlaceholder}
                        maxLength={24}
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>

                  <label className="text-field">
                    <span>{t.note} <small>({t.optional})</small></span>
                    <textarea
                      value={answers.note}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, note: event.target.value }))}
                      placeholder={t.notePlaceholder}
                      rows={3}
                      maxLength={600}
                    />
                  </label>

                  {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

                  <button className="next-button" disabled={status === "sending"} type="submit">
                    {status === "sending" ? t.sending : t.send}
                  </button>
                  <p className="privacy-note">{t.privacy}</p>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
