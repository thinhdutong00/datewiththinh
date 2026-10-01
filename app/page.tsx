"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const languageOptions = [
  { value: "en", label: "English", locale: "en-GB" },
  { value: "es", label: "Español", locale: "es-ES" },
  { value: "it", label: "Italiano", locale: "it-IT" },
  { value: "de", label: "Deutsch", locale: "de-DE" },
  { value: "pt", label: "Português", locale: "pt-BR" },
  { value: "fr", label: "Français", locale: "fr-FR" },
  { value: "zh", label: "中文", locale: "zh-CN" },
  { value: "hi", label: "हिन्दी", locale: "hi-IN" },
  { value: "ar", label: "العربية", locale: "ar" },
  { value: "ja", label: "日本語", locale: "ja-JP" },
  { value: "ko", label: "한국어", locale: "ko-KR" },
  { value: "ru", label: "Русский", locale: "ru-RU" },
] as const;

type Language = (typeof languageOptions)[number]["value"];
type AnswerKey = "date" | "time" | "activity" | "food";
type Choice = { emoji: string; value: string };
type Step = {
  key: AnswerKey;
  icon: string;
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
  es: {
    importantQuestion: "UNA PREGUNTA MUY IMPORTANTE",
    introTitle: ["¿Quieres tener una", "cita conmigo?"],
    prettyPlease: "¿Por favor?",
    yes: "¡¡Sí!! 💖",
    no: "No 😔",
    noAria: "No — ¿estás segura?",
    sentKicker: "SOLICITUD ENVIADA",
    successTitle: "¡Es una cita!",
    successBody: "Tus respuestas están de camino a Thinh. Ahora viene lo mejor ✨",
    step: "PASO",
    of: "DE",
    progress: "Paso",
    back: "Volver",
    chooseDate: "Elige una fecha",
    specificDate: "Elegir una fecha concreta",
    next: "Siguiente 💕",
    finalTitle: "Una última cosita…",
    summary: { date: "Cuándo", time: "Hora", activity: "Plan", food: "Comida" },
    name: "Tu nombre",
    namePlaceholder: "Para saber quién ha dicho que sí 💕",
    phone: "Número de teléfono",
    phonePlaceholder: "Tu número",
    prefix: "Código de país",
    note: "Un mensaje para Thinh",
    notePlaceholder: "¿Quieres añadir algo más?",
    optional: "opcional",
    nameError: "Primero dime tu nombre 💗",
    phoneError: "Introduce un número de teléfono válido.",
    genericError: "Algo salió mal.",
    tryAgain: "Inténtalo de nuevo.",
    sending: "Enviando…",
    send: "Enviar mi respuesta 💘",
    privacy: "Tus respuestas se envían de forma privada a Thinh.",
    language: "Elegir idioma",
  },
  de: {
    importantQuestion: "EINE SEHR WICHTIGE FRAGE",
    introTitle: ["Möchtest du mit mir", "auf ein Date gehen?"],
    prettyPlease: "Bitte?",
    yes: "Ja!! 💖",
    no: "Nein 😔",
    noAria: "Nein — bist du sicher?",
    sentKicker: "DATE-ANFRAGE GESENDET",
    successTitle: "Es ist ein Date!",
    successBody: "Deine Antworten sind auf dem Weg zu Thinh. Jetzt kommt das Beste ✨",
    step: "SCHRITT",
    of: "VON",
    progress: "Schritt",
    back: "Zurück",
    chooseDate: "Datum auswählen",
    specificDate: "Ein bestimmtes Datum wählen",
    next: "Weiter 💕",
    finalTitle: "Eine letzte Kleinigkeit…",
    summary: { date: "Wann", time: "Uhrzeit", activity: "Plan", food: "Essen" },
    name: "Dein Name",
    namePlaceholder: "Damit ich weiß, wer Ja gesagt hat 💕",
    phone: "Telefonnummer",
    phonePlaceholder: "Deine Nummer",
    prefix: "Ländervorwahl",
    note: "Eine Nachricht für Thinh",
    notePlaceholder: "Möchtest du noch etwas hinzufügen?",
    optional: "optional",
    nameError: "Sag mir zuerst deinen Namen 💗",
    phoneError: "Gib bitte eine gültige Telefonnummer ein.",
    genericError: "Etwas ist schiefgelaufen.",
    tryAgain: "Bitte versuche es erneut.",
    sending: "Wird gesendet…",
    send: "Meine Antwort senden 💘",
    privacy: "Deine Antworten werden privat an Thinh gesendet.",
    language: "Sprache wählen",
  },
  pt: {
    importantQuestion: "UMA PERGUNTA MUITO IMPORTANTE",
    introTitle: ["Você aceita sair", "comigo?"],
    prettyPlease: "Por favor?",
    yes: "Sim!! 💖",
    no: "Não 😔",
    noAria: "Não — tem certeza?",
    sentKicker: "PEDIDO ENVIADO",
    successTitle: "Temos um encontro!",
    successBody: "Suas respostas estão a caminho do Thinh. Agora vem a melhor parte ✨",
    step: "ETAPA",
    of: "DE",
    progress: "Etapa",
    back: "Voltar",
    chooseDate: "Escolha uma data",
    specificDate: "Escolher uma data específica",
    next: "Continuar 💕",
    finalTitle: "Só mais uma coisinha…",
    summary: { date: "Quando", time: "Horário", activity: "Programa", food: "Comida" },
    name: "Seu nome",
    namePlaceholder: "Para eu saber quem disse sim 💕",
    phone: "Número de telefone",
    phonePlaceholder: "Seu número",
    prefix: "Código do país",
    note: "Uma mensagem para Thinh",
    notePlaceholder: "Quer acrescentar mais alguma coisa?",
    optional: "opcional",
    nameError: "Primeiro, diga seu nome 💗",
    phoneError: "Digite um número de telefone válido.",
    genericError: "Algo deu errado.",
    tryAgain: "Tente novamente.",
    sending: "Enviando…",
    send: "Enviar minha resposta 💘",
    privacy: "Suas respostas são enviadas em particular para Thinh.",
    language: "Escolher idioma",
  },
  fr: {
    importantQuestion: "UNE QUESTION TRÈS IMPORTANTE",
    introTitle: ["Veux-tu aller à un", "rendez-vous avec moi ?"],
    prettyPlease: "S’il te plaît ?",
    yes: "Oui !! 💖",
    no: "Non 😔",
    noAria: "Non — tu es sûre ?",
    sentKicker: "DEMANDE ENVOYÉE",
    successTitle: "C’est un rendez-vous !",
    successBody: "Tes réponses sont en route vers Thinh. Maintenant, place au meilleur ✨",
    step: "ÉTAPE",
    of: "SUR",
    progress: "Étape",
    back: "Retour",
    chooseDate: "Choisir une date",
    specificDate: "Choisir une date précise",
    next: "Suivant 💕",
    finalTitle: "Une toute dernière chose…",
    summary: { date: "Quand", time: "Heure", activity: "Programme", food: "Repas" },
    name: "Ton prénom",
    namePlaceholder: "Pour savoir qui a dit oui 💕",
    phone: "Numéro de téléphone",
    phonePlaceholder: "Ton numéro",
    prefix: "Indicatif du pays",
    note: "Un message pour Thinh",
    notePlaceholder: "Tu veux ajouter quelque chose ?",
    optional: "facultatif",
    nameError: "Dis-moi d’abord ton prénom 💗",
    phoneError: "Saisis un numéro de téléphone valide.",
    genericError: "Une erreur s’est produite.",
    tryAgain: "Réessaie.",
    sending: "Envoi…",
    send: "Envoyer ma réponse 💘",
    privacy: "Tes réponses sont envoyées en privé à Thinh.",
    language: "Choisir la langue",
  },
  zh: {
    importantQuestion: "一个非常重要的问题",
    introTitle: ["愿意和我", "约会吗？"],
    prettyPlease: "答应我，好吗？",
    yes: "愿意！！💖",
    no: "不了 😔",
    noAria: "不了——你确定吗？",
    sentKicker: "约会邀请已发送",
    successTitle: "约会定啦！",
    successBody: "你的回答正在发送给 Thinh。接下来是最美好的部分 ✨",
    step: "步骤",
    of: "/",
    progress: "步骤",
    back: "返回",
    chooseDate: "选择日期",
    specificDate: "选择一个具体日期",
    next: "下一步 💕",
    finalTitle: "最后一件小事…",
    summary: { date: "日期", time: "时间", activity: "安排", food: "食物" },
    name: "你的名字",
    namePlaceholder: "这样我就知道是谁答应了 💕",
    phone: "电话号码",
    phonePlaceholder: "你的号码",
    prefix: "国家区号",
    note: "给 Thinh 的留言",
    notePlaceholder: "还有什么想说的吗？",
    optional: "选填",
    nameError: "请先告诉我你的名字 💗",
    phoneError: "请输入有效的电话号码。",
    genericError: "出现了一点问题。",
    tryAgain: "请再试一次。",
    sending: "正在发送…",
    send: "发送我的回答 💘",
    privacy: "你的回答会私密发送给 Thinh。",
    language: "选择语言",
  },
  hi: {
    importantQuestion: "एक बहुत ज़रूरी सवाल",
    introTitle: ["क्या तुम मेरे साथ", "डेट पर चलोगी?"],
    prettyPlease: "प्लीज़?",
    yes: "हाँ!! 💖",
    no: "नहीं 😔",
    noAria: "नहीं — क्या तुम्हें यक़ीन है?",
    sentKicker: "डेट अनुरोध भेज दिया गया",
    successTitle: "डेट पक्की!",
    successBody: "तुम्हारे जवाब Thinh तक पहुँच रहे हैं। अब सबसे अच्छा हिस्सा बाकी है ✨",
    step: "चरण",
    of: "में से",
    progress: "चरण",
    back: "वापस जाएँ",
    chooseDate: "तारीख चुनें",
    specificDate: "कोई खास तारीख चुनें",
    next: "आगे 💕",
    finalTitle: "बस एक आख़िरी छोटी-सी बात…",
    summary: { date: "कब", time: "समय", activity: "योजना", food: "खाना" },
    name: "तुम्हारा नाम",
    namePlaceholder: "ताकि मुझे पता चले किसने हाँ कहा 💕",
    phone: "फ़ोन नंबर",
    phonePlaceholder: "तुम्हारा नंबर",
    prefix: "देश कोड",
    note: "Thinh के लिए संदेश",
    notePlaceholder: "कुछ और कहना चाहोगी?",
    optional: "वैकल्पिक",
    nameError: "पहले अपना नाम बताओ 💗",
    phoneError: "कृपया एक मान्य फ़ोन नंबर डालें।",
    genericError: "कुछ गड़बड़ हो गई।",
    tryAgain: "फिर से कोशिश करें।",
    sending: "भेजा जा रहा है…",
    send: "मेरा जवाब भेजें 💘",
    privacy: "तुम्हारे जवाब निजी तौर पर Thinh को भेजे जाते हैं।",
    language: "भाषा चुनें",
  },
  ar: {
    importantQuestion: "سؤال مهم جدًا",
    introTitle: ["هل ترغب في", "الخروج في موعد معي؟"],
    prettyPlease: "أرجوك؟",
    yes: "نعم!! 💖",
    no: "لا 😔",
    noAria: "لا — هل أنت متأكد؟",
    sentKicker: "تم إرسال طلب الموعد",
    successTitle: "لدينا موعد!",
    successBody: "إجاباتك في طريقها إلى Thinh. والآن يأتي الجزء الأجمل ✨",
    step: "الخطوة",
    of: "من",
    progress: "الخطوة",
    back: "رجوع",
    chooseDate: "اختر تاريخًا",
    specificDate: "اختر تاريخًا محددًا",
    next: "التالي 💕",
    finalTitle: "شيء أخير صغير…",
    summary: { date: "متى", time: "الوقت", activity: "الخطة", food: "الطعام" },
    name: "اسمك",
    namePlaceholder: "لأعرف من قال نعم 💕",
    phone: "رقم الهاتف",
    phonePlaceholder: "رقمك",
    prefix: "رمز الدولة",
    note: "رسالة إلى Thinh",
    notePlaceholder: "هل تريد إضافة شيء آخر؟",
    optional: "اختياري",
    nameError: "أخبرني باسمك أولًا 💗",
    phoneError: "أدخل رقم هاتف صالحًا.",
    genericError: "حدث خطأ ما.",
    tryAgain: "حاول مرة أخرى.",
    sending: "جارٍ الإرسال…",
    send: "إرسال إجابتي 💘",
    privacy: "تُرسل إجاباتك إلى Thinh بشكل خاص.",
    language: "اختر اللغة",
  },
  ja: {
    importantQuestion: "とても大切な質問",
    introTitle: ["私とデートに", "行ってくれますか？"],
    prettyPlease: "お願い！",
    yes: "はい!! 💖",
    no: "いいえ 😔",
    noAria: "いいえ — 本当に？",
    sentKicker: "デートの回答を送信しました",
    successTitle: "デート決定！",
    successBody: "回答を Thinh に送信しました。ここからが一番楽しみです ✨",
    step: "ステップ",
    of: "/",
    progress: "ステップ",
    back: "戻る",
    chooseDate: "日付を選択",
    specificDate: "具体的な日付を選ぶ",
    next: "次へ 💕",
    finalTitle: "最後にもうひとつ…",
    summary: { date: "いつ", time: "時間", activity: "プラン", food: "食事" },
    name: "名前",
    namePlaceholder: "誰が「はい」と言ったか教えてね 💕",
    phone: "電話番号",
    phonePlaceholder: "電話番号",
    prefix: "国番号",
    note: "Thinh へのメッセージ",
    notePlaceholder: "ほかに伝えたいことはある？",
    optional: "任意",
    nameError: "まず名前を教えてね 💗",
    phoneError: "有効な電話番号を入力してください。",
    genericError: "問題が発生しました。",
    tryAgain: "もう一度お試しください。",
    sending: "送信中…",
    send: "回答を送る 💘",
    privacy: "回答は Thinh に非公開で送信されます。",
    language: "言語を選択",
  },
  ko: {
    importantQuestion: "아주 중요한 질문",
    introTitle: ["나와 데이트", "해줄래요?"],
    prettyPlease: "제발요?",
    yes: "네!! 💖",
    no: "아니요 😔",
    noAria: "아니요 — 정말 확실해요?",
    sentKicker: "데이트 요청을 보냈어요",
    successTitle: "데이트 확정!",
    successBody: "답변이 Thinh에게 전달되고 있어요. 이제 가장 좋은 순간이 남았어요 ✨",
    step: "단계",
    of: "/",
    progress: "단계",
    back: "뒤로",
    chooseDate: "날짜 선택",
    specificDate: "특정 날짜 선택",
    next: "다음 💕",
    finalTitle: "마지막으로 한 가지만…",
    summary: { date: "언제", time: "시간", activity: "계획", food: "음식" },
    name: "이름",
    namePlaceholder: "누가 좋다고 했는지 알려 주세요 💕",
    phone: "전화번호",
    phonePlaceholder: "전화번호",
    prefix: "국가 번호",
    note: "Thinh에게 남길 메시지",
    notePlaceholder: "더 하고 싶은 말이 있나요?",
    optional: "선택 사항",
    nameError: "먼저 이름을 알려 주세요 💗",
    phoneError: "올바른 전화번호를 입력해 주세요.",
    genericError: "문제가 발생했어요.",
    tryAgain: "다시 시도해 주세요.",
    sending: "전송 중…",
    send: "답변 보내기 💘",
    privacy: "답변은 Thinh에게 비공개로 전송됩니다.",
    language: "언어 선택",
  },
  ru: {
    importantQuestion: "ОЧЕНЬ ВАЖНЫЙ ВОПРОС",
    introTitle: ["Пойдёшь со мной", "на свидание?"],
    prettyPlease: "Ну пожалуйста?",
    yes: "Да!! 💖",
    no: "Нет 😔",
    noAria: "Нет — ты уверена?",
    sentKicker: "ПРИГЛАШЕНИЕ ОТПРАВЛЕНО",
    successTitle: "У нас свидание!",
    successBody: "Твои ответы уже летят к Thinh. Теперь начинается самое приятное ✨",
    step: "ШАГ",
    of: "ИЗ",
    progress: "Шаг",
    back: "Назад",
    chooseDate: "Выбрать дату",
    specificDate: "Выбрать конкретную дату",
    next: "Дальше 💕",
    finalTitle: "И ещё одна мелочь…",
    summary: { date: "Когда", time: "Время", activity: "План", food: "Еда" },
    name: "Твоё имя",
    namePlaceholder: "Чтобы я знал, кто сказал «да» 💕",
    phone: "Номер телефона",
    phonePlaceholder: "Твой номер",
    prefix: "Код страны",
    note: "Сообщение для Thinh",
    notePlaceholder: "Хочешь что-нибудь добавить?",
    optional: "необязательно",
    nameError: "Сначала напиши своё имя 💗",
    phoneError: "Введи действительный номер телефона.",
    genericError: "Что-то пошло не так.",
    tryAgain: "Попробуй ещё раз.",
    sending: "Отправка…",
    send: "Отправить мой ответ 💘",
    privacy: "Твои ответы будут отправлены Thinh лично.",
    language: "Выбрать язык",
  },
} as const;

const steps: Step[] = [
  {
    key: "date",
    icon: "📅",
    choices: [
      { emoji: "🌼", value: "This weekend" },
      { emoji: "🌌", value: "Friday night" },
      { emoji: "☀️", value: "Sunday brunch" },
      { emoji: "🎁", value: "A surprise!" },
    ],
  },
  {
    key: "time",
    icon: "🕐",
    choices: [
      { emoji: "🌅", value: "Morning" },
      { emoji: "☀️", value: "Afternoon" },
      { emoji: "🌇", value: "Evening" },
      { emoji: "🌙", value: "Night" },
    ],
  },
  {
    key: "activity",
    icon: "✨",
    choices: [
      { emoji: "☕", value: "Coffee & a walk" },
      { emoji: "🍷", value: "Dinner date" },
      { emoji: "🎬", value: "Movie night" },
      { emoji: "🎲", value: "Surprise me" },
    ],
  },
  {
    key: "food",
    icon: "🍽️",
    choices: [
      { emoji: "🍕", value: "Pizza" },
      { emoji: "🍣", value: "Sushi" },
      { emoji: "🍝", value: "Pasta" },
      { emoji: "🍨", value: "Something sweet" },
    ],
  },
];

const stepTranslations: Record<Language, ReadonlyArray<{ title: string; choices: readonly string[] }>> = {
  en: [
    { title: "When should our date be?", choices: ["This weekend", "Friday night", "Sunday brunch", "A surprise!"] },
    { title: "What time feels right?", choices: ["Morning", "Afternoon", "Evening", "Night"] },
    { title: "What should we do?", choices: ["Coffee & a walk", "Dinner date", "Movie night", "Surprise me"] },
    { title: "What are we eating?", choices: ["Pizza", "Sushi", "Pasta", "Something sweet"] },
  ],
  it: [
    { title: "Quando facciamo il nostro appuntamento?", choices: ["Questo weekend", "Venerdì sera", "Brunch domenicale", "Una sorpresa!"] },
    { title: "Qual è l’orario perfetto?", choices: ["Mattina", "Pomeriggio", "Sera", "Notte"] },
    { title: "Cosa ti andrebbe di fare?", choices: ["Caffè e passeggiata", "Cena romantica", "Serata cinema", "Sorprendimi"] },
    { title: "Cosa mangiamo?", choices: ["Pizza", "Sushi", "Pasta", "Qualcosa di dolce"] },
  ],
  es: [
    { title: "¿Cuándo debería ser nuestra cita?", choices: ["Este fin de semana", "Viernes por la noche", "Brunch del domingo", "¡Una sorpresa!"] },
    { title: "¿Qué hora te viene mejor?", choices: ["Mañana", "Tarde", "Atardecer", "Noche"] },
    { title: "¿Qué hacemos?", choices: ["Café y paseo", "Cena romántica", "Noche de cine", "Sorpréndeme"] },
    { title: "¿Qué comemos?", choices: ["Pizza", "Sushi", "Pasta", "Algo dulce"] },
  ],
  de: [
    { title: "Wann soll unser Date sein?", choices: ["Dieses Wochenende", "Freitagabend", "Sonntagsbrunch", "Eine Überraschung!"] },
    { title: "Welche Uhrzeit passt?", choices: ["Morgens", "Nachmittags", "Abends", "Nachts"] },
    { title: "Was sollen wir machen?", choices: ["Kaffee & Spaziergang", "Romantisches Dinner", "Filmabend", "Überrasch mich"] },
    { title: "Was wollen wir essen?", choices: ["Pizza", "Sushi", "Pasta", "Etwas Süßes"] },
  ],
  pt: [
    { title: "Quando será nosso encontro?", choices: ["Neste fim de semana", "Sexta à noite", "Brunch de domingo", "Uma surpresa!"] },
    { title: "Qual horário parece melhor?", choices: ["Manhã", "Tarde", "Fim de tarde", "Noite"] },
    { title: "O que vamos fazer?", choices: ["Café e caminhada", "Jantar romântico", "Noite de cinema", "Me surpreenda"] },
    { title: "O que vamos comer?", choices: ["Pizza", "Sushi", "Massa", "Algo doce"] },
  ],
  fr: [
    { title: "Quand aura lieu notre rendez-vous ?", choices: ["Ce week-end", "Vendredi soir", "Brunch du dimanche", "Une surprise !"] },
    { title: "Quelle heure te convient ?", choices: ["Matin", "Après-midi", "Soir", "Nuit"] },
    { title: "Qu’est-ce qu’on fait ?", choices: ["Café et promenade", "Dîner romantique", "Soirée cinéma", "Surprends-moi"] },
    { title: "Qu’est-ce qu’on mange ?", choices: ["Pizza", "Sushi", "Pâtes", "Quelque chose de sucré"] },
  ],
  zh: [
    { title: "我们的约会定在什么时候？", choices: ["这个周末", "周五晚上", "周日早午餐", "给我一个惊喜！"] },
    { title: "什么时间最合适？", choices: ["早上", "下午", "傍晚", "晚上"] },
    { title: "我们做什么？", choices: ["咖啡和散步", "浪漫晚餐", "电影之夜", "给我惊喜"] },
    { title: "我们吃什么？", choices: ["披萨", "寿司", "意大利面", "甜点"] },
  ],
  hi: [
    { title: "हमारी डेट कब हो?", choices: ["इस सप्ताहांत", "शुक्रवार की रात", "रविवार का ब्रंच", "एक सरप्राइज़!"] },
    { title: "कौन-सा समय सही रहेगा?", choices: ["सुबह", "दोपहर", "शाम", "रात"] },
    { title: "हम क्या करें?", choices: ["कॉफ़ी और सैर", "रोमांटिक डिनर", "मूवी नाइट", "मुझे चौंकाओ"] },
    { title: "हम क्या खाएँ?", choices: ["पिज़्ज़ा", "सुशी", "पास्ता", "कुछ मीठा"] },
  ],
  ar: [
    { title: "متى سيكون موعدنا؟", choices: ["نهاية هذا الأسبوع", "مساء الجمعة", "فطور الأحد المتأخر", "مفاجأة!"] },
    { title: "ما الوقت المناسب؟", choices: ["الصباح", "بعد الظهر", "المساء", "الليل"] },
    { title: "ماذا سنفعل؟", choices: ["قهوة ونزهة", "عشاء رومانسي", "ليلة سينمائية", "فاجئني"] },
    { title: "ماذا سنأكل؟", choices: ["بيتزا", "سوشي", "باستا", "شيء حلو"] },
  ],
  ja: [
    { title: "デートはいつにする？", choices: ["今週末", "金曜の夜", "日曜のブランチ", "サプライズ！"] },
    { title: "何時がいい？", choices: ["朝", "午後", "夕方", "夜"] },
    { title: "何をする？", choices: ["コーヒーと散歩", "ロマンチックなディナー", "映画ナイト", "おまかせ"] },
    { title: "何を食べる？", choices: ["ピザ", "寿司", "パスタ", "甘いもの"] },
  ],
  ko: [
    { title: "데이트는 언제 할까요?", choices: ["이번 주말", "금요일 밤", "일요일 브런치", "깜짝 데이트!"] },
    { title: "어떤 시간이 좋아요?", choices: ["아침", "오후", "저녁", "밤"] },
    { title: "무엇을 할까요?", choices: ["커피와 산책", "로맨틱한 저녁 식사", "영화 보기", "깜짝 놀라게 해줘"] },
    { title: "무엇을 먹을까요?", choices: ["피자", "스시", "파스타", "달콤한 디저트"] },
  ],
  ru: [
    { title: "Когда устроим свидание?", choices: ["В эти выходные", "В пятницу вечером", "Воскресный бранч", "Сюрприз!"] },
    { title: "Какое время подойдёт?", choices: ["Утро", "День", "Вечер", "Ночь"] },
    { title: "Чем займёмся?", choices: ["Кофе и прогулка", "Романтический ужин", "Вечер кино", "Удиви меня"] },
    { title: "Что будем есть?", choices: ["Пицца", "Суши", "Паста", "Что-нибудь сладкое"] },
  ],
};

const phonePrefixes = [
  { dial: "+39", flag: "🇮🇹", regions: ["IT"] },
  { dial: "+1", flag: "🇺🇸", regions: ["US", "CA"] },
  { dial: "+44", flag: "🇬🇧", regions: ["GB"] },
  { dial: "+33", flag: "🇫🇷", regions: ["FR"] },
  { dial: "+34", flag: "🇪🇸", regions: ["ES"] },
  { dial: "+49", flag: "🇩🇪", regions: ["DE"] },
  { dial: "+41", flag: "🇨🇭", regions: ["CH"] },
  { dial: "+43", flag: "🇦🇹", regions: ["AT"] },
  { dial: "+32", flag: "🇧🇪", regions: ["BE"] },
  { dial: "+31", flag: "🇳🇱", regions: ["NL"] },
  { dial: "+351", flag: "🇵🇹", regions: ["PT"] },
  { dial: "+353", flag: "🇮🇪", regions: ["IE"] },
  { dial: "+30", flag: "🇬🇷", regions: ["GR"] },
  { dial: "+45", flag: "🇩🇰", regions: ["DK"] },
  { dial: "+46", flag: "🇸🇪", regions: ["SE"] },
  { dial: "+47", flag: "🇳🇴", regions: ["NO"] },
  { dial: "+358", flag: "🇫🇮", regions: ["FI"] },
  { dial: "+48", flag: "🇵🇱", regions: ["PL"] },
  { dial: "+40", flag: "🇷🇴", regions: ["RO"] },
  { dial: "+420", flag: "🇨🇿", regions: ["CZ"] },
  { dial: "+385", flag: "🇭🇷", regions: ["HR"] },
  { dial: "+386", flag: "🇸🇮", regions: ["SI"] },
  { dial: "+381", flag: "🇷🇸", regions: ["RS"] },
  { dial: "+355", flag: "🇦🇱", regions: ["AL"] },
  { dial: "+380", flag: "🇺🇦", regions: ["UA"] },
  { dial: "+90", flag: "🇹🇷", regions: ["TR"] },
  { dial: "+972", flag: "🇮🇱", regions: ["IL"] },
  { dial: "+971", flag: "🇦🇪", regions: ["AE"] },
  { dial: "+91", flag: "🇮🇳", regions: ["IN"] },
  { dial: "+86", flag: "🇨🇳", regions: ["CN"] },
  { dial: "+81", flag: "🇯🇵", regions: ["JP"] },
  { dial: "+82", flag: "🇰🇷", regions: ["KR"] },
  { dial: "+61", flag: "🇦🇺", regions: ["AU"] },
  { dial: "+64", flag: "🇳🇿", regions: ["NZ"] },
  { dial: "+55", flag: "🇧🇷", regions: ["BR"] },
  { dial: "+52", flag: "🇲🇽", regions: ["MX"] },
  { dial: "+54", flag: "🇦🇷", regions: ["AR"] },
  { dial: "+27", flag: "🇿🇦", regions: ["ZA"] },
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
    const locale = languageOptions.find((option) => option.value === language)?.locale ?? "en-GB";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }

  const stepIndex = steps.findIndex((item) => item.key === key);
  if (stepIndex < 0) return value;

  const choiceIndex = steps[stepIndex].choices.findIndex((choice) => choice.value === value);
  return stepTranslations[language][stepIndex]?.choices[choiceIndex] ?? value;
}

function EnglishDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : today;
  const [initialYear, initialMonth] = initialDate.split("-").map(Number);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(initialYear, initialMonth - 1, 1, 12),
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1, 12).getDay();
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const previousDisabled = new Date(year, month, 1, 12) <= new Date(todayYear, todayMonth - 1, 1, 12);
  const monthTitle = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const formattedValue = value
    ? `${value.slice(5, 7)}/${value.slice(8, 10)}/${value.slice(0, 4)}`
    : "";

  function changeMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  }

  function chooseDay(day: number) {
    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isoDate >= today) onChange(isoDate);
  }

  return (
    <div className="english-date-picker" lang="en-US" dir="ltr" aria-label="Choose a date">
      <input
        className="date-display"
        value={formattedValue}
        placeholder="MM/DD/YYYY"
        aria-label="Selected date in MM/DD/YYYY format"
        readOnly
      />
      <div className="calendar-header">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={previousDisabled}
          aria-label="Previous month"
        >
          ‹
        </button>
        <strong>{monthTitle}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
      </div>
      <div className="calendar-grid calendar-weekdays" aria-hidden="true">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span className="calendar-spacer" key={`spacer-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const selectedDay = value === isoDate;
          const unavailable = isoDate < today;
          const accessibleDate = new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date(year, month, day, 12));

          return (
            <button
              type="button"
              className={selectedDay ? "calendar-day calendar-day--selected" : "calendar-day"}
              disabled={unavailable}
              onClick={() => chooseDay(day)}
              aria-label={accessibleDate}
              aria-pressed={selectedDay}
              aria-current={isoDate === today ? "date" : undefined}
              key={isoDate}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
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
  const currentTranslation = stepTranslations[language][step];
  const isReview = step === 4;
  const selected = current ? answers[current.key] : "";
  const locale = languageOptions.find((option) => option.value === language)?.locale ?? "en-GB";
  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
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
    if (!answers.phone.trim() || phoneDigits.length < 5 || phoneDigits.length > 18) {
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
    <main className="page-shell" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
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
          {languageOptions.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
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
                  <h2>{currentTranslation.title}</h2>
                  <div className="choice-grid">
                    {current.choices.map((choice, choiceIndex) => (
                      <button
                        key={choice.value}
                        className={`choice ${selected === choice.value ? "choice--selected" : ""}`}
                        onClick={() => choose(choice.value)}
                        aria-pressed={selected === choice.value}
                      >
                        <span aria-hidden="true">{choice.emoji}</span>
                        {currentTranslation.choices[choiceIndex]}
                      </button>
                    ))}
                  </div>

                  {current.key === "date" && (
                    <div className="specific-date-wrap">
                      {specificDate ? (
                        <EnglishDatePicker
                          value={answers.date.match(/^\d{4}-/) ? answers.date : ""}
                          onChange={(date) => setAnswers((previous) => ({ ...previous, date }))}
                        />
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
                <form onSubmit={submit} noValidate>
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
                      required
                    />
                  </label>

                  <div className="text-field">
                    <span>{t.phone} <small aria-hidden="true">*</small></span>
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
                            {prefix.flag} {prefix.regions.map((region) => regionNames.of(region) ?? region).join(" / ")} ({prefix.dial})
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
                        required
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
