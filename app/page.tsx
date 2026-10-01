"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Choice = { emoji: string; label: string; value: string };
type Step = {
  key: "date" | "time" | "activity" | "food";
  icon: string;
  eyebrow: string;
  title: string;
  choices: Choice[];
};

type Answers = {
  date: string;
  time: string;
  activity: string;
  food: string;
  name: string;
  note: string;
};

const steps: Step[] = [
  {
    key: "date",
    icon: "📅",
    eyebrow: "STEP 1 OF 5",
    title: "When should our date be?",
    choices: [
      { emoji: "🌼", label: "This weekend", value: "This weekend" },
      { emoji: "🌌", label: "Friday night", value: "Friday night" },
      { emoji: "☀️", label: "Sunday brunch", value: "Sunday brunch" },
      { emoji: "🎁", label: "A surprise!", value: "A surprise!" },
    ],
  },
  {
    key: "time",
    icon: "🕐",
    eyebrow: "STEP 2 OF 5",
    title: "What time feels right?",
    choices: [
      { emoji: "🌅", label: "Morning", value: "Morning" },
      { emoji: "☀️", label: "Afternoon", value: "Afternoon" },
      { emoji: "🌇", label: "Evening", value: "Evening" },
      { emoji: "🌙", label: "Night", value: "Night" },
    ],
  },
  {
    key: "activity",
    icon: "✨",
    eyebrow: "STEP 3 OF 5",
    title: "What should we do?",
    choices: [
      { emoji: "☕", label: "Coffee & a walk", value: "Coffee & a walk" },
      { emoji: "🍷", label: "Dinner date", value: "Dinner date" },
      { emoji: "🎬", label: "Movie night", value: "Movie night" },
      { emoji: "🎲", label: "Surprise me", value: "Surprise me" },
    ],
  },
  {
    key: "food",
    icon: "🍽️",
    eyebrow: "STEP 4 OF 5",
    title: "What are we eating?",
    choices: [
      { emoji: "🍕", label: "Pizza", value: "Pizza" },
      { emoji: "🍣", label: "Sushi", value: "Sushi" },
      { emoji: "🍝", label: "Pasta", value: "Pasta" },
      { emoji: "🍨", label: "Something sweet", value: "Something sweet" },
    ],
  },
];

const initialAnswers: Answers = {
  date: "",
  time: "",
  activity: "",
  food: "",
  name: "",
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

export default function Home() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [specificDate, setSpecificDate] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const noAttempts = useRef(0);

  const current = steps[step];
  const isReview = step === 4;
  const selected = current ? answers[current.key] : "";

  const summary = useMemo(
    () => [
      ["📅", "When", answers.date],
      ["🕐", "Time", answers.time],
      ["✨", "Plan", answers.activity],
      ["🍽️", "Food", answers.food],
    ],
    [answers],
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answers.name.trim()) {
      setErrorMessage("Tell me your name first 💗");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/date-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Something went wrong.");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <main className="page-shell">
      <div className="soft-orb soft-orb--one" />
      <div className="soft-orb soft-orb--two" />
      {decorations.map(([symbol, className]) => (
        <span className={className} aria-hidden="true" key={className}>
          {symbol}
        </span>
      ))}

      <section className={`experience ${started ? "experience--started" : ""}`}>
        {!started ? (
          <div className="intro" aria-labelledby="intro-title">
            <div className="bear" aria-hidden="true">🐻</div>
            <p className="kicker"><span>💛</span> A VERY IMPORTANT QUESTION <span>💛</span></p>
            <h1 id="intro-title">Will you go on a<br />date with me?</h1>
            <p className="pretty">🌷 Pretty please? 🌷</p>
            <div className="intro-actions">
              <button className="yes-button" onClick={() => setStarted(true)}>
                Yes!! 💖
              </button>
              <button
                className="no-button"
                onMouseEnter={dodgeNo}
                onClick={dodgeNo}
                style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
                aria-label="No — are you sure?"
              >
                No 😔
              </button>
            </div>
          </div>
        ) : status === "success" ? (
          <div className="success-card" role="status">
            <div className="success-burst" aria-hidden="true">💖</div>
            <p className="kicker">DATE REQUEST SENT</p>
            <h1>It&apos;s a date!</h1>
            <p>Your answers are on their way to Thinh. Now comes the best part ✨</p>
            <div className="celebration" aria-hidden="true">🌷 💕 🥂 💕 🌷</div>
          </div>
        ) : (
          <div className="wizard-wrap">
            <nav className="progress" aria-label={`Step ${step + 1} of 5`}>
              {[0, 1, 2, 3, 4].map((value) => (
                <span key={value} className={value <= step ? "progress-heart progress-heart--active" : "progress-heart"}>
                  ♥
                </span>
              ))}
            </nav>

            <div className="form-card">
              <button className="back-button" onClick={back} aria-label="Go back">←</button>

              {!isReview && current ? (
                <>
                  <div className="step-icon" aria-hidden="true">{current.icon}</div>
                  <p className="step-label">{current.eyebrow}</p>
                  <h2>{current.title}</h2>
                  <div className="choice-grid">
                    {current.choices.map((choice) => (
                      <button
                        key={choice.value}
                        className={`choice ${selected === choice.value ? "choice--selected" : ""}`}
                        onClick={() => choose(choice.value)}
                        aria-pressed={selected === choice.value}
                      >
                        <span aria-hidden="true">{choice.emoji}</span>
                        {choice.label}
                      </button>
                    ))}
                  </div>

                  {current.key === "date" && (
                    <div className="specific-date-wrap">
                      {specificDate ? (
                        <label className="date-field">
                          <span>Choose a date</span>
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
                          ✏️ Pick a specific date instead
                        </button>
                      )}
                    </div>
                  )}

                  <button className="next-button" disabled={!selected} onClick={next}>
                    Next 💕
                  </button>
                </>
              ) : (
                <form onSubmit={submit}>
                  <div className="step-icon" aria-hidden="true">💌</div>
                  <p className="step-label">STEP 5 OF 5</p>
                  <h2>One last little thing…</h2>

                  <div className="summary-grid">
                    {summary.map(([emoji, label, value]) => (
                      <button
                        type="button"
                        className="summary-item"
                        key={label}
                        onClick={() => setStep(summary.findIndex((item) => item[1] === label))}
                      >
                        <span aria-hidden="true">{emoji}</span>
                        <span><small>{label}</small><strong>{value}</strong></span>
                      </button>
                    ))}
                  </div>

                  <label className="text-field">
                    <span>Your name</span>
                    <input
                      value={answers.name}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="So I know who said yes 💕"
                      maxLength={80}
                      autoComplete="name"
                    />
                  </label>

                  <label className="text-field">
                    <span>A note for Thinh <small>(optional)</small></span>
                    <textarea
                      value={answers.note}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, note: event.target.value }))}
                      placeholder="Anything else you'd like to add?"
                      rows={3}
                      maxLength={600}
                    />
                  </label>

                  {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

                  <button className="next-button" disabled={status === "sending"} type="submit">
                    {status === "sending" ? "Sending…" : "Send my answer 💘"}
                  </button>
                  <p className="privacy-note">Your answers are sent privately to Thinh.</p>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
