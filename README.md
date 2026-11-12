# CONECTADOS CON RESPETO — Una foto, cientos de miradas

Simulación educativa ficticia y accesible para **Formación Ética y Ciudadana, 3.º año** (Argentina). Tema: convivencia digital, consentimiento para compartir imágenes, privacidad, respeto y análisis de conductas que pueden constituir ciberacoso.

Es un sitio estático: **HTML + CSS + JavaScript sin dependencias, sin servidor, sin cuentas, sin claves y sin conexión a servicios externos** (la tipografía y la foto están incluidas en el proyecto).

## Estructura

```
index.html                  Estructura de todas las pantallas
css/styles.css              Estilos (colores por variables; alto contraste real)
js/data.js                  TODOS los textos del caso + punto de inserción de videos LSA
js/app.js                   Lógica: navegación, decisiones, decálogo, ajustes, narración, barrido
assets/img/                 Foto ficticia del caso (.webp) y favicon
assets/fonts/               Atkinson Hyperlegible (licencia OFL incluida)
datos/caso_educativo.json   Copia de referencia del caso (no la lee el sitio)
README.md
ACCESIBILIDAD_PRUEBAS.md    Qué se implementó, qué se verificó y qué falta
```

## Abrir localmente
Hacé doble clic en `index.html` (funciona sin servidor). Si preferís un servidor local:

```
python3 -m http.server 8000
# y abrir http://localhost:8000/
```

## Publicar en GitHub Pages
1. Creá un repositorio en GitHub (por ejemplo `conectados-con-respeto`).
2. Subí **el contenido** de esta carpeta a la raíz del repositorio (que `index.html` quede en la raíz).
3. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guardá.
4. En uno o dos minutos la página queda en `https://TU-USUARIO.github.io/conectados-con-respeto/`.

Todas las rutas son **relativas** y la navegación usa `#/seccion`, así que funciona en la subcarpeta de GitHub Pages. Se probó en un servidor local dentro de una subcarpeta y abriendo el archivo directamente. Todavía no se probó en un repositorio real de GitHub Pages: hacelo y revisá que se vean la foto y la tipografía.

## Cómo modificar textos e imágenes
- **Textos del caso, comentarios, glosario, decisiones y acuerdos sugeridos:** `js/data.js`.
- **Títulos, explicaciones y avisos de cada pantalla:** `index.html`.
- **Tarjetas de «Investigamos»:** función `investigationCards()` en `js/app.js`.
- **Foto:** reemplazá `assets/img/foto_grupo_ficticio.webp` (o cambiá `image.src` en `data.js`) y actualizá `image.alt` y `image.longDescription` para describir la nueva imagen. Usá solo imágenes ficticias o con autorización.
- **Colores:** variables al comienzo de `css/styles.css`.

## Agregar un video en LSA (cuando exista)
Hoy **no hay videos en Lengua de Señas Argentina**, y el sitio lo dice. Cuando una persona competente en LSA grabe y revise un video:
1. Copiá el archivo a `assets/lsa/` (por ejemplo `caso.mp4`, y opcionalmente subtítulos `.vtt`).
2. En `js/data.js`, completá la entrada de la sección en `window.CASO_LSA` (hay un ejemplo comentado). Se mostrará un reproductor con controles, subtítulos opcionales y transcripción, sin reproducción automática.

## Datos y privacidad
No se piden nombres ni datos personales. Decisiones, ideas, acuerdos y ajustes se guardan en `localStorage` **solo en el dispositivo**. Hay un botón «Borrar mis datos guardados» con confirmación (en «Construimos» y en «Ayuda y privacidad»). **No hay colaboración en tiempo real**: los equipos trabajan presentes en el aula.

## Créditos
- Foto ficticia creada para la simulación educativa (paquete del proyecto).
- Tipografía Atkinson Hyperlegible © Braille Institute of America, licencia SIL OFL 1.1 (`assets/fonts/LICENSE-Atkinson-Hyperlegible.txt`).
- Íconos dibujados a mano como SVG en línea.


## Mejora visual e interacción de decisiones (noviembre 2026)
- `css/experiencia-visual.css` y `js/experiencia-visual.js` añaden diseño de publicación simulada y comentarios con pistas visuales, tarjetas de decisión, lectura optativa de opciones y confirmación antes de ver consecuencias.
- Las mejoras complementan la accesibilidad existente: textos reales, teclado, contraste, ampliación, comunicación CAA y ausencia de tiempos límite. Los emojis se acompañan de texto y no son la única señal.
- La síntesis de voz depende de la disponibilidad de voces del navegador; la LSA auténtica y la prueba con pulsador físico siguen pendientes.
- Comprobar en el sitio publicado la lectura, el recorrido con Tab/Enter, zoom, pantalla móvil y compatibilidad con el barrido experimental.
