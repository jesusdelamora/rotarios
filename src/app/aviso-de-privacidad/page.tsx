import type { Metadata } from "next";
import { PRIVACIDAD } from "@/data/privacidad";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Aviso de privacidad" };

export default function AvisoPrivacidad() {
  const p = PRIVACIDAD;
  const contacto = [p.correo && `correo ${p.correo}`, p.telefono && `teléfono ${p.telefono}`].filter(Boolean).join(" o ");
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-rotary-blue">Aviso de privacidad</h1>
      <p className="mt-1 text-sm text-rotary-gray">Última actualización: {p.fechaActualizacion}</p>

      <Card className="mt-6 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold text-rotary-blue">Responsable</h2>
          <p>
            <strong>{p.responsable}</strong>
            {p.domicilio ? `, con domicilio en ${p.domicilio},` : ""} es el responsable del tratamiento de los datos
            personales que se recaban a través de esta aplicación, conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares y su Reglamento.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Datos que recabamos</h2>
          <p>Según el módulo que utilices, podemos recabar:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>
              <strong>Encuesta sobre la salud del club:</strong> de forma opcional, tu nombre y cargo en el club, además de
              tus respuestas y comentarios. Puedes responder de manera anónima.
            </li>
            <li>
              <strong>Ver para aprender:</strong> nombre, edad y escuela del alumno; nombre y teléfono del padre, madre o
              tutor; nombre del evaluador; respuestas del cuestionario de signos y síntomas; resultados de agudeza visual
              y observaciones del evaluador.
            </li>
            <li>
              <strong>Cuentas de usuario:</strong> nombre, nombre de usuario y contraseña (almacenada de forma cifrada),
              así como la fecha de tu último acceso.
            </li>
          </ul>
          <p className="mt-2">
            Los datos de salud visual del alumno son <strong>datos personales sensibles</strong>. Solo se recaban con el
            consentimiento expreso del padre, madre o tutor, que se registra al dar de alta al alumno.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Para qué usamos tus datos</h2>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Evaluar la salud del club y planear acciones de mejora (encuesta).</li>
            <li>Identificar posibles problemas de visión en los alumnos y canalizarlos a una valoración profesional.</li>
            <li>Dar seguimiento a cada alumno a lo largo del programa mediante uno o varios cuestionarios.</li>
            <li>Contactar al padre, madre o tutor sobre los resultados de su hijo o hija.</li>
            <li>Generar estadísticas del programa de forma agregada, sin identificar a las personas.</li>
          </ul>
          <p className="mt-2">No usamos tus datos con fines publicitarios ni los vendemos.</p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Con quién los compartimos</h2>
          <p>
            Los datos de los alumnos pueden compartirse únicamente con los profesionales de la salud visual que colaboran
            en el programa para realizar las valoraciones, y con la escuela del alumno para coordinar el seguimiento. No
            se transfieren a terceros con otros fines, salvo requerimiento de autoridad competente.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Quién puede ver la información</h2>
          <p>
            El acceso está protegido con usuario y contraseña. Los rotarios del club administran el programa; los maestros
            ven a los alumnos que registran; los padres, madres o tutores solo ven la información de sus propios hijos.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Cómo los protegemos</h2>
          <p>
            La información se almacena en servicios en la nube con conexión cifrada. Las contraseñas se guardan cifradas y
            no son visibles para nadie, ni siquiera para los administradores.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Tus derechos (ARCO)</h2>
          <p>
            Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus datos, así como
            revocar tu consentimiento, escribiendo al responsable
            {contacto ? ` por ${contacto}` : " a través de cualquier rotario del club"}. Responderemos en un plazo máximo de
            20 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-rotary-blue">Cambios a este aviso</h2>
          <p>
            Cualquier modificación se publicará en esta misma página, con la fecha de actualización al inicio.
          </p>
        </section>
      </Card>
    </div>
  );
}
