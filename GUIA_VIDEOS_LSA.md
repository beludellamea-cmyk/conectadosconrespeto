# Guía para incorporar materiales auténticos en LSA
## Conectados con respeto — trabajo integrador de TIC inclusivas

Esta guía sirve para preparar cuatro videos breves de acceso al contenido en **Lengua de Señas Argentina (LSA)**. **No constituye una traducción a LSA**: los textos en español son el contenido de referencia para que una persona competente en LSA prepare una versión natural en esa lengua. La LSA no se sustituye con subtítulos, pictogramas ni avatares.

## Materiales sugeridos

### 1. Bienvenida — clave `inicio`
Contenido para interpretar/adaptar: «Bienvenidos a Conectados con respeto. Vamos a conocer una historia ficticia sobre una foto compartida en un grupo escolar. Observaremos qué sucedió, pensaremos distintas decisiones y construiremos acuerdos para convivir mejor en internet. Cada persona puede avanzar a su ritmo, volver, leer o escuchar y participar de distintas maneras».

### 2. Presentación del conflicto — claves `foto` y `mensajes`
Contenido de referencia: «Nico publica una foto del grupo 3.º B. Sofi pide que la borren. Otros estudiantes comentan. Lara dice que ya llegó a otro grupo. ¿Qué sabemos? ¿Qué nos falta averiguar?». Incluir la explicación de que **una sonrisa en una foto no equivale a autorizar su difusión**. No dramatizar ni afirmar información que el caso todavía no presenta.

### 3. Investigamos y decidimos — claves `investigamos` y `decidimos`
Contenido de referencia: «Vamos a revisar pistas. Necesitamos comprender consentimiento, privacidad, respeto y difusión de imágenes. Elegí una opción y confirmá tu decisión. Luego aparecerá una consecuencia posible. Podés probar otra alternativa y explicar lo que pensás. No hay puntajes ni límite de tiempo».

### 4. Acuerdos y cierre — clave `construimos`
Contenido de referencia: «En grupo vamos a proponer diez acuerdos de convivencia digital. Podemos agregar, editar y ordenar las ideas. Cada persona puede participar con el medio de comunicación que utiliza. Al terminar, descargamos o imprimimos nuestro decálogo».

## Cómo producirlos
1. Revisar el contenido con una persona sorda usuaria de LSA y un/a intérprete o docente competente. Preparar un guion en LSA que respete su gramática; **no traducir palabra por palabra**.
2. Filmar en un lugar iluminado, con fondo uniforme sin distracciones, plano suficiente para ver manos, rostro y expresiones. No recortar los movimientos.
3. Editar con CapCut, Clipchamp, Canva u otra herramienta; evitar recuadros pequeños y transiciones que tapen las señas.
4. Proveer texto en español y subtítulos sincronizados donde correspondan. Validar la inteligibilidad y el contenido con usuarios competentes.
5. Guardar MP4 en `assets/lsa/`, con subtítulos VTT si corresponden. No activar reproducción automática.
6. En `js/data.js` reemplazar `null` de la escena respectiva dentro de `window.CASO_LSA`. Ejemplo:

```js
inicio: {
  src: "assets/lsa/inicio.mp4",
  captions: "assets/lsa/inicio.es.vtt",
  transcript: "Transcripción / texto de apoyo revisado",
  credit: "Producción en LSA: [datos acordados y autorizados]"
}
```

**Importante:** Los botones LSA de la web están preparados, pero sin grabaciones publicadas no hay interpretación disponible. En la clase, prever interpretación o mediación lingüística presencial cuando se requiera. No declarar accesibilidad en LSA como resuelta por el solo hecho de tener el botón.

## Antes de la entrega
- Validar con una persona sorda usuaria de LSA el material y su tamaño en celular/proyector.
- Probar teclado, controles del video, pausa/repetición, subtítulos y versión sin movimiento.
- Comprobar también lectura ampliada, contraste, lector de pantalla, barrido experimental con dispositivo real y comunicación mediante CAA.
