# CONECTADOS CON RESPETO — Una foto, cientos de miradas

Historia interactiva accesible para **Formación Ética y Ciudadana, 3.º año** (Argentina).
Es una simulación **ficticia**: una foto del grupo se comparte sin permiso y empieza a circular.
El estudiantado investiga, decide y construye un decálogo de convivencia digital.

Sitio estático (HTML + CSS + JavaScript sin dependencias). Sin servidor, sin cuentas, sin analíticas, sin red.
Todo se guarda **solo en el dispositivo** (localStorage). No hay sonidos.

## Las 8 escenas
1. Inicio · 2. Notificación · 3. La foto · 4. Los mensajes (uno por uno, nunca desaparecen) ·
5. La historia se detiene («¿Qué está pasando acá?») · 6. Investigamos (pistas, línea de tiempo, conceptos, señales) ·
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
