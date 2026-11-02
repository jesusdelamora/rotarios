import Link from "next/link";
import { redirect } from "next/navigation";
import { getSesionVpa } from "@/lib/vpa-auth";
import { VPA_NOMBRE, VPA_PROGRAMA } from "@/data/vpa";
import { ButtonLink, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AprenderInicio() {
  const s = await getSesionVpa();
  if (s) {
    if (s.rol === "papa" && s.alumnoIds.length === 1) redirect(`/aprender/alumnos/${s.alumnoIds[0]}`);
    redirect("/aprender/alumnos");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">{VPA_NOMBRE}</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-rotary-blue">{VPA_PROGRAMA}</h1>
      </div>
      <Card className="text-center">
        <p className="text-sm text-rotary-gray">Para entrar necesitas una cuenta de usuario. Si no la tienes, pídela a un rotario del club.</p>
        <ButtonLink href="/login?next=/aprender" className="mt-4 w-full py-3 text-base">
          Iniciar sesión
        </ButtonLink>
        <p className="mt-4 text-xs text-rotary-gray">
          Los datos de los alumnos se tratan conforme al{" "}
          <Link href="/aviso-de-privacidad" className="underline">
            aviso de privacidad
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
