/* ==========================================================================
   CONECTADOS CON RESPETO — Lógica de la aplicación (JavaScript sin dependencias)
   - Navegación por secciones con hash (#/caso, #/decidimos…), sin recargar.
   - Estado guardado SOLO en localStorage de este dispositivo.
   - Sin red, sin analíticas, sin cuentas.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.CASO;
  var LSA = window.CASO_LSA || {};
  var root = document.documentElement;
  var STORAGE_KEY = "conectados-con-respeto:v1";

  /* ------------------------------------------------------------------ utilidades */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icon(id, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>';
  }
  function initial(name) { return esc(String(name).charAt(0).toUpperCase()); }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }
  var annTimer;
  function announce(msg) {
    var r = $("#anuncios");
    if (!r) return;
    r.textContent = "";
    clearTimeout(annTimer);
    annTimer = setTimeout(function () { r.textContent = msg; }, 60);
  }
  function uid() { return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ------------------------------------------------------------------ estado + almacenamiento local */
  var storageOk = true;
  function defaults() {
    return {
      settings: { scale: 100, contrast: false, motion: null, spacing: false, scan: false, scanSpeed: 3000 },
      decisions: {
        decision1: { explored: [], chosen: null, note: "" },
        decision2: { explored: [], chosen: null, note: "" }
      },
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
        if (s.settings) Object.keys(base.settings).forEach(function (k) { if (k in s.settings) base.settings[k] = s.settings[k]; });
        if (s.decisions) ["decision1", "decision2"].forEach(function (k) {
          if (s.decisions[k]) {
            var d = s.decisions[k];
            base.decisions[k] = {
              explored: Array.isArray(d.explored) ? d.explored : [],
              chosen: typeof d.chosen === "string" ? d.chosen : null,
              note: typeof d.note === "string" ? d.note : ""
            };
          }
        });
        if (s.notes) { base.notes.caso0 = String(s.notes.caso0 || ""); base.notes.caso1 = String(s.notes.caso1 || ""); }
        if (Array.isArray(s.agreements)) {
          base.agreements = s.agreements.filter(function (a) { return a && typeof a.text === "string"; })
            .slice(0, D.maxAgreements)
            .map(function (a) { return { id: a.id || uid(), text: a.text, src: typeof a.src === "number" ? a.src : null }; });
        }
        base.finalReflection = String(s.finalReflection || "");
      }
    } catch (e) { storageOk = false; }
    return base;
  }
  var state = load();
  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageOk = true;
    } catch (e) { storageOk = false; }
  }
  function clearAll() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* nada */ }
    state = defaults();
  }
  var SAVED_NOTE = function () {
    return storageOk ? "Guardado en este dispositivo." : "Tu navegador no deja guardar: lo escrito se pierde al cerrar la página.";
  };

  /* ------------------------------------------------------------------ ajustes de accesibilidad */
  var SCALES = [100, 115, 130, 150, 175, 200];
  function applySettings() {
    var s = state.settings;
    root.style.fontSize = s.scale + "%";
    root.setAttribute("data-contrast", s.contrast ? "alto" : "normal");
    root.setAttribute("data-motion", s.motion === true ? "reducido" : (s.motion === false ? "normal" : "auto"));
    root.classList.toggle("espaciado", !!s.spacing);
    root.classList.toggle("nav-compact", s.scale >= 150);
    var tam = $("#tam-valor"); if (tam) tam.textContent = "Tamaño actual: " + s.scale + " %";
    var reduceOS = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSwitch($("#sw-contraste"), s.contrast);
    setSwitch($("#sw-movimiento"), s.motion === null ? reduceOS : s.motion);
    setSwitch($("#sw-espaciado"), s.spacing);
    setSwitch($("#sw-barrido"), s.scan);
    var sel = $("#sel-barrido"); if (sel) sel.value = String(s.scanSpeed);
    var menos = [$("#btn-a-menos"), $("#p-a-menos")], mas = [$("#btn-a-mas"), $("#p-a-mas")];
    menos.forEach(function (b) { if (b) b.setAttribute("aria-disabled", s.scale <= SCALES[0] ? "true" : "false"); });
    mas.forEach(function (b) { if (b) b.setAttribute("aria-disabled", s.scale >= SCALES[SCALES.length - 1] ? "true" : "false"); });
  }
  function setSwitch(btn, on) {
    if (!btn) return;
    btn.setAttribute("aria-checked", on ? "true" : "false");
    var st = $(".switch-state", btn); if (st) st.textContent = on ? "Sí" : "No";
  }
  function changeScale(dir) {
    var i = SCALES.indexOf(state.settings.scale);
    if (i < 0) i = 0;
    var j = Math.max(0, Math.min(SCALES.length - 1, i + dir));
    if (j === i) { announce("Ya está en el tamaño " + (dir > 0 ? "máximo" : "mínimo") + "."); return; }
    state.settings.scale = SCALES[j];
    save(); applySettings();
    announce("Tamaño del texto: " + SCALES[j] + " por ciento.");
  }
  function initSettings() {
    $("#btn-a-menos").addEventListener("click", function () { changeScale(-1); });
    $("#btn-a-mas").addEventListener("click", function () { changeScale(1); });
    $("#p-a-menos").addEventListener("click", function () { changeScale(-1); });
    $("#p-a-mas").addEventListener("click", function () { changeScale(1); });
    $("#p-a-reset").addEventListener("click", function () { state.settings.scale = 100; save(); applySettings(); announce("Tamaño del texto: normal."); });
    $("#sw-contraste").addEventListener("click", function () {
      state.settings.contrast = !state.settings.contrast; save(); applySettings();
      announce("Alto contraste " + (state.settings.contrast ? "activado." : "desactivado."));
    });
    $("#sw-movimiento").addEventListener("click", function () {
      var reduceOS = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var actual = state.settings.motion === null ? reduceOS : state.settings.motion;
      state.settings.motion = !actual; save(); applySettings();
      announce("Reducir movimiento " + (state.settings.motion ? "activado." : "desactivado."));
    });
    $("#sw-espaciado").addEventListener("click", function () {
      state.settings.spacing = !state.settings.spacing; save(); applySettings();
      announce("Más espacio en el texto " + (state.settings.spacing ? "activado." : "desactivado."));
    });
    $("#sw-barrido").addEventListener("click", function () {
      state.settings.scan = !state.settings.scan; save(); applySettings(); updateScan();
    });
    $("#sel-barrido").addEventListener("change", function (e) {
      state.settings.scanSpeed = parseInt(e.target.value, 10) || 3000; save(); updateScan();
    });

    var btn = $("#btn-a11y"), panel = $("#panel-a11y");
    function abrirPanel(foco) {
      panel.hidden = false; btn.setAttribute("aria-expanded", "true");
      window.scrollTo(0, 0);
      if (foco) $("#t-a11y").setAttribute("tabindex", "-1"), $("#t-a11y").focus();
    }
    function cerrarPanel(devolverFoco) {
      panel.hidden = true; btn.setAttribute("aria-expanded", "false");
      if (devolverFoco) btn.focus();
    }
    btn.addEventListener("click", function () { panel.hidden ? abrirPanel(true) : cerrarPanel(true); });
    $("#btn-a11y-cerrar").addEventListener("click", function () { cerrarPanel(true); });
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-abrir-a11y]");
      if (t) { abrirPanel(true); }
    });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarPanel(true); });
  }

  /* ------------------------------------------------------------------ barrido automático (opcional) */
  var scanTimer = null, scanPaused = false;
  function scanTargets() {
    var all = $$("a[href], button, select, summary, [tabindex='0']");
    return all.filter(function (el) {
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
      if (el.closest("[hidden], dialog:not([open])")) return false;
      if (el.classList.contains("skip-link")) return false;
      var r = el.getClientRects();
      return r.length > 0 && getComputedStyle(el).visibility !== "hidden";
    });
  }
  function scanStep() {
    if (scanPaused) return;
    var items = scanTargets();
    if (!items.length) return;
    var dlg = $("#dlg-foto");
    if (dlg && dlg.open) items = items.filter(function (el) { return dlg.contains(el); });
    var i = items.indexOf(document.activeElement);
    var next = items[(i + 1) % items.length];
    if (next) next.focus({ preventScroll: false });
  }
  function updateScan() {
    clearInterval(scanTimer); scanTimer = null;
    var on = !!state.settings.scan;
    root.classList.toggle("scan-on", on);
    var bar = $("#barra-barrido");
    bar.hidden = !on;
    if (on) {
      scanPaused = false;
      $("#scan-pausa").textContent = "Pausar barrido";
      $("#scan-texto").textContent = "Barrido activo: el foco avanza solo cada " + (state.settings.scanSpeed / 1000) + " segundos. Enter o Espacio acciona.";
      scanTimer = setInterval(scanStep, state.settings.scanSpeed);
      announce("Barrido activado.");
    } else if (bar) {
      announce("Barrido desactivado.");
    }
  }
  function initScan() {
    $("#scan-pausa").addEventListener("click", function () {
      scanPaused = !scanPaused;
      this.textContent = scanPaused ? "Reanudar barrido" : "Pausar barrido";
      $("#scan-texto").textContent = scanPaused ? "Barrido en pausa." : "Barrido activo: el foco avanza solo cada " + (state.settings.scanSpeed / 1000) + " segundos. Enter o Espacio acciona.";
    });
    $("#scan-stop").addEventListener("click", function () {
      state.settings.scan = false; save(); applySettings(); updateScan();
    });
  }

  /* ------------------------------------------------------------------ navegación */
  var RUTAS = {
    inicio: "Inicio", caso: "El caso", investigamos: "Investigamos",
    decidimos: "Decidimos", construimos: "Construimos", ayuda: "Ayuda y privacidad"
  };
  var currentRoute = null;

  function routeFromHash() {
    var h = location.hash;
    if (h.indexOf("#/") !== 0) return null;
    var r = h.slice(2).split(/[?/]/)[0];
    return RUTAS[r] ? r : "inicio";
  }
  function showRoute(id, moveFocus) {
    var changed = id !== currentRoute;
    currentRoute = id;
    $$("[data-ruta-vista]").forEach(function (v) { v.hidden = v.getAttribute("data-ruta-vista") !== id; });
    $$("#nav-principal a").forEach(function (a) {
      if (a.getAttribute("data-ruta") === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.title = (id === "inicio" ? "" : RUTAS[id] + " · ") + "Conectados con respeto · Una foto, cientos de miradas";
    closeMenu(false);
    voz.stop();
    window.scrollTo(0, 0);
    if (moveFocus) {
      var h1 = $("[data-ruta-vista='" + id + "'] h1");
      if (h1) h1.focus();
    }
    if (changed && id === "construimos") renderRepaso();
  }
  function closeMenu(focusBtn) {
    var nav = $("#nav-principal"), b = $("#btn-menu");
    nav.classList.remove("abierto"); b.setAttribute("aria-expanded", "false");
    if (focusBtn) b.focus();
  }
  function initNav() {
    var nav = $("#nav-principal"), b = $("#btn-menu");
    b.addEventListener("click", function () {
      var open = !nav.classList.contains("abierto");
      nav.classList.toggle("abierto", open);
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var first = $("a", nav); if (first) first.focus(); }
    });
    nav.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("abierto")) closeMenu(true); });

    // Si el enlace apunta a la sección actual, el hash no cambia: llevamos el foco igual.
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='#/']");
      if (!a) return;
      var destino = a.getAttribute("href").slice(2).split(/[?/]/)[0];
      if (destino === currentRoute && location.hash === a.getAttribute("href")) {
        e.preventDefault(); showRoute(destino, true);
      }
    });
    window.addEventListener("hashchange", function () {
      var r = routeFromHash();
      if (r) showRoute(r, true);
    });
    $("#skip-link").addEventListener("click", function (e) {
      e.preventDefault();
      var main = $("#contenido");
      var h1 = $("[data-ruta-vista]:not([hidden]) h1");
      (h1 || main).focus();
    });
    var inicial = routeFromHash() || "inicio";
    showRoute(inicial, false);
    if (location.hash.indexOf("#/") !== 0) { try { history.replaceState(null, "", "#/inicio"); } catch (e) { /* nada */ } }
  }

  /* ------------------------------------------------------------------ LSA: lugar preparado (sin videos todavía) */
  function renderLsa() {
    $$("[data-lsa]").forEach(function (slot) {
      var key = slot.getAttribute("data-lsa");
      var v = LSA[key];
      if (v && v.src) {
        slot.className = "lsa";
        slot.innerHTML =
          '<h2 class="h-sec">Explicación en Lengua de Señas Argentina (LSA)</h2>' +
          '<video controls preload="none" ' + (v.poster ? 'poster="' + esc(v.poster) + '" ' : "") + 'src="' + esc(v.src) + '">' +
          (v.captions ? '<track kind="captions" srclang="es" label="Español" src="' + esc(v.captions) + '">' : "") +
          "</video>" +
          (v.credit ? '<p class="small muted">' + esc(v.credit) + "</p>" : "") +
          (v.transcript ? '<details class="detalle"><summary>Transcripción del video</summary><p>' + esc(v.transcript) + "</p></details>" : "");
      } else {
        slot.className = "lsa";
        slot.innerHTML =
          '<details class="lsa-pendiente"><summary>' + icon("hand") + 'Apoyo en Lengua de Señas Argentina (LSA): pendiente</summary>' +
          "<p><strong>Todavía no hay un video en LSA para esta sección.</strong> Cuando una persona competente en LSA lo grabe y lo revise, se podrá incorporar en este lugar (ver el README). No usamos avatares ni traducciones automáticas.</p>" +
          "<p>Mientras tanto, todo el contenido está escrito y organizado con guías visuales. Si el grupo cuenta con mediación en LSA en el aula, esa mediación es presencial.</p></details>";
      }
    });
  }

  /* ------------------------------------------------------------------ pantalla EL CASO */
  var feedOpen = false;
  function renderFeed() {
    var p = D.post;
    var html = "";
    html += '<article class="post" aria-labelledby="post-autor">';
    html += '<div class="post-head"><span class="avatar" aria-hidden="true">' + initial(p.author) + '</span>';
    html += '<span class="who"><strong id="post-autor">' + esc(p.author) + '</strong><span>' + esc(p.time) + " · Grupo " + esc(D.groupName) + "</span></span></div>";
    html += '<p class="post-text">' + esc(p.text) + "</p>";
    html += '<figure class="post-figure"><img src="' + esc(D.image.src) + '" alt="' + esc(D.image.alt) + '" width="1448" height="1086">';
    html += "<figcaption>" + esc(D.image.caption) + "</figcaption></figure>";
    html += '<div class="post-actions">';
    html += '<button type="button" class="btn btn-secondary" id="btn-ampliar">' + icon("expand") + "Ampliar la foto</button>";
    html += '<button type="button" class="btn btn-secondary" id="btn-grande" aria-pressed="false">' + icon("plus") + "Texto de los mensajes más grande</button>";
    html += "</div>";
    html += '<details class="detalle post-desc"><summary>Descripción de la foto en texto</summary><p>' + esc(D.image.longDescription) + "</p></details>";
    html += "</article>";

    html += '<div class="comentarios-wrap">';
    html += '<button type="button" class="btn btn-primary" id="btn-comentarios" aria-expanded="false" aria-controls="lista-comentarios">Ver los comentarios (' + D.comments.length + ")</button>";
    html += '<ol class="comments" id="lista-comentarios" aria-label="Comentarios en orden cronológico" hidden>';
    D.comments.forEach(function (c) {
      html += '<li class="comment"><div class="comment-head"><span class="avatar" aria-hidden="true">' + initial(c.author) + '</span>';
      html += '<span class="who"><strong>' + esc(c.author) + "</strong><span>" + esc(c.time) + "</span></span></div>";
      html += '<p class="comment-text">' + esc(c.text) + "</p></li>";
    });
    html += "</ol></div>";
    $("#feed-contenido").innerHTML = html;

    var feedBox = $("#feed-contenido");
    $("#btn-grande").addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", on ? "true" : "false");
      feedBox.classList.toggle("feed-grande", on);
    });
    $("#btn-comentarios").addEventListener("click", function () { toggleComentarios(); });
    $("#btn-ampliar").addEventListener("click", function () { openFoto(this); });
  }
  function toggleComentarios(force) {
    var b = $("#btn-comentarios"), l = $("#lista-comentarios");
    if (!b) return;
    var open = typeof force === "boolean" ? force : l.hidden;
    l.hidden = !open;
    b.setAttribute("aria-expanded", open ? "true" : "false");
    b.textContent = open ? "Ocultar los comentarios" : "Ver los comentarios (" + D.comments.length + ")";
    if (open && typeof force !== "boolean") { l.setAttribute("tabindex", "-1"); l.focus(); }
  }
  function renderPreguntasCaso() {
    var qs = D.caseQuestions.open, html = "";
    qs.forEach(function (q, i) {
      html += '<div class="pregunta-card"><label for="caso-nota-' + i + '">' + esc(q) + "</label>";
      html += '<textarea class="textarea" id="caso-nota-' + i + '" data-nota="caso' + i + '" rows="3" maxlength="1000" placeholder="Opcional: anotá una idea del equipo. También pueden conversarlo."></textarea>';
      html += '<p class="estado-guardado" data-estado>Opcional. Se guarda solo en este dispositivo.</p></div>';
    });
    $("#preguntas-caso").innerHTML = html;
    $$("#preguntas-caso textarea").forEach(function (ta) {
      var key = ta.getAttribute("data-nota");
      ta.value = state.notes[key] || "";
      var est = ta.parentNode.querySelector("[data-estado]");
      var guardar = debounce(function () { state.notes[key] = ta.value; save(); est.textContent = ta.value ? SAVED_NOTE() : "Opcional. Se guarda solo en este dispositivo."; }, 400);
      ta.addEventListener("input", guardar);
    });
  }
  function initCaso() {
    $("#notif-texto").textContent = D.notification;
    var btn = $("#btn-notif");
    btn.addEventListener("click", function () {
      if (!feedOpen) {
        feedOpen = true;
        $("#feed").hidden = false;
        btn.setAttribute("aria-expanded", "true");
        $("#notif-ayuda").textContent = "Notificación abierta";
        var h = $("#t-feed"); h.focus();
        h.scrollIntoView({ block: "start" });
      } else {
        $("#t-feed").focus();
      }
    });
    renderFeed();
    renderPreguntasCaso();
    // La barra de voz solo aparece si el navegador soporta síntesis de voz.
    if (voz.supported) $("#barra-voz").hidden = false;
    else { $("#barra-voz").hidden = false; $("#voz-play").disabled = true; $("#voz-msg").textContent = "Tu navegador no ofrece narración en voz. Podés leer todo el contenido escrito."; }
  }

  /* ---- foto ampliada ---- */
  var dlgOpener = null;
  function openFoto(opener) {
    var dlg = $("#dlg-foto");
    dlgOpener = opener;
    var img = $("#dlg-foto-img");
    img.src = D.image.src; img.alt = D.image.alt;
    $("#dlg-foto-cap").textContent = D.image.caption + " " + D.image.alt;
    if (typeof dlg.showModal === "function") { dlg.showModal(); $("#dlg-foto-cerrar").focus(); }
    else { window.open(D.image.src, "_blank", "noopener"); }
  }
  function initDialogo() {
    var dlg = $("#dlg-foto");
    $("#dlg-foto-cerrar").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (dlgOpener) dlgOpener.focus(); });
  }

  /* ---- narración (SpeechSynthesis, opcional) ---- */
  var voz = (function () {
    var supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    var queue = [], idx = 0, speaking = false, paused = false, token = 0;
    function msg(t) { var m = $("#voz-msg"); if (m) m.textContent = t; }
    function buttons() {
      var play = $("#voz-play"), pa = $("#voz-pausa"), st = $("#voz-stop");
      if (!play) return;
      play.disabled = !supported || speaking;
      pa.disabled = !speaking; st.disabled = !speaking;
      pa.innerHTML = (paused ? icon("play") + "Continuar" : icon("pause") + "Pausar");
    }
    function pickVoice() {
      var vs = window.speechSynthesis.getVoices() || [];
      var es = vs.filter(function (v) { return /^es(-|_|$)/i.test(v.lang); });
      var ar = es.filter(function (v) { return /^es[-_]AR/i.test(v.lang); });
      return { voice: ar[0] || es[0] || null, any: vs.length > 0, hasEs: es.length > 0 };
    }
    function script() {
      var parts = ["Caso: " + D.caseTitle + ". Simulación educativa ficticia.", D.notification + ".",
        D.post.author + ", a las " + D.post.time + ", publicó una foto grupal. Dice: " + stripEmoji(D.post.text),
        "Comentarios, en orden."];
      D.comments.forEach(function (c) { parts.push(c.author + ", a las " + c.time + ": " + stripEmoji(c.text)); });
      parts.push("Pregunta para conversar: " + D.caseQuestions.central);
      return parts;
    }
    function stripEmoji(t) { return t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim(); }
    function next(myToken) {
      if (myToken !== token) return;
      if (idx >= queue.length) { stop(true); return; }
      var u = new SpeechSynthesisUtterance(queue[idx++]);
      var pv = pickVoice();
      u.lang = pv.voice ? pv.voice.lang : "es-AR";
      if (pv.voice) u.voice = pv.voice;
      u.rate = parseFloat($("#voz-vel").value) || 1;
      u.onend = function () { next(myToken); };
      u.onerror = function () { if (myToken === token) stop(false, "No se pudo reproducir la narración. Podés leer el texto escrito."); };
      window.speechSynthesis.speak(u);
    }
    function play() {
      if (!supported) return;
      var pv = pickVoice();
      if (pv.any && !pv.hasEs) { msg("Este dispositivo no tiene una voz en español, así que no se reproduce la narración. Podés leer todo el texto."); return; }
      toggleComentarios(true);
      window.speechSynthesis.cancel();
      token++; queue = script(); idx = 0; speaking = true; paused = false;
      msg("Reproduciendo la narración. Podés pausarla o detenerla cuando quieras.");
      buttons();
      next(token);
    }
    function pause() {
      if (!speaking) return;
      if (paused) { window.speechSynthesis.resume(); paused = false; msg("Reproduciendo."); }
      else { window.speechSynthesis.pause(); paused = true; msg("En pausa."); }
      buttons();
    }
    function stop(finished, custom) {
      if (!supported) return;
      token++;
      window.speechSynthesis.cancel();
      var was = speaking;
      speaking = false; paused = false;
      if (was || custom) msg(custom || (finished ? "La narración terminó." : "Narración detenida."));
      buttons();
    }
    return { supported: supported, play: play, pause: pause, stop: function (f, c) { if (speaking) stop(f, c); }, buttons: buttons };
  })();
  function initVoz() {
    $("#voz-play").addEventListener("click", function () { voz.play(); });
    $("#voz-pausa").addEventListener("click", function () { voz.pause(); });
    $("#voz-stop").addEventListener("click", function () { voz.stop(false); });
    if (voz.supported) {
      voz.buttons();
      window.addEventListener("pagehide", function () { voz.stop(false); });
    }
  }

  /* ------------------------------------------------------------------ pantalla INVESTIGAMOS */
  function investigationCards() {
    var com = D.comments;
    return [
      {
        id: "publicacion", icon: "case", titulo: "La publicación", teaser: "Quién la subió, cuándo y qué se ve.",
        html:
          '<ul class="hechos">' +
          "<li><strong>Quién:</strong> " + esc(D.post.author) + " (personaje ficticio).</li>" +
          '<li><strong>Cuándo:</strong> <span class="hora">' + esc(D.post.time) + "</span> en el grupo " + esc(D.groupName) + ".</li>" +
          "<li><strong>Qué dice:</strong> «" + esc(D.post.text) + "»</li>" +
          "<li><strong>Qué se ve:</strong> " + esc(D.image.alt) + " (Podés verla en <a href=\"#/caso\">El caso</a>.)</li>" +
          "<li><strong>Qué no aparece:</strong> en la publicación no se ve ninguna consulta previa a las personas de la foto. Eso es lo que muestra el mensaje; no sabemos si se habló por otro medio.</li>" +
          "</ul>" +
          '<p class="small muted">Recordá: que haya sonrisas en la foto no significa que haya permiso para publicarla.</p>'
      },
      {
        id: "conversacion", icon: "users", titulo: "La conversación", teaser: "Qué dijo cada persona.",
        html:
          '<ul class="hechos">' +
          com.map(function (c) {
            var rol = {
              Sofi: c.time === "08:07" ? "pide que borren la foto" : "pide que dejen de compartirla",
              Bruno: "minimiza el pedido con un comentario despectivo",
              Lara: "avisa que la imagen llegó a otro grupo",
              Mica: "propone respetar el pedido de Sofi"
            }[c.author] || "";
            return '<li><span class="hora">' + esc(c.time) + "</span> <strong>" + esc(c.author) + "</strong> (" + esc(rol) + "): «" + esc(c.text) + "»</li>";
          }).join("") +
          "</ul>"
      },
      {
        id: "cronologia", icon: "search", titulo: "La cronología", teaser: "Qué pasó y en qué orden, en 15 minutos.",
        html:
          '<ol class="linea">' +
          '<li><span class="hora">' + esc(D.post.time) + "</span> Nico comparte la foto del grupo.</li>" +
          '<li><span class="hora">08:07</span> Sofi pide que la borren.</li>' +
          '<li><span class="hora">08:10</span> Bruno minimiza el pedido.</li>' +
          '<li><span class="hora">08:13</span> Lara avisa que la foto ya pasó a otro grupo.</li>' +
          '<li><span class="hora">08:17</span> Mica propone respetar el pedido de Sofi.</li>' +
          '<li><span class="hora">08:20</span> Sofi vuelve a pedir que pare.</li>' +
          "</ol>" +
          '<p class="small muted">Pasaron 15 minutos entre la publicación y el último mensaje.</p>'
      },
      {
        id: "saber", icon: "help", titulo: "Lo que necesitamos saber", teaser: "Lo que sabemos y lo que falta averiguar.",
        html:
          '<div class="dos-col">' +
          '<div><h4>Sabemos</h4><ul>' +
          "<li>La foto se publicó en el grupo.</li>" +
          "<li>Sofi pidió dos veces que la retiren y que paren.</li>" +
          "<li>Hubo un comentario que minimizó el pedido.</li>" +
          "<li>La foto llegó a otro grupo.</li>" +
          "<li>Una persona propuso respetar a Sofi.</li></ul></div>" +
          '<div><h4>Falta averiguar</h4><ul>' +
          "<li>¿Se le preguntó a Sofi antes de publicar?</li>" +
          "<li>¿Hasta dónde llegó la foto y quién la reenvió?</li>" +
          "<li>¿Cómo se siente Sofi y qué necesita ahora?</li>" +
          "<li>¿Esto ya pasó antes o es la primera vez?</li>" +
          "<li>¿Qué hicieron las demás personas que la vieron?</li></ul></div>" +
          "</div>"
      }
    ];
  }
  function renderInvestigamos() {
    var cards = investigationCards(), html = "";
    cards.forEach(function (c) {
      html += '<article class="card-inv"><h3><button type="button" class="card-inv-btn" aria-expanded="false" aria-controls="inv-' + c.id + '" id="inv-b-' + c.id + '">' +
        '<span class="card-inv-ico" aria-hidden="true">' + icon(c.icon) + "</span>" +
        '<span class="card-inv-txt"><span class="card-inv-t">' + esc(c.titulo) + '</span><span class="card-inv-d">' + esc(c.teaser) + "</span></span>" +
        '<span class="card-inv-mas" aria-hidden="true">' + icon("chev") + "</span></button></h3>" +
        '<div class="card-inv-body" id="inv-' + c.id + '" role="region" aria-labelledby="inv-b-' + c.id + '" hidden>' + c.html + "</div></article>";
    });
    $("#tarjetas-inv").innerHTML = html;
    $$(".card-inv-btn").forEach(function (b) {
      b.addEventListener("click", function () { setCard(b, b.getAttribute("aria-expanded") !== "true"); });
    });
    $("#inv-abrir-todas").addEventListener("click", function () { $$(".card-inv-btn").forEach(function (b) { setCard(b, true); }); announce("Se abrieron las cuatro tarjetas."); });
    $("#inv-cerrar-todas").addEventListener("click", function () { $$(".card-inv-btn").forEach(function (b) { setCard(b, false); }); announce("Se cerraron las tarjetas."); });

    $("#glosario").innerHTML = D.glossary.map(function (g) {
      return '<details class="glos"><summary>' + esc(g.term) + "</summary><p>" + esc(g.definition) + "</p></details>";
    }).join("");
    $("#preguntas-inv").innerHTML = ["¿Qué sabemos con seguridad y qué necesitamos averiguar?", "¿Qué pidió Sofi?", "¿Qué respuestas obtuvo?", "¿Qué responsabilidad tienen quienes reenvían y quienes observan?"]
      .map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("");
    $("#preguntas-debate").innerHTML = D.debateQuestions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("");
  }
  function setCard(btn, open) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    $("#" + btn.getAttribute("aria-controls")).hidden = !open;
  }

  /* ------------------------------------------------------------------ pantalla DECIDIMOS */
  var LETRAS = ["A", "B", "C"];
  var statusTimers = {};
  function renderDilemas() {
    var html = "";
    D.dilemmas.forEach(function (d, n) {
      var st = state.decisions[d.id];
      html += '<section class="dilema" aria-labelledby="h-' + d.id + '" data-dilema="' + d.id + '">';
      html += '<p class="eyebrow">Decisión ' + (n + 1) + " de " + D.dilemmas.length + "</p>";
      html += '<h2 id="h-' + d.id + '">' + esc(d.title) + "</h2>";
      html += '<div class="situacion"><p>' + esc(d.situation) + "</p></div>";
      html += '<ul class="opciones" aria-label="Opciones de la decisión ' + (n + 1) + '">';
      d.options.forEach(function (o, i) {
        var exp = st.explored.indexOf(o.id) >= 0;
        html += '<li><button type="button" class="opcion' + (exp ? " explorada" : "") + '" data-dilema="' + d.id + '" data-op="' + o.id + '" aria-pressed="false">' +
          '<span class="opcion-letra" aria-hidden="true">' + LETRAS[i] + "</span>" +
          "<span>" + esc(o.label) + "</span>" +
          '<span class="opcion-marca sel">' + icon("check") + "Opción elegida</span>" +
          '<span class="opcion-marca exp">' + icon("check") + "Ya la exploraste</span>" +
          "</button></li>";
      });
      html += "</ul>";
      html += '<div class="consecuencia" id="cons-' + d.id + '" tabindex="-1" hidden></div>';

      html += '<details class="detalle"><summary>Comparar las tres opciones juntas</summary><div class="tabla-wrap"><table class="tabla">' +
        '<caption class="sr-only">Comparación de las opciones de la decisión ' + (n + 1) + "</caption>" +
        '<thead><tr><th scope="col">Opción</th><th scope="col">Una consecuencia posible</th><th scope="col">Para pensar</th></tr></thead><tbody>';
      d.options.forEach(function (o, i) {
        html += '<tr><th scope="row">' + LETRAS[i] + ". " + esc(o.label) + "</th><td>" + esc(o.possibleConsequence) + "</td><td>" + esc(o.reflection) + "</td></tr>";
      });
      html += "</tbody></table></div><p class=\"small muted\">Ninguna opción suma ni resta puntos: sirven para comparar y conversar.</p></details>";

      html += '<div class="fundamento"><label for="nota-' + d.id + '">Registrar nuestra idea (opcional)</label>';
      html += '<p class="small muted">Podés explicar por qué elegirían esa opción. Si preferís, conversenlo en voz alta, en LSA o con un comunicador: no hace falta escribir para seguir.</p>';
      html += '<div class="chips" role="group" aria-label="Frases para empezar a escribir">';
      D.sentenceStarters.forEach(function (f) {
        html += '<button type="button" class="chip" data-frase="' + esc(f) + '" data-para="' + d.id + '">' + esc(f) + "</button>";
      });
      html += "</div>";
      html += '<textarea class="textarea" id="nota-' + d.id + '" rows="4" maxlength="1000" placeholder="No escribas nombres reales ni datos personales."></textarea>';
      html += '<div class="btn-row"><button type="button" class="btn btn-secondary" data-registrar="' + d.id + '">Registrar nuestra idea</button></div>';
      html += '<p class="estado-guardado" id="estado-' + d.id + '" role="status"></p></div>';
      html += "</section>";
    });
    $("#dilemas").innerHTML = html;

    D.dilemmas.forEach(function (d) {
      var st = state.decisions[d.id];
      $("#nota-" + d.id).value = st.note || "";
    });
  }

  function showConsequence(d, o, idx) {
    var st = state.decisions[d.id];
    st.chosen = o.id;
    if (st.explored.indexOf(o.id) < 0) st.explored.push(o.id);
    save();
    var sec = $('[data-dilema="' + d.id + '"].dilema');
    $$(".opcion", sec).forEach(function (b) {
      var on = b.getAttribute("data-op") === o.id;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (st.explored.indexOf(b.getAttribute("data-op")) >= 0) b.classList.add("explorada");
    });
    var c = $("#cons-" + d.id);
    var pendientes = d.options.filter(function (x) { return st.explored.indexOf(x.id) < 0; }).length;
    c.innerHTML =
      '<h3>Una consecuencia posible</h3>' +
      '<p class="elegiste">Elegiste: ' + LETRAS[idx] + ". " + esc(o.label) + "</p>" +
      "<p>" + esc(o.possibleConsequence) + "</p>" +
      '<div class="para-pensar"><p><strong>Para pensar:</strong> ' + esc(o.reflection) + "</p></div>" +
      '<p class="small muted">' + (pendientes > 0 ? "Todavía pueden explorar " + pendientes + (pendientes === 1 ? " opción más." : " opciones más.") : "Ya exploraron las tres opciones. Pueden volver a cualquiera.") + "</p>" +
      '<div class="btn-row"><button type="button" class="btn btn-primary" data-otra="' + d.id + '">' + icon("refresh") + "Explorar otra decisión</button></div>";
    c.hidden = false;
    c.focus();
  }

  function initDilemas() {
    renderDilemas();
    var cont = $("#dilemas");
    cont.addEventListener("click", function (e) {
      var op = e.target.closest(".opcion");
      if (op) {
        var d = D.dilemmas.filter(function (x) { return x.id === op.getAttribute("data-dilema"); })[0];
        var i = 0; d.options.forEach(function (x, k) { if (x.id === op.getAttribute("data-op")) i = k; });
        showConsequence(d, d.options[i], i);
        return;
      }
      var otra = e.target.closest("[data-otra]");
      if (otra) {
        var id = otra.getAttribute("data-otra");
        var dd = D.dilemmas.filter(function (x) { return x.id === id; })[0];
        var st = state.decisions[id];
        st.chosen = null; save();
        var sec = $('[data-dilema="' + id + '"].dilema');
        $$(".opcion", sec).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        $("#cons-" + id).hidden = true;
        var primeraSinExplorar = $$(".opcion", sec).filter(function (b) { return st.explored.indexOf(b.getAttribute("data-op")) < 0; })[0];
        (primeraSinExplorar || $(".opcion", sec)).focus();
        announce("Podés elegir otra opción.");
        return;
      }
      var chip = e.target.closest(".chip");
      if (chip) {
        var ta = $("#nota-" + chip.getAttribute("data-para"));
        var frase = chip.getAttribute("data-frase");
        ta.value = (ta.value ? ta.value.replace(/\s*$/, "") + "\n" : "") + frase + " ";
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
        return;
      }
      var reg = e.target.closest("[data-registrar]");
      if (reg) {
        var rid = reg.getAttribute("data-registrar");
        state.decisions[rid].note = $("#nota-" + rid).value;
        save();
        var est = $("#estado-" + rid);
        est.textContent = state.decisions[rid].note ? "Idea registrada. " + SAVED_NOTE() : "No hay nada escrito. Podés seguir sin escribir.";
      }
    });
    // Guardado automático suave mientras se escribe (sin anuncios). Delegado: sobrevive a re-renderizados.
    var guardarNotaDilema = debounce(function (ta) {
      var id = ta.id.replace(/^nota-/, "");
      if (state.decisions[id]) { state.decisions[id].note = ta.value; save(); }
    }, 500);
    cont.addEventListener("input", function (e) {
      if (e.target && e.target.tagName === "TEXTAREA" && /^nota-/.test(e.target.id)) guardarNotaDilema(e.target);
    });
  }

  /* ------------------------------------------------------------------ pantalla CONSTRUIMOS */
  var undoInfo = null;
  function agreementsText() {
    return state.agreements.map(function (a, i) { return (i + 1) + ". " + a.text; }).join("\n");
  }
  function renderRepaso() {
    var box = $("#repaso-contenido");
    if (!box) return;
    var html = "";
    D.dilemmas.forEach(function (d) {
      var st = state.decisions[d.id];
      html += "<h3>" + esc(d.title) + "</h3>";
      if (!st.explored.length) { html += '<p class="muted">Todavía no exploraron opciones. <a href="#/decidimos">Ir a Decidimos</a>.</p>'; }
      else {
        html += "<ul>";
        st.explored.forEach(function (id) {
          d.options.forEach(function (o, i) { if (o.id === id) html += "<li><strong>" + LETRAS[i] + ". " + esc(o.label) + ":</strong> " + esc(o.possibleConsequence) + "</li>"; });
        });
        html += "</ul>";
      }
      if (st.note) html += '<p><strong>Nuestra idea registrada:</strong></p><p class="nota-repaso"></p>';
    });
    box.innerHTML = html;
    var i = 0;
    D.dilemmas.forEach(function (d) {
      var st = state.decisions[d.id];
      if (st.note) { var ps = $$(".nota-repaso", box); ps[i++].textContent = st.note; }
    });
  }

  function renderIdeas() {
    var ul = $("#lista-ideas"), full = state.agreements.length >= D.maxAgreements;
    ul.innerHTML = D.suggestedAgreements.map(function (t, i) {
      var usado = state.agreements.some(function (a) { return a.src === i; });
      var off = usado || full;
      return '<li><span class="idea-txt">' + esc(t) + '</span><button type="button" class="btn btn-secondary" data-idea="' + i + '" aria-disabled="' + (off ? "true" : "false") + '">' +
        (usado ? icon("check") + "Ya está agregada" : icon("plus") + "Agregar") +
        '<span class="sr-only">: ' + esc(t) + "</span></button></li>";
    }).join("");
  }
  function renderAcuerdos(focusSel) {
    var ol = $("#lista-acuerdos"), n = state.agreements.length, max = D.maxAgreements;
    $("#vacio-acuerdos").hidden = n > 0;
    ol.innerHTML = state.agreements.map(function (a, i) {
      return '<li class="acuerdo" data-id="' + a.id + '">' +
        '<label for="ac-' + a.id + '">Acuerdo ' + (i + 1) + "</label>" +
        '<textarea class="textarea" id="ac-' + a.id + '" rows="2" maxlength="200"></textarea>' +
        '<div class="acuerdo-acc">' +
        '<button type="button" class="btn btn-secondary" data-acc="subir" aria-disabled="' + (i === 0) + '" aria-label="Subir acuerdo ' + (i + 1) + '">' + icon("up") + "Subir</button>" +
        '<button type="button" class="btn btn-secondary" data-acc="bajar" aria-disabled="' + (i === n - 1) + '" aria-label="Bajar acuerdo ' + (i + 1) + '">' + icon("down") + "Bajar</button>" +
        '<button type="button" class="btn btn-secondary" data-acc="borrar" aria-label="Eliminar acuerdo ' + (i + 1) + '">' + icon("trash") + "Eliminar</button>" +
        "</div></li>";
    }).join("");
    state.agreements.forEach(function (a) { $("#ac-" + a.id).value = a.text; });
    $("#contador-acuerdos").textContent = n + " de " + max + " acuerdos" + (n >= max ? ". Llegaron a 10. Para sumar otro, editen o eliminen uno." : n > 0 ? ". Faltan " + (max - n) + "." : ".");
    var add = $("#btn-agregar");
    add.setAttribute("aria-disabled", n >= max ? "true" : "false");
    renderIdeas();
    var du = $("#aviso-deshacer");
    if (undoInfo) {
      du.hidden = false;
      du.innerHTML = 'Se eliminó un acuerdo. <button type="button" class="btn btn-secondary" id="btn-deshacer">Deshacer</button>';
    } else { du.hidden = true; du.innerHTML = ""; }
    if (focusSel) { var el = $(focusSel); if (el) el.focus(); }
  }
  function persistAgreements() { save(); }

  function addAgreement(text, src) {
    if (state.agreements.length >= D.maxAgreements) {
      $("#agregar-msg").textContent = "Ya tienen 10 acuerdos. Para sumar otro, editen o eliminen uno.";
      announce("Ya tienen 10 acuerdos.");
      return false;
    }
    state.agreements.push({ id: uid(), text: text, src: typeof src === "number" ? src : null });
    undoInfo = null;
    persistAgreements();
    return true;
  }

  function initConstruimos() {
    $("#pregunta-final").textContent = D.finalReflection;
    var fin = $("#final-texto"); fin.value = state.finalReflection || "";
    fin.addEventListener("input", debounce(function () {
      state.finalReflection = fin.value; save();
      $("#final-estado").textContent = fin.value ? SAVED_NOTE() : "Opcional. Se guarda solo en este dispositivo.";
    }, 500));

    renderAcuerdos();

    $("#lista-ideas").addEventListener("click", function (e) {
      var b = e.target.closest("[data-idea]");
      if (!b) return;
      if (b.getAttribute("aria-disabled") === "true") {
        announce(state.agreements.length >= D.maxAgreements ? "Ya tienen 10 acuerdos." : "Esa idea ya está en el decálogo.");
        return;
      }
      var i = parseInt(b.getAttribute("data-idea"), 10);
      if (addAgreement(D.suggestedAgreements[i], i)) {
        renderAcuerdos('[data-idea="' + i + '"]');
        announce("Agregaste el acuerdo " + state.agreements.length + ". Hay " + state.agreements.length + " de " + D.maxAgreements + ".");
      }
    });

    $("#btn-cargar-ideas").addEventListener("click", function () {
      var agregadas = 0;
      D.suggestedAgreements.forEach(function (t, i) {
        if (state.agreements.length < D.maxAgreements && !state.agreements.some(function (a) { return a.src === i; })) {
          state.agreements.push({ id: uid(), text: t, src: i }); agregadas++;
        }
      });
      undoInfo = null; persistAgreements();
      renderAcuerdos("#lista-acuerdos .acuerdo textarea");
      announce(agregadas ? "Se cargaron las ideas para revisar. Ahora pueden editarlas, moverlas o eliminarlas." : "No había lugar para agregar más ideas.");
    });

    $("#form-agregar").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("#nuevo-acuerdo"), t = inp.value.trim();
      var msg = $("#agregar-msg");
      if (!t) { msg.textContent = "Escribí el acuerdo antes de agregarlo."; inp.focus(); return; }
      if (addAgreement(t, null)) {
        inp.value = ""; msg.textContent = "Acuerdo agregado.";
        renderAcuerdos("#nuevo-acuerdo");
      }
    });
    $("#nuevo-acuerdo").addEventListener("input", function () { $("#agregar-msg").textContent = ""; });
    // El botón "Agregar acuerdo" usa aria-disabled: si está lleno, el submit lo frena en addAgreement.

    var lista = $("#lista-acuerdos");
    lista.addEventListener("input", function (e) {
      var ta = e.target.closest("textarea"); if (!ta) return;
      var li = ta.closest(".acuerdo"), a = state.agreements.filter(function (x) { return x.id === li.getAttribute("data-id"); })[0];
      if (a) { a.text = ta.value; persistAgreements(); }
    });
    lista.addEventListener("click", function (e) {
      var b = e.target.closest("[data-acc]"); if (!b) return;
      if (b.getAttribute("aria-disabled") === "true") return;
      var li = b.closest(".acuerdo"), id = li.getAttribute("data-id");
      var i = state.agreements.map(function (a) { return a.id; }).indexOf(id);
      var acc = b.getAttribute("data-acc");
      if (acc === "subir" && i > 0) {
        var t = state.agreements.splice(i, 1)[0]; state.agreements.splice(i - 1, 0, t);
        undoInfo = null; persistAgreements();
        renderAcuerdos('[data-id="' + id + '"] [data-acc="subir"]');
        // si quedó arriba, el botón queda deshabilitado pero conserva el foco
        announce("Acuerdo movido a la posición " + i + " de " + state.agreements.length + ".");
      } else if (acc === "bajar" && i < state.agreements.length - 1) {
        var t2 = state.agreements.splice(i, 1)[0]; state.agreements.splice(i + 1, 0, t2);
        undoInfo = null; persistAgreements();
        renderAcuerdos('[data-id="' + id + '"] [data-acc="bajar"]');
        announce("Acuerdo movido a la posición " + (i + 2) + " de " + state.agreements.length + ".");
      } else if (acc === "borrar") {
        var removed = state.agreements.splice(i, 1)[0];
        undoInfo = { item: removed, index: i };
        persistAgreements();
        var siguiente = state.agreements[i] || state.agreements[i - 1];
        renderAcuerdos(siguiente ? '[data-id="' + siguiente.id + '"] textarea' : "#nuevo-acuerdo");
        announce("Acuerdo eliminado. Quedan " + state.agreements.length + ". Podés deshacerlo.");
      }
    });
    $("#aviso-deshacer").addEventListener("click", function (e) {
      if (!e.target.closest("#btn-deshacer") || !undoInfo) return;
      if (state.agreements.length >= D.maxAgreements) { announce("No hay lugar para recuperarlo: ya hay 10 acuerdos."); return; }
      state.agreements.splice(undoInfo.index, 0, undoInfo.item);
      var id = undoInfo.item.id; undoInfo = null;
      persistAgreements();
      renderAcuerdos('[data-id="' + id + '"] textarea');
      announce("Acuerdo recuperado.");
    });

    $("#btn-imprimir").addEventListener("click", function () { printDecalogo(); });
    $("#btn-txt").addEventListener("click", function () { downloadTxt(); });
    window.addEventListener("beforeprint", fillPrintSheet);
  }

  function fillPrintSheet() {
    var ol = $("#p-lista"); ol.innerHTML = "";
    state.agreements.forEach(function (a) { var li = document.createElement("li"); li.textContent = a.text; ol.appendChild(li); });
    var n = state.agreements.length, b = $("#p-borrador");
    b.textContent = n === 0 ? "Borrador vacío: todavía no se escribió ningún acuerdo."
      : n < D.maxAgreements ? "Borrador: hay " + n + " de " + D.maxAgreements + " acuerdos. Falta completar el decálogo."
      : "";
  }
  function printDecalogo() {
    fillPrintSheet();
    window.print();
  }
  function downloadTxt() {
    var n = state.agreements.length;
    var txt = "NUESTRO DECÁLOGO DE CONVIVENCIA DIGITAL\r\nConectados con respeto · Una foto, cientos de miradas\r\nFormación Ética y Ciudadana, 3.º año\r\n\r\n" +
      (n < D.maxAgreements ? "(Borrador: " + n + " de " + D.maxAgreements + " acuerdos)\r\n\r\n" : "") +
      agreementsText().replace(/\n/g, "\r\n") +
      "\r\n\r\nSimulación educativa ficticia.\r\n";
    var blob = new Blob(["﻿" + txt], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "decalogo-convivencia-digital.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("Se descargó el decálogo como archivo de texto.");
  }

  /* ------------------------------------------------------------------ borrar datos (con confirmación) */
  function initBorrar() {
    $$("[data-borrar]").forEach(function (box, n) {
      var pid = "borrar-" + n;
      box.innerHTML =
        '<p>Se guardan solo en este dispositivo: tus decisiones, ideas, acuerdos, reflexión y ajustes de accesibilidad. <strong>No es una cuenta ni se comparte con nadie.</strong></p>' +
        '<p class="small" id="' + pid + '-alm"></p>' +
        '<button type="button" class="btn btn-secondary" data-b="pedir">' + icon("trash") + "Borrar mis datos guardados</button>" +
        '<div class="borrar-confirm" id="' + pid + '-conf" role="group" aria-labelledby="' + pid + '-t" hidden>' +
        '<p id="' + pid + '-t"><strong>¿Borrar todo lo guardado en este dispositivo?</strong> Se eliminan decisiones, ideas, acuerdos y ajustes. No se puede deshacer.</p>' +
        '<div class="btn-row"><button type="button" class="btn btn-primary" data-b="si">Sí, borrar todo</button>' +
        '<button type="button" class="btn btn-secondary" data-b="no">Cancelar</button></div></div>' +
        '<p class="borrar-estado" id="' + pid + '-est" role="status"></p>';
      var conf = $("#" + pid + "-conf"), pedir = $('[data-b="pedir"]', box);
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-b]"); if (!b) return;
        var w = b.getAttribute("data-b");
        if (w === "pedir") { conf.hidden = false; $('[data-b="no"]', box).focus(); }
        if (w === "no") { conf.hidden = true; pedir.focus(); }
        if (w === "si") {
          clearAll(); undoInfo = null; scanPaused = false;
          conf.hidden = true;
          applySettings(); updateScan(); renderAll();
          $("#" + pid + "-est").textContent = "Listo: se borraron los datos guardados en este dispositivo.";
          announce("Se borraron los datos guardados en este dispositivo.");
          pedir.focus();
        }
      });
    });
    refreshStorageNotes();
  }
  function refreshStorageNotes() {
    $$("[id$='-alm']").forEach(function (p) {
      p.textContent = storageOk ? "" : "Aviso: tu navegador no permite guardar datos acá (por ejemplo, en modo privado). Lo que escribas se perderá al cerrar la página.";
    });
  }

  /* ------------------------------------------------------------------ arranque */
  function renderAll() {
    renderPreguntasCaso();
    renderDilemas();
    $("#final-texto").value = state.finalReflection || "";
    renderAcuerdos();
    renderRepaso();
    $$(".borrar-estado").forEach(function () { /* se conserva el mensaje recién mostrado */ });
  }

  function init() {
    document.body.classList.add("js-ready");
    applySettings();
    initSettings();
    initScan();
    initDialogo();
    initVoz();
    renderLsa();
    renderInvestigamos();
    initCaso();
    initDilemas();
    initConstruimos();
    initBorrar();
    initNav();
    if (state.settings.scan) updateScan();
    if (!storageOk) refreshStorageNotes();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
