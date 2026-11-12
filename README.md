# CONECTADOS CON RESPETO — Una foto, cientos de miradas

Historia interactiva accesible para **Formación Ética y Ciudadana, 3.º año** (Argentina).
Es una simulación **ficticia**: una foto del grupo se comparte sin permiso y empieza a circular.
El estudiantado investiga, decide y construye un decálogo de convivencia digital.

Sitio estático (HTML + CSS + JavaScript sin dependencias). La historia no utiliza cuentas ni analíticas propias y puede abrirse sin conexión. El video externo opcional en LSA requiere internet y se carga solo si la persona lo solicita.
Todo se guarda **solo en el dispositivo** (localStorage). No hay sonidos.

## Las 8 escenas
1. Inicio · 2. Notificación · 3. La foto · 4. Los mensajes (uno por uno, nunca desaparecen; incluyen burlas reiteradas) ·
5. La historia se detiene («¿Qué está pasando acá?») · 6. Investigamos (7 pistas, conceptos, señales de ciberacoso y video externo en LSA, opcional) ·
7. Decidimos (3 opciones, consecuencia en texto + dibujo, reflexión, sin puntajes) · 8. Construimos (decálogo editable, imprimir/descargar).

Nada avanza solo: se avanza con «Continuar» / «Volver». El botón **Etapas** (docente) salta a cualquier escena o decisión.

## Ejecutar
- Abrir `index.html` con doble clic (funciona por `file://`), o
- `python3 -m http.server` y abrir `http://localhost:8000`.

## Publicar en GitHub Pages
Subir el contenido de esta carpeta a la raíz del repositorio (reemplazando lo anterior, incluidos `css/experiencia-visual.css` y `js/experiencia-visual.js`, que ya no se usan) y activar Pages (Settings → Pages → rama `main`, carpeta `/root`). Todas las rutas son relativas.

## Estructura
```
index.html            estructura y diálogos
css/styles.css        estilos (3 aspectos: cine, claro, alto contraste)
js/data.js            TODOS los textos del caso (editar acá)
js/app.js             motor de escenas
assets/               foto ficticia, fuente Atkinson Hyperlegible (OFL), favicon
datos/caso_educativo.json   copia del caso en JSON
```

## Editar contenidos
Los textos están en `js/data.js` (`window.CASO` y `CASO.historia`). Mantener sincronizado `datos/caso_educativo.json` si se usa.

## Videos en LSA
No hay videos en LSA todavía y **no se simulan**. Los espacios están listos: en `js/data.js`, `window.CASO_LSA`
tiene una clave por escena (`inicio`, `notificacion`, `foto`, `mensajes`, `pausa`, `investigamos`, `decidimos`, `construimos`).
Reemplazar `null` por `{ src: "assets/lsa/foto.mp4", captions: "…vtt", transcript: "…", credit: "…" }` cuando una persona competente en LSA grabe y revise el video.

## Accesibilidad (resumen)
Teclado completo, foco visible, lectura en voz alta opcional en español, tamaño de texto A+/A−, tres aspectos incluido alto contraste,
«Reducir movimiento» (la historia queda idéntica, sin animaciones), emojis siempre con texto, sin límites de tiempo,
barrido automático experimental opcional. Ver `ACCESIBILIDAD_PRUEBAS.md`: se apunta a WCAG 2.2 AA pero **no se declara cumplimiento**.


## Mejoras de comprensión visual (noviembre 2026)
- Bienvenida con propósito claro y tres acciones ilustradas mediante símbolos acompañados de palabras.
- Antes del conflicto, la foto propone una pregunta de observación sin anticipar todas las respuestas.
- Desde la evidencia de Lara, la investigación incorpora un esquema de tres pasos que representa cómo circuló la imagen, sin inventar destinatarios ni cantidades.
- Opciones de decisión, conceptos y acuerdos con símbolos visuales **que no reemplazan los textos**.
- Bloque opcional «Comunicar una idea sin escribir», con frases seleccionables, visibles y de lectura voluntaria. No reemplaza ningún comunicador de CAA.
- Guía de producción para completar los apoyos reales en LSA en `GUIA_VIDEOS_LSA.md`.

## Actualización del caso y recurso complementario en LSA
- La historia se amplió de **difusión no consentida** a **posibles situaciones de ciberacoso**: burlas reiteradas, una foto que sigue circulando, un reenvío después del pedido y el malestar expresado por Sofi. Las decisiones buscan detener el daño y acompañar; no diagnostican ni etiquetan automáticamente.
- Al final de «Investigamos» se incorporó un recurso externo: **Canales Asociación Civil, «Día contra el acoso escolar y el ciberacoso en Lengua de Señas Argentina»**. Enlace: https://www.youtube.com/watch?v=HsaAA17hhAM
- El enlace y el reproductor de YouTube se ofrecen sin copiar, reeditar o descargar el video. La carga del reproductor requiere una acción explícita. Se puede saltar el video y seguir con toda la secuencia.
- **Este video no interpreta nuestra historia** y no sustituye la mediación comunicativa necesaria para participar del debate en LSA. Su pertinencia debe validarse con una persona usuaria de LSA. La reproducción incrustada dependerá de que YouTube la permita.
- Para orientación docente, ver `GUIA_VIDEO_LSA_EN_CLASE.md`.
