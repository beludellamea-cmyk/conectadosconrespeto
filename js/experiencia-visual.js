/* Mejoras visuales y de lectura, añadidas sin reemplazar los apoyos originales */
(function () {
  "use strict";
  var q = function (selector, parent) { return (parent || document).querySelector(selector); };
  var qa = function (selector, parent) { return Array.prototype.slice.call((parent || document).querySelectorAll(selector)); };
  var supportsVoice = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);
  var lastText = "";
  var currentUtterance = null;
  var paused = false;
  var bypassOption = false;
  var pending = {};
  function sayStatus(text) {
    qa(".lectura-estado").forEach(function (el) { el.textContent = text; });
  }
  function speak(text) {
    text = String(text || "").replace(/\s+/g, " ").trim().slice(0, 4200);
    if (!text) return;
    lastText = text;
    if (!supportsVoice) {
      sayStatus("Este navegador no dispone de lectura en voz alta. El contenido permanece disponible para leer.");
      return;
    }
    window.speechSynthesis.cancel();
    paused = false;
    var u = new SpeechSynthesisUtterance(text);
    currentUtterance = u;
    u.lang = "es-AR";
    u.rate = .9;
    var voices = window.speechSynthesis.getVoices() || [];
    u.voice = voices.find(function (v) { return /^es[-_]AR/i.test(v.lang); }) ||
              voices.find(function (v) { return /^es([-_]|$)/i.test(v.lang); }) || null;
    if (u.voice) u.lang = u.voice.lang;
    u.onend = function () { if (currentUtterance === u) sayStatus("Lectura finalizada."); };
    u.onerror = function () { if (currentUtterance === u) sayStatus("No se pudo reproducir. Podés leer todo el contenido escrito."); };
    sayStatus("Leyendo en voz alta. Podés pausar, repetir o detener.");
    window.speechSynthesis.speak(u);
  }
  function stop() {
    if (supportsVoice) window.speechSynthesis.cancel();
    currentUtterance = null;
    paused = false;
    sayStatus("Lectura detenida.");
  }
  function pause() {
    if (!supportsVoice) return;
    if (paused) { window.speechSynthesis.resume(); paused = false; sayStatus("Lectura reanudada."); }
    else if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); paused = true; sayStatus("Lectura en pausa."); }
  }
  function toolbar(target, label) {
    if (q(".lectura-extra", target)) return;
    var el = document.createElement("div");
    el.className = "lectura-extra";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", "Opciones de lectura de esta sección");
    el.innerHTML =
      '<button type="button" class="btn btn-secondary" data-voz="seccion">🔊 Escuchar ' + label + '</button>' +
      '<button type="button" class="btn btn-secondary" data-voz="pausar">⏸ Pausar / continuar</button>' +
      '<button type="button" class="btn btn-secondary" data-voz="repetir">🔁 Repetir</button>' +
      '<button type="button" class="btn btn-secondary" data-voz="detener">⏹ Detener</button>' +
      '<p class="lectura-estado" role="status">La lectura es opcional. Todo permanece escrito.</p>';
    el.dataset.lectura = label;
    if (!supportsVoice) {
      q('[data-voz="seccion"]',el).disabled = true;
      q('[data-voz="pausar"]',el).disabled = true;
      q('[data-voz="repetir"]',el).disabled = true;
      q('[data-voz="detener"]',el).disabled = true;
    }
    var lead = q(".lead",target);
    if (lead) lead.insertAdjacentElement("afterend",el);
  }
  function hero() {
    var art = q(".hero-art");
    if (!art || q(".historia-preview", art)) return;
    art.removeAttribute("aria-hidden");
    art.innerHTML =
      '<div class="historia-preview">' +
      '<figure><img src="assets/img/foto_grupo_ficticio.webp" width="600" height="450" alt="">' +
      '<figcaption>📸 Una foto de grupo. ¿Publicarla significa que todas las personas dieron permiso?</figcaption></figure>' +
      '<div class="historia-avisos" aria-label="Mensajes que dan inicio al caso">' +
      '<p><span aria-hidden="true">💬</span> «¿La podés borrar, por favor?»</p>' +
      '<p><span aria-hidden="true">🔄</span> La imagen llegó a otro grupo</p></div></div>';
  }
  function feed() {
    var root = q("#feed-contenido");
    if (!root || q(".info-reacciones", root)) return;
    var post = q(".post", root);
    if (!post) return;
    var caption = q(".post-text", post);
    if (caption) {
      var context = document.createElement("p");
      context.className = "post-contexto";
      context.textContent = "📱 Publicación del grupo 3.º B · Situación ficticia";
      caption.insertAdjacentElement("beforebegin", context);
      context.style.padding = "0 1rem";
    }
    var figure = q(".post-figure", post);
    if (figure) {
      var reactions = document.createElement("div");
      reactions.className = "info-reacciones";
      reactions.setAttribute("role", "note");
      reactions.setAttribute("aria-label", "Elementos de una publicación simulada");
      reactions.innerHTML = '<span>💜 Reacciones</span><span>💬 5 comentarios</span><span>↪ Imagen reenviada</span>';
      figure.insertAdjacentElement("afterend", reactions);
    }
    var list = q("#lista-comentarios", root);
    var btn = q("#btn-comentarios", root);
    var wrap = q(".comentarios-wrap",root);
    if (wrap && !q(".comentarios-titulo",wrap)) {
      var heading = document.createElement("h3");
      heading.className = "comentarios-titulo";
      heading.textContent = "💬 Lo que dice el grupo";
      wrap.insertBefore(heading,wrap.firstChild);
    }
    if (list && btn) {
      list.hidden = false;
      btn.setAttribute("aria-expanded","true");
      btn.textContent = "Ocultar los comentarios";
    }
    var emotions = {
      Sofi: ["😟","Pide que respeten su decisión y retiren la foto"],
      Bruno: ["🙄","Minimiza el pedido de Sofi"],
      Lara: ["📲","Informa que la imagen llegó a otro grupo"],
      Mica: ["🤝","Propone acompañar y respetar el pedido"]
    };
    qa(".comment",root).forEach(function (card) {
      var who = q(".who strong",card);
      var name = who ? who.textContent.trim() : "";
      var pair = emotions[name] || ["💬","Mensaje del grupo"];
      card.dataset.personaje = name.toLowerCase();
      var head = q(".comment-head",card);
      if(head && !q(".comment-emocion",head)) {
        var emoji = document.createElement("span");
        emoji.className = "comment-emocion";
        emoji.setAttribute("aria-hidden","true");
        emoji.textContent = pair[0];
        head.appendChild(emoji);
      }
      var role = document.createElement("p");
      role.className = "comment-rol";
      role.textContent = pair[1];
      q(".comment-text",card).insertAdjacentElement("beforebegin", role);
      var read = document.createElement("button");
      read.type = "button";read.className = "btn btn-secondary escuchar-mensaje";
      read.dataset.voz = "mensaje";
      read.textContent = "🔊 Escuchar mensaje de " + name;
      card.appendChild(read);
      if (!supportsVoice) read.disabled=true;
    });
    var summary = document.createElement("section");
    summary.className = "caso-resumen";
    summary.setAttribute("aria-label","Pistas visuales del caso");
    summary.innerHTML = '<h3>🔎 ¿Qué observamos hasta ahora?</h3><ul>' +
      '<li><span aria-hidden="true">📸</span> La foto se publicó</li>' +
      '<li><span aria-hidden="true">🗣️</span> Sofi pidió retirarla</li>' +
      '<li><span aria-hidden="true">🔄</span> La imagen circuló a otro grupo</li>' +
      '<li><span aria-hidden="true">🤝</span> Una compañera ofreció apoyo</li></ul>';
    root.insertAdjacentElement("beforebegin",summary);
  }
  function investigate() {
    var icons = {publicacion:"📸",conversacion:"💬",cronologia:"⏳",saber:"🔎"};
    qa(".card-inv-btn").forEach(function (button) {
      var id = (button.id || "").replace(/^inv-b-/, "");
      var title = q(".card-inv-t",button);
      if (title && !q(".card-inv-emoji",title)) {
        var e=document.createElement("span");e.className="card-inv-emoji";e.setAttribute("aria-hidden","true");e.textContent=icons[id]||"🔍";
        title.insertBefore(e,title.firstChild);
      }
    });
    var glosIcons = {"Consentimiento":"✅","Privacidad":"🔒","Respeto":"🤝","Difusión sin consentimiento":"📲","Ciberacoso":"🛡️"};
    qa("#glosario details").forEach(function (detail) {
      var title=q("summary",detail); if (!title || q(".glos-emoji",title)) return;
      var e=document.createElement("span");e.className="glos-emoji";e.setAttribute("aria-hidden","true");
      e.textContent=glosIcons[title.textContent.trim()]||"💡";
      title.insertBefore(e,title.firstChild);
      var btn=document.createElement("button");btn.type="button";btn.className="btn btn-secondary glos-escuchar";
      btn.dataset.voz="concepto";btn.textContent="🔊 Escuchar este concepto";if(!supportsVoice)btn.disabled=true;detail.appendChild(btn);
    });
  }
  var emoticons = { reenviar:"📤",no_intervenir:"👀",acompanar:"🤝",insultar:"💢",buscar_ayuda:"🧑‍🏫",ignorar:"🙈" };
  function enhanceDecisions() {
    qa("#dilemas .dilema").forEach(function (section) {
      if(q(".confirmacion",section))return;
      var id=section.dataset.dilema;
      var opts=q(".opciones",section);
      if(!opts)return;
      qa(".opcion",opts).forEach(function (button) {
        var e=document.createElement("span");e.className="opcion-emoji";e.setAttribute("aria-hidden","true");
        e.textContent=emoticons[button.dataset.op]||"💭";
        var letter=q(".opcion-letra",button);
        if(letter)letter.insertAdjacentElement("afterend",e);
        var label=document.createElement("span");label.className="opcion-texto";
        var child=letter && letter.nextElementSibling && letter.nextElementSibling.nextElementSibling;
        // El texto existente es un nodo de texto; no se reemplaza ni se oculta.
        var read=document.createElement("button");read.type="button";read.className="btn btn-secondary opcion-escuchar";
        read.dataset.voz="opcion";read.textContent="🔊 Escuchar esta opción";if(!supportsVoice)read.disabled=true;
        button.insertAdjacentElement("afterend",read);
      });
      var panel=document.createElement("div");panel.className="confirmacion";panel.hidden=true;
      panel.setAttribute("role","group");panel.setAttribute("aria-label","Confirmar una opción antes de conocer su consecuencia");
      panel.innerHTML='<p class="confirmacion-texto" role="status">Elegiste una alternativa. ¿Querés confirmar?</p>' +
        '<div class="btn-row"><button type="button" class="btn btn-primary" data-confirmar="' + id + '">✓ Confirmar mi decisión</button>' +
        '<button type="button" class="btn btn-secondary" data-cambiar="' + id + '">Cambiar opción</button></div>';
      opts.insertAdjacentElement("afterend",panel);
    });
  }
  function decorateAgreements() {
    var icons=["✅","🛑","🤝","💬","🫂","🙋","🔒","💭","🗣️","🌐"];
    qa("#lista-ideas li").forEach(function (li,i) {
      if(q(".idea-emoticon",li))return;
      var e=document.createElement("span");e.className="idea-emoticon";e.setAttribute("aria-hidden","true");e.textContent=icons[i%icons.length];
      li.insertBefore(e,li.firstChild);
    });
  }
  function initReadingButtons() {
    ["investigamos","decidimos","construimos"].forEach(function (route) {
      var section=q('[data-ruta-vista="'+route+'"]');
      if(section)toolbar(section, route);
    });
  }
  function bindEvents() {
    var decisions=q("#dilemas");
    decisions.addEventListener("click",function(e){
      var item=e.target.closest(".opcion");
      if(item && !bypassOption) {
        e.preventDefault();e.stopImmediatePropagation();
        var sec=item.closest(".dilema");var id=sec.dataset.dilema;pending[id]=item;
        qa(".opcion",sec).forEach(function(b){
          var on=b===item;b.dataset.pendiente=on?"true":"false";
          b.setAttribute("aria-pressed",on?"true":"false");
        });
        var panel=q(".confirmacion",sec);panel.hidden=false;
        q(".confirmacion-texto",panel).textContent="Seleccionaste: "+item.innerText.replace(/Opción elegida|Ya la exploraste/g,"").trim()+". Confirmá para conocer una posible consecuencia.";
        var cons=q(".consecuencia",sec);if(cons)cons.hidden=true;
        q("[data-confirmar]",panel).focus();
        return;
      }
      var yes=e.target.closest("[data-confirmar]");
      if(yes) {
        e.preventDefault();e.stopImmediatePropagation();
        var idYes=yes.dataset.confirmar;var chosen=pending[idYes];
        if(!chosen)return;
        q(".confirmacion",chosen.closest(".dilema")).hidden=true;
        delete pending[idYes];
        qa(".opcion",chosen.closest(".dilema")).forEach(function(b){ delete b.dataset.pendiente; });
        bypassOption=true;try { chosen.click(); } finally { bypassOption=false; }
        return;
      }
      var change=e.target.closest("[data-cambiar]");
      if(change) {
        e.preventDefault();e.stopImmediatePropagation();
        var sec2=change.closest(".dilema");delete pending[sec2.dataset.dilema];
        q(".confirmacion",sec2).hidden=true;
        qa(".opcion",sec2).forEach(function(b){ delete b.dataset.pendiente;b.setAttribute("aria-pressed","false"); });
        q(".opcion",sec2).focus();
        return;
      }
      var retry=e.target.closest("[data-otra]");
      if(retry) {
        delete pending[retry.dataset.otra];
        var previous=q(".confirmacion",retry.closest(".dilema"));if(previous)previous.hidden=true;
      }
    },true);
    document.addEventListener("click",function(e){
      var b=e.target.closest("[data-voz]");if(!b)return;
      var action=b.dataset.voz;var text="";
      if(action==="pausar"){pause();return;}
      if(action==="repetir"){speak(lastText);return;}
      if(action==="detener"){stop();return;}
      if(action==="mensaje") {
        var c=b.closest(".comment");var name=q(".who strong",c);
        text=(name?name.textContent+": ":"")+q(".comment-text",c).textContent;
      } else if (action==="opcion") {
        var option=q(".opcion",b.closest("li"));
        text=option ? option.textContent.replace(/Opción elegida|Ya la exploraste/g,"").trim() : "";
      } else if(action==="concepto") {
        var d=b.closest(".glos");text=q("summary",d).textContent+". "+q("p",d).textContent;
      } else if(action==="seccion") {
        var s=b.closest(".view");
        if(s) {
          var h=q("h1",s),lead=q(".lead",s);
          text=(h?h.textContent+". ":"")+(lead?lead.textContent+". ":"");
          if(s.dataset.rutaVista==="decidimos") {
            qa(".dilema",s).forEach(function(d){
              text+=(q("h2",d)?q("h2",d).textContent+". ":"")+
                    (q(".situacion",d)?q(".situacion",d).textContent+". ":"");
              qa(".opcion",d).forEach(function(opt){text+=opt.textContent.replace(/Opción elegida|Ya la exploraste/g,"")+". ";});
            });
          } else if(s.dataset.rutaVista==="investigamos") {
            qa(".card-inv-t",s).forEach(function(t){text+=t.textContent+". ";});
            qa(".glos",s).forEach(function(d){text+=q("summary",d).textContent+". "+q("p",d).textContent+". ";});
          } else {
            text+="Cada equipo puede elegir, modificar y proponer acuerdos para construir el decálogo de convivencia digital.";
          }
        }
      }
      if(text)speak(text);
    });
    window.addEventListener("pagehide",stop);
  }
  function boot() {
    hero();feed();investigate();enhanceDecisions();decorateAgreements();initReadingButtons();bindEvents();
    var watch=q("#dilemas");
    if(watch) new MutationObserver(function(){
      pending={};requestAnimationFrame(enhanceDecisions);
    }).observe(watch,{childList:true});
    var ideas=q("#lista-ideas");
    if(ideas)new MutationObserver(function(){requestAnimationFrame(decorateAgreements);}).observe(ideas,{childList:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();