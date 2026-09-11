import { CLUB } from "@/data/encuesta";
import { ButtonLink, Card } from "@/components/ui";
import { LimpiarBorrador } from "./LimpiarBorrador";

export default function Gracias() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <LimpiarBorrador />
      <Card>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rotary-gold text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-rotary-blue">¡Gracias por tu respuesta!</h1>
        <p className="mt-3 text-rotary-gray">
          Tu opinión ayuda a que el {CLUB} siga siendo un club saludable. La directiva revisará
          los resultados en conjunto.
        </p>
        <ButtonLink href="/" variant="outline" className="mt-6">
          Volver al inicio
        </ButtonLink>
      </Card>
    </div>
  );
}
