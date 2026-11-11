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
    Sofi: "estudiante que pide retirar la imagen",
    Nico: "comparte la imagen sin consultar",
    Bruno: "minimiza el pedido y comenta de forma despectiva",
    Lara: "informa que la imagen se difundió más",
    Mica: "propone respetar el pedido y acompañar"
  },

  post: {
    time: "08:05",
    author: "Nico",
    text: "Les dejo la foto que sacamos en el recreo 😅"
  },

  comments: [
    { time: "08:07", author: "Sofi", text: "No quería que subieran esa foto. ¿La podés borrar, por favor?" },
    { time: "08:10", author: "Bruno", text: "Qué exagerada, si es una foto nada más 🙄" },
    { time: "08:13", author: "Lara", text: "Ya la pasaron a otro grupo. Me llegó recién." },
    { time: "08:17", author: "Mica", text: "Si Sofi pidió que la borren, tenemos que respetarla." },
    { time: "08:20", author: "Sofi", text: "No me gusta que sigan compartiéndola. Quiero que pare." }
  ],

  /* ---- Preguntas de la pantalla "El caso" ---- */
  caseQuestions: {
    central: "¿Qué está pasando?",
    open: [
      "¿Qué te llamó la atención?",
      "¿Qué información falta para comprender lo que ocurrió?"
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
        "Hostigamiento mediante medios digitales; para analizar una situación importan el contexto, la reiteración y sus efectos, no solo una publicación."
    }
  ],

  investigateQuestions: [
    "¿Qué sabemos con seguridad y qué necesitamos averiguar?",
    "¿Qué pidió Sofi?",
    "¿Qué respuestas obtuvo?",
    "¿Qué responsabilidad tienen quienes reenvían, comentan o miran sin intervenir?",
    "¿Hay señales de hostigamiento reiterado?"
  ],

  /* Preguntas extra para el debate presencial, sin pantallas */
  debateQuestions: [
    "¿Qué sabemos con seguridad y qué necesitamos averiguar?",
    "¿Por qué importa pedir consentimiento antes de compartir una imagen?",
    "¿Qué hace que una broma deje de ser graciosa para todas las personas?",
    "¿Qué responsabilidad tienen quienes reenvían, comentan o miran sin intervenir?",
    "¿Hay señales de hostigamiento reiterado? ¿Por qué no alcanza una sola pista para etiquetar automáticamente una situación como ciberacoso?"
  ],

  /* ---- Decidimos ---- */
  dilemmas: [
    {
      id: "decision1",
      title: "¿Qué harías ante esta situación?",
      situation: "Acabás de ver el mensaje de Sofi.",
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
          possibleConsequence: "El mensaje puede continuar circulando y Sofi puede sentirse sola.",
          reflection: "¿Qué forma de apoyo sería segura y respetuosa?"
        },
        {
          id: "acompanar",
          label: "Pedir que se retire la foto y acompañar a Sofi",
          possibleConsequence:
            "Se reconoce el pedido de Sofi y se intenta detener la circulación con apoyo de sus compañeros.",
          reflection: "¿Qué otras acciones serían necesarias si continúa?"
        }
      ]
    },
    {
      id: "decision2",
      title: "La foto sigue circulando. ¿Qué hacemos ahora?",
      situation: "Pasó un rato y la imagen sigue yendo de un grupo a otro.",
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
    "No reenviar mensajes que humillan o perjudican.",
    "Evitar burlas y comentarios ofensivos.",
    "Acompañar a quien recibe agresiones.",
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
   sección, copiá el archivo a assets/lsa/ y completá la entrada, por ejemplo:

     caso: {
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
  caso: null,
  investigamos: null,
  decidimos: null,
  construimos: null
};
