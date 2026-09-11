import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Link from "next/link";
import { CLUB, TITULO_ENCUESTA } from "@/data/encuesta";
import { RotaryLogo } from "@/components/RotaryLogo";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: `${TITULO_ENCUESTA} · ${CLUB}`,
  description: `${TITULO_ENCUESTA} del ${CLUB}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <header className="bg-white border-b-4 border-rotary-gold no-print">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
            <Link href="/" className="shrink-0" aria-label="Inicio">
              <RotaryLogo className="h-10 w-auto" />
            </Link>
            <div className="min-w-0">
              <p className="text-rotary-blue font-bold leading-tight truncate">
                {CLUB}
              </p>
              <p className="text-rotary-gray text-sm leading-tight">
                {TITULO_ENCUESTA}
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print text-center text-xs text-rotary-gray py-6">
          {CLUB} · Basado en la Encuesta sobre la Salud del Club de Rotary
          International
        </footer>
      </body>
    </html>
  );
}
