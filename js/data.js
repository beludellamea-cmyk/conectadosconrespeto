/* ==========================================================================
   CONECTADOS CON RESPETO — Contenido del caso
   --------------------------------------------------------------------------
   Este archivo es la FUENTE de los textos que se muestran en el sitio.
   Está en JavaScript (y no solo en JSON) para que la página funcione también
   abriendo index.html con doble clic, sin servidor. Una copia de referencia
   del caso está en datos/caso_educativo.json.

   Para cambiar textos: editá las cadenas entre comillas. No hace falta tocar
   el resto del código.
   ========================================================================== */
window.CASO = {
  project: "Conectados con respeto",
  caseTitle: "Una foto, cientos de miradas",
  fictionalDisclaimer:
    "Simulación educativa ficticia. Todas las personas y publicaciones representadas son inventadas.",

  /* ---- Foto del caso (única imagen con personas; ficticia) ---- */
  image: {
    src: "assets/img/foto_grupo_ficticio.webp",
    alt: "Cinco estudiantes posan sonrientes para una foto grupal en el pasillo de una escuela.",
    caption: "Imagen ficticia creada para simulación educativa.",
    longDescription:
      "Foto grupal tipo selfie tomada en un pasillo luminoso de una escuela, con ventanales a la derecha y una bandera argentina al fondo. Se ven cinco estudiantes con uniforme (remeras blancas y suéteres azul marino) muy juntos y sonrientes. Una de ellas, en primer plano, estira el brazo para sacar la foto; otra, a la derecha, hace la seña de la V con los dedos. Atrás se alcanzan a ver otros estudiantes en el pasillo. Las personas de la imagen son ficticias. Que haya sonrisas en la foto no significa que se haya dado permiso para publicarla."
  },

  groupName: "3.º B",
  notification: "Nueva publicación en el grupo 3.º B",

  characters: {
    Sofi: "estudiante que pide retirar la imagen y frenar las burlas",
    Nico: "comparte la imagen sin consultar",
    Bruno: "se burla de Sofi y vuelve a compartir la imagen",
    Lara: "informa que la foto llegó a otros grupos con mensajes de burla",
    Mica: "pide frenar las burlas y acompañar a Sofi"
  },

  post: {
    time: "08:05",
    author: "Nico",
    text: "Les dejo la foto que sacamos en el recreo 😅"
  },

  comments: [
    { time: "08:07", author: "Sofi", text: "No quería que subieran esa foto. ¿La podés borrar, por favor?" },
    { time: "08:10", author: "Bruno", text: "Jajaja, miren a Sofi en la foto. Qué exagerada 🙄" },
    { time: "08:13", author: "Lara", text: "Ya la pasaron a otro grupo. También hay mensajes burlándose de Sofi." },
    { time: "08:16", author: "Bruno", text: "La volví a compartir. Ahora la están mandando a otros grupos." },
    { time: "08:18", author: "Mica", text: "Sofi pidió que paren. No está bien burlarse ni reenviar la foto. Hay que acompañarla." },
    { time: "08:20", author: "Sofi", text: "Me siguen llegando burlas de otros chats. Ya les pedí que paren. Esto me hace sentir muy mal." }
  ],

  /* ---- Preguntas de la pantalla "El caso" ---- */
  caseQuestions: {
    central: "¿Qué está pasando?",
    open: [
      "¿Qué te llamó la atención?",
      "¿Qué señales de acoso encontramos y qué información nos falta?"
    ]
  },

  /* ---- Investigamos ---- */
  glossary: [
    {
      term: "Consentimiento",
      definition:
        "Acuerdo libre e informado para que alguien haga algo que nos involucra. Aparecer en una foto no implica autorizar que la publiquen."
    },
    {
      term: "Privacidad",
      definition:
        "Posibilidad de decidir qué información o imágenes personales compartimos y con quién."
    },
    {
      term: "Respeto",
      definition: "Reconocer derechos, opiniones y límites de otras personas, también en internet."
    },
    {
      term: "Difusión sin consentimiento",
      definition: "Compartir una imagen de alguien sin haber pedido o recibido permiso."
    },
    {
      term: "Ciberacoso",
      definition:
        "Hostigamiento a través de medios digitales que puede incluir burlas, humillaciones o difusión repetida de contenidos. Para analizarlo importan la reiteración, el contexto y sus efectos."
    }
  ],

  investigateQuestions: [
    "¿Qué sabemos con seguridad y qué necesitamos averiguar?",
    "¿Qué pidió Sofi?",
    "¿Qué respuestas obtuvo?",
    "¿Qué responsabilidad tienen quienes reenvían, comentan o miran sin intervenir?",
    "¿Qué señales de ciberacoso aparecen y qué información nos falta?"
  ],

  /* Preguntas extra para el debate presencial, sin pantallas */
  debateQuestions: [
    "¿Qué sabemos con seguridad y qué necesitamos averiguar?",
    "¿Por qué importa pedir consentimiento antes de compartir una imagen?",
    "¿Qué hace que una broma deje de ser graciosa para todas las personas?",
    "¿Qué responsabilidad tienen quienes reenvían, comentan o miran sin intervenir?",
    "¿Qué señales de ciberacoso aparecen? ¿Cómo podría intervenir el grupo para proteger a Sofi?"
  ],

  /* ---- Decidimos ---- */
  dilemmas: [
    {
      id: "decision1",
      title: "¿Qué harías ante esta situación?",
      situation: "Sofi pidió que retiraran su foto, pero las burlas y los reenvíos continúan en otros chats.",
      options: [
        {
          id: "reenviar",
          label: "Reenviar la foto",
          possibleConsequence:
            "La imagen puede circular todavía más y Sofi pierde control sobre dónde aparece.",
          reflection: "¿Cómo podríamos reparar o detener esta difusión?"
        },
        {
          id: "no_intervenir",
          label: "No intervenir",
          possibleConsequence: "Las burlas pueden continuar, la foto puede circular aún más y Sofi puede sentirse sola.",
          reflection: "¿Qué forma de apoyo sería segura y respetuosa?"
        },
        {
          id: "acompanar",
          label: "Pedir que se retire la foto y acompañar a Sofi",
          possibleConsequence:
            "Se reconoce el pedido de Sofi y se busca detener la difusión y las burlas con apoyo de sus compañeros.",
          reflection: "¿Qué otras acciones serían necesarias si continúa?"
        }
      ]
    },
    {
      id: "decision2",
      title: "La foto sigue circulando. ¿Qué hacemos ahora?",
      situation: "Sofi sigue recibiendo mensajes de burla y la imagen continúa circulando pese a su pedido.",
      options: [
        {
          id: "insultar",
          label: "Responder con insultos",
          possibleConsequence: "El conflicto puede aumentar y aparecer nuevas agresiones.",
          reflection: "¿Cómo se puede intervenir sin violencia?"
        },
        {
          id: "buscar_ayuda",
          label: "Pedir ayuda a una persona adulta de confianza o referente escolar",
          possibleConsequence:
            "Se amplían los apoyos para proteger a Sofi y buscar una solución respetuosa.",
          reflection: "¿Cómo aseguramos que Sofi participe en las decisiones que la afectan?"
        },
        {
          id: "ignorar",
          label: "Hacer de cuenta que nunca pasó",
          possibleConsequence:
            "El problema puede continuar sin el acompañamiento que se necesita.",
          reflection: "¿Qué alternativa de acompañamiento podríamos ofrecer?"
        }
      ]
    }
  ],

  /* Frases para empezar a fundamentar (se insertan en el cuadro de texto) */
  sentenceStarters: [
    "Elegimos esta opción porque…",
    "Creemos que Sofi se sentiría…",
    "Una consecuencia que no queremos es…",
    "Lo primero que haríamos es…",
    "Necesitaríamos saber…"
  ],

  /* ---- Construimos ---- */
  suggestedAgreements: [
    "Pedir permiso antes de publicar imágenes de otras personas.",
    "Respetar cuando alguien pide retirar un contenido.",
    "No reenviar fotografías ni mensajes que buscan humillar.",
    "Evitar burlas y comentarios ofensivos.",
    "Acompañar a quien recibe burlas o agresiones en internet.",
    "Pedir ayuda ante situaciones que no sabemos resolver.",
    "Cuidar nuestros datos y los de las demás personas.",
    "Pensar en las consecuencias antes de compartir.",
    "Dialogar sin insultar ni amenazar.",
    "Construir grupos digitales donde todas las voces sean respetadas."
  ],
  maxAgreements: 10,
  finalReflection: "¿Qué decisión tomarías hoy si presenciaras una situación parecida? ¿Por qué?"
};

/* ==========================================================================
   VIDEOS EN LENGUA DE SEÑAS ARGENTINA (LSA) — PUNTO DE INSERCIÓN
   --------------------------------------------------------------------------
   HOY NO HAY VIDEOS EN LSA. Todas las entradas están en null y el sitio lo
   dice abiertamente (no hay avatar ni "traducción" simulada).

   Cuando una persona competente en LSA grabe y revise un video para una
   escena (claves: inicio, notificacion, foto, mensajes, pausa, investigamos, decidimos, construimos), copiá el archivo a assets/lsa/ y completá la entrada, por ejemplo:

     foto: {
       src: "assets/lsa/caso.mp4",
       poster: "assets/lsa/caso.jpg",          // opcional
       captions: "assets/lsa/caso.es.vtt",     // opcional (subtítulos en español)
       transcript: "Texto completo de lo que se dice en el video…",
       credit: "Interpretado por … (nombre y rol)"  // quién lo realizó y revisó
     }

   El sitio mostrará entonces el reproductor (sin reproducción automática),
   con controles, subtítulos y transcripción.
   ========================================================================== */
window.CASO_LSA = {
  inicio: null,
  notificacion: null,
  foto: null,
  mensajes: null,
  pausa: null,
  investigamos: null,
  decidimos: null,
  construimos: null
};

/* ==========================================================================
   MATERIAL NARRATIVO (lo que se cuenta y se explora en cada escena).
   Los mensajes del caso están arriba (post y comments). Acá se agregan:
   etiquetas de tono con emoji (siempre acompañadas de texto), la línea de
   tiempo, lo que sabemos / falta, los conceptos y las señales a analizar.
   Todo es texto real: ningún texto importante va dentro de una imagen.
   ========================================================================== */
window.CASO.historia = {
  /* Tono de cada mensaje. El emoji es solo un apoyo visual: el texto dice lo mismo. */
  tonos: {
    post: { emoji: "📸", etiqueta: "comparte la foto" },
    c0: { emoji: "🙏", etiqueta: "pide que la retiren" },
    c1: { emoji: "🙄", etiqueta: "se burla de Sofi" },
    c2: { emoji: "📲", etiqueta: "avisa que las burlas llegaron a otro grupo" },
    c3: { emoji: "📤", etiqueta: "vuelve a compartir la imagen" },
    c4: { emoji: "🤝", etiqueta: "pide frenar las burlas y acompañar" },
    c5: { emoji: "✋", etiqueta: "cuenta cómo le afecta y vuelve a pedir que pare" }
  },
  /* Descripción en palabras de los emojis que aparecen dentro de los mensajes */
  emojisEnTexto: {
    post: "😅 significa: cara sonriendo con una gota de sudor.",
    c1: "🙄 significa: cara con los ojos en blanco."
  },
  colores: { Nico: "#1D4ED8", Sofi: "#6D28D9", Bruno: "#0F766E", Lara: "#BE185D", Mica: "#B45309" },

  escenas: [
    { id: "inicio", nombre: "Inicio" },
    { id: "notificacion", nombre: "Una notificación" },
    { id: "foto", nombre: "La foto" },
    { id: "mensajes", nombre: "Los mensajes" },
    { id: "pausa", nombre: "La historia se detiene" },
    { id: "investigamos", nombre: "Investigamos" },
    { id: "decidimos", nombre: "Decidimos" },
    { id: "construimos", nombre: "Construimos" }
  ],

  /* Qué pasó, en orden (una pista por vez) */
  linea: [
    { hora: "08:05", quien: "Nico", que: "Comparte la foto del grupo.", cita: "Les dejo la foto que sacamos en el recreo 😅" },
    { hora: "08:07", quien: "Sofi", que: "Pide que retiren la foto.", cita: "No quería que subieran esa foto. ¿La podés borrar, por favor?" },
    { hora: "08:10", quien: "Bruno", que: "Se burla de Sofi.", cita: "Jajaja, miren a Sofi en la foto. Qué exagerada 🙄" },
    { hora: "08:13", quien: "Lara", que: "Avisa de burlas en otros grupos.", cita: "Ya la pasaron a otro grupo. También hay mensajes burlándose de Sofi." },
    { hora: "08:16", quien: "Bruno", que: "Vuelve a reenviar la foto.", cita: "La volví a compartir. Ahora la están mandando a otros grupos." },
    { hora: "08:18", quien: "Mica", que: "Pide frenar las burlas y acompañar.", cita: "Sofi pidió que paren. No está bien burlarse ni reenviar la foto. Hay que acompañarla." },
    { hora: "08:20", quien: "Sofi", que: "Cuenta que las burlas siguen y la afectan.", cita: "Me siguen llegando burlas de otros chats. Ya les pedí que paren. Esto me hace sentir muy mal." }
  ],

  sabemos: [
    "Nico publicó una foto del grupo.",
    "Sofi pidió que dejaran de compartirla.",
    "Bruno se burló y admitió haberla reenviado otra vez.",
    "Lara informó que la foto y las burlas llegaron a otros chats.",
    "Sofi explicó que esto la hace sentir muy mal.",
    "Mica propuso intervenir y acompañar."
  ],
  falta: [
    "¿Se le preguntó a Sofi antes de publicar?",
    "¿Quiénes más reenviaron la foto y hasta dónde llegó?",
    "¿Qué necesita Sofi para sentirse acompañada y segura?",
    "¿Las burlas ya ocurrían antes o continuaron después?",
    "¿Cómo intervinieron las otras personas que vieron los mensajes?"
  ],

  /* Conceptos: definición (del glosario) + qué se ve en este caso */
  conceptos: [
    { clave: "Consentimiento", enElCaso: "Sofi pidió que retiraran la foto. Pese al pedido, siguieron reenviándola." },
    { clave: "Privacidad", enElCaso: "La foto llegó a otros grupos y Sofi perdió control sobre dónde circula." },
    { clave: "Respeto", enElCaso: "Mica busca frenar las burlas y apoyar a Sofi; Bruno vuelve a difundir la foto pese a su pedido." },
    { clave: "Difusión sin consentimiento", enElCaso: "No se ve una consulta previa y Bruno admite haber reenviado la imagen después de que Sofi pidió que pararan." },
    { clave: "Ciberacoso", etiqueta: "Señales de ciberacoso", enElCaso: "Hay burlas reiteradas en chats, circulación sostenida de una foto y malestar expresado por Sofi. Son señales que debemos analizar, sin dar por conocido todo el contexto." }
  ],

  /* Señales para analizar si hay hostigamiento (se muestran al seleccionarlas) */
  senales: [
    { clave: "Reiteración", pregunta: "¿Las burlas y los reenvíos continúan?", evidencia: "Bruno se burla y vuelve a compartir la foto. Lara informa de otros chats con burlas y Sofi dice que le siguen llegando. No sabemos desde cuándo sucede." },
    { clave: "Intención", pregunta: "¿Se intenta humillar o lastimar?", evidencia: "Bruno se burla y comparte otra vez la foto, aun cuando Sofi pidió detenerlo. Analizamos esas acciones sin asegurar conocer todas sus motivaciones." },
    { clave: "Contexto", pregunta: "¿Qué ocurre en los grupos?", evidencia: "El caso empieza en 3.º B y se extiende a otros chats. Mica pide intervenir, pero no sabemos cómo actuaron las demás personas." },
    { clave: "Efectos", pregunta: "¿Cómo afecta a Sofi?", evidencia: "Sofi cuenta que le llegan burlas de otros chats y que se siente muy mal. Es importante escucharla, creer en lo que expresa y respetar su pedido." }
  ],
  conclusionAcoso: "Ahora encontramos señales más claras de posible ciberacoso: burlas reiteradas, difusión que continúa pese al pedido y malestar expresado por Sofi. Podemos intervenir y acompañarla sin esperar que la situación empeore.",

  /* Ilustración simple de cada consecuencia: tipo de dibujo */
  dibujos: {
    reenviar: "propaga",
    no_intervenir: "sola",
    acompanar: "rodea",
    insultar: "conflicto",
    buscar_ayuda: "ayuda",
    ignorar: "sigue"
  },

  videoComplementarioLSA: {
    titulo: "Día contra el acoso escolar y el ciberacoso en Lengua de Señas Argentina",
    autor: "Canales Asociación Civil",
    url: "https://www.youtube.com/watch?v=HsaAA17hhAM",
    embed: "https://www.youtube-nocookie.com/embed/HsaAA17hhAM"
  },

  clases: {
    uno: ["Notificación y presentación digital · 10 min", "Investigación y video en LSA (opcional) · 25 min", "Debate sin pantallas · 20 min", "Dilema y decisiones · 25 min"],
    dos: ["Recuperar lo sucedido · 10 min", "Explorar otros desenlaces · 25 min", "Acuerdos colectivos · 35 min", "Reflexión final · 10 min"]
  }
};
