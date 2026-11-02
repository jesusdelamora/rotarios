import Link from "next/link";
import { redirect } from "next/navigation";
import { getSesion, inicioDeRol } from "@/lib/auth";
import { CLUB } from "@/data/encuesta";
import { Card } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const s = await getSesion();
  if (s) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : inicioDeRol(s.rol));

  return (
    <div className="mx-auto max-w-sm px-4 py-8 sm:py-16">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">{CLUB}</p>
        <h1 className="mt-1 text-2xl font-bold text-rotary-blue">Iniciar sesión</h1>
      </div>
      <Card>
        <LoginForm next={next} />
      </Card>
      <p className="mt-4 text-center text-xs text-rotary-gray">
        ¿No tienes cuenta? Pídela a un rotario del club.
        <br />
        <Link href="/aviso-de-privacidad" className="underline">
          Aviso de privacidad
        </Link>
      </p>
    </div>
  );
}
