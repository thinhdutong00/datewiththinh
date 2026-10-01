# datewiththinh 💘

A mobile-first, five-step date invitation inspired by the supplied screen recording. Every completed request is delivered privately by Resend.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add a valid `RESEND_API_KEY` to `.env.local`. During Resend onboarding, `onboarding@resend.dev` can send only to the email address associated with the Resend account. For a public launch, verify a sending domain and update `RESEND_FROM_EMAIL`.

## Deploy on Vercel

Set these environment variables for Production, Preview, and Development:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `DATE_REQUEST_TO_EMAIL=thinh.dutong00@gmail.com`

Then deploy with `vercel --prod` or import the GitHub repository from the Vercel dashboard.
