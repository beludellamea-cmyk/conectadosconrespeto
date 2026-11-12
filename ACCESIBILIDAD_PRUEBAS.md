# Accesibilidad: qué se probó y qué falta

Objetivo: WCAG 2.2 nivel AA. **No se afirma cumplimiento**; falta validación con personas y tecnologías de apoyo reales.

## Implementado
- Navegación completa por teclado; foco al título al cambiar de escena; el foco permanece en «Continuar» al avanzar pasos; «Escape» cierra diálogos y devuelve el foco.
- Regiones `aria-live` para anunciar cada mensaje/paso; enlace «saltar al contenido».
- Tamaño de texto (100–200 %), más espaciado, tres aspectos (cine, claro, alto contraste), reflujo sin scroll horizontal.
- Reducir movimiento: botón visible + `prefers-reduced-motion`; la historia es idéntica y nada depende de eventos de animación.
- Sin temporizadores ni límites de tiempo; nada avanza solo; todo permite volver.
- Emojis siempre acompañados de texto; foto con texto alternativo y descripción larga.
- Sin acciones solo de arrastrar: el decálogo se ordena con «Subir/Bajar».
- Lectura en voz alta opcional (SpeechSynthesis): escuchar, pausar, continuar, repetir, detener; sin autoinicio (la lectura automática está desactivada por defecto).
- Barrido automático **experimental** (opcional, con pausa y detención).
- Espacios para videos en LSA (vacíos, sin traducciones automáticas).

## Verificado en esta sesión (Chrome headless, escritorio y 390 px)
- Recorrido completo de las 8 escenas, ida y vuelta, decisiones, consecuencias y decálogo; sin errores de JavaScript.
- Ninguna escena muestra información de pasos posteriores antes de llegar a ellos.
- Contraste ≥ 4,5:1 (texto normal) / 3:1 (grande) en los tres aspectos, con verificación automática (los falsos positivos sobre fondos con degradé se revisaron a mano).
- Sin desborde horizontal a 320 px con texto al 200 %.
- Con «Reducir movimiento»: 0 animaciones en ejecución.
- Persistencia y borrado de datos; carga por `file://`; impresión del decálogo en 1 página.

## Pendiente (no probado)
- Lectores de pantalla reales (NVDA, JAWS, VoiceOver, TalkBack).
- **Pulsador/switch físico**: el barrido es experimental y no se probó con un pulsador real; no se afirma que funcione.
- Comunicadores y dispositivos de acceso reales; pruebas con Tomás, Valentina y Mateo (o estudiantes equivalentes).
- Revisión de LSA por una persona sorda competente; videos aún inexistentes.
- Otros navegadores (Safari, Firefox, Edge), celulares y tablets reales, voces en español disponibles en cada dispositivo.
- Auditoría WCAG 2.2 AA completa.
