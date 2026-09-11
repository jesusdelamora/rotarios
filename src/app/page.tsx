import { CLUB, INTRO, SECCIONES, TITULO_ENCUESTA, ANIO } from "@/data/encuesta";
import { ButtonLink, Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center mb-8">
        <p className="uppercase tracking-widest text-rotary-gold-dark font-semibold text-sm">
          {CLUB}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-rotary-blue mt-2">
          {TITULO_ENCUESTA} {ANIO}
        </h1>
      </div>
      <Card>
        <p className="text-rotary-gray leading-relaxed">{INTRO}</p>
        <h2 className="mt-6 font-bold text-rotary-blue">La encuesta tiene 5 secciones:</h2>
        <ol className="mt-2 grid gap-2 sm:grid-cols-2">
          {SECCIONES.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 rounded-md bg-rotary-gray-light px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rotary-gold font-bold text-rotary-blue-dark text-sm">
                {i + 1}
              </span>
              <span className="text-sm font-semibold">{s.titulo}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-rotary-gray">
          Cada sección tiene 15 afirmaciones. Marca las que consideres verdaderas. Toma
          alrededor de 10 minutos.
        </p>
        <div className="mt-6 text-center">
          <ButtonLink href="/encuesta" variant="gold" className="text-lg px-8 py-3">
            Comenzar la encuesta
          </ButtonLink>
        </div>
      </Card>
      <p className="mt-6 text-center text-xs text-rotary-gray">
        <a href="/admin" className="hover:underline">
          Acceso para la directiva
        </a>
      </p>
    </div>
  );
}
