import { ButtonLink, Card } from "@/components/ui";

export default function Aprender() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">Ver para aprender</p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-rotary-blue">Muy pronto</h1>
      </div>
      <Card className="text-center">
        <p className="text-rotary-gray text-sm sm:text-base">
          Aquí vivirá el contenido de <strong>Ver para aprender</strong>. Estamos preparando esta sección.
        </p>
        <ButtonLink href="/" variant="outline" className="mt-6 w-full sm:w-auto">
          Volver al inicio
        </ButtonLink>
      </Card>
    </div>
  );
}
