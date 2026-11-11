# Accesibilidad y pruebas — Conectados con respeto

No se afirma «100 % accesible». Este documento separa lo **implementado**, lo **verificado** y lo **pendiente**.

## 1. Implementado
- HTML semántico: `lang="es-AR"`, `header`, `nav`, `main`, `footer`, un `h1` por pantalla, títulos en secuencia, botones y enlaces reales, etiquetas visibles, enlace «Saltar al contenido».
- Al cambiar de sección: se actualiza el título de la pestaña y el foco va al `h1` de la pantalla. Hay botones «Volver» y el menú siempre permite saltar a cualquier sección (sin bloqueos).
- Teclado completo (Tab, Shift+Tab, Enter, Espacio, Esc para cerrar panel/menú/foto). Sin arrastrar y soltar. Foco visible con doble anillo.
- Texto: A− / A+ (100–200 %), «Más espacio en el texto», diseño con `rem` que se adapta al zoom del navegador. Con texto grande el menú lateral pasa a menú plegable.
- Alto contraste real (cambia todas las variables de color) y estados que no dependen solo del color (íconos, texto «Opción elegida», «Ya la exploraste», marca ✓ en la sección actual).
- Reducir movimiento: ajuste propio + `prefers-reduced-motion`.
- Sin temporizadores, sin audio ni video automáticos.
- Foto con `alt` descriptivo + descripción larga en texto + ampliación (diálogo nativo con Esc). Mensajes del feed como texto real, seleccionable y ampliable.
- Narración opcional con SpeechSynthesis (solo si el navegador la ofrece; con pausa, detener y velocidad; nunca empieza sola).
- LSA: lugar preparado en cada sección y mensaje honesto de «pendiente». No hay avatar ni falsas traducciones.
- CAA / pulsador: botones grandes, escribir siempre opcional, frases de arranque para fundamentar, barrido opcional (pausable, con ritmo regulable y desactivable; el teclado sigue funcionando).
- Consecuencias como texto, con el foco movido al mensaje y botón para volver a elegir. Avisos con `aria-live="polite"` solo en acciones puntuales.
- Privacidad: solo `localStorage`; aviso visible; borrado con confirmación; sin analíticas ni servicios externos.
- Exportación del decálogo: impresión/PDF del navegador (hoja propia, sin barra lateral) y descarga `.txt`.
- Contenido pedagógico: no se afirma que toda foto compartida sin permiso sea ciberacoso; se trabaja reiteración, intención, contexto y efectos.

## 2. Verificado (automatizado, Chrome 153 sin interfaz, 11/11/2026)
- [x] Recorrido completo: inicio → caso → investigamos → decidimos → construimos, con consecuencias, notas y decálogo (cargar 10 ideas, editar, subir/bajar, eliminar, deshacer, límite de 10, agregar propio).
- [x] Persistencia tras recargar y borrado total con confirmación (`localStorage` queda vacío).
- [x] Textos de `js/data.js` idénticos a `datos/caso_educativo.json` (comentarios, consecuencias, preguntas, acuerdos, alt).
- [x] Foto carga; sin errores de consola ni de red; funciona en servidor local (subcarpeta) y abriendo `index.html` con `file://`.
- [x] Contraste de texto ≥ 4,5:1 (≥ 3:1 en texto grande) en las 6 pantallas, tema normal y alto contraste (cálculo automático sobre el DOM).
- [x] Sin desplazamiento horizontal a 320 px de ancho (≈ 400 % de zoom), con texto al 200 % y a 1280 px con texto al 200 %.
- [x] Alto contraste y «Reducir movimiento» se aplican (animaciones en `none`).
- [x] Orden de tabulación lógico en el inicio; el foco pasa al diálogo de la foto y vuelve al botón al cerrarlo.
- [x] Impresión: solo se ve la hoja del decálogo; PDF de una página con los acuerdos numerados.
- [x] El barrido mueve el foco solo y muestra su barra con pausar/detener.

## 3. NO verificado / pendiente
- [ ] **Lector de pantalla** (NVDA, JAWS, VoiceOver, TalkBack): no se probó. Hacerlo antes de usar en clase.
- [ ] **Pulsador físico / sistema de barrido real**: el barrido es experimental y no se probó con hardware. No se promete compatibilidad con ningún dispositivo concreto.
- [ ] **Video en LSA auténtico**: no existe. Debe realizarlo y revisarlo una persona competente en LSA. El punto de inserción está listo (`CASO_LSA` en `js/data.js`).
- [ ] **Pictogramas de CAA** (por ejemplo ARASAAC): no se incluyeron.
- [ ] Navegación por teclado probada manualmente de punta a punta por una persona (la prueba automatizada cubre las interacciones, no la experiencia).
- [ ] Revisión en celulares y tablets reales, y en Safari/Firefox (solo se probó Chrome).
- [ ] Comprobar a ojo el zoom real del navegador al 400 % y el contraste de los íconos.
- [ ] Probar la narración con voces en español del dispositivo del aula (depende del navegador).
- [ ] Publicar en GitHub Pages y revisar las rutas en el repositorio real.
- [ ] Validación pedagógica por la docente (tono, tiempos, preguntas).

## 4. Lista de pruebas manuales sugeridas
- [ ] Navegué de inicio a final sin mouse.
- [ ] El foco es visible y ningún botón queda oculto.
- [ ] Amplié el texto sin recortes ni solapamientos.
- [ ] Alto contraste: todas las etiquetas se leen.
- [ ] Reducir movimiento: se nota el cambio.
- [ ] Leí la historia y sus consecuencias en texto seleccionable.
- [ ] Las opciones muestran consecuencias distintas, sin puntajes.
- [ ] Edité 10 acuerdos y obtuve un documento imprimible.
- [ ] Revisé el sitio en pantalla estrecha.
- [ ] Probé con lector de pantalla y, si hay, con pulsador real.
