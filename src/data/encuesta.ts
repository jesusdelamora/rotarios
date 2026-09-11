export const CLUB = "Club Rotarios Saltillo Industrial";
export const TITULO_ENCUESTA = "Encuesta sobre la Salud del Club";
export const ANIO = 2026;

/** Regla del PDF: si en una sección quedan más de 5 casillas sin marcar, esa área debe atenderse. */
export const MAX_SIN_MARCAR = 5;

export const INTRO =
  "Al igual que las visitas de rutina al médico nos ayudan a identificar los riesgos para la salud antes de que se vuelvan graves, una encuesta sobre la salud del club puede diagnosticar las áreas problemáticas y recetar soluciones. Marca las casillas junto a las afirmaciones que consideres verdaderas, basándote en los últimos 12 meses. Si dejas en blanco más de cinco casillas en cualquier sección, esa área debe abordarse.";

export type Seccion = {
  id: string;
  titulo: string;
  descripcion: string;
  items: string[];
};

export const SECCIONES: Seccion[] = [
  {
    id: "experiencia",
    titulo: "Experiencia en el club",
    descripcion:
      "Es más probable que los socios que tienen una experiencia positiva en el club permanezcan en sus clubes. La experiencia incluye no solo las reuniones del club y otras actividades, sino también las conexiones que has establecido y el orgullo que sientes por la labor de Rotary.",
    items: [
      "Espero con entusiasmo asistir a las reuniones del club y otras de sus actividades.",
      "Los programas de las reuniones de nuestro club son pertinentes, interesantes y variados.",
      "Contamos con anfitriones para dar la bienvenida a los socios y visitantes a las reuniones.",
      "Nuestras reuniones se organizan y manejan de manera profesional.",
      "Los socios se esfuerzan por reunirse y hablar con diferentes personas en cada reunión.",
      "He hecho varios nuevos amigos en el club.",
      "Nuestro club intenta nuevas ideas (actividades, prácticas y formatos para las reuniones, proyectos de servicio, eventos sociales, etc.) para enriquecer la experiencia de los socios.",
      "Somos inclusivos en relación a las personas que invitamos a nuestro club, la forma en que damos la bienvenida a los invitados, los temas que discutimos y el servicio en el que nos enfocamos.",
      "Los socios que no son líderes del club participan en eventos de Rotary a nivel distrital o internacional.",
      "La mayoría de los socios conocen las Avenidas de Servicio de Rotary y las áreas de interés, participan en proyectos y se sienten orgullosos de ser parte del club.",
      "Recaudamos fondos de manera que los socios aportan según sus posibilidades.",
      "Reconocemos el servicio, el compromiso y las donaciones de los socios al proponerlos para recibir premios y otorgarlos.",
      "He forjado vínculos internacionales a través de Rotary.",
      "Pedimos a los invitados que se presenten y se les invita a regresar.",
      "Ofrecemos a los socios oportunidades flexibles para las reuniones (tales como asistir virtualmente o en persona o ver grabaciones si no pudieron asistir a una reunión).",
    ],
  },
  {
    id: "servicio",
    titulo: "Proyectos de servicio y eventos sociales",
    descripcion:
      "Participar en proyectos de servicio y divertirse con otros socios son las principales razones por las que los socios se afilian y se mantienen involucrados en Rotary. Los clubes más saludables varían sus actividades y ofrecen diferentes métodos de participación.",
    items: [
      "Nuestro club lleva a cabo reuniones sociales frecuentes (además de las reuniones del club) para que los socios tengan la oportunidad de socializar y establecer contactos.",
      "Nuestro club anima a los socios a que inviten a sus parejas, cónyuges, amigos y familiares a los eventos y reuniones del club.",
      "Nuestro club ofrece a los socios oportunidades de liderazgo y desarrollo profesional.",
      "Nuestro club invita a los miembros de la familia Rotary (tales como los rotaractianos, interactianos, estudiantes del Programa de Intercambio de Jóvenes y becarios de Rotary pro Paz) a participar en las reuniones y eventos.",
      "Nuestro club patrocina un club Rotaract o Interact, patrocina o aloja a un estudiante de Intercambio de Jóvenes, está involucrado con el programa Intercambios de Servicio para las Nuevas Generaciones, u organiza un evento de los Seminarios de Rotary para Líderes Jóvenes (RYLA).",
      "Nuestro club tiene comunicación directa con colaboradores, amigos y exbecarios.",
      "Consultamos con los líderes y los miembros de la comunidad para evaluar las necesidades de la comunidad antes de elegir un proyecto.",
      "Visitamos los foros de discusión de Mi Rotary, asistimos a ferias de proyectos o consultamos al Equipo de Asesores Técnicos de La Fundación Rotaria (Cadre) para buscar ideas y socios antes de elegir un nuevo proyecto.",
      "Nuestro club tiene un proyecto de servicio en desarrollo.",
      "Todos los socios pueden hacer recomendaciones (por ejemplo, con sus conocimientos profesionales) para las actividades sociales y de servicio.",
      "Los proyectos de servicio de nuestro club se alinean con las áreas de interés de Rotary.",
      "Nuestro club ha solicitado o utilizado fondos de subvenciones de Rotary para un proyecto de servicio.",
      "Al menos un socio de nuestro club asiste cada año a un seminario de gestión de subvenciones de La Fundación Rotaria.",
      "Nuestro club contribuye a La Fundación Rotaria.",
      "Nuestro club tiene un presidente del Comité de La Fundación Rotaria y un presidente del Comité de Proyectos de Servicio.",
    ],
  },
  {
    id: "socios",
    titulo: "Socios",
    descripcion:
      "Un club saludable es uno que crece y cambia. Contar con socios que tengan diferentes perspectivas e historiales fomentará la innovación y dará al club una comprensión más amplia de las necesidades de la comunidad. Involucrar a los socios y permitirles expresar sus opiniones sobre el futuro del club fortalecerá al club y el compromiso de los socios con Rotary.",
    items: [
      "Nuestro club tuvo un aumento neto en el número de socios el año pasado.",
      "Nuestro club tuvo un aumento neto en el número de socios que representan a diversos grupos.",
      "Nuestro club representa la diversidad racial o étnica de nuestra comunidad.",
      "Nuestro club trata de captar socios que ejercen profesiones en la comunidad y que están menos representados en el club.",
      "Los nuevos socios ingresan mediante una ceremonia oficial y se les da una orientación, materiales informativos y oportunidades para involucrarse.",
      "Nuestro club se mantiene en contacto activamente con los exbecarios (antiguos rotaractianos, estudiantes del Intercambio de Jóvenes, becarios pro Paz y participantes en otros programas de Rotary).",
      "Nuestro club muestra su aprecio por las contribuciones únicas de cada socio.",
      "Nuestro club conserva al menos el 90 % de los socios cada año.",
      "Al menos el 75 % de nuestros socios están involucrados en un proyecto de servicio de forma directa, un cargo de liderazgo u otras funciones asignadas.",
      "Una persona designada verifica y da seguimiento a las consultas y recomendaciones sobre membresía que se le asignen al club.",
      "Nuestro club explica y promueve los beneficios a los socios nuevos y ya existentes.",
      "Asignamos a los socios veteranos la tarea de establecer relaciones de mentoría con los socios más nuevos.",
      "Pedimos a los socios que tomen la palabra en las reuniones para hablar sobre sus profesiones y otros temas de interés.",
      "Nuestro club cuenta con un comité de membresía cuyo presidente y socios se dedican a atraer e involucrar a los socios del club.",
      "Los socios asisten a eventos distritales y a seminarios sobre temas de Rotary que les interesan.",
    ],
  },
  {
    id: "imagen",
    titulo: "Imagen",
    descripcion:
      "Los socios se sienten más a gusto en clubes que son divertidos y que generan impacto. Una imagen pública positiva mejora la relación del club con la comunidad y los socios potenciales. Asegúrate de que el club reciba el reconocimiento por el servicio que brinda.",
    items: [
      "Tenemos un sitio web público visualmente atractivo que explica lo que hace el club, quiénes son sus socios y los beneficios de la membresía.",
      "Tenemos cuentas en las redes sociales que muestran a nuestros seguidores la diferencia que marcamos en nuestra comunidad.",
      "Nuestras cuentas en las redes sociales llegan a una amplia gama de audiencias.",
      "Nuestro club apareció en los medios de comunicación locales varias veces el año pasado.",
      "Promovemos nuestro club y Rotary a través de diversos medios de comunicación de la comunidad (televisión, radio, vallas publicitarias, etc.).",
      "Nuestro club invita a los miembros de los medios de comunicación a cubrir nuestros proyectos de servicio.",
      "Los materiales de nuestro club cumplen las pautas actualizadas de la marca Rotary.",
      "Utilizamos las plantillas y materiales de la marca Rotary del Brand Center que muestran a nuestros socios como gente de acción.",
      "Utilizamos los materiales de mercadotecnia de Rotary International, como por ejemplo, los anuncios de los proyectos de servicio, videos, imágenes y logotipos.",
      "Colocamos carteles y banderines de Rotary y Rotaract en nuestro lugar de reunión, proyectos de servicio y eventos.",
      "Nuestro club es conocido en la comunidad.",
      "El folleto del club que entregamos a los miembros de la comunidad y a los socios potenciales muestra el impacto que generamos.",
      "Nuestro club cuenta con socios que tienen experiencia en mercadotecnia.",
      "Construimos la imagen pública de Rotary asegurándonos de que nuestros invitados y el público tengan experiencias positivas con nuestro club.",
      "Nuestro club cuenta con un comité de imagen pública cuyo presidente y socios se dedican a la imagen pública y a la labor de difusión.",
    ],
  },
  {
    id: "operaciones",
    titulo: "Operaciones",
    descripcion:
      "Cuando un club funciona sin complicaciones, es probable que tenga buenos líderes que miran hacia el futuro. El desarrollo del liderazgo, la planificación estratégica y el plan de sucesión son también una manera de fortalecer al club.",
    items: [
      "Tenemos un plan estratégico para nuestro club que actualizamos con regularidad.",
      "Hemos establecido metas anuales y las hemos ingresado en Rotary Club Central.",
      "Nuestro club se esfuerza y a menudo gana la Mención de Rotary.",
      "La Directiva de nuestro club se reúne al menos trimestralmente para revisar nuestro plan estratégico, medir nuestro progreso hacia la consecución de las metas y modificar los estatutos y otros documentos según sea necesario.",
      "La Directiva de nuestro club hace cambios cuando algo no funciona y actualiza los estatutos del club.",
      "Existe un proceso para garantizar la continuidad que identifica a los futuros líderes de club y los prepara para ocupar cargos de liderazgo, documenta procedimientos e involucra a líderes actuales, pasados y futuros en la toma de decisiones.",
      "El presidente o presidenta de nuestro club asiste al PETS y los líderes del club asisten a la asamblea distrital de capacitación.",
      "Los líderes del club utilizan Mi Rotary o el software integrado de gestión de clubes para llevar a cabo las actividades rotarias.",
      "Nuestro club elige a los funcionarios entrantes a más tardar el 31 de diciembre y notifica a Rotary International a más tardar el 1 de febrero.",
      "El secretario o secretaria de nuestro club notifica sobre los nuevos socios dentro de los 30 días posteriores a su afiliación.",
      "Nuestro club establece y aprueba un presupuesto para el siguiente año rotario, designa un tesorero y mantiene cuentas bancarias separadas para administrar y recaudar fondos para los proyectos.",
      "Nuestro club establece y alcanza sus metas de captación de fondos a través de varias actividades.",
      "Solicitamos a nuestros socios que completen una encuesta sobre la satisfacción de los socios cada año y utilizamos los resultados para moldear el club.",
      "Más de la mitad de los socios de nuestro club tienen una cuenta en Mi Rotary.",
      "Nuestro club tiene un presidente del Comité de Administración del club.",
    ],
  },
];

export const ITEMS_POR_SECCION = 15;

/** Respuestas: { [seccionId]: boolean[15] } */
export type Respuestas = Record<string, boolean[]>;
/** Comentarios: { [seccionId]: string } */
export type Comentarios = Record<string, string>;
