import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A date with Thinh 💘",
  description: "One very important question — planned with love.",
  icons: {
    icon: "/heart.svg",
  },
  openGraph: {
    title: "A date with Thinh 💘",
    description: "Will you go on a date with me?",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7b6d7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
