/* CONECTADOS CON RESPETO — interfaz de descubrimiento progresivo.
   Conserva el motor didáctico, la accesibilidad y los datos de la versión original.
   Sin tiempos límite ni bloqueo de etapas: la docente puede saltar mediante "Etapas".
 */
(function(){
  "use strict";
  var $=function(s,ctx){return (ctx||document).querySelector(s);};
  var $$=function(s,ctx){return Array.prototype.slice.call((ctx||document).querySelectorAll(s));};
  var routeNames={inicio:"Comenzamos",caso:"El caso",investigamos:"Investigamos",decidimos:"Decidimos",construimos:"Construimos",ayuda:"Ayuda y privacidad"};
  var routeOrder=["inicio","caso","investigamos","decidimos","construimos"];
  var caseStep=0, invStep=0, decStep=0, ideaStep=0, internalDecision=false, pending={};
  var supportsVoice=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
  var lastSpeech="", utterance=null, speechPaused=false;
  var ui={}, markedRender=false;
  function hide(el,yes){if(el)el.hidden=!!yes;}
  function word(el){return el?(el.innerText||el.textContent||"").trim():"";}
  function button(label,style,click){
    var el=document.createElement("button");el.type="button";el.className="btn "+(style||"btn-secondary");el.textContent=label;
    if(click)el.addEventListener("click",click);return el;
  }
  function focus(el){if(el){el.focus({preventScroll:true});el.scrollIntoView({block:"start",behavior:"instant"});}}
  function currentRoute(){
    var name=(window.location.hash||"#/inicio").replace(/^#\//,"").split(/[/?]/)[0];
    return routeNames[name]?name:"inicio";
  }
  function visible(el){return el&&!el.hidden&&!!el.getClientRects().length;}
  function speechStatus(message){if(ui.speechState)ui.speechState.textContent=message;}
  function stopSpeech(){
    if(supportsVoice){window.speechSynthesis.cancel();utterance=null;speechPaused=false;}
  }
  function speak(text){
    text=String(text||"").replace(/\s+/g," ").trim().slice(0,4000);if(!text)return;
    lastSpeech=text;
    if(!supportsVoice){speechStatus("Este dispositivo no ofrece lectura en voz alta. El texto sigue disponible.");return;}
    stopSpeech();
    var v=new SpeechSynthesisUtterance(text);utterance=v;v.lang="es-AR";v.rate=.93;
    var vs=window.speechSynthesis.getVoices()||[];
    v.voice=vs.find(function(x){return /^es[-_]AR/i.test(x.lang);})||vs.find(function(x){return /^es(?:[-_]|$)/i.test(x.lang);})||null;
    if(v.voice)v.lang=v.voice.lang;
    v.onend=function(){if(utterance===v)speechStatus("Lectura terminada.");};
    v.onerror=function(){if(utterance===v)speechStatus("No se pudo reproducir. Podés leer toda la información en pantalla.");};
    speechStatus("Leyendo. Podés pausar o repetir.");window.speechSynthesis.speak(v);
  }
  function currentSpeech(){
    var r=currentRoute(),view=$('[data-ruta-vista="'+r+'"]');
    if(!view)return"";
    if(r==="inicio")return word($(".hero-text",view));
    if(r==="caso"){
      if($("#feed").hidden)return"Notificación: "+word($("#notif-texto"));
      if(caseStep===0)return"Una publicación del grupo. "+word($(".post-head"))+". "+word($(".post-text"))+". "+window.CASO.image.alt+". "+window.CASO.image.longDescription;
      if(caseStep<=5){var c=window.CASO.comments[caseStep-1];return"Mensaje de "+c.author+" a las "+c.time+": "+c.text;}
      if(caseStep<=7)return word($$(".pregunta-card",view)[caseStep-6]);
      return"Revisamos qué pasó: la foto se compartió; Sofi pidió retirarla y siguió circulando. Ahora vamos a investigar.";
    }
    if(r==="investigamos"){
      if(invStep<=3)return word($$(".card-inv",view)[invStep]);
      if(invStep<=6)return $$("details.glos:not([hidden])",view).map(word).join(". ");
      if(invStep===7)return word($("#t-acoso").closest(".box"));
      if(invStep===8||invStep===9)return $$("#preguntas-inv li:not([hidden])",view).map(word).join(". ");
      return"Ya investigamos el caso. Seguimos con las decisiones.";
    }
    if(r==="decidimos"){
      var d=$$(".dilema",view)[decStep],text=word($("h2",d))+". "+word($(".situacion",d))+". ";
      text+=$$(".opcion",d).map(function(x){return word(x).replace(/Opción elegida|Ya la exploraste/g,"");}).join(". ");
      if(visible($(".consecuencia",d)))text+=" "+word($(".consecuencia",d));
      return text;
    }
    if(r==="construimos")return"Construimos acuerdos de convivencia digital. "+word($("#contador-acuerdos"))+". "+word($$("#lista-ideas li")[ideaStep])+". "+word($("#pregunta-final"));
    return word(view);
  }
  function initJourneyBar(){
    var main=$("#contenido"),bar=document.createElement("div");bar.className="journey-bar";bar.id="journey-bar";
    bar.innerHTML='<div class="journey-top"><div><p class="journey-current" id="journey-current"></p>'+
      '<p class="journey-meta" id="journey-meta">Simulación educativa ficticia</p></div>'+
      '<details class="journey-link" id="journey-menu"><summary>Cambiar etapa</summary>'+
      '<nav aria-label="Ir a otra etapa de la experiencia">'+
      '<a href="#/inicio">Inicio</a><a href="#/caso">1. El caso</a>'+
      '<a href="#/investigamos">2. Investigamos</a><a href="#/decidimos">3. Decidimos</a>'+
      '<a href="#/construimos">4. Construimos</a><a href="#/ayuda">Ayuda y privacidad</a></nav></details></div>'+
      '<progress id="journey-progress" max="4" value="0" aria-label="Avance por etapas de la propuesta"></progress>'+
      '<div class="journey-read" role="group" aria-label="Lectura opcional del momento actual">'+
      '<button type="button" class="btn btn-secondary" id="journey-escuchar">🔊 Escuchar</button>'+
      '<button type="button" class="btn btn-secondary" id="journey-pausar">⏸ Pausar</button>'+
      '<button type="button" class="btn btn-secondary" id="journey-repetir">🔁 Repetir</button>'+
      '<p class="journey-read-msg" id="journey-voz-estado" role="status"></p></div>';
    main.insertBefore(bar,main.firstChild);
    ui.progress=$("#journey-progress");ui.heading=$("#journey-current");ui.meta=$("#journey-meta");ui.speechState=$("#journey-voz-estado");
    $("#journey-escuchar").addEventListener("click",function(){speak(currentSpeech());});
    $("#journey-repetir").addEventListener("click",function(){speak(lastSpeech||currentSpeech());});
    $("#journey-pausar").addEventListener("click",function(){
      if(!supportsVoice)return;
      if(speechPaused){window.speechSynthesis.resume();speechPaused=false;this.textContent="⏸ Pausar";speechStatus("Lectura reanudada.");}
      else if(window.speechSynthesis.speaking){window.speechSynthesis.pause();speechPaused=true;this.textContent="▶ Continuar";speechStatus("Lectura en pausa.");}
    });
    if(!supportsVoice){
      ["#journey-escuchar","#journey-pausar","#journey-repetir"].forEach(function(s){$(s).disabled=true;});
      speechStatus("Lectura en voz alta no disponible en este navegador.");
    }
    bar.addEventListener("click",function(e){
      if(e.target.closest("nav a"))$("#journey-menu").open=false;
    });
    window.addEventListener("hashchange",function(){
      stopSpeech();if($("#journey-pausar"))$("#journey-pausar").textContent="⏸ Pausar";
      $("#journey-menu").open=false;updateTop();
    });
    updateTop();
  }
  function updateTop(){
    if(!ui.progress)return;
    var r=currentRoute(),n=routeOrder.indexOf(r);
    hide(ui.progress,r==="ayuda");
    ui.progress.value=Math.max(0,n);
    ui.heading.textContent=r==="inicio"?"Una historia que vamos a descubrir":(r==="ayuda"?"Ayuda":("Momento "+n+" de 4 · "+routeNames[r]));
    ui.meta.textContent="Simulación ficticia · Sin tiempo límite";
  }
  function hero(){
    var root=$(".hero-art");if(!root)return;root.removeAttribute("aria-hidden");
    root.innerHTML='<figure class="journey-hero-photo"><img src="assets/img/foto_grupo_ficticio.webp" alt="" width="600" height="450">'+
      '<p>📸 Una foto que terminó circulando sin permiso.</p></figure>';
    var actions=$(".hero .actions");if(actions){
      var extra=actions.querySelector('a[href="#/ayuda"]');if(extra)extra.textContent="¿Cómo participar?";
    }
  }
  function stageBanner(target,id){
    var panel=document.createElement("div");panel.className="journey-step";panel.innerHTML='<h2 id="'+id+'" tabindex="-1"></h2><p></p>';
    target.parentNode.insertBefore(panel,target);return panel;
  }
  function controlBar(target,backName,nextName,backAction,nextAction){
    var nav=document.createElement("div");nav.className="journey-controls";
    var back=button(backName,"btn-secondary",backAction),next=button(nextName,"btn-primary",nextAction);
    nav.appendChild(back);nav.appendChild(next);target.appendChild(nav);
    return {root:nav,back:back,next:next};
  }
  function initCase(){
    var feed=$("#feed"),content=$("#feed-contenido"),not=$(".notif-wrap"),post=$(".post",content),comments=$(".comentarios-wrap",content),list=$("#lista-comentarios");
    var qbox=$(".caso-preguntas",feed),qcards=$$(".pregunta-card",qbox);
    var banner=stageBanner(content,"journey-case-title");
    var context=document.createElement("p");context.className="journey-mini-context";context.textContent="📸 La imagen se publicó en el grupo 3.º B.";
    comments.parentNode.insertBefore(context,comments);
    var done=document.createElement("div");done.className="journey-finish";
    done.innerHTML='<h2>¿Qué aprendimos del caso?</h2><p>La foto circuló, Sofi pidió que la retiraran y algunas personas respondieron de diferentes maneras.</p>'+
      '<p>Ahora vamos a reunir pistas para comprender mejor qué ocurrió.</p>'+
      '<a class="btn btn-primary" href="#/investigamos">Seguir: investigamos →</a>';
    feed.insertBefore(done,feed.querySelector(".nav-pie"));
    var controls=controlBar(feed,"← Volver","Continuar →",function(){
      if(caseStep===0){window.location.hash="#/inicio";return;}
      caseStep=Math.max(0,caseStep-1);renderCase(true);},
      function(){caseStep=Math.min(8,caseStep+1);renderCase(true);});
    ui.caseObj={feed:feed,content:content,not:not,post:post,comments:comments,list:list,qbox:qbox,qcards:qcards,
      banner:banner,context:context,done:done,controls:controls};
    var emoji={Sofi:"😟",Bruno:"🙄",Lara:"📲",Mica:"🤝"};
    $$(".comment",comments).forEach(function(c,i){
      var name=window.CASO.comments[i].author,cHead=$(".comment-head",c);
      c.setAttribute("data-personaje",name);
      if(cHead){
        var badge=document.createElement("span");badge.className="journey-emotion";badge.setAttribute("aria-hidden","true");
        badge.textContent=emoji[name]||"💬";cHead.appendChild(badge);
      }
    });
    $("#btn-notif").addEventListener("click",function(){setTimeout(function(){caseStep=0;renderCase(true);},0);});
    renderCase(false);
    new MutationObserver(function(){renderCase(false);}).observe($("#preguntas-caso"),{childList:true});
  }
  function renderCase(moveFocus){
    var s=ui.caseObj;if(!s)return;
    if(moveFocus)stopSpeech();
    var opened=!s.feed.hidden;
    hide(s.not,opened);
    if(!opened)return;
    var titles=["La publicación","Primer mensaje","Segundo mensaje","Tercer mensaje","Cuarto mensaje","Quinto mensaje",
      "Pensemos juntos","Una pregunta más","Estamos listos para investigar"];
    var desc=["Mirá la fotografía y leé qué publicó Nico.","Sofi responde a la publicación.",
      "Otro compañero opina sobre el pedido.","La imagen llegó a otro grupo.","Una compañera propone una forma de actuar.",
      "Sofi vuelve a pedir que la situación termine.","Podemos conversar antes de responder.",
      "No necesitamos adivinar: también podemos reconocer lo que falta saber.","Pasamos del relato al análisis de los hechos."];
    $("h2",s.banner).textContent=titles[caseStep];$("p",s.banner).textContent=desc[caseStep];
    hide(s.post,caseStep!==0);
    hide(s.comments,!(caseStep>=1&&caseStep<=5));
    hide(s.context,!(caseStep>=1&&caseStep<=5));
    hide(s.qbox,!(caseStep===6||caseStep===7));
    hide(s.done,caseStep!==8);
    hide(s.controls.root,false);
    hide(s.controls.back,false);
    s.controls.back.textContent=caseStep===0?"← Volver al inicio":"← Volver";
    hide(s.controls.next,caseStep===8);
    s.controls.next.textContent=caseStep===0?"Ver qué dijo Sofi →":
      caseStep>=1&&caseStep<=4?"Leer el siguiente mensaje →":
      caseStep===5?"Conversar sobre lo ocurrido →":
      caseStep===6?"Otra pregunta →":"Seguir →";
    if(caseStep>=1&&caseStep<=5){
      hide(s.list,false);
      $$(".comment",s.list).forEach(function(e,i){hide(e,i!==caseStep-1);});
    }
    s.qcards=$(".pregunta-card",s.qbox);
    s.qcards.forEach(function(c,i){hide(c,i!==caseStep-6);});
    if(moveFocus)focus($("h2",s.banner));
  }
  function initInvestigation(){
    var view=$('[data-ruta-vista="investigamos"]'),cards=$$(".card-inv",view),terms=$$("#glosario details",view);
    var cbox=$("#tarjetas-inv"),analysis=$("#t-acoso").closest(".box"),glossary=$("#t-glosario").closest(".box"),reflex=$("#t-reflex").closest(".box");
    var banner=stageBanner(cbox,"journey-inv-title");
    var done=document.createElement("div");done.className="journey-finish";
    done.innerHTML='<h2>Ya tenemos más información</h2><p>Comprender lo que ocurrió nos ayuda a tomar decisiones responsables.</p>'+
      '<a class="btn btn-primary" href="#/decidimos">Seguir: decidimos →</a>';
    view.insertBefore(done,view.querySelector(".nav-pie"));
    var controls=controlBar(view,"← Volver","Siguiente pista →",function(){
      if(invStep===0){window.location.hash="#/caso";return;}
      invStep=Math.max(0,invStep-1);renderInvestigation(true);},
      function(){invStep=Math.min(10,invStep+1);renderInvestigation(true);});
    ui.invObj={view:view,cards:cards,terms:terms,cbox:cbox,analysis:analysis,glossary:glossary,reflex:reflex,
      banner:banner,done:done,controls:controls};
    renderInvestigation(false);
  }
  function renderInvestigation(moveFocus){
    var s=ui.invObj;if(!s)return;
    if(moveFocus)stopSpeech();
    var titles=["Pista 1 · La publicación","Pista 2 · La conversación","Pista 3 · La cronología",
      "Pista 4 · Lo que sabemos","Palabras para comprender · 1","Palabras para comprender · 2",
      "Palabras para comprender · 3","¿Se trata de ciberacoso?","Pensemos en equipo · 1",
      "Pensemos en equipo · 2","Investigación terminada"];
    var desc=["¿Qué se publicó?","¿Qué expresó cada persona?","¿Cómo avanzó la situación?",
      "Distinguimos hechos de preguntas.","Primero, consentimiento y privacidad.",
      "Ahora, respeto y difusión sin consentimiento.","Una palabra importante: ciberacoso.",
      "Analizamos el contexto sin poner etiquetas apresuradas.",
      "Conversamos sobre lo que sabemos.","Pensamos en responsabilidades y alternativas.",
      "Ya podemos pasar a tomar decisiones."];
    $("h2",s.banner).textContent=titles[invStep];$("p",s.banner).textContent=desc[invStep];
    hide(s.cbox,invStep>3);
    s.cards.forEach(function(c,i){
      var open=i===invStep;hide(c,!open);
      var b=$(".card-inv-btn",c),body=$(".card-inv-body",c);
      if(b){b.setAttribute("aria-expanded",open?"true":"false");}
      hide(body,!open);
    });
    hide(s.glossary,!(invStep>=4&&invStep<=6));
    s.terms.forEach(function(term,i){
      var show=invStep===4?i<2:invStep===5?i>=2&&i<4:invStep===6?i===4:false;
      hide(term,!show);
      term.open=show;
    });
    hide(s.analysis,invStep!==7);
    hide(s.reflex,!(invStep===8||invStep===9));
    $$("#preguntas-inv li",s.reflex).forEach(function(li,i){hide(li,invStep===8?i>1:invStep===9?i<2:true);});
    hide(s.done,invStep!==10);
    hide(s.controls.root,false);hide(s.controls.back,false);
    s.controls.back.textContent=invStep===0?"← Volver al caso":"← Volver";
    hide(s.controls.next,invStep===10);
    s.controls.next.textContent=invStep===9?"Terminar investigación →":invStep===7?"Conversar en equipo →":
      invStep>=4&&invStep<=6?"Continuar →":"Siguiente pista →";
    if(moveFocus)focus($("h2",s.banner));
  }
  var emojis={reenviar:"📤",no_intervenir:"👀",acompanar:"🤝",insultar:"💢",buscar_ayuda:"🙋",ignorar:"🙈"};
  function enhanceDecisionMarkup(){
    var container=$("#dilemas");if(!container)return;
    $$(".dilema",container).forEach(function(sec){
      if(sec.dataset.journeyReady==="yes")return;
      sec.dataset.journeyReady="yes";
      $$(".opcion",sec).forEach(function(b){
        var letter=$(".opcion-letra",b),emoji=document.createElement("span");
        emoji.className="journey-choice-icon";emoji.setAttribute("aria-hidden","true");emoji.textContent=emojis[b.dataset.op]||"💭";
        if(letter)letter.insertAdjacentElement("afterend",emoji);
        var read=button("🔊 Escuchar esta opción","btn-secondary",function(){
          var d=window.CASO.dilemmas.find(function(x){return x.id===sec.dataset.dilema;});
          var o=d&&d.options.find(function(x){return x.id===b.dataset.op;});if(o)speak(o.label);
        });
        read.classList.add("journey-listen-choice");if(!supportsVoice)read.disabled=true;
        b.parentNode.appendChild(read);
      });
      var panel=document.createElement("div");panel.className="journey-confirm";panel.hidden=true;panel.setAttribute("role","group");
      panel.setAttribute("aria-label","Confirmar una alternativa");
      var p=document.createElement("p");p.setAttribute("role","status");p.textContent="¿Confirmamos esta decisión?";
      var controls=document.createElement("div");controls.className="btn-row";
      var yes=button("✓ Confirmar decisión","btn-primary",function(){
        var op=pending[sec.dataset.dilema];if(!op)return;
        hide(panel,true);$$(".opcion",sec).forEach(function(el){el.removeAttribute("data-pendiente");});
        internalDecision=true;try{op.click();}finally{internalDecision=false;}
        renderDecisions(false);
      });
      var no=button("Cambiar opción","btn-secondary",function(){
        delete pending[sec.dataset.dilema];hide(panel,true);
        $$(".opcion",sec).forEach(function(el){el.removeAttribute("data-pendiente");el.setAttribute("aria-pressed","false");});
        focus($(".opcion",sec));
      });
      controls.appendChild(yes);controls.appendChild(no);panel.appendChild(p);panel.appendChild(controls);
      $(".opciones",sec).insertAdjacentElement("afterend",panel);
      var argumento=$(".fundamento",sec);
      if(argumento){
        var details=document.createElement("details");details.className="journey-argumento";
        var sum=document.createElement("summary");sum.textContent="¿Por qué elegimos esta opción? (opcional)";
        argumento.parentNode.insertBefore(details,argumento);details.appendChild(sum);details.appendChild(argumento);
      }
      sec.journeyConfirm={panel:panel,msg:p,yes:yes};
    });
  }
  function initDecisions(){
    var view=$('[data-ruta-vista="decidimos"]'),box=$("#dilemas");
    var banner=stageBanner(box,"journey-dec-title");
    var done=document.createElement("div");done.className="journey-finish";done.hidden=true;
    done.innerHTML='<h2>Ahora construimos nuestros acuerdos</h2><p>Elegimos y reflexionamos sobre distintas consecuencias. Podemos convertir esas ideas en acuerdos de convivencia.</p>'+
      '<a class="btn btn-primary" href="#/construimos">Seguir: construimos →</a>';
    box.insertAdjacentElement("afterend",done);
    var controls=controlBar(box,"← Primera situación","Segunda situación →",
      function(){if(decStep===0){window.location.hash="#/investigamos";return;}decStep=0;renderDecisions(true);},
      function(){decStep=1;renderDecisions(true);});
    ui.decObj={view:view,box:box,banner:banner,done:done,controls:controls};
    enhanceDecisionMarkup();renderDecisions(false);
    box.addEventListener("click",function(e){
      var op=e.target.closest(".opcion");
      if(op&&!internalDecision){
        e.preventDefault();e.stopImmediatePropagation();
        var sec=op.closest(".dilema"),id=sec.dataset.dilema;
        pending[id]=op;hide($(".consecuencia",sec),true);
        $$(".opcion",sec).forEach(function(b){
          var on=b===op;b.setAttribute("data-pendiente",on?"true":"false");b.setAttribute("aria-pressed",on?"true":"false");
        });
        var data=window.CASO.dilemmas.find(function(d){return d.id===id;});
        var alternative=data&&data.options.find(function(d){return d.id===op.dataset.op;});
        sec.journeyConfirm.msg.textContent="Seleccionaste: "+(alternative?alternative.label:"una alternativa")+". ¿Querés confirmar?";
        hide(sec.journeyConfirm.panel,false);
        hide(ui.decObj.controls.root,true);focus(sec.journeyConfirm.yes);return;
      }
      if(e.target.closest("[data-otra]")){
        var sec2=e.target.closest(".dilema");delete pending[sec2.dataset.dilema];
        hide(sec2.journeyConfirm.panel,true);
        setTimeout(function(){renderDecisions(false);},0);
      }
    },true);
    // El módulo base vuelve a generar los dilemas cuando se borran los datos.
    new MutationObserver(function(){
      if(!$(".dilema:not([data-journey-ready])",box))return;
      if(!box.contains(ui.decObj.controls.root))box.appendChild(ui.decObj.controls.root);
      enhanceDecisionMarkup();renderDecisions(false);
    }).observe(box,{childList:true});
  }
  function renderDecisions(moveFocus){
    var s=ui.decObj;if(!s)return;
    if(moveFocus)stopSpeech();
    var sections=$$(".dilema",s.box);if(sections.length<2)return;
    sections.forEach(function(e,i){hide(e,i!==decStep);});
    $("h2",s.banner).textContent=decStep===0?"Primera decisión: ¿qué harías?":"Segunda decisión: ¿cómo acompañamos?";
    $("p",s.banner).textContent="Elegí una alternativa, confirmala y descubrí una consecuencia posible. Podés escuchar cada opción.";
    var sec=sections[decStep],consequence=$(".consecuencia",sec),confirmed=visible(consequence);
    hide(s.controls.back,false);
    s.controls.back.textContent=decStep===0?"← Volver a investigar":"← Primera situación";
    hide(s.controls.next,decStep!==0||!confirmed);
    hide(s.controls.root,false);
    hide(s.done,decStep!==1||!confirmed);
    if(moveFocus)focus($("h2",s.banner));
  }
  function initBuild(){
    var view=$('[data-ruta-vista="construimos"]'),ideas=$("#lista-ideas");
    var stage=document.createElement("div");stage.className="journey-ideas-controls";
    stage.innerHTML='<span class="journey-ideas-number" id="journey-idea-count" role="status"></span>';
    var prev=button("← Idea anterior","btn-secondary",function(){ideaStep=Math.max(0,ideaStep-1);showIdea(true);});
    var next=button("Otra idea →","btn-secondary",function(){ideaStep=Math.min(9,ideaStep+1);showIdea(true);});
    stage.appendChild(prev);stage.appendChild(next);ideas.insertAdjacentElement("beforebegin",stage);
    var note=$(".view[data-ruta-vista='construimos']>.nota-aviso");
    if(note){
      var details=document.createElement("details");details.className="detalle";
      var sum=document.createElement("summary");sum.textContent="¿Dónde se guardan nuestras ideas?";
      note.parentNode.insertBefore(details,note);details.appendChild(sum);details.appendChild(note);
      note.style.display="block";note.classList.remove("nota-aviso");
    }
    var back=document.createElement("p");back.className="journey-skip-note";
    back.innerHTML='<a class="btn btn-secondary" href="#/decidimos">← Volver a las decisiones</a>';
    $(".grid-2",view).insertAdjacentElement("beforebegin",back);
    ui.buildObj={ideas:ideas,prev:prev,next:next,count:$("#journey-idea-count")};
    showIdea(false);
    new MutationObserver(function(){showIdea(false);}).observe(ideas,{childList:true});
  }
  function showIdea(moveFocus){
    var u=ui.buildObj;if(!u)return;
    var entries=$$("li",u.ideas);if(!entries.length)return;
    ideaStep=Math.min(entries.length-1,ideaStep);
    entries.forEach(function(li,i){hide(li,i!==ideaStep);});
    u.count.textContent="Propuesta "+(ideaStep+1)+" de "+entries.length;
    hide(u.prev,ideaStep===0);hide(u.next,ideaStep===entries.length-1);
    if(moveFocus)focus($("[data-idea]",entries[ideaStep]));
  }
  function boot(){
    document.body.classList.add("journey-mode");
    initJourneyBar();hero();initCase();initInvestigation();initDecisions();initBuild();
    window.addEventListener("pagehide",stopSpeech);
    document.addEventListener("click",function(e){
      var a=e.target.closest('a[href^="#/"]');
      if(a)stopSpeech();
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
