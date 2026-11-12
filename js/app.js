/* ==========================================================================
   CONECTADOS CON RESPETO — Historia interactiva (JavaScript sin dependencias)
   --------------------------------------------------------------------------
   · 8 escenas; cada escena tiene «pasos» (beats). Avanzar = «Continuar»;
     retroceder = «Volver». Nada avanza solo ni por tiempo.
   · El estado se guarda SOLO en localStorage de este dispositivo.
   · Sin red, sin analíticas, sin cuentas, sin sonidos.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.CASO, H = D.historia, LSA = window.CASO_LSA || {};
  var root = document.documentElement;
  var STORAGE_KEY = "conectados-con-respeto:v1";
  var N_ESCENAS = H.escenas.length;

  /* ------------------------------------------------------------------ utilidades */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function icon(id) { return '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>'; }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function uid() { return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function reducedMotion() {
    var m = root.getAttribute("data-motion");
    if (m === "reducido") return true;
    if (m === "normal") return false;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  var annTimer;
  function say(id, msg) {
    var r = $("#" + id); if (!r) return;
    r.textContent = ""; clearTimeout(annTimer[id]);
    annTimer = annTimer || {};
    annTimer[id] = setTimeout(function () { r.textContent = msg; }, 60);
  }
  annTimer = {};
  function announce(msg) { say("anuncios", msg); }
  function story(msg) { say("relato", msg); }
  function initialOf(n) { return esc(String(n).charAt(0).toUpperCase()); }
  function avatar(n, small) { return '<span class="avatar' + (small ? " avatar-sm" : "") + '" aria-hidden="true" style="background:' + (H.colores[n] || "#3730A3") + '">' + initialOf(n) + "</span>"; }
  var EMOJI_HABLADO = { "😅": " (emoji: cara sonriendo con una gota de sudor)", "🙄": " (emoji: cara con los ojos en blanco)" };
  function hablado(t) {
    return String(t).replace(/😅|🙄/g, function (e) { return EMOJI_HABLADO[e]; }).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
  }

  /* ------------------------------------------------------------------ estado + almacenamiento local */
  var storageOk = true;
  function defaults() {
    return {
      settings: { scale: 100, tema: "cine", motion: null, spacing: false, autoRead: false, rate: 1, scan: false, scanSpeed: 3000 },
      decisions: { decision1: { explored: [], note: "" }, decision2: { explored: [], note: "" } },
      notes: { caso0: "", caso1: "" },
      agreements: [],
      finalReflection: ""
    };
  }
  function load() {
    var base = defaults();
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      var s = JSON.parse(raw);
      if (s && typeof s === "object") {
        if (s.settings) {
          Object.keys(base.settings).forEach(function (k) { if (k in s.settings) base.settings[k] = s.settings[k]; });
          if (s.settings.contrast === true && !s.settings.tema) base.settings.tema = "alto"; // compatibilidad con la versión anterior
        }
        if (["cine", "claro", "alto"].indexOf(base.settings.tema) < 0) base.settings.tema = "cine";
        ["decision1", "decision2"].forEach(function (k) {
          if (s.decisions && s.decisions[k]) {
            var d = s.decisions[k];
            base.decisions[k] = { explored: Array.isArray(d.explored) ? d.explored : [], note: typeof d.note === "string" ? d.note : "" };
          }
        });
        if (s.notes) { base.notes.caso0 = String(s.notes.caso0 || ""); base.notes.caso1 = String(s.notes.caso1 || ""); }
        if (Array.isArray(s.agreements)) {
          base.agreements = s.agreements.filter(function (a) { return a && typeof a.text === "string"; }).slice(0, D.maxAgreements)
            .map(function (a) { return { id: a.id || uid(), text: a.text, src: typeof a.src === "number" ? a.src : null }; });
        }
        base.finalReflection = String(s.finalReflection || "");
      }
    } catch (e) { storageOk = false; }
    return base;
  }
  var state = load();
  function save() { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageOk = true; } catch (e) { storageOk = false; } }
  function SAVED() { return storageOk ? "Guardado en este dispositivo." : "Tu navegador no deja guardar: lo escrito se pierde al cerrar la página."; }

  /* Estado de la sesión (no se guarda) */
  var ui = { dec: { decision1: { sel: null, confirmed: false }, decision2: { sel: null, confirmed: false } }, idea: 0, senal: null, undo: null };
  var nav = { scene: 0, beat: 0 };

  /* ------------------------------------------------------------------ ajustes de accesibilidad */
  var SCALES = [100, 115, 130, 150, 175, 200];
  function setSwitch(btn, on) { if (!btn) return; btn.setAttribute("aria-checked", on ? "true" : "false"); var st = $(".switch-state", btn); if (st) st.textContent = on ? "Sí" : "No"; }
  function applySettings() {
    var s = state.settings;
    root.style.fontSize = s.scale + "%";
    root.setAttribute("data-tema", s.tema);
    root.setAttribute("data-motion", s.motion === true ? "reducido" : (s.motion === false ? "normal" : "auto"));
    root.classList.toggle("espaciado", !!s.spacing);
    $("#tam-valor").textContent = "Tamaño actual: " + s.scale + " %";
    var reduceOS = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setSwitch($("#sw-movimiento"), s.motion === null ? reduceOS : s.motion);
    setSwitch($("#sw-espaciado"), s.spacing);
    setSwitch($("#sw-autoleer"), s.autoRead);
    setSwitch($("#sw-barrido"), s.scan);
    $("#sel-barrido").value = String(s.scanSpeed);
    $("#sel-vel").value = String(s.rate);
    $$("[data-tema]", $("#dlg-a11y")).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tema") === s.tema ? "true" : "false"); });
    $("#p-a-menos").setAttribute("aria-disabled", s.scale <= SCALES[0] ? "true" : "false");
    $("#p-a-mas").setAttribute("aria-disabled", s.scale >= SCALES[SCALES.length - 1] ? "true" : "false");
  }
  function changeScale(dir) {
    var i = Math.max(0, SCALES.indexOf(state.settings.scale)), j = Math.max(0, Math.min(SCALES.length - 1, i + dir));
    if (j === i) { announce("Ya está en el tamaño " + (dir > 0 ? "máximo" : "mínimo") + "."); return; }
    state.settings.scale = SCALES[j]; save(); applySettings(); announce("Tamaño del texto: " + SCALES[j] + " por ciento.");
  }
  function initSettings() {
    $("#p-a-menos").addEventListener("click", function () { changeScale(-1); });
    $("#p-a-mas").addEventListener("click", function () { changeScale(1); });
    $("#p-a-reset").addEventListener("click", function () { state.settings.scale = 100; save(); applySettings(); announce("Tamaño del texto: normal."); });
    $$("[data-tema]", $("#dlg-a11y")).forEach(function (b) {
      b.addEventListener("click", function () { state.settings.tema = b.getAttribute("data-tema"); save(); applySettings(); announce("Aspecto: " + b.textContent + "."); });
    });
    $("#sw-movimiento").addEventListener("click", function () {
      var actual = state.settings.motion === null ? !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) : state.settings.motion;
      state.settings.motion = !actual; save(); applySettings(); announce("Reducir movimiento " + (state.settings.motion ? "activado." : "desactivado."));
    });
    $("#sw-espaciado").addEventListener("click", function () { state.settings.spacing = !state.settings.spacing; save(); applySettings(); announce("Más espacio en el texto " + (state.settings.spacing ? "activado." : "desactivado.")); });
    $("#sw-autoleer").addEventListener("click", function () { state.settings.autoRead = !state.settings.autoRead; save(); applySettings(); announce("Lectura automática de mensajes " + (state.settings.autoRead ? "activada." : "desactivada.")); });
    $("#sel-vel").addEventListener("change", function (e) { state.settings.rate = parseFloat(e.target.value) || 1; save(); });
    $("#sw-barrido").addEventListener("click", function () { state.settings.scan = !state.settings.scan; save(); applySettings(); var d = $("#dlg-a11y"); if (state.settings.scan && d.open) d.close(); updateScan(); });
    $("#sel-barrido").addEventListener("change", function (e) { state.settings.scanSpeed = parseInt(e.target.value, 10) || 3000; save(); updateScan(); });
  }

  /* ------------------------------------------------------------------ diálogos */
  var dlgOpener = null;
  function openDlg(dlg, opener) {
    dlgOpener = opener || document.activeElement;
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    var h = $("h2", dlg); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
  }
  function initDialogs() {
    $$("dialog").forEach(function (d) {
      $$("[data-cerrar]", d).forEach(function (b) { b.addEventListener("click", function () { d.close(); }); });
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      d.addEventListener("close", function () { if (dlgOpener && document.contains(dlgOpener)) dlgOpener.focus(); });
    });
    $("#btn-a11y").addEventListener("click", function () { openDlg($("#dlg-a11y"), this); });
    $("#btn-ayuda").addEventListener("click", function () { openDlg($("#dlg-ayuda"), this); });
    $("#btn-lsa").addEventListener("click", function () { renderLsa(); openDlg($("#dlg-lsa"), this); });
    $("#ayuda-clases").innerHTML =
      '<div class="clase"><h4>Clase 1 · 80 minutos</h4><ol>' + H.clases.uno.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></div>" +
      '<div class="clase"><h4>Clase 2 · 80 minutos</h4><ol>' + H.clases.dos.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></div>";
  }
  function openFoto(opener) {
    var dlg = $("#dlg-foto"), img = $("#dlg-foto-img");
    img.src = D.image.src; img.alt = D.image.alt;
    $("#dlg-foto-cap").textContent = D.image.caption + " " + D.image.alt;
    openDlg(dlg, opener);
    $("[data-cerrar]", dlg).focus();
  }
  function renderLsa() {
    var key = H.escenas[nav.scene].id, v = LSA[key], box = $("#lsa-contenido");
    if (v && v.src) {
      box.innerHTML = '<video controls preload="none" ' + (v.poster ? 'poster="' + esc(v.poster) + '" ' : "") + 'src="' + esc(v.src) + '">' +
        (v.captions ? '<track kind="captions" srclang="es" label="Español" src="' + esc(v.captions) + '">' : "") + "</video>" +
        (v.credit ? '<p class="small muted">' + esc(v.credit) + "</p>" : "") +
        (v.transcript ? "<details><summary>Transcripción del video</summary><p>" + esc(v.transcript) + "</p></details>" : "");
    } else {
      box.innerHTML = '<div class="lsa-pendiente"><p><strong>Todavía no hay un video en LSA para la escena «' + esc(H.escenas[nav.scene].nombre) + '».</strong></p>' +
        "<p>Cuando una persona competente en LSA lo grabe y lo revise, se podrá incorporar en este lugar (ver el README). No usamos avatares ni traducciones automáticas.</p>" +
        "<p>Mientras tanto, todo el contenido está escrito y acompañado de elementos visuales. Si el grupo cuenta con mediación en LSA en el aula, esa mediación es presencial.</p></div>";
    }
  }

  /* ------------------------------------------------------------------ lectura en voz alta (opcional) */
  var voz = (function () {
    var supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    var mode = "idle", queue = [], idx = 0, token = 0, lastText = "";
    function pick() {
      var vs = window.speechSynthesis.getVoices() || [], es = vs.filter(function (v) { return /^es(-|_|$)/i.test(v.lang); });
      var ar = es.filter(function (v) { return /^es[-_]AR/i.test(v.lang); });
      return { voice: ar[0] || es[0] || null, any: vs.length > 0, hasEs: es.length > 0 };
    }
    function chunks(t) { return String(t).replace(/\s+/g, " ").trim().split(/(?<=[.!?…:])\s+/).filter(Boolean); }
    function ui2() {
      var play = $("#aud-play"), rep = $("#aud-repetir"), st = $("#aud-stop"); if (!play) return;
      $("#aud-play-txt").textContent = mode === "speaking" ? "Pausar" : (mode === "paused" ? "Continuar" : "Escuchar");
      rep.hidden = st.hidden = (mode === "idle");
    }
    function note(t) { var n = $("#controles-nota"); if (n && t) { n.textContent = t; } }
    function next(my) {
      if (my !== token) return;
      if (idx >= queue.length) { mode = "ended"; ui2(); announce("La lectura terminó."); return; }
      var u = new SpeechSynthesisUtterance(queue[idx++]), pv = pick();
      u.lang = pv.voice ? pv.voice.lang : "es-AR"; if (pv.voice) u.voice = pv.voice;
      u.rate = state.settings.rate || 1;
      u.onend = function () { next(my); };
      u.onerror = function () { if (my === token) { mode = "idle"; ui2(); note("No se pudo reproducir la lectura. Podés leer el texto en pantalla."); } };
      window.speechSynthesis.speak(u);
    }
    function speak(text, force) {
      if (!supported || !text) return;
      var pv = pick();
      if (pv.any && !pv.hasEs) { note("Este dispositivo no tiene una voz en español. Podés leer todo el texto en pantalla."); return; }
      window.speechSynthesis.cancel(); token++; lastText = text;
      queue = chunks(text); idx = 0; mode = "speaking"; ui2(); next(token);
    }
    function toggle() {
      if (!supported) return;
      if (mode === "speaking") { window.speechSynthesis.pause(); mode = "paused"; announce("Lectura en pausa."); }
      else if (mode === "paused") { window.speechSynthesis.resume(); mode = "speaking"; announce("Continúa la lectura."); }
      else speak(currentSpeech());
      ui2();
    }
    function repeat() { speak(lastText || currentSpeech()); }
    function stop() { if (!supported) return; token++; window.speechSynthesis.cancel(); mode = "idle"; ui2(); }
    return { supported: supported, speak: speak, toggle: toggle, repeat: repeat, stop: stop, ui: ui2 };
  })();

  /* ------------------------------------------------------------------ barrido automático (opcional) */
  var scanTimer = null, scanPaused = false;
  function scanTargets() {
    var dlg = $("dialog[open]");
    var scope = dlg || document;
    return $$("a[href], button, select, summary, [tabindex='0']", scope).filter(function (el) {
      if (el.disabled || el.getAttribute("aria-disabled") === "true" || el.classList.contains("skip-link")) return false;
      if (el.closest("[hidden]") || (!dlg && el.closest("dialog"))) return false;
      return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
    });
  }
  function scanStep() {
    if (scanPaused) return;
    var items = scanTargets(); if (!items.length) return;
    var i = items.indexOf(document.activeElement);
    items[(i + 1) % items.length].focus();
  }
  function updateScan() {
    clearInterval(scanTimer); scanTimer = null;
    var on = !!state.settings.scan; root.classList.toggle("scan-on", on);
    $("#barra-barrido").hidden = !on;
    if (on) {
      scanPaused = false; $("#scan-pausa").textContent = "Pausar barrido";
      $("#scan-texto").textContent = "Barrido activo: el foco avanza solo cada " + (state.settings.scanSpeed / 1000) + " segundos. Enter o Espacio acciona.";
      scanTimer = setInterval(scanStep, state.settings.scanSpeed); announce("Barrido activado.");
    } else announce("Barrido desactivado.");
  }
  function initScan() {
    $("#scan-pausa").addEventListener("click", function () {
      scanPaused = !scanPaused; this.textContent = scanPaused ? "Reanudar barrido" : "Pausar barrido";
      $("#scan-texto").textContent = scanPaused ? "Barrido en pausa." : "Barrido activo: el foco avanza solo cada " + (state.settings.scanSpeed / 1000) + " segundos. Enter o Espacio acciona.";
    });
    $("#scan-stop").addEventListener("click", function () { state.settings.scan = false; save(); applySettings(); updateScan(); });
  }

  /* ------------------------------------------------------------------ dibujos de las consecuencias (SVG simple, con texto al lado) */
  function dibujo(tipo) {
    var cx = 120, cy = 100, i = 0, s = "";
    function nodo(x, y, letra, r, extra) {
      return '<g class="nodo" style="--i:' + (i++) + '"><circle class="n" cx="' + x + '" cy="' + y + '" r="' + (r || 14) + '"' + (extra || "") + ' fill="#4F46E5"/><text class="t" x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="14" fill="#fff">' + letra + "</text></g>";
    }
    function linea(x1, y1, x2, y2, dash) { return '<line class="l" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#64748B" stroke-width="3"' + (dash ? ' stroke-dasharray="6 6"' : "") + "/>"; }
    function foto(x, y) { return '<g class="nodo" style="--i:' + (i++) + '"><rect class="f" x="' + (x - 20) + '" y="' + (y - 15) + '" width="40" height="30" rx="5" fill="#A5B4FC" stroke="#3730A3" stroke-width="3"/><path class="l" d="M' + (x - 14) + " " + (y + 9) + "l8 -9 6 6 5 -5 9 8" + '" fill="none" stroke="#3730A3" stroke-width="3"/></g>'; }
    var a, p;
    if (tipo === "propaga") {
      for (a = 0; a < 6; a++) { var ang = a * Math.PI / 3 - Math.PI / 2; s += linea(cx, cy, cx + 78 * Math.cos(ang), cy + 66 * Math.sin(ang)); }
      s += foto(cx, cy);
      for (a = 0; a < 6; a++) { ang = a * Math.PI / 3 - Math.PI / 2; s += nodo(Math.round(cx + 78 * Math.cos(ang)), Math.round(cy + 66 * Math.sin(ang)), "·", 11); }
    } else if (tipo === "sola") {
      s += '<circle class="l" cx="120" cy="100" r="60" fill="none" stroke="#64748B" stroke-width="3" stroke-dasharray="6 8"/>' + nodo(120, 100, "S", 22) + foto(190, 40) + linea(172, 50, 142, 88, true);
    } else if (tipo === "rodea") {
      for (a = 0; a < 5; a++) { ang = a * 2 * Math.PI / 5 - Math.PI / 2; s += linea(cx, cy, cx + 68 * Math.cos(ang), cy + 62 * Math.sin(ang)); }
      s += nodo(120, 100, "S", 22);
      for (a = 0; a < 5; a++) { ang = a * 2 * Math.PI / 5 - Math.PI / 2; s += nodo(Math.round(cx + 68 * Math.cos(ang)), Math.round(cy + 62 * Math.sin(ang)), "♥", 13); }
    } else if (tipo === "conflicto") {
      s += '<path class="l" d="M70 70 l20 14 -20 14 20 14 -20 14" fill="none" stroke="#64748B" stroke-width="4"/><path class="l" d="M170 70 l-20 14 20 14 -20 14 20 14" fill="none" stroke="#64748B" stroke-width="4"/>' +
        nodo(50, 100, "A", 20) + nodo(190, 100, "B", 20) + '<g class="nodo" style="--i:' + (i++) + '"><text class="t2" x="120" y="108" text-anchor="middle" font-size="38" fill="#B91C1C">!</text></g>';
    } else if (tipo === "ayuda") {
      for (a = 0; a < 3; a++) { s += linea(120, 100, 60 + a * 60, 160); }
      s += linea(120, 100, 120, 42) + nodo(120, 100, "S", 22) + nodo(120, 38, "+", 20, ' stroke="#fff" stroke-width="3"') + nodo(60, 160, "♥", 13) + nodo(120, 165, "♥", 13) + nodo(180, 160, "♥", 13);
    } else { /* sigue */
      s += foto(40, 60) + linea(62, 62, 100, 62) + nodo(120, 62, "·", 11) + linea(132, 62, 168, 62) + nodo(188, 62, "·", 11) +
        '<circle class="l" cx="120" cy="140" r="40" fill="none" stroke="#64748B" stroke-width="3" stroke-dasharray="6 8"/>' + nodo(120, 140, "S", 20);
    }
    return '<svg viewBox="0 0 240 200" aria-hidden="true" focusable="false">' + s + "</svg>";
  }

  /* ------------------------------------------------------------------ ESCENAS */
  var LETRAS = ["A", "B", "C"];
  function eyebrow(n, extra) { return '<p class="eyebrow">Escena ' + n + " de " + N_ESCENAS + (extra ? " · " + esc(extra) : "") + "</p>"; }
  function tonoHtml(k) { var t = H.tonos[k]; return '<span class="tono"><span aria-hidden="true">' + t.emoji + "</span>" + esc(t.etiqueta) + "</span>"; }

  function postHtml(opts) {
    var p = D.post, t = H.tonos.post;
    var h = '<article class="post" aria-labelledby="post-autor"><div class="post-head">' + avatar(p.author) +
      '<span class="quien"><strong id="post-autor">' + esc(p.author) + "</strong><span>" + esc(p.time) + " · Grupo " + esc(D.groupName) + "</span></span></div>" +
      '<p class="post-text">' + esc(p.text) + "</p>" +
      '<p class="nota-emoji" style="padding:0 .8rem .4rem">' + esc(H.emojisEnTexto.post) + "</p>" +
      '<figure class="post-foto"><img src="' + esc(D.image.src) + '" alt="' + esc(D.image.alt) + '" width="1448" height="1086"><figcaption>' + esc(D.image.caption) + "</figcaption></figure>" +
      '<div class="post-acc"><button type="button" class="btn btn-secondary" data-act="ampliar">' + icon("expand") + "Ampliar la foto</button></div>" +
      '<details class="post-desc"><summary>Describir la foto con palabras</summary><p>' + esc(D.image.longDescription) + "</p></details></article>";
    return h;
  }


  /* Apoyos visuales: siempre junto a palabras, nunca como única información. */
  function guiaInicioHtml() {
    return '<div class="guia-inicio" role="group" aria-label="Qué vamos a hacer en esta historia">' +
      '<p class="guia-inicio-titulo">¿Qué vamos a hacer?</p>' +
      '<ol class="guia-inicio-lista">' +
      '<li><span aria-hidden="true">👀</span><span>Descubrir qué pasó</span></li>' +
      '<li><span aria-hidden="true">💭</span><span>Pensar qué haríamos</span></li>' +
      '<li><span aria-hidden="true">🤝</span><span>Crear acuerdos</span></li></ol></div>';
  }
  function circulacionHtml() {
    return '<section class="difusion-visual" aria-labelledby="difusion-t">' +
      '<h2 id="difusion-t">¿Cómo empezó a circular la foto?</h2>' +
      '<ol class="difusion-pasos">' +
      '<li><span class="difusion-icono" aria-hidden="true">📸</span><strong>Nico publica</strong><span>Comparte una foto.</span></li>' +
      '<li><span class="difusion-icono" aria-hidden="true">💬</span><strong>Grupo 3.º B</strong><span>Sus compañeros la ven.</span></li>' +
      '<li><span class="difusion-icono" aria-hidden="true">📲</span><strong>Otro grupo</strong><span>Lara avisa que la recibieron.</span></li></ol>' +
      '<p class="difusion-pregunta">💭 Para pensar: ¿quién puede decidir ahora dónde termina esa imagen?</p>' +
      '</section>';
  }
  var iconosOpciones = {
    reenviar:"📤", no_intervenir:"👀", acompañar:"🤝", acompanar:"🤝",
    insultar:"💢", buscar_ayuda:"🙋", ignorar:"🙈"
  };
  var iconosConceptos = ["✅", "🔒", "🤝", "📲", "⚠️"];
  var iconosAcuerdos = ["📸", "🛑", "📵", "💬", "🤝", "🙋", "🔒", "💭", "🗣️", "🌐"];
  function ayudaComunicacionHtml() {
    var frases = ["Estoy de acuerdo", "No estoy de acuerdo", "Quiero explicar", "Necesito más tiempo", "Necesito que lo repitan", "Quiero pedir ayuda"];
    return '<details class="comunicacion-opcional"><summary>💬 Comunicar una idea sin escribir (opcional)</summary>' +
      '<p class="small">Cualquier estudiante puede elegir una frase y mostrarla al grupo. Se puede seguir usando el comunicador habitual.</p>' +
      '<div class="frases-comunicacion" role="group" aria-label="Frases para participar">' +
      frases.map(function(f) { return '<button type="button" class="btn btn-secondary" data-act="comunicar" data-frase="' + esc(f) + '">' + esc(f) + '</button>'; }).join("") +
      '</div><div class="frase-elegida" hidden>' +
      '<p class="frase-elegida-texto" role="status" aria-live="polite"></p>' +
      '<button type="button" class="btn btn-secondary" data-act="oir-frase">' + icon("speaker") + 'Escuchar la frase</button>' +
      '</div></details>';
  }

  var scenes = {
    /* ---- 1. INICIO ---- */
    inicio: {
      beats: 1,
      render: function () {
        return '<section class="escena fono-escena" aria-labelledby="h-inicio"><div class="relato-col">' +
          '<p class="eyebrow">Formación Ética y Ciudadana · 3.º año</p>' +
          '<h1 id="h-inicio" class="titulo-grande" tabindex="-1">CONECTADOS CON RESPETO</h1>' +
          '<p class="subtitulo">Una foto, cientos de miradas</p>' +
          '<p class="lead">Una foto aparece en el grupo de 3.º B. ¿Qué pasa cuando alguien la comparte y otros empiezan a comentar? Vas a descubrir la historia, pensar cómo actuar y construir acuerdos para convivir con respeto en las redes.</p>' +
          guiaInicioHtml() + "</div>" +
          '<div class="phone" aria-hidden="true"><div class="phone-notch"></div><div class="phone-screen"><div class="lock"><p class="lock-hora">08:04</p><p class="lock-sub">Grupo escolar · 3.º B</p><div class="portada-tema"><span aria-hidden="true">💬</span><strong>Una historia sobre nuestras decisiones en internet</strong></div><div class="lock-fill"></div><p class="lock-sub">' + icon("lock") + " Simulación ficticia</p></div></div></div></section>";
      },
      bar: function () { return { next: "Descubrir qué pasó", backHidden: true }; },
      speech: function () { return "Conectados con respeto. Una foto, cientos de miradas. Una historia ficticia sobre privacidad, consentimiento y respeto en las redes. Vas a descubrir qué pasó en el grupo de tercero B, pensar qué harías y construir acuerdos de convivencia digital."; },
      live: function () { return "Inicio. Conectados con respeto. En esta historia descubrirás un caso, pensarás decisiones y construirás acuerdos. Para empezar, activá Descubrir qué pasó."; }
    },

    /* ---- 2. NOTIFICACIÓN ---- */
    notificacion: {
      beats: 1,
      render: function () {
        return '<section class="escena fono-escena" aria-labelledby="h-notif"><div class="relato-col">' + eyebrow(2) +
          '<h1 id="h-notif" class="titulo-grande" tabindex="-1" style="font-size:clamp(1.8rem,1.2rem + 3vw,3rem)">Una notificación</h1>' +
          '<p class="lead">Aparece una notificación en el celular. Abrila para descubrir qué sucede en el grupo.</p>' +
          '<p class="nota-lugar small">Abrila cuando quieras. No hay apuro.</p></div>' +
          '<div class="phone"><div class="phone-notch"></div><div class="phone-screen"><div class="lock"><p class="lock-hora">08:05</p><p class="lock-sub">Mensajes</p>' +
          '<button type="button" class="notif" data-act="abrir-notif"><span class="notif-ico" aria-hidden="true">' + icon("bell") + "</span>" +
          '<span class="notif-body"><span class="notif-app">Grupo ' + esc(D.groupName) + " · red ficticia</span><span class=\"notif-t\">" + esc(D.notification) + '</span><span class="notif-d">Ahora · Tocá para abrir</span></span></button>' +
          '<div class="lock-fill"></div></div></div></div></section>';
      },
      bar: function () { return { next: "", nextHidden: true }; },
      speech: function () { return "Aparece una notificación en el celular: " + D.notification + "."; },
      live: function () { return "Una notificación: " + D.notification + ". Activá el botón de la notificación para abrirla."; }
    },

    /* ---- 3. LA FOTO ---- */
    foto: {
      beats: 1,
      render: function () {
        return '<section class="escena fono-escena" aria-labelledby="h-foto"><div class="relato-col">' + eyebrow(3) +
          '<h1 id="h-foto" class="titulo-grande" tabindex="-1" style="font-size:clamp(1.8rem,1.2rem + 3vw,3rem)">La foto</h1>' +
          '<p class="lead">Nico publicó una foto del grupo.</p><p class="pregunta-foto">👀 Observá: ¿todas las personas sabían que iba a publicarse?</p><p class="nota-lugar small">Podés ampliar la foto o leer su descripción.</p></div>' +
          '<div class="phone"><div class="phone-notch"></div><div class="phone-screen"><div class="phone-app"><div class="app-head"><strong>Grupo ' + esc(D.groupName) + '</strong><span>red ficticia</span></div>' +
          '<div class="app-body">' + postHtml() + "</div></div></div></div></section>";
      },
      bar: function () { return { next: "Ver los mensajes", back: "Volver a la notificación" }; },
      speech: function () { return "Nico, a las " + D.post.time + ", publicó una foto en el grupo. Dice: " + hablado(D.post.text) + ". ¿Todas las personas sabían que iba a publicarse? " + D.image.alt + " " + D.image.longDescription; },
      live: function () { return "La foto. Nico publicó una foto en el grupo " + D.groupName + ". " + D.image.alt; }
    },

    /* ---- 4. LOS MENSAJES ---- */
    mensajes: {
      beats: D.comments.length,
      render: function (beat, o) {
        var h = '<section class="escena fono-escena" aria-labelledby="h-msj"><div class="relato-col">' + eyebrow(4) +
          '<h1 id="h-msj" class="titulo-grande" tabindex="-1" style="font-size:clamp(1.8rem,1.2rem + 3vw,3rem)">Los mensajes</h1>' +
          '<p class="lead" id="msj-ahora"></p><p class="paso-contador" id="msj-cont"></p>' +
          '<p class="nota-lugar small">Los mensajes no desaparecen. Con «Mensaje anterior» podés volver y releer.</p></div>' +
          '<div class="phone"><div class="phone-notch"></div><div class="phone-screen"><div class="phone-app"><div class="app-head"><strong>Grupo ' + esc(D.groupName) + '</strong><span>red ficticia</span></div>' +
          '<div class="chat" tabindex="0" role="region" aria-label="Conversación del grupo, en orden cronológico" id="chat">';
        // mensaje inicial de Nico (con la foto pequeña)
        h += '<div class="burbuja">' + avatar(D.post.author, true) + '<div class="burbuja-cuerpo"><div class="burbuja-meta"><strong>' + esc(D.post.author) + "</strong><span>" + esc(D.post.time) + "</span></div>" +
          '<p class="burbuja-txt">' + esc(D.post.text) + "</p>" + tonoHtml("post") + '<p class="nota-emoji">' + esc(H.emojisEnTexto.post) + "</p>" +
          '<img class="mini-foto" src="' + esc(D.image.src) + '" alt="' + esc(D.image.alt) + '" width="1448" height="1086"></div></div>';
        for (var i = 0; i <= beat; i++) {
          var c = D.comments[i], nuevo = i === beat, k = "c" + i;
          h += '<div class="burbuja' + (nuevo ? " es-nuevo" : "") + (nuevo && o.forward ? " burbuja-in" : "") + '">' + avatar(c.author, true) +
            '<div class="burbuja-cuerpo"><div class="burbuja-meta"><strong>' + esc(c.author) + "</strong><span>" + esc(c.time) + '</span></div><p class="burbuja-txt">' + esc(c.text) + "</p>" + tonoHtml(k) +
            (H.emojisEnTexto[k] ? '<p class="nota-emoji">' + esc(H.emojisEnTexto[k]) + "</p>" : "") + "</div></div>";
        }
        return h + "</div></div></div></div></section>";
      },
      after: function (beat) {
        var c = D.comments[beat], chat = $("#chat");
        $("#msj-ahora").textContent = c.author + " " + H.tonos["c" + beat].etiqueta + ".";
        $("#msj-cont").textContent = "Mensaje " + (beat + 1) + " de " + D.comments.length;
        if (chat) chat.scrollTop = chat.scrollHeight;
      },
      bar: function (b) { return { next: b < D.comments.length - 1 ? "Siguiente mensaje" : "Seguir", back: b > 0 ? "Mensaje anterior" : "Volver a la foto" }; },
      speech: function (b) { var c = D.comments[b]; return c.author + ", a las " + c.time + ": " + hablado(c.text) + ". " + c.author + " " + H.tonos["c" + b].etiqueta + "."; },
      live: function (b) { var c = D.comments[b]; return "Mensaje " + (b + 1) + " de " + D.comments.length + ". " + c.author + ", " + c.time + ": " + c.text + ". " + c.author + " " + H.tonos["c" + b].etiqueta + "." + (H.emojisEnTexto["c" + b] ? " " + H.emojisEnTexto["c" + b] : ""); }
    },

    /* ---- 5. LA HISTORIA SE DETIENE ---- */
    pausa: {
      beats: 1,
      render: function () {
        var q = D.caseQuestions.open;
        var h = '<section class="escena escena-pausa" aria-labelledby="h-pausa"><div class="pausa-int">' + eyebrow(5, "La historia se detiene") +
          '<h1 id="h-pausa" class="pausa-pregunta" tabindex="-1">¿Qué está pasando acá?</h1>' +
          '<p class="lead" style="margin-inline:auto">Conversen en el equipo. La docente organiza el intercambio. Cuando estén listos, seguimos.</p><div class="pausa-prompts">';
        q.forEach(function (t, i) {
          h += '<div class="card"><h2 style="font-size:1.25rem">' + esc(t) + '</h2><details><summary>Anotar una idea (opcional)</summary><label for="nota-caso' + i + '" class="sr-only">' + esc(t) + '</label>' +
            '<textarea class="textarea" id="nota-caso' + i + '" data-nota="caso' + i + '" rows="3" maxlength="1000" placeholder="También pueden conversarlo, en voz alta, en LSA o con un comunicador."></textarea>' +
            '<p class="estado-guardado" data-estado>Opcional. Se guarda solo en este dispositivo.</p></details></div>';
        });
        h += '</div><div class="card" style="text-align:left;margin-top:1rem"><details><summary>Preguntas para guiar el debate sin pantallas</summary><ol class="preguntas">' +
          D.debateQuestions.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></details></div></div></section>";
        return h;
      },
      after: function () { $$("[data-nota]").forEach(function (ta) { ta.value = state.notes[ta.getAttribute("data-nota")] || ""; }); },
      bar: function () { return { next: "Estamos listos: investigar", back: "Volver a los mensajes" }; },
      speech: function () { return "La historia se detiene. ¿Qué está pasando acá? " + D.caseQuestions.open.join(" ") + " Conversen en el equipo."; },
      live: function () { return "La historia se detiene. ¿Qué está pasando acá? Conversen en el equipo."; }
    },

    /* ---- 6. INVESTIGAMOS ---- */
    investigamos: {
      beats: 6 + 1 + 5 + 1,
      chapters: [{ t: "Línea de tiempo", b: 0 }, { t: "Lo que sabemos", b: 6 }, { t: "Conceptos clave", b: 7 }, { t: "Señales de hostigamiento", b: 12 }],
      render: function (b, o) {
        var h = '<section class="escena panel-escena" aria-labelledby="h-inv">' + eyebrow(6) + '<h1 id="h-inv" tabindex="-1">Investigamos</h1>';
        if (b <= 5) {
          h += '<p class="lead">Armemos la línea de tiempo, una pista por vez.</p><ol class="linea" aria-label="Línea de tiempo, de lo primero a lo último">';
          for (var i = 0; i <= b; i++) {
            var e = H.linea[i];
            h += '<li' + (i === b && o.forward ? ' class="nuevo"' : "") + '><span class="hora">' + esc(e.hora) + '</span> <span class="que">' + esc(e.quien) + ": " + esc(e.que) + '</span><span class="cita">«' + esc(e.cita) + "»</span></li>";
          }
          h += "</ol>";
          if (b >= 3) h += circulacionHtml();
        } else if (b === 6) {
          h += '<p class="lead">¿Qué sabemos con seguridad y qué necesitamos averiguar?</p><div class="dos-col"><div class="card"><h2>Sabemos</h2><ul>' +
            H.sabemos.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul></div><div class="card"><h2>Falta averiguar</h2><ul>' +
            H.falta.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div></div>";
        } else if (b <= 11) {
          var k = b - 7, cpt = H.conceptos[k], g = D.glossary[k];
          h += '<p class="lead">Cinco ideas para entender lo que pasó.</p><ol class="tira" aria-label="Conceptos">' +
            H.conceptos.map(function (c, j) { return '<li class="' + (j < k ? "hecho" : (j === k ? "actual" : "")) + '"' + (j === k ? ' aria-current="step"' : "") + ">" + (j < k ? "✓ " : "") + esc(c.etiqueta || c.clave) + "</li>"; }).join("") + "</ol>" +
            '<div class="card concepto revela"><h2><span class="concepto-picto" aria-hidden="true">' + iconosConceptos[k] + '</span>' + esc(cpt.etiqueta || g.term) + '</h2><p class="def">' + esc(g.definition) + '</p><p class="en-caso"><strong>En el caso:</strong> ' + esc(cpt.enElCaso) + "</p></div>";
        } else {
          h += '<p class="lead">¿Hay señales de hostigamiento reiterado? Elegí una señal para ver qué sabemos.</p><div class="card"><div class="chips" role="group" aria-label="Señales para analizar">' +
            H.senales.map(function (s, j) { return '<button type="button" class="chip" data-act="senal" data-i="' + j + '" aria-pressed="' + (ui.senal === j ? "true" : "false") + '">' + esc(s.clave) + "</button>"; }).join("") +
            '</div><div id="senal-out" tabindex="-1"></div></div><div class="card"><p style="margin:0"><strong>' + esc(H.conclusionAcoso) + "</strong></p></div>";
        }
        return h + "</section>";
      },
      after: function (b) { if (b === 12) renderSenal(); },
      bar: function (b) {
        var n = b <= 4 ? "Siguiente pista" : b === 5 ? "¿Qué sabemos?" : b === 6 ? "Conceptos clave" : b <= 10 ? "Siguiente concepto" : b === 11 ? "Analizar señales" : "Ir a las decisiones";
        return { next: n, back: b > 0 ? "Volver un paso" : "Volver a la pausa", note: b <= 5 ? "Pista " + (b + 1) + " de 6" : b >= 7 && b <= 11 ? "Concepto " + (b - 6) + " de 5" : "" };
      },
      speech: function (b) {
        if (b <= 5) { var e = H.linea[b]; return "A las " + e.hora + ", " + e.quien + ": " + e.que + " " + hablado(e.cita) + (b >= 3 ? " Esquema de circulación: Nico publica una foto, se comparte en el grupo tercero B y Lara avisa que llegó a otro grupo. ¿Quién decide dónde termina la imagen?" : ""); }
        if (b === 6) return "Sabemos: " + H.sabemos.join(" ") + " Falta averiguar: " + H.falta.join(" ");
        if (b <= 11) { var c = H.conceptos[b - 7], g = D.glossary[b - 7]; return (c.etiqueta || g.term) + ". " + g.definition + " En el caso: " + c.enElCaso; }
        return (ui.senal !== null ? H.senales[ui.senal].clave + ". " + H.senales[ui.senal].evidencia + " " : "¿Hay señales de hostigamiento reiterado? Elegí una señal. ") + H.conclusionAcoso;
      },
      live: function (b) {
        if (b <= 5) { var e = H.linea[b]; return "Pista " + (b + 1) + " de 6. A las " + e.hora + ", " + e.quien + ": " + e.que; }
        if (b === 6) return "¿Qué sabemos con seguridad y qué necesitamos averiguar?";
        if (b <= 11) { var c = H.conceptos[b - 7]; return "Concepto " + (b - 6) + " de 5: " + (c.etiqueta || c.clave) + ". " + D.glossary[b - 7].definition; }
        return "¿Hay señales de hostigamiento reiterado? Elegí una señal para ver qué sabemos.";
      }
    },

    /* ---- 7. DECIDIMOS ---- */
    decidimos: {
      beats: 4,
      chapters: [{ t: "Decisión 1", b: 0 }, { t: "Decisión 2", b: 2 }],
      render: function (b) {
        var n = b < 2 ? 0 : 1, d = D.dilemmas[n], st = state.decisions[d.id], u = ui.dec[d.id];
        var h = '<section class="escena panel-escena" aria-labelledby="h-dec">' + eyebrow(7, "Decisión " + (n + 1) + " de 2") + '<h1 id="h-dec" tabindex="-1">' + esc(d.title) + "</h1>";
        if (b % 2 === 0) {
          h += '<p class="situacion">' + esc(d.situation) + ' Elegí una opción, escuchá las que quieras y después confirmá.</p><ul class="opciones" aria-label="Opciones">';
          d.options.forEach(function (o, i) {
            var exp = st.explored.indexOf(o.id) >= 0;
            h += '<li><button type="button" class="opcion' + (exp ? " explorada" : "") + '" data-act="opcion" data-i="' + i + '" aria-pressed="' + (u.sel === i ? "true" : "false") + '">' +
              '<span class="opcion-letra" aria-hidden="true">' + LETRAS[i] + '</span><span class="opcion-picto" aria-hidden="true">' + (iconosOpciones[o.id] || "💭") + '</span><span>' + esc(o.label) + "</span>" +
              '<span class="opcion-marca sel">' + icon("check") + "Opción elegida</span><span class=\"opcion-marca exp\">" + icon("check") + "Ya la exploraste</span></button>" +
              '<button type="button" class="btn btn-secondary" data-act="oir-op" data-i="' + i + '">' + icon("speaker") + "Escuchar la opción " + LETRAS[i] + "</button></li>";
          });
          h += "</ul>" + ayudaComunicacionHtml();
        } else {
          var o = d.options[u.sel];
          h += '<div class="consecuencia"><div class="dibujo" role="img" aria-label="Ilustración esquemática de la consecuencia, explicada en el texto">' + dibujo(H.dibujos[o.id]) + "</div>" +
            '<div class="card revela"><h2>Una consecuencia posible</h2><p><strong>Elegiste: ' + LETRAS[u.sel] + ". " + esc(o.label) + "</strong></p><p style=\"font-size:1.2rem\">" + esc(o.possibleConsequence) + "</p>" +
            '<div class="para-pensar"><p><strong>Para pensar:</strong> ' + esc(o.reflection) + '</p></div>' +
            '<div class="btn-row" style="margin-top:1rem"><button type="button" class="btn btn-secondary" data-act="otra">' + icon("refresh") + "Explorar otra alternativa</button></div>" +
            '<details><summary>Comparar las tres opciones juntas</summary><div class="tabla-wrap"><table class="tabla"><caption class="sr-only">Comparación de las opciones</caption><thead><tr><th scope="col">Opción</th><th scope="col">Una consecuencia posible</th><th scope="col">Para pensar</th></tr></thead><tbody>' +
            d.options.map(function (x, i) { return '<tr><th scope="row">' + LETRAS[i] + ". " + esc(x.label) + "</th><td>" + esc(x.possibleConsequence) + "</td><td>" + esc(x.reflection) + "</td></tr>"; }).join("") +
            '</tbody></table></div><p class="small muted">Ninguna opción suma ni resta puntos: sirven para comparar y conversar.</p></details>' +
            '<details><summary>Registrar nuestra idea (opcional)</summary><p class="small muted">Podés explicar por qué elegirían esa opción. No hace falta escribir para seguir: pueden conversarlo, usar LSA o un comunicador.</p>' +
            '<div class="chips-frases" role="group" aria-label="Frases para empezar a escribir">' + D.sentenceStarters.map(function (f) { return '<button type="button" class="chip" data-act="frase" data-frase="' + esc(f) + '">' + esc(f) + "</button>"; }).join("") + "</div>" +
            '<label for="nota-' + d.id + '" class="sr-only">Nuestra idea</label><textarea class="textarea" id="nota-' + d.id + '" data-dec="' + d.id + '" rows="4" maxlength="1000" placeholder="No escribas nombres reales ni datos personales."></textarea>' +
            '<div class="btn-row" style="margin-top:.6rem"><button type="button" class="btn btn-secondary" data-act="registrar" data-dec="' + d.id + '">Registrar nuestra idea</button></div><p class="estado-guardado" id="estado-' + d.id + '" role="status"></p></details></div></div>';
        }
        return h + "</section>";
      },
      after: function (b) {
        var n = b < 2 ? 0 : 1, d = D.dilemmas[n], ta = $("#nota-" + d.id); if (ta) ta.value = state.decisions[d.id].note || "";
      },
      bar: function (b) {
        var n = b < 2 ? 0 : 1, u = ui.dec[D.dilemmas[n].id];
        if (b % 2 === 0) return { next: "Confirmar mi elección", nextDisabled: u.sel === null, back: b === 0 ? "Volver a las pistas" : "Volver a la consecuencia", note: u.sel === null ? "Elegí una opción para poder confirmar. Podés escuchar cada una." : "Elegiste la opción " + LETRAS[u.sel] + ". Podés cambiarla antes de confirmar." };
        return { next: n === 0 ? "Siguiente decisión" : "Ir a construir acuerdos", back: "Volver a las opciones" };
      },
      speech: function (b) {
        var n = b < 2 ? 0 : 1, d = D.dilemmas[n], u = ui.dec[d.id];
        if (b % 2 === 0) return d.title + " " + d.situation + " " + d.options.map(function (o, i) { return "Opción " + LETRAS[i] + ": " + o.label + "."; }).join(" ");
        var o = d.options[u.sel]; return "Una consecuencia posible: " + o.possibleConsequence + " Para pensar: " + o.reflection;
      },
      live: function (b) {
        var n = b < 2 ? 0 : 1, d = D.dilemmas[n], u = ui.dec[d.id];
        if (b % 2 === 0) return "Decisión " + (n + 1) + " de 2: " + d.title + " " + d.situation;
        var o = d.options[u.sel]; return "Una consecuencia posible de la opción " + LETRAS[u.sel] + ": " + o.possibleConsequence + " Para pensar: " + o.reflection;
      }
    },

    /* ---- 8. CONSTRUIMOS ---- */
    construimos: {
      beats: 2,
      chapters: [{ t: "Armar el decálogo", b: 0 }, { t: "Cierre", b: 1 }],
      render: function (b, o) {
        var h = '<section class="escena panel-escena" aria-labelledby="h-con">' + eyebrow(8) + '<h1 id="h-con" tabindex="-1">Construimos</h1>';
        if (b === 0) {
          h += '<p class="lead">Cada idea es una propuesta para revisar. Sumen las que les sirvan, cámbienlas y agreguen otras hasta llegar a 10 acuerdos.</p>' +
            '<p class="small muted"><strong>No es colaboración en tiempo real</strong> ni usa cuentas: lo escrito se guarda solo en este dispositivo. Los equipos trabajan presentes en el aula. No escribas nombres reales ni datos personales.</p>' +
            '<div class="armado"><div><div class="card idea-card" id="idea-card"></div>' +
            '<details class="card"><summary>Repasar lo que exploramos en las decisiones</summary><div id="repaso"></div></details></div>' +
            '<div class="papel" id="papel"><h2>Nuestro decálogo de convivencia digital</h2><p class="contador" id="contador-acuerdos"></p><p class="small" id="aviso-deshacer" hidden></p>' +
            '<ol class="acuerdos" id="lista-acuerdos"></ol><p class="vacio" id="vacio-acuerdos" hidden>Todavía no hay acuerdos. Sumá una idea de la izquierda o escribí una propia abajo.</p>' +
            '<form class="agregar" id="form-agregar" novalidate><label for="nuevo-acuerdo">Sumá un acuerdo propio</label><div class="agregar-row">' +
            '<input type="text" id="nuevo-acuerdo" class="input" maxlength="140" autocomplete="off" placeholder="Por ejemplo: Preguntar antes de etiquetar a alguien.">' +
            '<button type="submit" class="btn btn-primary" id="btn-agregar">' + icon("plus") + 'Agregar acuerdo</button></div><p class="small" id="agregar-msg" role="status"></p></form></div></div>';
        } else {
          var n = state.agreements.length;
          h += '<p class="lead">Este es el decálogo que construyó el grupo.</p><div class="papel"><h2>Nuestro decálogo de convivencia digital</h2>' +
            (n < D.maxAgreements ? '<p class="small"><strong>Borrador:</strong> hay ' + n + " de " + D.maxAgreements + " acuerdos. Pueden volver y seguir editando.</p>" : "") +
            (n ? '<ol class="final-lista">' + state.agreements.map(function (a, i) { return '<li style="' + (o.forward ? "--i:" + i : "animation:none") + '">' + esc(a.text) + "</li>"; }).join("") + "</ol>" : '<p class="vacio">Todavía no hay acuerdos escritos.</p>') +
            '<div class="btn-row"><button type="button" class="btn btn-primary" data-act="imprimir">' + icon("print") + 'Imprimir o guardar como PDF</button><button type="button" class="btn btn-secondary" data-act="txt">' + icon("download") + "Descargar como texto</button></div>" +
            '<p class="small muted">«Imprimir o guardar como PDF» abre el diálogo del navegador: elegí «Guardar como PDF» si querés un archivo.</p></div>' +
            '<div class="card"><h2>Reflexión final</h2><p><strong>' + esc(D.finalReflection) + '</strong></p><label for="final-texto" class="sr-only">Tu reflexión (opcional)</label><textarea id="final-texto" class="textarea" rows="4" maxlength="1000" placeholder="Podés conversarlo en voz alta, en LSA o con tu comunicador. Si querés, anotá una idea."></textarea><p class="estado-guardado" id="final-estado">Opcional. Se guarda solo en este dispositivo.</p></div>' +
            '<div class="card"><h2>Tus datos en este dispositivo</h2><div data-borrar></div></div>' +
            '<div class="btn-row"><button type="button" class="btn btn-secondary" data-act="reiniciar">' + icon("refresh") + "Volver a empezar la historia</button></div>";
        }
        return h + "</section>";
      },
      after: function (b) {
        if (b === 0) { refreshArmado(); renderRepaso(); }
        else { var f = $("#final-texto"); if (f) f.value = state.finalReflection || ""; mountBorrar($("[data-borrar]", $("#escenario")), "fin"); }
      },
      bar: function (b) {
        if (b === 0) { var n = state.agreements.length; return { next: "Terminar el decálogo", back: "Volver a las decisiones", note: "Tienen " + n + " de " + D.maxAgreements + " acuerdos. Pueden terminar cuando quieran." }; }
        return { next: "", nextHidden: true, back: "Seguir editando el decálogo" };
      },
      speech: function (b) {
        if (b === 0) { var i = ui.idea; return "Idea " + (i + 1) + " de " + D.suggestedAgreements.length + ": " + D.suggestedAgreements[i]; }
        return "Nuestro decálogo de convivencia digital. " + state.agreements.map(function (a, i) { return (i + 1) + ". " + a.text; }).join(" ") + " " + D.finalReflection;
      },
      live: function (b) { return b === 0 ? "Construimos. Armen entre todos el decálogo de convivencia digital." : "Nuestro decálogo de convivencia digital. Tienen " + state.agreements.length + " de " + D.maxAgreements + " acuerdos."; }
    }
  };

  /* ---- Señales (Investigamos, último paso) ---- */
  function renderSenal() {
    var out = $("#senal-out"); if (!out) return;
    if (ui.senal === null) { out.innerHTML = '<p class="muted">Todavía no elegiste ninguna señal.</p>'; return; }
    var s = H.senales[ui.senal];
    out.innerHTML = '<div class="revela"><h2 style="font-size:1.3rem">' + esc(s.clave) + '</h2><p><em>' + esc(s.pregunta) + "</em></p><p>" + esc(s.evidencia) + "</p></div>";
  }

  /* ------------------------------------------------------------------ Construimos: ideas y acuerdos */
  function refreshArmado(focusSel) {
    var n = state.agreements.length, max = D.maxAgreements, i = ui.idea, total = D.suggestedAgreements.length;
    var usada = state.agreements.some(function (a) { return a.src === i; }), lleno = n >= max;
    $("#idea-card").innerHTML =
      '<p class="idea-num">Idea ' + (i + 1) + " de " + total + '</p><span class="idea-picto" aria-hidden="true">' + (iconosAcuerdos[i] || "🤝") + '</span><p class="idea-txt">' + esc(D.suggestedAgreements[i]) + "</p>" +
      (usada ? '<p class="idea-estado">' + icon("check") + " Ya está en el decálogo</p>" : "") +
      '<div class="btn-row"><button type="button" class="btn btn-primary" data-act="sumar" aria-disabled="' + (usada || lleno) + '">' + icon("plus") + "Sumar al decálogo</button></div>" +
      '<div class="btn-row"><button type="button" class="btn btn-secondary" data-act="idea-ant" aria-disabled="' + (i === 0) + '">' + icon("left") + 'Idea anterior</button><button type="button" class="btn btn-secondary" data-act="idea-sig" aria-disabled="' + (i === total - 1) + '">Idea siguiente' + icon("right") + "</button></div>" +
      '<div class="btn-row"><button type="button" class="btn btn-secondary" data-act="sumar-todas">Sumar todas para revisarlas</button></div>' +
      (lleno ? '<p class="small">Ya tienen 10 acuerdos. Para sumar otra idea, editen o eliminen uno.</p>' : "");
    $("#vacio-acuerdos").hidden = n > 0;
    $("#lista-acuerdos").innerHTML = state.agreements.map(function (a, k) {
      return '<li class="acuerdo' + (a.recien ? " recien" : "") + '" data-id="' + a.id + '"><label for="ac-' + a.id + '">Acuerdo ' + (k + 1) + '</label><textarea class="textarea" id="ac-' + a.id + '" rows="2" maxlength="200"></textarea>' +
        '<div class="acuerdo-acc"><button type="button" class="btn btn-secondary" data-acc="subir" aria-disabled="' + (k === 0) + '" aria-label="Subir acuerdo ' + (k + 1) + '">' + icon("up") + 'Subir</button>' +
        '<button type="button" class="btn btn-secondary" data-acc="bajar" aria-disabled="' + (k === n - 1) + '" aria-label="Bajar acuerdo ' + (k + 1) + '">' + icon("down") + 'Bajar</button>' +
        '<button type="button" class="btn btn-secondary" data-acc="borrar" aria-label="Eliminar acuerdo ' + (k + 1) + '">' + icon("trash") + "Eliminar</button></div></li>";
    }).join("");
    state.agreements.forEach(function (a) { var t = $("#ac-" + a.id); if (t) t.value = a.text; delete a.recien; });
    $("#contador-acuerdos").textContent = n + " de " + max + " acuerdos" + (n >= max ? ". Llegaron a 10." : n > 0 ? ". Faltan " + (max - n) + "." : ".");
    $("#btn-agregar").setAttribute("aria-disabled", lleno ? "true" : "false");
    var du = $("#aviso-deshacer");
    if (ui.undo) { du.hidden = false; du.innerHTML = 'Se eliminó un acuerdo. <button type="button" class="btn btn-secondary" data-act="deshacer">Deshacer</button>'; } else { du.hidden = true; du.innerHTML = ""; }
    updateBar();
    if (focusSel) { var el = $(focusSel); if (el) el.focus(); }
  }
  function renderRepaso() {
    var box = $("#repaso"); if (!box) return;
    var html = "";
    D.dilemmas.forEach(function (d) {
      var st = state.decisions[d.id];
      html += "<h3>" + esc(d.title) + "</h3>";
      if (!st.explored.length) html += '<p class="muted">Todavía no exploraron opciones de esta decisión.</p>';
      else {
        html += "<ul>";
        st.explored.forEach(function (id) { d.options.forEach(function (o, i) { if (o.id === id) html += "<li><strong>" + LETRAS[i] + ". " + esc(o.label) + ":</strong> " + esc(o.possibleConsequence) + "</li>"; }); });
        html += "</ul>";
      }
      if (st.note) html += '<p><strong>Nuestra idea registrada:</strong></p><p class="nota-repaso"></p>';
    });
    box.innerHTML = html;
    var k = 0; D.dilemmas.forEach(function (d) { if (state.decisions[d.id].note) $$(".nota-repaso", box)[k++].textContent = state.decisions[d.id].note; });
  }
  function addAgreement(text, src) {
    if (state.agreements.length >= D.maxAgreements) { announce("Ya tienen 10 acuerdos. Para sumar otro, editen o eliminen uno."); return false; }
    state.agreements.push({ id: uid(), text: text, src: typeof src === "number" ? src : null, recien: true });
    ui.undo = null; save(); return true;
  }
  function textoDecalogo() { return state.agreements.map(function (a, i) { return (i + 1) + ". " + a.text; }).join("\n"); }
  function fillPrintSheet() {
    var ol = $("#p-lista"); ol.innerHTML = "";
    state.agreements.forEach(function (a) { var li = document.createElement("li"); li.textContent = a.text; ol.appendChild(li); });
    var n = state.agreements.length;
    $("#p-borrador").textContent = n === 0 ? "Borrador vacío: todavía no se escribió ningún acuerdo." : n < D.maxAgreements ? "Borrador: hay " + n + " de " + D.maxAgreements + " acuerdos. Falta completar el decálogo." : "";
  }
  function downloadTxt() {
    var n = state.agreements.length;
    var txt = "NUESTRO DECÁLOGO DE CONVIVENCIA DIGITAL\r\nConectados con respeto · Una foto, cientos de miradas\r\nFormación Ética y Ciudadana, 3.º año\r\n\r\n" +
      (n < D.maxAgreements ? "(Borrador: " + n + " de " + D.maxAgreements + " acuerdos)\r\n\r\n" : "") + textoDecalogo().replace(/\n/g, "\r\n") + "\r\n\r\nSimulación educativa ficticia.\r\n";
    var url = URL.createObjectURL(new Blob(["﻿" + txt], { type: "text/plain;charset=utf-8" }));
    var a = document.createElement("a"); a.href = url; a.download = "decalogo-convivencia-digital.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("Se descargó el decálogo como archivo de texto.");
  }

  /* ------------------------------------------------------------------ borrar datos (con confirmación) */
  var borrarN = 0;
  function mountBorrar(box, tag) {
    if (!box) return;
    var pid = "borrar-" + (tag || "") + (borrarN++);
    box.innerHTML = "<p>Se guardan solo en este dispositivo: decisiones, ideas, acuerdos, reflexión y ajustes. <strong>No es una cuenta ni se comparte con nadie.</strong></p>" +
      '<p class="small">' + (storageOk ? "" : "Aviso: tu navegador no permite guardar datos acá (por ejemplo, en modo privado). Lo que escribas se perderá al cerrar la página.") + "</p>" +
      '<button type="button" class="btn btn-secondary" data-b="pedir">' + icon("trash") + "Borrar mis datos guardados</button>" +
      '<div class="borrar-confirm" role="group" aria-labelledby="' + pid + '-t" hidden><p id="' + pid + '-t"><strong>¿Borrar todo lo guardado en este dispositivo?</strong> Se eliminan decisiones, ideas, acuerdos y ajustes. No se puede deshacer.</p>' +
      '<div class="btn-row"><button type="button" class="btn btn-primary" data-b="si">Sí, borrar todo</button><button type="button" class="btn btn-secondary" data-b="no">Cancelar</button></div></div>' +
      '<p class="borrar-estado" role="status"></p>';
    var conf = $(".borrar-confirm", box), pedir = $('[data-b="pedir"]', box);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-b]"); if (!b) return; var w = b.getAttribute("data-b");
      if (w === "pedir") { conf.hidden = false; $('[data-b="no"]', box).focus(); }
      if (w === "no") { conf.hidden = true; pedir.focus(); }
      if (w === "si") {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (er) { /* nada */ }
        state = defaults(); ui.undo = null; ui.idea = 0; ui.senal = null;
        ui.dec = { decision1: { sel: null, confirmed: false }, decision2: { sel: null, confirmed: false } };
        applySettings(); updateScan();
        $$(".borrar-estado").forEach(function (p) { p.textContent = ""; });
        conf.hidden = true; $(".borrar-estado", box).textContent = "Listo: se borraron los datos guardados en este dispositivo.";
        announce("Se borraron los datos guardados en este dispositivo.");
        if (nav.scene === N_ESCENAS - 1 && nav.beat === 1) { var f = $("#final-texto"); if (f) f.value = ""; $$(".final-lista, .final-lista + .btn-row", $("#escenario")).length; }
        pedir.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ motor de escenas */
  function sc() { return scenes[H.escenas[nav.scene].id]; }
  function beatsOf(i) { return scenes[H.escenas[i].id].beats; }
  function clampBeat(i, b) {
    var id = H.escenas[i].id;
    b = Math.max(0, Math.min(beatsOf(i) - 1, b));
    if (id === "decidimos") {
      if (b === 1 && !ui.dec.decision1.confirmed) b = 0;
      if (b === 3 && !ui.dec.decision2.confirmed) b = 2;
    }
    return b;
  }
  function currentSpeech() { return sc().speech(nav.beat); }

  function updateBar() {
    var s = sc(), cfg = s.bar(nav.beat), total = s.beats;
    var txt = "Escena " + (nav.scene + 1) + " de " + N_ESCENAS + " · " + H.escenas[nav.scene].nombre + (total > 1 ? " · paso " + (nav.beat + 1) + " de " + total : "");
    $("#prog-texto").textContent = txt;
    $("#prog-relleno").style.width = Math.round(((nav.scene + (nav.beat + 1) / total) / N_ESCENAS) * 100) + "%";
    var back = $("#btn-volver"); back.hidden = !!cfg.backHidden; $("#volver-txt").textContent = cfg.back || (nav.scene > 0 ? "Volver a " + H.escenas[nav.scene - 1].nombre.toLowerCase() : "Volver");
    var nx = $("#btn-siguiente"); nx.hidden = !!cfg.nextHidden; $("#sig-txt").textContent = cfg.next || "Continuar";
    nx.setAttribute("aria-disabled", cfg.nextDisabled ? "true" : "false");
    $("#controles-nota").textContent = cfg.note || "";
    $("#audio").hidden = !voz.supported;
    $$("#panel-etapas [data-ir]").forEach(function (b) {
      var i = parseInt(b.getAttribute("data-ir"), 10), bt = b.getAttribute("data-beat");
      if (bt === null) { if (i === nav.scene) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); }
    });
  }

  function renderStage(sceneChanged, forward) {
    var s = sc(), stage = $("#escenario");
    stage.innerHTML = s.render(nav.beat, { forward: forward });
    root.setAttribute("data-escena", H.escenas[nav.scene].id);
    if (s.after) s.after(nav.beat);
    if (!sceneChanged) { var sec = $(".escena", stage); if (sec) sec.style.animation = "none"; }
    updateBar();
  }

  function setPos(scene, beat, opts) {
    opts = opts || {};
    var sceneChanged = scene !== nav.scene, forward = !!opts.forward;
    voz.stop();
    nav.scene = scene; nav.beat = clampBeat(scene, beat);
    renderStage(sceneChanged, forward && !sceneChanged || (forward && opts.animate));
    if (sceneChanged) {
      var id = H.escenas[scene].id;
      if (location.hash !== "#/" + id) { suppressHash = true; try { history.pushState(null, "", "#/" + id); } catch (e) { location.hash = "#/" + id; } }
      document.title = H.escenas[scene].nombre + " · Conectados con respeto";
      window.scrollTo(0, 0);
      var h1 = $("h1", $("#escenario")); if (h1 && !opts.noFocus) h1.focus();
      announce("Escena " + (scene + 1) + " de " + N_ESCENAS + ": " + H.escenas[scene].nombre + ".");
    } else {
      story(sc().live(nav.beat));
    }
    if (state.settings.autoRead && voz.supported && (!sceneChanged || opts.forward)) voz.speak(currentSpeech());
    if (opts.focusSel) { var el = $(opts.focusSel); if (el) el.focus(); }
  }
  var suppressHash = false;

  function goNext() {
    var cfg = sc().bar(nav.beat);
    if (cfg.nextDisabled) { announce("Primero elegí una opción."); return; }
    var id = H.escenas[nav.scene].id;
    if (id === "decidimos" && nav.beat % 2 === 0) {      // confirmar la elección
      var d = D.dilemmas[nav.beat < 2 ? 0 : 1], u = ui.dec[d.id], st = state.decisions[d.id];
      u.confirmed = true; var oid = d.options[u.sel].id; if (st.explored.indexOf(oid) < 0) st.explored.push(oid); save();
    }
    if (nav.beat < beatsOf(nav.scene) - 1) setPos(nav.scene, nav.beat + 1, { forward: true });
    else if (nav.scene < N_ESCENAS - 1) setPos(nav.scene + 1, 0, { forward: true });
  }
  function goBack() {
    if (nav.beat > 0) setPos(nav.scene, nav.beat - 1, {});
    else if (nav.scene > 0) { var p = nav.scene - 1; setPos(p, clampBeat(p, beatsOf(p) - 1), {}); }
  }

  /* ------------------------------------------------------------------ etapas (docente) */
  function renderEtapas() {
    $("#lista-etapas").innerHTML = H.escenas.map(function (e, i) {
      var s = scenes[e.id], sub = "";
      if (s.chapters) sub = '<ul class="etapa-sub">' + s.chapters.map(function (c) { return '<li><button type="button" class="btn btn-secondary" data-ir="' + i + '" data-beat="' + c.b + '">' + esc(c.t) + "</button></li>"; }).join("") + "</ul>";
      return '<li class="etapa"><button type="button" class="btn btn-secondary" data-ir="' + i + '"' + (i === nav.scene ? ' aria-current="step"' : "") + ">" + (i + 1) + ". " + esc(e.nombre) + "</button>" + sub + "</li>";
    }).join("");
  }
  function toggleEtapas(force) {
    var p = $("#panel-etapas"), b = $("#btn-etapas"), open = typeof force === "boolean" ? force : p.hidden;
    p.hidden = !open; b.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var cur = $('[aria-current="step"]', p) || $("button", p); if (cur) cur.focus(); }
  }

  /* ------------------------------------------------------------------ eventos */
  function initEvents() {
    $("#btn-siguiente").addEventListener("click", goNext);
    $("#btn-volver").addEventListener("click", goBack);
    $("#btn-marca").addEventListener("click", function () { setPos(0, 0, {}); });
    $("#btn-etapas").addEventListener("click", function () { toggleEtapas(); });
    $("#aud-play").addEventListener("click", function () { voz.toggle(); });
    $("#aud-repetir").addEventListener("click", function () { voz.repeat(); });
    $("#aud-stop").addEventListener("click", function () { voz.stop(); announce("Lectura detenida."); });
    $("#panel-etapas").addEventListener("click", function (e) {
      var b = e.target.closest("[data-ir]"); if (!b) return;
      var i = parseInt(b.getAttribute("data-ir"), 10), bt = b.getAttribute("data-beat");
      toggleEtapas(false); $("#btn-etapas").focus();
      setPos(i, bt === null ? 0 : parseInt(bt, 10), { noFocus: false });
    });
    $("#panel-etapas").addEventListener("keydown", function (e) { if (e.key === "Escape") { toggleEtapas(false); $("#btn-etapas").focus(); } });
    $("#skip-link").addEventListener("click", function (e) { e.preventDefault(); var h1 = $("h1", $("#escenario")); (h1 || $("#escena")).focus(); });
    window.addEventListener("hashchange", function () {
      if (suppressHash) { suppressHash = false; return; }
      var id = location.hash.replace(/^#\//, ""), i = H.escenas.map(function (e) { return e.id; }).indexOf(id);
      if (i >= 0 && i !== nav.scene) setPos(i, 0, {});
    });
    window.addEventListener("pagehide", function () { voz.stop(); });
    window.addEventListener("beforeprint", fillPrintSheet);

    var stage = $("#escenario");
    stage.addEventListener("click", function (e) {
      var t = e.target.closest("[data-act]"), a = t && t.getAttribute("data-act");
      if (a) stageAction(a, t);
      var acc = e.target.closest("[data-acc]"); if (acc) acuerdoAccion(acc);
    });
    stage.addEventListener("input", function (e) {
      var ta = e.target;
      if (ta.tagName !== "TEXTAREA") return;
      if (ta.hasAttribute("data-nota")) guardarNota(ta);
      else if (ta.hasAttribute("data-dec")) guardarDec(ta);
      else if (ta.id === "final-texto") guardarFinal(ta);
      else if (ta.closest(".acuerdo")) { var a = state.agreements.filter(function (x) { return x.id === ta.closest(".acuerdo").getAttribute("data-id"); })[0]; if (a) { a.text = ta.value; save(); } }
    });
    stage.addEventListener("submit", function (e) {
      if (e.target.id !== "form-agregar") return; e.preventDefault();
      var inp = $("#nuevo-acuerdo"), t = inp.value.trim(), msg = $("#agregar-msg");
      if (!t) { msg.textContent = "Escribí el acuerdo antes de agregarlo."; inp.focus(); return; }
      if (state.agreements.length >= D.maxAgreements) { msg.textContent = "Ya tienen 10 acuerdos. Para sumar otro, editen o eliminen uno."; return; }
      addAgreement(t, null); inp.value = ""; msg.textContent = "Acuerdo agregado."; refreshArmado("#nuevo-acuerdo");
      announce("Acuerdo agregado. Hay " + state.agreements.length + " de " + D.maxAgreements + ".");
    });
  }
  var guardarNota = debounce(function (ta) { state.notes[ta.getAttribute("data-nota")] = ta.value; save(); var e = ta.parentNode.querySelector("[data-estado]"); if (e) e.textContent = ta.value ? SAVED() : "Opcional. Se guarda solo en este dispositivo."; }, 400);
  var guardarDec = debounce(function (ta) { state.decisions[ta.getAttribute("data-dec")].note = ta.value; save(); }, 500);
  var guardarFinal = debounce(function (ta) { state.finalReflection = ta.value; save(); var e = $("#final-estado"); if (e) e.textContent = ta.value ? SAVED() : "Opcional. Se guarda solo en este dispositivo."; }, 500);

  function stageAction(a, t) {
    var id = H.escenas[nav.scene].id;
    if (a === "comunicar") {
      var panel = t.closest(".comunicacion-opcional");
      var chosen = t.getAttribute("data-frase") || "";
      var output = $(".frase-elegida", panel);
      $(".frase-elegida-texto", panel).textContent = chosen;
      output.hidden = false;
      $("[data-act='comunicar']", panel).forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); });
      announce("Frase seleccionada: " + chosen + ". Podés mostrarla al grupo o escucharla.");
    }
    else if (a === "oir-frase") {
      var frase = $(".frase-elegida-texto", t.closest(".comunicacion-opcional"));
      if (frase) voz.speak(frase.textContent);
    }
    else if (a === "abrir-notif") { setPos(nav.scene + 1, 0, { forward: true, animate: true }); }
    else if (a === "ampliar") openFoto(t);
    else if (a === "senal") { var i = parseInt(t.getAttribute("data-i"), 10); ui.senal = ui.senal === i ? null : i; $$("[data-act=senal]").forEach(function (b, j) { b.setAttribute("aria-pressed", ui.senal === j ? "true" : "false"); }); renderSenal(); if (ui.senal !== null) story(H.senales[ui.senal].clave + ". " + H.senales[ui.senal].evidencia); }
    else if (a === "opcion") {
      var d = D.dilemmas[nav.beat < 2 ? 0 : 1], u = ui.dec[d.id], k = parseInt(t.getAttribute("data-i"), 10);
      u.sel = k; u.confirmed = false;
      $$(".opcion").forEach(function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
      updateBar(); announce("Elegiste la opción " + LETRAS[k] + ": " + d.options[k].label + ". Falta confirmar.");
    }
    else if (a === "oir-op") { var dd = D.dilemmas[nav.beat < 2 ? 0 : 1], kk = parseInt(t.getAttribute("data-i"), 10); voz.speak("Opción " + LETRAS[kk] + ": " + dd.options[kk].label + "."); if (!voz.supported) announce("Este dispositivo no ofrece lectura en voz alta."); }
    else if (a === "otra") {
      var d2 = D.dilemmas[nav.beat < 2 ? 0 : 1], u2 = ui.dec[d2.id], st2 = state.decisions[d2.id];
      u2.sel = null; u2.confirmed = false;
      var first = d2.options.map(function (o, i) { return i; }).filter(function (i) { return st2.explored.indexOf(d2.options[i].id) < 0; })[0];
      setPos(nav.scene, nav.beat - 1, { focusSel: ".opciones li:nth-child(" + ((first === undefined ? 0 : first) + 1) + ") .opcion" });
    }
    else if (a === "frase") { var ta = $("textarea[data-dec]"); if (!ta) return; ta.value = (ta.value ? ta.value.replace(/\s*$/, "") + "\n" : "") + t.getAttribute("data-frase") + " "; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); guardarDec(ta); }
    else if (a === "registrar") { var rid = t.getAttribute("data-dec"), ta2 = $("#nota-" + rid); state.decisions[rid].note = ta2.value; save(); $("#estado-" + rid).textContent = ta2.value ? "Idea registrada. " + SAVED() : "No hay nada escrito. Podés seguir sin escribir."; }
    else if (a === "sumar") {
      if (t.getAttribute("aria-disabled") === "true") { announce(state.agreements.length >= D.maxAgreements ? "Ya tienen 10 acuerdos." : "Esa idea ya está en el decálogo."); return; }
      if (addAgreement(D.suggestedAgreements[ui.idea], ui.idea)) { refreshArmado('[data-act="sumar"]'); announce("Sumaste el acuerdo " + state.agreements.length + ". Hay " + state.agreements.length + " de " + D.maxAgreements + "."); }
    }
    else if (a === "idea-sig" || a === "idea-ant") {
      if (t.getAttribute("aria-disabled") === "true") return;
      ui.idea += a === "idea-sig" ? 1 : -1; refreshArmado('[data-act="' + a + '"]');
      var ic = $("#idea-card"); story("Idea " + (ui.idea + 1) + " de " + D.suggestedAgreements.length + ": " + D.suggestedAgreements[ui.idea]);
      if (state.settings.autoRead && voz.supported) voz.speak(currentSpeech());
    }
    else if (a === "sumar-todas") {
      var n0 = state.agreements.length;
      D.suggestedAgreements.forEach(function (tx, i) { if (state.agreements.length < D.maxAgreements && !state.agreements.some(function (x) { return x.src === i; })) state.agreements.push({ id: uid(), text: tx, src: i, recien: true }); });
      ui.undo = null; save(); refreshArmado("#lista-acuerdos .acuerdo textarea");
      announce(state.agreements.length > n0 ? "Se sumaron las ideas para revisar. Ahora pueden editarlas, moverlas o eliminarlas." : "No había lugar para sumar más ideas.");
    }
    else if (a === "deshacer") {
      if (!ui.undo) return; if (state.agreements.length >= D.maxAgreements) { announce("No hay lugar para recuperarlo: ya hay 10 acuerdos."); return; }
      var it = ui.undo.item; it.recien = true; state.agreements.splice(ui.undo.index, 0, it); ui.undo = null; save(); refreshArmado('[data-id="' + it.id + '"] textarea'); announce("Acuerdo recuperado.");
    }
    else if (a === "imprimir") { fillPrintSheet(); window.print(); }
    else if (a === "txt") downloadTxt();
    else if (a === "reiniciar") { ui.dec = { decision1: { sel: null, confirmed: false }, decision2: { sel: null, confirmed: false } }; ui.senal = null; setPos(0, 0, {}); }
  }
  function acuerdoAccion(b) {
    if (b.getAttribute("aria-disabled") === "true") return;
    var li = b.closest(".acuerdo"), id = li.getAttribute("data-id"), i = state.agreements.map(function (a) { return a.id; }).indexOf(id), acc = b.getAttribute("data-acc");
    if (acc === "subir" && i > 0) { var t = state.agreements.splice(i, 1)[0]; state.agreements.splice(i - 1, 0, t); ui.undo = null; save(); refreshArmado('[data-id="' + id + '"] [data-acc="subir"]'); announce("Acuerdo movido a la posición " + i + " de " + state.agreements.length + "."); }
    else if (acc === "bajar" && i < state.agreements.length - 1) { var t2 = state.agreements.splice(i, 1)[0]; state.agreements.splice(i + 1, 0, t2); ui.undo = null; save(); refreshArmado('[data-id="' + id + '"] [data-acc="bajar"]'); announce("Acuerdo movido a la posición " + (i + 2) + " de " + state.agreements.length + "."); }
    else if (acc === "borrar") {
      var rm = state.agreements.splice(i, 1)[0]; ui.undo = { item: rm, index: i }; save();
      var sig = state.agreements[i] || state.agreements[i - 1];
      refreshArmado(sig ? '[data-id="' + sig.id + '"] textarea' : "#nuevo-acuerdo"); announce("Acuerdo eliminado. Quedan " + state.agreements.length + ". Podés deshacerlo.");
    }
  }

  /* El botón «Continuar» usa aria-disabled: lo manejamos en goNext. */

  /* ------------------------------------------------------------------ arranque */
  function init() {
    applySettings(); initSettings(); initScan(); initDialogs();
    $$("[data-borrar]").forEach(function (b) { mountBorrar(b, "ayuda"); });
    renderEtapas(); initEvents();
    var id = location.hash.replace(/^#\//, ""), i = H.escenas.map(function (e) { return e.id; }).indexOf(id);
    nav.scene = i >= 0 ? i : 0; nav.beat = 0;
    renderStage(true, false);
    document.title = (nav.scene ? H.escenas[nav.scene].nombre + " · " : "") + "Conectados con respeto · Una foto, cientos de miradas";
    voz.ui();
    if (state.settings.scan) updateScan();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
