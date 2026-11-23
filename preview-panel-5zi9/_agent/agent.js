/* LE Agent panel: shared module for the LongevityExplorer suite (onvalidation.com /p/*).
 * One include per page:
 *   <script src="/p/_agent/agent.js?v=HASH" defer data-app="APP-ID" data-commands="/p/APP/agent-commands.json"></script>
 * Optional attributes: data-menu (default /p/_menu/menu.json), data-backend, data-notes, data-cap (override the JSON).
 * Navigation commands are matched ON THE DEVICE (0 tokens). Only unmatched text goes to the pluggable agentBackend
 * (action "ask"), metered against a daily token cap (default 10,000 per device, ONE meter shared by all apps: localStorage 'le-agent-tok') and,
 * when the backend answers with tokens_used / tokens_left / cap (the agent-panel Apps Script does), it follows the
 * server's real numbers; the server is the one that enforces the cap. Notes are commands in the same box, typed or spoken
 * ("note buy new shoes", "take a note …", "nota comprar tenis", "anota …"); the text goes to notesEndpoint (action "agent_note";
 * "note" is PaceSetter's own action in the shared Apps Script project). Opening the panel by tap, swipe or Ctrl+K starts listening
 * for a voice command (autoListen, default on); without SpeechRecognition or with the microphone blocked it falls back to typing.
 * The agent is called "RunningMan" in both languages (optional "agentName" in agent-commands.json).
 * Endpoints come from agent-commands.json (agentBackend, notesEndpoint) or the data-* attributes.
 * Per-app look: "panelBg": "runner" in agent-commands.json (+ optional "panelBgImg": {"mobile": url, "desktop": url})
 * adds the class lea-bg-runner; apps without it keep the default panel. No keys or secrets live in this file or in the page.
 * v0.4.1: visible launcher ("launcher": "auto" = shown on mouse/trackpad screens, "always", "off"), grip + launcher above app layers,
 * "edgeSwipe": false for apps that own the right-edge swipe (PaceSetter), "micBusy": CSS selector that means the page's own voice
 * is using the microphone (the panel then opens in typing mode instead of auto-listening), and no second panel inside a same-origin
 * frame whose parent page already has one (PaceSetter embedded in the GymBoss hub; Ctrl/Cmd+K inside that frame drives the parent's panel).
 * "micBusyFrames": selector of same-origin frames where micBusy is also checked; "yieldTo": selector that, while it matches (the app's
 * own side panel is open), hides the grip and launcher so they never cover it. Grip + launcher also step up or down, together, off any
 * fixed control of the page (floating menu buttons, toolbars). */
(function () {
  'use strict';
  if (window.LEAgent) return;
  // one panel per screen: inside a same-origin frame whose parent page already loads the panel (PaceSetter in the GymBoss hub) the parent's panel is the one
  // and Ctrl/Cmd+K pressed while focus is inside the frame still opens / closes the parent's panel
  try {
    if (window.top !== window && window.parent.document.querySelector('script[src*="/_agent/agent.js"]')) {
      var PW = window.parent;
      document.addEventListener('keydown', function (e) {
        if (!((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K'))) return;
        var A = PW.LEAgent; if (!A) return;
        e.preventDefault(); if (A.isOpen()) A.close(); else A.open({ via: 'key' });
      });
      return;
    }
  } catch (e) { }
  var S = document.currentScript || document.querySelector('script[src*="/_agent/agent.js"]');
  var D = (S && S.dataset) || {};
  var VERSION = '0.4.1';
  var APP = D.app || 'app';
  var EDGE = 24;               // px edge zone for the swipe-open gesture
  var html = document.documentElement;

  /* ---------------------------------------------------------------- css + fonts */
  (function () {
    var src = (S && S.src) || '/p/_agent/agent.js';
    var href = src.replace(/agent\.js(\?[^#]*)?$/, 'agent.css$1');
    if (!document.querySelector('link[href*="/_agent/agent.css"]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
    var hasFonts = [].some.call(document.querySelectorAll('link[href*="fonts.googleapis.com"]'), function (x) { return /Inria\+Serif/.test(x.href); });
    if (!hasFonts) {
      var f = document.createElement('link'); f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Inria+Serif:wght@400;700&family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap';
      document.head.appendChild(f);
    }
  })();

  /* ---------------------------------------------------------------- strings */
  var T = {
    en: {
      open: 'Open {name}', close: 'Close {name}', mute: 'Mute voice replies', unmute: 'Unmute voice replies',
      tokLine: '{used} / {cap} tokens today', cap: 'Token cap reached; navigation commands still work', capLeft: 'Not enough tokens left today for that ({n} left); navigation commands still work', left: '{n} left today', srv: 'counted by the server',
      input: '{name} command', send: 'Send', mic: 'Speak a command', micStop: 'Stop listening', prompts: 'Suggested commands',
      noMic: 'Voice is not available in this browser. Type your command.', micBlocked: 'Microphone blocked. Type your command, or allow the microphone in the browser.',
      noMicDev: 'No microphone found. Type your command.',
      micBusy: '{busy} is using the microphone, so I am not listening. Type your command, or tap the microphone button.',
      listening: 'Listening…', typeInstead: 'Type instead',
      noteSaving: 'Saving note…', noteSaved: 'Note saved: “{t}”', noteSavedSay: 'Note saved.', noteFail: 'Could not save the note. ', retry: 'Retry',
      noteSavedAudio: 'Note saved with audio: “{t}”', noteQueued: 'Note kept on this device: “{t}”. It will upload when you are back online.',
      voiceSaved: 'Voice is saved privately to improve {name}.', voiceOff: 'Don’t save my voice', voiceOffDone: 'OK, your voice will not be saved. Say “save my voice” to turn it back on.',
      voiceOnDone: 'OK, your voice is saved privately again to improve {name}.',
      noteNo: 'Notes are not set up for this app.', noteEmpty: 'What should I note? For example “note buy new shoes”.',
      hello: 'Hi! How can I help?',
      unknownNoBackend: 'I did not catch a command. Try “list commands”.',
      thinking: 'Thinking…', mock: 'MOCK', fail: 'The assistant is not reachable right now. Navigation still works.',
      listHead: 'Commands:', listSay: 'Here are the commands. ', appsItem: 'Open an app: ',
      nothingRefresh: 'There is nothing to refresh on this page. Try “latest campaign stats”.', refreshing: 'Refreshing the numbers.',
      going: 'Going to ', backing: 'Going back.', which: 'Which one?', opened: 'Opening ', inNewTab: ' in a new tab.',
      langSet: 'Switched to English.', menuOpen: 'Opening the menu.', stopped: 'Stopped.', statsWait: 'Fetching the latest campaign stats…',
      statsStale: ' (live refresh failed, these are the saved numbers)', est: 'estimate, about 4 characters per token'
    },
    es: {
      open: 'Abrir {name}', close: 'Cerrar {name}', mute: 'Silenciar respuestas de voz', unmute: 'Activar respuestas de voz',
      tokLine: '{used} / {cap} tokens hoy', cap: 'Límite de tokens alcanzado; los comandos de navegación siguen funcionando', capLeft: 'No quedan tokens suficientes hoy para eso (quedan {n}); los comandos de navegación siguen funcionando', left: 'quedan {n} hoy', srv: 'contados por el servidor',
      input: 'Comando para {name}', send: 'Enviar', mic: 'Decir un comando', micStop: 'Dejar de escuchar', prompts: 'Comandos sugeridos',
      noMic: 'La voz no está disponible en este navegador. Escribe el comando.', micBlocked: 'Micrófono bloqueado. Escribe el comando o permite el micrófono en el navegador.',
      noMicDev: 'No se encontró micrófono. Escribe el comando.',
      micBusy: '{busy} está usando el micrófono, así que no estoy escuchando. Escribe el comando o toca el botón del micrófono.',
      listening: 'Escuchando…', typeInstead: 'Escribir',
      noteSaving: 'Guardando nota…', noteSaved: 'Nota guardada: “{t}”', noteSavedSay: 'Nota guardada.', noteFail: 'No se pudo guardar la nota. ', retry: 'Reintentar',
      noteSavedAudio: 'Nota guardada con audio: “{t}”', noteQueued: 'Nota guardada en este dispositivo: “{t}”. Se subirá cuando vuelvas a tener conexión.',
      voiceSaved: 'La voz se guarda en privado para mejorar {name}.', voiceOff: 'No guardar mi voz', voiceOffDone: 'Listo, tu voz no se guardará. Di “guarda mi voz” para activarlo de nuevo.',
      voiceOnDone: 'Listo, tu voz se guarda de nuevo en privado para mejorar {name}.',
      noteNo: 'Las notas no están configuradas en esta app.', noteEmpty: '¿Qué anoto? Por ejemplo “nota comprar tenis”.',
      hello: '¡Hola! ¿En qué te ayudo?',
      unknownNoBackend: 'No reconocí un comando. Prueba “lista de comandos”.',
      thinking: 'Pensando…', mock: 'MOCK', fail: 'El asistente no responde ahora. La navegación sigue funcionando.',
      listHead: 'Comandos:', listSay: 'Estos son los comandos. ', appsItem: 'Abrir una app: ',
      nothingRefresh: 'No hay nada que actualizar en esta página. Prueba “últimas estadísticas de la campaña”.', refreshing: 'Actualizando los números.',
      going: 'Vamos a ', backing: 'Regresando.', which: '¿Cuál?', opened: 'Abriendo ', inNewTab: ' en una pestaña nueva.',
      langSet: 'Cambiado a español.', menuOpen: 'Abriendo el menú.', stopped: 'Listo, me callo.', statsWait: 'Trayendo las últimas estadísticas de la campaña…',
      statsStale: ' (falló la actualización en vivo, son los números guardados)', est: 'estimado, unos 4 caracteres por token'
    }
  };
  var NAME_DEFAULT = 'RunningMan';
  function NAME() { return (typeof CONF !== 'undefined' && CONF.agentName) || NAME_DEFAULT; }
  function L() { return /^es/i.test(html.lang || '') ? 'es' : 'en'; }
  function t(k) { var l = L(); return String((T[l] && T[l][k] != null ? T[l][k] : T.en[k] != null ? T.en[k] : k)).replace(/\{name\}/g, NAME()); }
  function pick(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[L()] || o.en || ''; }

  /* ---------------------------------------------------------------- storage helpers */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { } }

  /* ---------------------------------------------------------------- text normalisation + intent matcher */
  function fold(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_/]+/g, ' ').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/ñ/g, 'n').replace(/\s+/g, ' ').trim();
  }
  // multi-word synonyms first (applied on folded text, word bounded). Canonical tokens start with "_".
  var SYN = [
    ['what can you do|what can i say|que puedes hacer|que comandos hay|list of commands|command list', '_commands'],
    ['landing page|pagina de aterrizaje|pagina publica|public page|landing|aterrizaje', '_landing'],
    ['most recent|mas recientes|mas reciente|latest|newest|recent|recientes|reciente|ultimas|ultimos|ultima|ultimo|current|actuales|en vivo|live', '_latest'],
    ['short term|short stay|shortterm|corto plazo|corta estancia|vacacionales|vacacional|vacation|holiday', '_short'],
    ['long term|longterm|largo plazo|larga estancia|anual|annual|yearly|mensual|monthly', '_long'],
    ['(?:1|one|una|un) (?:bedrooms?|beds?|br|recs?|recamaras?|habitacion(?:es)?|cuartos?|dormitorios?)|1br|1 br|1bd', '_1br'],
    ['(?:2|two|dos) (?:bedrooms?|beds?|br|recs?|recamaras?|habitaciones|cuartos|dormitorios)|2br|2bd', '_2br'],
    ['(?:3|three|tres) (?:bedrooms?|beds?|br|recs?|recamaras?|habitaciones|cuartos|dormitorios)|3br|3bd', '_3br'],
    ['studios?|estudios?|monoambientes?|lofts?', '_studio'],
    ['villas?', '_villas'],
    ['apartments?|apartamentos?|departamentos?|deptos?|depas?|condos?|condominios?|flats?', '_apts'],
    ['land|lots?|lotes?|terrenos?|plots?|parcelas?', '_land'],
    ['rents?|rentals?|rentas?|renting|alquiler(?:es)?|alquileres|arriendos?|for rent|en renta', '_rents'],
    ['for sale|en venta|sales?|ventas?|venta|selling|buy|comprar', '_sales'],
    ['hub|home|homepage|inicio|principal|portada', '_hub'],
    ['stats|stat|statistics|estadisticas?|metrics?|metricas?|numbers|numeros|kpis?|results|resultados|performance|rendimiento|figures|cifras', '_stats'],
    ['campaigns?|campanas?|campaing', '_campaign'],
    ['refresh|reload|update|actualizar|actualiza|actualice|recargar|recarga|refrescar|refresca', '_refresh'],
    ['go back|back|atras|regresar|regresa|regresame|volver|vuelve|vuelve atras|previous|anterior', '_back'],
    ['spanish|espanol|castellano', '_es'], ['english|ingles', '_en'],
    ['commands?|comandos?|help|ayuda|options|opciones', '_commands'],
    ['menu|menus', '_menu'],
    ['stop talking|be quiet|quiet|silence|stop|callate|silencio|deten', '_stop'],
    ['close the agent|close agent|close panel|close|cerrar|cierra|cierra el agente', '_close']
  ];
  // plain single words of the synonym table ("rents?" gives rent + rents): typo targets for the fuzzy pre-pass ("sails" -> "sales")
  var VOCAB = {};
  SYN.forEach(function (p) { p[0].split('|').forEach(function (w) { var m = /^([a-z]+)(s\?)?$/.exec(w); if (m) { VOCAB[m[1]] = 1; if (m[2]) VOCAB[m[1] + 's'] = 1; } }); });
  var VLIST = Object.keys(VOCAB);
  SYN = SYN.map(function (p) { return [new RegExp('\\b(?:' + p[0] + ')\\b', 'g'), ' ' + p[1] + ' ']; });
  var STOP = ('get me the a an to go open show take bring please pls i want would like see page of for on in at my us can you could tell let lets ' +
    'switch change set language idioma cambiar cambia cambiame pon poner list lista de la el los las del al abre abrir abreme ir ve vete llevame ' +
    'lleva muestrame muestra mostrar ver quiero quisiera por favor pagina en mis mi dame da con y and now ahora section seccion jump navigate navegar ' +
    'que what is are es son hey ok okay oye agent agente runningman this esta este esa ese all todos todas some unos unas give view read lee leer me la lo le nos ' +
    'section tab app aplicacion please').split(' ');
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function fix(w) {
    if (w.length < 5 || VOCAB[w] || STOPSET[w] || /\d/.test(w)) return w;
    for (var i = 0; i < VLIST.length; i++) { var v = VLIST[i]; if (Math.abs(v.length - w.length) <= 1 && v.length >= 5 && lev(v, w) <= 1) return v; }
    return w;
  }
  function toks(s, noFix) {
    var f = fold(s).replace(/\brunning man\b/g, 'runningman'); if (!noFix) f = f.split(' ').map(fix).join(' ');
    var x = ' ' + f + ' ';
    SYN.forEach(function (p) { x = x.replace(p[0], p[1]); });
    return x.split(' ').filter(function (w) { return w && !STOPSET[w] && (w.length > 1 || /\d/.test(w)); });
  }
  function lev(a, b) {
    if (a === b) return 0; var m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    var p = [], c, i, j; for (j = 0; j <= n; j++) p[j] = j;
    for (i = 1; i <= m; i++) { c = [i]; for (j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; }
    return p[n];
  }
  function near(a, b) {
    if (a === b) return 2;
    if (a.charAt(0) === '_' || b.charAt(0) === '_') return 0;   // canonical tokens match exactly only
    var n = Math.min(a.length, b.length), d = lev(a, b);
    return (n >= 4 && d <= 1) || (n >= 7 && d <= 2) ? 1 : 0;
  }

  var CMDS = [];          // {id, label, action, phrases:[[tok]], list, group}
  function addCmd(c, i) {
    var ph = [];
    var src = c.phrases || {};
    var all = Array.isArray(src) ? src : [].concat(src.en || [], src.es || []);
    if (c.label) all = all.concat([c.label.en, c.label.es]);
    all.forEach(function (p) { var tk = toks(p); if (tk.length && !ph.some(function (q) { return q.join(' ') === tk.join(' '); })) ph.push(tk); });
    CMDS.push({ id: c.id, label: c.label || { en: c.id, es: c.id }, action: c.action || {}, phrases: ph, list: c.list !== false, group: c.group || '', order: CMDS.length });
  }
  function match(text) {
    var it = toks(text); if (!it.length) return null;
    var best = null;
    CMDS.forEach(function (c) {
      c.phrases.forEach(function (ph) {
        var used = {}, m = 0, exact = 0;
        ph.forEach(function (w) {
          var bi = -1, bs = 0;
          it.forEach(function (x, k) { if (!used[k]) { var s = near(w, x); if (s > bs) { bs = s; bi = k; } } });
          if (bi >= 0) { used[bi] = 1; m++; if (bs === 2) exact++; }
        });
        var need = ph.length >= 4 ? ph.length - 1 : ph.length;
        var cov = m / it.length, full = m >= need;
        // partial: every spoken word is accounted for and at least half of the phrase ("yoga" -> "Yoga Experiences"); ranks below full matches
        if (!full && !(m >= 1 && cov === 1 && m / ph.length >= 0.5)) return;
        if (cov < 0.5) return;
        var sc = [full ? 1 : 0, m, cov, exact, -c.order];
        if (!best || cmp(sc, best.sc) > 0) best = { cmd: c, sc: sc, tokens: it };
      });
    });
    return best;
  }
  function cmp(a, b) { for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1; } return 0; }

  /* ---------------------------------------------------------------- config */
  var CONF = { app: APP, base: '/', tokenCap: 10000, agentBackend: '', notesEndpoint: '', autoListen: true, saveVoice: true, launcher: 'auto', edgeSwipe: true, micBusy: '', micBusyFrames: '', micBusyName: '', yieldTo: '', langSelector: '[data-set="{lang}"]', langKey: '', refreshSelector: '#live .rf, .live .rf, [data-agent-refresh]' };
  function builtins() {
    return [
      { id: 'back', label: { en: 'Go back', es: 'Regresar' }, phrases: { en: ['go back', 'back'], es: ['regresar', 'atrás', 'volver'] }, action: { type: 'back' } },
      { id: 'refresh', label: { en: 'Refresh', es: 'Actualizar' }, phrases: { en: ['refresh', 'refresh the numbers'], es: ['actualizar', 'actualiza los números'] }, action: { type: 'refresh' } },
      { id: 'lang-es', label: { en: 'Switch to Spanish', es: 'Cambiar a español' }, phrases: { en: ['switch to spanish', 'spanish'], es: ['español', 'en español'] }, action: { type: 'lang', lang: 'es' } },
      { id: 'lang-en', label: { en: 'Switch to English', es: 'Cambiar a inglés' }, phrases: { en: ['switch to english', 'english'], es: ['inglés', 'en inglés'] }, action: { type: 'lang', lang: 'en' } },
      { id: 'menu', label: { en: 'Open menu', es: 'Abrir menú' }, phrases: { en: ['open menu', 'menu'], es: ['abrir menú', 'menú'] }, action: { type: 'menu' } },
      { id: 'list', label: { en: 'List commands', es: 'Lista de comandos' }, phrases: { en: ['list commands', 'commands', 'help', 'what can you do'], es: ['lista de comandos', 'comandos', 'ayuda', 'qué puedes hacer'] }, action: { type: 'list' } },
      { id: 'stop', label: { en: 'Stop talking', es: 'Silencio' }, phrases: { en: ['stop', 'quiet'], es: ['silencio', 'cállate'] }, action: { type: 'stop' } },
      { id: 'close', label: { en: 'Close ' + NAME(), es: 'Cerrar ' + NAME() }, phrases: { en: ['close agent', 'close runningman', 'close'], es: ['cerrar agente', 'cerrar runningman', 'cierra'] }, action: { type: 'close' } }
    ];
  }
  function abs(path) {
    if (!path) return CONF.base;
    if (/^https?:|^\//.test(path)) return path;
    return CONF.base.replace(/\/?$/, '/') + path;
  }
  function samePath(a, b) { return String(a).replace(/index\.html$/, '').replace(/\/?$/, '/') === String(b).replace(/index\.html$/, '').replace(/\/?$/, '/'); }

  /* ---------------------------------------------------------------- tokens (ONE shared daily free-token meter per device for every suite app) */
  // Key 'le-agent-tok' is the same on every app, so all apps show one counter (the server also counts per device, not per app).
  // The old per-app key ('le-agent-tok:<app>', before 2026-10-31) is read once for today's numbers and then removed.
  var TOKKEY = 'le-agent-tok', OLDTOKKEY = 'le-agent-tok:' + APP;
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function tokState() {
    var s = null; try { s = JSON.parse(lsGet(TOKKEY) || 'null'); } catch (e) { s = null; }
    if (!s && lsGet(OLDTOKKEY) != null) {
      try { var o = JSON.parse(lsGet(OLDTOKKEY) || 'null'); if (o && o.d === today()) { s = o; lsSet(TOKKEY, JSON.stringify(s)); } } catch (e) { /* bad old value */ }
      lsDel(OLDTOKKEY);
    }
    if (!s || s.d !== today()) { s = { d: today(), used: 0, calls: 0 }; lsSet(TOKKEY, JSON.stringify(s)); }
    return s;
  }
  function tokAdd(n) { var s = tokState(); s.used += n; s.calls += 1; lsSet(TOKKEY, JSON.stringify(s)); renderMeter(); return s; }
  // server numbers win: used = cap - tokens_left (the server counts real xAI usage for this device today)
  function tokSync(j, counted) {
    var s = tokState(), c = Number(j.cap), left = Number(j.tokens_left);
    if (isFinite(c) && c > 0) s.cap = c;
    if (isFinite(left)) { s.used = Math.max(0, (s.cap || cap()) - left); s.left = left; s.srv = 1; }
    if (counted) s.calls += 1;
    lsSet(TOKKEY, JSON.stringify(s)); renderMeter(); return s;
  }
  function est(str) { return Math.ceil(String(str || '').length / 4); }
  function cap() { var s = tokState(); return Math.max(0, Number(D.cap || s.cap || CONF.tokenCap) || 0); }
  function device() {   // random per-browser id for the server's per-device cap; not personal data
    var k = 'le-agent-dev', v = lsGet(k);
    if (!v || !/^[A-Za-z0-9_-]{8,64}$/.test(v)) { v = 'le-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); lsSet(k, v); }
    return v;
  }

  /* ---------------------------------------------------------------- UI */
  var root, handle, launch, back, panel, logEl, input, micBtn, micNote, muteBtn, meter, upBtn, pop, listenBar, toast, h2;
  var ICON = {
    run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14.5" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M7 21l3.5-5.5 3 2.5 1-6"/><path d="M6 11l3-3h5l3 4h3"/><path d="M10.5 15.5l1.5-7.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
    spk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="lea-w" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="lea-m" d="M17 9l5 6M22 9l-5 6"/></svg>'
  };
  function el(tag, cls, htmlStr) { var e = document.createElement(tag); if (cls) e.className = cls; if (htmlStr != null) e.innerHTML = htmlStr; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  function build() {
    root = el('div', 'lea-root'); root.id = 'lea-root';
    root.setAttribute('data-noswipe', '');   // apps with their own swipe gestures (PaceSetter, GymBoss) skip touches that start on the panel
    root.setAttribute('data-launcher', /^(always|off)$/.test(CONF.launcher) ? CONF.launcher : 'auto');
    // slim edge grip: no icon, no arrow, no text (swipe from the right edge or click/tap it to open)
    handle = el('button', 'lea-handle', '<span class="lea-grip" aria-hidden="true"></span>'); handle.type = 'button';
    // visible launcher (v0.4.1): the grip alone is hard to find with a mouse; a labelled button that works by click and keyboard
    launch = el('button', 'lea-launch', ICON.run + '<span class="lea-ltxt"></span>'); launch.type = 'button';
    back = el('div', 'lea-back');
    panel = el('aside', 'lea-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.id = 'lea-panel'; panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="lea-head"><h2 tabindex="-1" id="lea-title"><span class="lea-name"></span></h2>' +
      '<button type="button" class="lea-ib lea-mute">' + ICON.spk + '</button>' +
      '<button type="button" class="lea-ib lea-x">' + ICON.x + '</button></div>' +
      '<div class="lea-meter" role="status" aria-live="polite"><span class="lea-mv"></span><span class="lea-mleft" hidden></span><span class="lea-capmsg" hidden></span></div>' +
      '<div class="lea-log" aria-live="polite"></div>' +
      '<div class="lea-listen" role="status" hidden><span class="lea-dot" aria-hidden="true"></span><span class="lea-ll"></span><button type="button" class="lea-type"></button></div>' +
      '<p class="lea-note lea-micnote" role="status" hidden></p>' +
      '<div class="lea-dock"><div class="lea-pop" id="lea-pop" role="menu" hidden></div>' +
      '<form class="lea-form" autocomplete="off">' +
      '<button type="button" class="lea-ib lea-up" aria-haspopup="menu" aria-controls="lea-pop" aria-expanded="false">' + ICON.up + '</button>' +
      '<input type="text" enterkeyhint="go" class="lea-in">' +
      '<button type="button" class="lea-ib lea-mic" aria-pressed="false">' + ICON.mic + '</button>' +
      '<button type="submit" class="lea-ib lea-send">' + ICON.send + '</button></form></div>';
    panel.setAttribute('aria-labelledby', 'lea-title');
    toast = el('div', 'lea-toast'); toast.setAttribute('role', 'status');
    root.appendChild(handle); root.appendChild(launch); root.appendChild(back); root.appendChild(panel); root.appendChild(toast);
    document.body.appendChild(root);
    h2 = panel.querySelector('h2'); logEl = panel.querySelector('.lea-log'); input = panel.querySelector('.lea-in');
    micBtn = panel.querySelector('.lea-mic'); micNote = panel.querySelector('.lea-micnote'); muteBtn = panel.querySelector('.lea-mute');
    meter = panel.querySelector('.lea-meter'); upBtn = panel.querySelector('.lea-up'); pop = panel.querySelector('.lea-pop'); listenBar = panel.querySelector('.lea-listen');

    handle.addEventListener('click', function () { openP('handle'); });
    launch.addEventListener('click', function () { openP('launcher'); });
    back.addEventListener('click', function () { closeP(); });
    panel.querySelector('.lea-x').addEventListener('click', function () { closeP(); });
    muteBtn.addEventListener('click', function () { setMute(!muted()); });
    panel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; popShow(false); run(v, { source: 'text' }); });
    micBtn.addEventListener('click', function () { if (listening) stopListen(false); else startListen('mic'); });
    listenBar.querySelector('.lea-type').addEventListener('click', function () { toTyping(); });
    // tapping or typing in the box switches from listening to typing
    input.addEventListener('pointerdown', function () { if (listening) stopListen(true); });
    input.addEventListener('input', function () { if (listening) stopListen(true, true); });
    upBtn.addEventListener('click', function () { popShow(pop.hidden); });
    pop.addEventListener('click', function (e) { var b = e.target.closest('button[data-cmd]'); if (!b) return; popShow(false); if (listening) stopListen(true); run(b.getAttribute('data-cmd'), { source: 'prompt' }); });
    pop.addEventListener('keydown', function (e) {
      var items = [].slice.call(pop.querySelectorAll('button')), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var n = items.length; if (n) items[((i < 0 ? 0 : i + (e.key === 'ArrowDown' ? 1 : -1)) + n) % n].focus(); }
    });
    // tap / click outside the list closes it (the Up button toggles it itself)
    document.addEventListener('pointerdown', function (e) { if (!pop.hidden && !pop.contains(e.target) && !upBtn.contains(e.target)) popShow(false, true); }, true);
    logEl.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-run]'); if (b) { run(b.getAttribute('data-run'), { source: 'list' }); return; }
      var r = e.target.closest('button[data-retry]'); if (r) { noteRetry(); return; }
      var vo = e.target.closest('button[data-voiceoff]'); if (vo) { vo.disabled = true; setVoicePref(false, 'button'); }
    });
    if (!SR) micBtn.hidden = true;
    if (CONF.panelBg === 'runner') {   // per-app opt-in (Marketing Boss); other apps keep the default panel
      root.classList.add('lea-bg-runner');
      var im = CONF.panelBgImg || {};
      if (im.mobile) root.style.setProperty('--lea-bg-m', 'url("' + abs(im.mobile) + '")');
      if (im.desktop) root.style.setProperty('--lea-bg-d', 'url("' + abs(im.desktop) + '")');
    }
    relabel(); restoreLog(); renderMeter();
  }
  function popShow(show, keepFocus) {
    if (!pop) return;
    if (show && !pop.querySelector('button')) show = false;
    pop.hidden = !show; upBtn.setAttribute('aria-expanded', String(!!show)); root.classList.toggle('lea-popopen', !!show);
    if (show) { if (listening) stopListen(true); var f = pop.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
    else if (!keepFocus && pop.contains(document.activeElement)) upBtn.focus({ preventScroll: true });
  }
  // micBusy: CSS selector meaning "the page's own voice holds the microphone", checked in this page and in same-origin frames (micBusyFrames)
  function micBusy() {
    if (!CONF.micBusy) return false;
    var docs = [document];
    if (CONF.micBusyFrames) try { [].forEach.call(document.querySelectorAll(CONF.micBusyFrames), function (f) { try { if (f.contentDocument) docs.push(f.contentDocument); } catch (e) { } }); } catch (e) { }
    return docs.some(function (d) { try { return !!d.querySelector(CONF.micBusy); } catch (e) { return false; } });
  }
  // dodge: grip + launcher never sit on a fixed control of the page (a floating menu button, a toolbar, a player bar).
  // They move up or down together, in 24px steps, to the nearest clear spot; re-checked on resize and after late UI loads.
  var CTL = 'a,button,input,select,textarea,label,summary,[role=button],[role=link],[role=tab],[role=slider],[onclick]';
  function fixedCtlAt(x, y) {
    var st = document.elementsFromPoint(x, y), n = null;
    for (var i = 0; i < st.length; i++) { if (!root.contains(st[i])) { n = st[i]; break; } }
    var c = n && n.closest && n.closest(CTL); if (!c || c === document.body) return false;
    for (var a = c; a && a !== html; a = a.parentElement) { var ps = getComputedStyle(a).position; if (ps === 'fixed' || ps === 'sticky') return true; }
    return false;
  }
  function clearAt(e, dy) {
    var r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).display === 'none') return true;
    var top = r.top + dy; if (top < 6 || top + r.height > innerHeight - 6) return false;
    for (var j = 0; j <= 4; j++) { var y = top + 2 + (r.height - 4) * j / 4; if (fixedCtlAt(r.left + 3, y) || fixedCtlAt(r.left + r.width / 2, y)) return false; }
    return true;
  }
  function dodge() {
    if (!handle || isOpen) return;
    handle.style.top = ''; launch.style.top = '';
    var both = function (dy) { return clearAt(handle, dy) && clearAt(launch, dy); };
    if (both(0)) return;
    for (var d = 24; d < innerHeight; d += 24) {
      var hit = both(-d) ? -d : (both(d) ? d : 0);
      if (hit) {
        handle.style.top = (parseFloat(getComputedStyle(handle).top) + hit) + 'px';
        launch.style.top = (parseFloat(getComputedStyle(launch).top) + hit) + 'px';
        return;
      }
    }
  }
  function dodgeWatch() {
    var t; var later = function () { clearTimeout(t); t = setTimeout(dodge, 150); };
    addEventListener('resize', later); dodge(); setTimeout(dodge, 1200); setTimeout(dodge, 3500);
  }
  // yieldTo: while the app's own side panel is open (PaceSetter / GymBoss agent), grip and launcher step aside so they never cover it
  function yieldWatch() {
    if (!CONF.yieldTo) return;
    var tick = function () { var y = false; try { y = !!document.querySelector(CONF.yieldTo); } catch (e) { } root.classList.toggle('lea-yield', y); };
    tick(); setInterval(tick, 400);
  }
  function micMsg(k) { if (root) root.removeAttribute('data-mic-busy'); micNote.hidden = !k; if (k) { micNote.setAttribute('data-k', k); micNote.textContent = t(k); } else micNote.removeAttribute('data-k'); }
  function relabel() {
    if (!root) return;
    var l = L();
    root.setAttribute('lang', l);
    var kb = IS_MAC ? '⌘K' : 'Ctrl+K';
    handle.setAttribute('aria-label', t('open') + ' (' + kb + ')'); handle.title = t('open') + ' (' + kb + ')';
    handle.setAttribute('aria-controls', 'lea-panel'); handle.setAttribute('aria-expanded', String(isOpen)); handle.setAttribute('aria-keyshortcuts', IS_MAC ? 'Meta+K' : 'Control+K');
    launch.setAttribute('aria-label', t('open') + ' (' + kb + ')'); launch.title = t('open') + ' (' + kb + ')'; launch.querySelector('.lea-ltxt').textContent = NAME();
    launch.setAttribute('aria-controls', 'lea-panel'); launch.setAttribute('aria-expanded', String(isOpen)); launch.setAttribute('aria-keyshortcuts', IS_MAC ? 'Meta+K' : 'Control+K');
    h2.querySelector('.lea-name').textContent = NAME();
    panel.querySelector('.lea-x').setAttribute('aria-label', t('close'));
    input.placeholder = listening ? t('listening') : '';
    input.setAttribute('aria-label', t('input'));
    micBtn.setAttribute('aria-label', listening ? t('micStop') : t('mic'));
    panel.querySelector('.lea-send').setAttribute('aria-label', t('send'));
    upBtn.setAttribute('aria-label', t('prompts')); upBtn.title = t('prompts'); pop.setAttribute('aria-label', t('prompts'));
    listenBar.querySelector('.lea-ll').textContent = t('listening');
    listenBar.querySelector('.lea-type').textContent = t('typeInstead');
    if (micNote.getAttribute('data-k')) micNote.textContent = t(micNote.getAttribute('data-k'));
    var m = muted(); muteBtn.setAttribute('aria-pressed', String(m)); muteBtn.setAttribute('aria-label', m ? t('unmute') : t('mute'));
    muteBtn.querySelector('.lea-w').style.display = m ? 'none' : ''; muteBtn.querySelector('.lea-m').style.display = m ? '' : 'none';
    var sug = (CONF.suggest && (CONF.suggest[l] || CONF.suggest.en)) || [];
    pop.innerHTML = sug.map(function (s) { return '<button type="button" role="menuitem" data-cmd="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
    upBtn.hidden = !sug.length; if (!sug.length) popShow(false);
    renderMeter();
  }
  function renderMeter() {
    if (!meter) return;
    var s = tokState(), c = cap(), pct = c ? Math.min(100, s.used / c * 100) : 100, loc = L() === 'es' ? 'es-MX' : 'en-US';
    // text only (no bar): "1,240 / 10,000 tokens today"
    var mv = meter.querySelector('.lea-mv');
    mv.textContent = t('tokLine').replace('{used}', s.used.toLocaleString(loc)).replace('{cap}', c.toLocaleString(loc));
    mv.title = s.srv ? t('srv') : t('est');
    var full = s.used >= c;
    meter.classList.toggle('lea-full', full); meter.classList.toggle('lea-warn', !full && pct >= 80);
    var cm = meter.querySelector('.lea-capmsg'); cm.hidden = !full; cm.textContent = t('cap');
    var ml = meter.querySelector('.lea-mleft');
    ml.hidden = !s.srv || full;
    if (s.srv) ml.textContent = t('left').replace('{n}', Math.max(0, c - s.used).toLocaleString(loc)) + ' · ' + t('srv');
    meter.setAttribute('data-left', Math.max(0, c - s.used)); meter.setAttribute('data-src', s.srv ? 'server' : 'estimate');
    meter.setAttribute('data-used', s.used); meter.setAttribute('data-cap', c);
  }

  /* ---------------------------------------------------------------- open / close + gestures */
  var isOpen = false, lastFocus = null, listenOnRelease = false;
  // via: 'handle' (tap/click on the grip), 'swipe', 'key' (Ctrl/Cmd+K) are user gestures and start listening; 'api' / 'list' do not
  function openP(via, o) {
    if (!root) return;
    if (isOpen) return; isOpen = true; lastFocus = document.activeElement;
    html.classList.add('lea-open'); root.classList.add('lea-open'); panel.setAttribute('aria-hidden', 'false'); handle.setAttribute('aria-expanded', 'true'); launch.setAttribute('aria-expanded', 'true');
    renderMeter(); ssSet('le-agent-open', '1'); micMsg(null);
    setTimeout(function () { (via === 'key' ? input : h2).focus({ preventScroll: true }); logEl.scrollTop = logEl.scrollHeight; }, 30);
    root.setAttribute('data-opened-by', via || '');
    var auto = CONF.autoListen !== false && (via === 'handle' || via === 'launcher' || via === 'swipe' || via === 'key' || (o && o.listen));
    if (auto) {
      // a swipe opens on touchmove, which is not a user activation in every browser: start on the touchend / pointerup of the same gesture
      if (via === 'swipe') listenOnRelease = true; else startListen('auto');
    }
  }
  function closeP() {
    if (!isOpen) return; isOpen = false; listenOnRelease = false;
    html.classList.remove('lea-open'); root.classList.remove('lea-open'); panel.setAttribute('aria-hidden', 'true'); handle.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-expanded', 'false');
    ssSet('le-agent-open', null); popShow(false, true);
    if (listening) stopListen(true);
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) try { lastFocus.focus({ preventScroll: true }); } catch (e) { }
  }
  function released() { if (listenOnRelease) { listenOnRelease = false; if (isOpen) startListen('auto'); } }
  var sw = null;
  function edgeW(isTouch) { return isTouch ? window.innerWidth : html.clientWidth || window.innerWidth; }
  function gStart(x, y, isTouch, target) {
    if (!isOpen && ((CONF.edgeSwipe !== false && x >= edgeW(isTouch) - EDGE) || (target && target.closest && target.closest('.lea-handle')))) sw = { m: 'open', x: x, y: y };
    else if (isOpen && (panel.contains(target) || back.contains(target)) && !(target.closest && target.closest('input,textarea,.lea-pop'))) sw = { m: 'close', x: x, y: y };
    else sw = null;
  }
  function gMove(x, y) {
    if (!sw) return;
    var dx = x - sw.x, dy = y - sw.y, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ay > 24 && ay > ax) { sw = null; return; }   // vertical scroll wins: hand the gesture back to the page
    if (sw.m === 'open' && dx < -36 && ax > ay * 1.5) { sw = null; openP('swipe'); }          // right-to-left from the right edge opens
    else if (sw.m === 'close' && dx > 56 && ax > ay * 1.5) { sw = null; closeP(); }          // left-to-right on the panel closes
  }
  function gestures() {
    // touchstart/end are passive; the left edge (iOS / Android back swipe) is never used
    document.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) { sw = null; return; } var p = e.touches[0]; gStart(p.clientX, p.clientY, true, e.target); }, { passive: true, capture: true });
    // not passive only so a clearly leftward edge drag can stop the browser's own forward-swipe (Chrome overscroll navigation);
    // returns at once when no edge gesture is running, and never cancels vertical moves
    document.addEventListener('touchmove', function (e) {
      if (!sw || e.touches.length !== 1) return; var p = e.touches[0];
      if (sw.m === 'open' && e.cancelable) { var dx = p.clientX - sw.x, dy = p.clientY - sw.y; if (dx < -6 && Math.abs(dx) > Math.abs(dy) * 1.5) e.preventDefault(); }
      gMove(p.clientX, p.clientY);
    }, { passive: false, capture: true });
    document.addEventListener('touchend', function () { sw = null; released(); }, { passive: true, capture: true });
    document.addEventListener('touchcancel', function () { sw = null; listenOnRelease = false; }, { passive: true, capture: true });
    // mouse / pen drag from the right edge (touch is handled above)
    document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch' || e.button !== 0) return; gStart(e.clientX, e.clientY, false, e.target); }, true);
    document.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch' || !sw) return; gMove(e.clientX, e.clientY); }, true);
    document.addEventListener('pointerup', function (e) { if (e.pointerType !== 'touch') { sw = null; released(); } }, true);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (isOpen) closeP(); else openP('key'); return; }
      if (e.key === 'Escape' && isOpen) { e.preventDefault(); if (!pop.hidden) { popShow(false); return; } closeP(); return; }
      if (e.key === 'Tab' && isOpen) {   // keep focus inside the dialog
        var f = [].filter.call(panel.querySelectorAll('button:not([disabled]),input,[tabindex="-1"]'), function (x) { return x.offsetParent !== null && !x.hidden; });
        if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    new MutationObserver(relabel).observe(html, { attributes: true, attributeFilter: ['lang'] });
  }

  /* ---------------------------------------------------------------- log, toast, speech */
  var LOGKEY = 'le-agent-log:' + APP;
  function logItems() { try { return JSON.parse(ssGet(LOGKEY) || '[]'); } catch (e) { return []; } }
  function saveLog(items) { ssSet(LOGKEY, JSON.stringify(items.slice(-30))); }
  function bubble(item, persist) {
    var d = el('div', 'lea-msg ' + (item.who === 'u' ? 'lea-u' : 'lea-a') + (item.err ? ' lea-err' : '') + (item.ok ? ' lea-okmsg' : ''));
    d.setAttribute('data-who', item.who); if (item.cmd) d.setAttribute('data-cmd', item.cmd);
    d.innerHTML = item.html || esc(item.text);
    logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight;
    if (persist !== false) { var a = logItems(); a.push(item); saveLog(a); }
    return d;
  }
  function restoreLog() {
    var a = logItems();
    if (!a.length) bubble({ who: 'a', text: t('hello') }, false);
    a.forEach(function (i) { bubble(i, false); });
  }
  var toastT = 0;
  function showToast(text) { toast.textContent = text; toast.classList.add('lea-show'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('lea-show'); }, 4500); }
  function muted() { return lsGet('le-agent-mute') === '1'; }
  function setMute(m) { lsSet('le-agent-mute', m ? '1' : '0'); if (m && window.speechSynthesis) speechSynthesis.cancel(); relabel(); }
  function speak(text, lang) {
    var spoken = false;
    if (!muted() && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text); u.lang = (lang || L()) === 'es' ? 'es-MX' : 'en-US';
        var vs = speechSynthesis.getVoices() || [], want = u.lang.toLowerCase();
        var v = vs.filter(function (x) { return (x.lang || '').toLowerCase() === want; })[0] || vs.filter(function (x) { return (x.lang || '').toLowerCase().indexOf(want.slice(0, 2)) === 0; })[0];
        if (v) u.voice = v;
        speechSynthesis.speak(u); spoken = true;
      } catch (e) { spoken = false; }
    }
    window.dispatchEvent(new CustomEvent('le-agent:say', { detail: { text: text, spoken: spoken, lang: lang || L() } }));
  }
  function reply(text, o) {
    o = o || {};
    var item = { who: 'a', text: text, cmd: o.cmd || '', err: !!o.err, ok: !!(o.cls === 'lea-ok') };
    if (o.html) item.html = o.html;
    bubble(item);
    if (o.toast) showToast(text);
    if (o.speak !== false) speak(o.sayText || text);
  }

  /* ---------------------------------------------------------------- run a command */
  var PENDKEY = 'le-agent-pending';
  function go(url, pending) {
    if (pending) ssSet(PENDKEY, JSON.stringify(Object.assign({ at: Date.now(), app: APP }, pending)));
    obWait().then(function () { location.assign(url); });   // let a queued voice sample reach IndexedDB first (<= 600 ms)
  }
  function run(text, opts) {
    opts = opts || {};
    text = String(text || '').trim(); if (!text) return null;
    bubble({ who: 'u', text: text });
    var vp = voicePrefCmd(text);
    if (vp !== null) {   // "don't save my voice" / "save my voice" (EN/ES): local switch, 0 tokens, never recorded as a sample
      var vev = { text: text, source: opts.source || 'text', matched: vp ? 'voice-on' : 'voice-off', tokens: [] };
      window.dispatchEvent(new CustomEvent('le-agent:command', { detail: vev }));
      setVoicePref(vp, 'command'); return vev;
    }
    var nb = noteBody(text);
    if (nb !== null) {   // "note …" / "nota …" (typed or spoken): private notes backend, 0 tokens, never the LLM
      var nev = { text: text, source: opts.source || 'text', matched: 'note', note: nb, tokens: [] };
      window.dispatchEvent(new CustomEvent('le-agent:command', { detail: nev }));
      saveNote(nb, opts.source, opts.clip, text); return nev;
    }
    var m = match(text);
    var ev = { text: text, source: opts.source || 'text', matched: m ? m.cmd.id : null, tokens: m ? m.tokens : toks(text) };
    window.dispatchEvent(new CustomEvent('le-agent:command', { detail: ev }));
    if (opts.clip) voiceSample(text, ev.matched, opts.clip);   // spoken command: audio + transcript, kind=command (queued, never blocks)
    if (m) { exec(m.cmd); return ev; }
    fallback(text); return ev;
  }
  function exec(c) {
    var a = c.action || {}, lbl = pick(c.label);
    switch (a.type) {
      case 'nav': {
        var url = abs(a.path) + (a.hash ? '#' + a.hash : '');
        var target = abs(a.path);
        if (a.external || /^https?:/.test(target) && target.indexOf(location.origin) !== 0) return openNew(a.path, lbl, c.id);
        var msg = t('going') + lbl + '.';
        if (samePath(target, location.pathname)) { reply(msg, { cmd: c.id, toast: true }); closeP(); if (a.hash) scrollToId(a.hash); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        bubble({ who: 'a', text: msg, cmd: c.id });
        go(url, { type: 'say', text: msg, lang: L() });
        return;
      }
      case 'stats': {
        var tp = abs(a.path);
        if (!samePath(tp, location.pathname)) { bubble({ who: 'a', text: t('statsWait'), cmd: c.id }); go(tp + '#' + (a.hash || ''), { type: 'stats', cmd: c.id }); return; }
        doStats(a, c.id); return;
      }
      case 'refresh': {
        var b = document.querySelector(CONF.refreshSelector);
        if (!b) { reply(t('nothingRefresh'), { cmd: c.id }); return; }
        b.click(); reply(t('refreshing'), { cmd: c.id, toast: !isOpen }); return;
      }
      case 'back': {
        var ref = document.referrer && document.referrer.indexOf(location.origin) === 0;
        bubble({ who: 'a', text: t('backing'), cmd: c.id });
        ssSet(PENDKEY, JSON.stringify({ at: Date.now(), app: APP, type: 'say', text: t('backing'), lang: L() }));
        if (history.length > 1 && ref) history.back(); else location.assign(CONF.base);
        return;
      }
      case 'lang': {
        var btn = document.querySelector(CONF.langSelector.replace('{lang}', a.lang));
        if (btn) btn.click();
        else { html.lang = a.lang; if (CONF.langKey) lsSet(CONF.langKey, a.lang); }
        if (L() !== a.lang) html.lang = a.lang;
        reply(T[a.lang].langSet, { cmd: c.id, sayText: T[a.lang].langSet }); return;
      }
      case 'list': return listCommands(c.id);
      case 'menu': {
        reply(t('menuOpen'), { cmd: c.id, speak: true });
        closeP();
        setTimeout(function () { var mb = document.querySelector('#lxm-root .lxm-btn'); if (mb) mb.click(); }, 260);
        return;
      }
      case 'open': return openNew(a.url, lbl, c.id);
      case 'ask': {
        var opts2 = (a.options || []).map(function (id) { return CMDS.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
        reply(t('which'), { cmd: c.id, html: esc(t('which')) + '<div class="lea-opts">' + opts2.map(function (o) { return '<button type="button" data-run="' + esc(pick(o.label)) + '">' + esc(pick(o.label)) + '</button>'; }).join('') + '</div>', sayText: t('which') + ' ' + opts2.map(function (o) { return pick(o.label); }).join(', ') });
        return;
      }
      case 'stop': if (window.speechSynthesis) speechSynthesis.cancel(); bubble({ who: 'a', text: t('stopped'), cmd: c.id }); return;
      case 'close': closeP(); return;
      default: reply(t('unknownNoBackend'), { err: true });
    }
  }
  function openNew(url, lbl, id) {
    var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    reply(t('opened') + lbl + t('inNewTab'), { cmd: id });
  }
  function scrollToId(id) {
    var e = document.getElementById(id); if (!e) return;
    var smooth = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    e.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }
  function listCommands(id) {
    var l = L(), items = CMDS.filter(function (c) { return c.list && c.group !== 'app'; });
    var apps = CMDS.filter(function (c) { return c.group === 'app'; });
    var lines = items.map(function (c) { return pick(c.label); });
    var rows = items.map(function (c, i) { return '<li><button type="button" data-run="' + esc(pick(c.label)) + '">' + esc(pick(c.label)) + '</button></li>'; });
    if (apps.length) {
      var names = apps.map(function (c) { return pick(c.label).replace(/^(Open|Abrir) /, ''); });
      lines.push(t('appsItem') + names.join(', '));
      rows.push('<li>' + esc(t('appsItem')) + apps.map(function (c) { return '<button type="button" data-run="' + esc(pick(c.label)) + '">' + esc(pick(c.label).replace(/^(Open|Abrir) /, '')) + '</button>'; }).join(', ') + '</li>');
    }
    var sayText = t('listSay') + lines.map(function (s, i) { return (i + 1) + '. ' + s + '.'; }).join(' ');
    reply(sayText, { cmd: id, html: '<b>' + esc(t('listHead')) + '</b><ol class="lea-list">' + rows.join('') + '</ol>', sayText: sayText });
    if (!isOpen) openP('list');
  }

  /* ---------------------------------------------------------------- stats: scroll to the live section, press Refresh, read the numbers */
  function doStats(a, id) {
    var st = CONF.stats || {};
    closeP();
    if (a.hash) scrollToId(a.hash);
    var box = document.querySelector(st.status || '#live');
    var btn = document.querySelector(st.refresh || '#live .rf');
    var before = box ? box.getAttribute('data-updated') : null;
    var done = false;
    function finish(stale) {
      if (done) return; done = true; if (mo) mo.disconnect();
      var vals = {}; var f = st.fields || {};
      Object.keys(f).forEach(function (k) { var e = document.querySelector(f[k]); vals[k] = e ? e.textContent.trim() : '?'; });
      var tpl = pick(st.say) || '{sent} sent, {replied} replied, {rate}.';
      var msg = tpl.replace(/\{(\w+)\}/g, function (_, k) { return vals[k] != null ? vals[k] : '?'; }) + (stale ? t('statsStale') : '');
      reply(msg, { cmd: id, toast: true });
      window.dispatchEvent(new CustomEvent('le-agent:stats', { detail: { values: vals, stale: !!stale, state: box && box.getAttribute('data-state') } }));
    }
    function check() {
      if (!box) return finish(true);
      if (box.getAttribute('aria-busy') === 'true') return;
      var s = box.getAttribute('data-state'), u = box.getAttribute('data-updated');
      if (s === 'error') return finish(true);
      if (s === 'live' && u && u !== before) return finish(false);
    }
    var mo = box ? new MutationObserver(check) : null;
    if (mo) mo.observe(box, { attributes: true });
    if (btn) btn.click(); else finish(true);
    setTimeout(function () { finish(true); }, 15000);
  }

  /* ---------------------------------------------------------------- LLM fallback (pluggable, metered) */
  var busy = false;
  function fallback(text) {
    var endpoint = D.backend || CONF.agentBackend;
    if (!endpoint) { reply(t('unknownNoBackend'), { err: true }); return; }
    var s = tokState(), c = cap();
    var body = JSON.stringify({ action: 'ask', app: APP, page: location.pathname, lang: L(), text: text, device: device(), origin: location.origin, commands: CMDS.map(function (x) { return x.id; }) });
    var reqTok = est(body);
    if (s.used >= c || s.used + reqTok > c) {   // block before calling: at the cap, or when this request alone would pass it
      renderMeter();
      reply(s.used >= c ? t('cap') : t('capLeft').replace('{n}', String(c - s.used)), { err: true, cmd: 'cap' });
      window.dispatchEvent(new CustomEvent('le-agent:cap', { detail: { used: s.used, cap: c, need: reqTok, full: s.used >= c } })); return;
    }
    if (busy) return; busy = true;
    var wait = bubble({ who: 'a', text: t('thinking') }, false);
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        wait.remove();
        j = j || {};
        var srv = j.tokens_left != null && isFinite(Number(j.tokens_left));
        if (j.capped) {   // the server refused before calling the model
          var st = srv ? tokSync(j, false) : tokState(), cc = cap();
          reply(st.used >= cc ? t('cap') : t('capLeft').replace('{n}', String(Math.max(0, cc - st.used))), { err: true, cmd: 'cap' });
          window.dispatchEvent(new CustomEvent('le-agent:cap', { detail: { used: st.used, cap: cc, server: true, full: st.used >= cc } })); return;
        }
        if (j.ok === false) { if (srv) tokSync(j, false); reply(t('fail'), { err: true }); return; }
        var out = String(j.reply || '');
        var used = srv && isFinite(Number(j.tokens_used)) ? Number(j.tokens_used) : reqTok + est(out);
        if (srv) tokSync(j, true); else tokAdd(used);
        var tag = j.mock ? '<span class="lea-tag">' + esc(t('mock')) + '</span>' : '';
        reply(out, { html: tag + esc(out) + '<span class="lea-meta">' + (srv && !j.estimated ? '' : '≈') + used + ' tokens</span>', cmd: 'llm' });
        window.dispatchEvent(new CustomEvent('le-agent:llm', { detail: { tokens: used, server: srv, tokens_left: srv ? Number(j.tokens_left) : null, mock: !!j.mock } }));
      })
      .catch(function () { wait.remove(); tokAdd(reqTok); reply(t('fail'), { err: true }); })
      .then(function () { busy = false; });
  }

  /* ---------------------------------------------------------------- voice commands (Web Speech API); opening the panel listens by default */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var recog = null, listening = false, MICBLK = 'le-agent-micblocked';
  function srLang() { return L() === 'es' ? 'es-MX' : 'en-US'; }
  function listenUI(on) {
    listening = on;
    if (!root) return;
    micBtn.setAttribute('aria-pressed', String(on)); listenBar.hidden = !on; root.classList.toggle('lea-listening', on);
    relabel();
  }
  // via: 'auto' (panel opened by a user gesture) or 'mic' (mic button). Returns true when listening started.
  function startListen(via) {
    if (listening) return true;
    if (!SR) { micMsg('noMic'); if (via === 'auto') setTimeout(function () { if (isOpen) input.focus({ preventScroll: true }); }, 40); return false; }
    if (via === 'auto' && ssGet(MICBLK) === '1') { micMsg('micBlocked'); return false; }
    // the page's own voice (PaceSetter hands-free / its agent mic) holds the microphone: open in typing mode, never fight it for the mic
    if (via === 'auto' && micBusy()) { micNote.hidden = false; micNote.setAttribute('data-k', 'micBusy'); micNote.textContent = t('micBusy').replace('{busy}', pick(CONF.micBusyName) || (L() === 'es' ? 'La página' : 'This page')); root.setAttribute('data-mic-busy', '1'); setTimeout(function () { if (isOpen) input.focus({ preventScroll: true }); }, 40); return false; }   // denied earlier in this tab: do not ask again on every open
    if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { }
    var r, finalText = '', discard = false, retryNoCap = false, retried = via === 'retry';
    try { r = new SR(); } catch (e) { micMsg('noMic'); return false; }
    recog = r; r.lang = srLang(); r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
    r.onresult = function (e) {
      if (discard) return;
      var interim = ''; for (var i = e.resultIndex; i < e.results.length; i++) { var x = e.results[i]; if (x.isFinal) finalText += x[0].transcript; else interim += x[0].transcript; }
      input.value = (finalText + ' ' + interim).trim();
    };
    r.onerror = function (e) {
      var er = e && e.error;
      if (er === 'audio-capture' && r._cap && r._cap.rec && !retried) { lsSet(VOICE_CONFLICT, '1'); retryNoCap = true; discard = true; return; }   // mic shared badly with the recorder on this device: capture off here, listen again
      if (er === 'not-allowed' || er === 'service-not-allowed') { ssSet(MICBLK, '1'); micMsg('micBlocked'); discard = true; if (isOpen) input.focus({ preventScroll: true }); }
      else if (er === 'audio-capture') { micMsg('noMicDev'); discard = true; if (isOpen) input.focus({ preventScroll: true }); }
      root.setAttribute('data-mic-error', er || '');
    };
    r.onend = function () {
      if (recog === r) recog = null;
      listenUI(false);
      var v = (finalText || '').trim(), k = r._cap; r._cap = null;
      if (discard) { capFinish(k, false); if (retryNoCap && isOpen) startListen('retry'); return; }
      input.value = '';
      if (!v) { capFinish(k, false); return; }
      if (!k) { run(v, { source: 'voice' }); return; }
      // the recorder ran for this one utterance (continuous = false): close it, then run the command with its clip
      capFinish(k, true).then(function (clip) { run(v, { source: 'voice', clip: clip }); });
    };
    r._discard = function () { discard = true; };
    try { r.start(); } catch (e) { recog = null; micMsg('noMic'); return false; }
    micMsg(null); ssSet(MICBLK, null); listenUI(true);
    r._cap = capStart();   // MediaRecorder in parallel with SpeechRecognition (saveVoice on + notes backend set)
    return true;
  }
  // drop = true: abort and run nothing (switch to typing / panel closed); false: stop and run what was heard. keepText: leave what the user typed
  function stopListen(drop, keepText) {
    var r = recog; if (!r) { if (listening) listenUI(false); return; }
    if (drop) { r._discard(); if (!keepText) input.value = ''; }
    try { if (drop) r.abort(); else r.stop(); } catch (e) { }
    listenUI(false);
  }
  function toTyping() { stopListen(true); input.focus({ preventScroll: true }); }

  /* ---------------------------------------------------------------- notes: a command in the same box ("note …", "nota …") -> notesEndpoint */
  var NOTE_RES = [
    /^(?:(?:please|ok|okay|hey(?: runningman| running man)?)[\s,]+)?(?:(?:take|make|add|save|write|create|leave)\s+(?:a\s+|the\s+|me\s+a\s+)?(?:quick\s+|new\s+)?)?note(?:\s+(?:that|down|to self))?(?:\s*[:,.\-\u2013\u2014]\s*|\s+)(\S[\s\S]*)$/i,
    /^(?:jot down|write down)(?:\s*[:,]\s*|\s+)(\S[\s\S]*)$/i,
    /^(?:(?:por favor|oye|ok)[\s,]+)?(?:(?:toma|tomar|tomame|haz|hacer|hazme|crea|crear|agrega|agregar|guarda|guardar|escribe|escribir|deja)\s+(?:una\s+|la\s+)?(?:nueva\s+)?)?nota(?:\s+(?:que|de))?(?:\s*[:,.\-\u2013\u2014]\s*|\s+)(\S[\s\S]*)$/i,
    /^(?:(?:por favor|oye)[\s,]+)?(?:anota|anotar|an[oó]tame|apunta|apuntar|ap[uú]ntame)(?:\s+(?:que|esto))?(?:\s*[:,]\s*|\s+)(\S[\s\S]*)$/i
  ];
  var NOTE_EMPTY = /^(?:(?:take|make|add)\s+(?:a\s+)?note|note|notes?|nota|anota|toma(?:r)?\s+(?:una\s+)?nota|jot down)\s*[.:!?]?\s*$/i;
  function noteBody(text) {
    var s = String(text || '').trim();
    for (var i = 0; i < NOTE_RES.length; i++) { var m = NOTE_RES[i].exec(s); if (m) { var b = m[1].trim(); if (b) return b; } }
    return NOTE_EMPTY.test(s) ? '' : null;
  }
  var lastNote = null;
  function newId(pfx) { return pfx + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function saveNote(body, source, clip, said) {
    var endpoint = notesURL();
    if (!endpoint) { reply(t('noteNo'), { err: true, cmd: 'note' }); return; }
    if (!body) { reply(t('noteEmpty'), { cmd: 'note' }); return; }
    var id = newId('an-');
    lastNote = {
      id: id, kind: 'note', at: Date.now(), tries: 0, blob: clip ? clip.blob : null,
      payload: { action: 'agent_note', batchId: 'agent_note:' + id, device: device(), origin: location.origin,
        // same payload the old voice-note button sent; a spoken note carries its audio, a typed note stays text-only (status no_audio)
        note: { id: id, kind: 'note', app: APP, page: location.pathname, lang: L(), transcript: body.slice(0, 4000), utterance: String(said || body).slice(0, 4000),
          timestamp: new Date().toISOString(), source: source === 'voice' ? 'voice' : 'text',
          durationSec: clip ? clip.dur : 0, audioMime: clip ? clip.mime : '', audioBytes: clip ? clip.blob.size : 0, audioB64: '' } }
    };
    notePost();
  }
  function notePost() {
    var rec = lastNote; if (!rec) return;
    var n = rec.payload.note, wait = bubble({ who: 'a', text: t('noteSaving') }, false);
    var detail = function (ok, extra) { return Object.assign({ id: n.id, ok: ok, text: n.transcript, source: n.source, audio: !!rec.blob }, extra || {}); };
    postRec(rec).then(function (res) {
      wait.remove();
      if (res.state === 'done') {
        reply(t(rec.blob ? 'noteSavedAudio' : 'noteSaved').replace('{t}', n.transcript), { cmd: 'note', sayText: t('noteSavedSay'), cls: 'lea-ok' });
        window.dispatchEvent(new CustomEvent('le-agent:note', { detail: detail(true) }));
        lastNote = null; obFlush();
      } else if (res.state === 'offline') {   // no network: keep it on the device and upload later
        lastNote = null;
        obAdd(rec).then(function () {
          reply(t('noteQueued').replace('{t}', n.transcript), { cmd: 'note', sayText: t('noteSavedSay'), cls: 'lea-ok' });
          window.dispatchEvent(new CustomEvent('le-agent:note', { detail: detail(true, { queued: true }) }));
        });
      } else {
        bubble({ who: 'a', err: true, cmd: 'note', text: t('noteFail'), html: esc(t('noteFail')) + ' <span class="lea-opts"><button type="button" data-retry="1">' + esc(t('retry')) + '</button></span>' });
        window.dispatchEvent(new CustomEvent('le-agent:note', { detail: detail(false, { error: res.error || '' }) }));
      }
    });
  }
  function noteRetry() { notePost(); }

  /* ---------------------------------------------------------------- voice capture: the audio of each spoken command / note, saved privately
     Only when a notes backend is set and saveVoice is on (CONF.saveVoice, default true; the user can switch it off on the device).
     MediaRecorder runs in parallel with SpeechRecognition for one listening session; SR stops after one utterance (continuous = false),
     so the clip is that command. Opus in WebM/Ogg (MP4 on Safari), ~24 kbit/s, first CONF.voiceMaxSec (<= 60) seconds only. */
  var MR_OK = !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  var VOICE_PREF = 'le-agent-savevoice', VOICE_TOLD = 'le-agent-voice-told', VOICE_UNSUP = 'le-agent-voice-unsup', VOICE_CONFLICT = 'le-agent-voice-conflict';
  var MAX_B64 = 1400000;   // backend refuses > 1.5 M base64 chars
  function notesURL() { return D.notes || CONF.notesEndpoint || ''; }
  function voiceMax() { return Math.max(1, Math.min(Number(CONF.voiceMaxSec || CONF.notesMaxSec) || 60, 60)); }
  function saveVoiceOn() { return CONF.saveVoice !== false && lsGet(VOICE_PREF) !== '0' && !!notesURL(); }
  function voiceTell() {   // told once per device, the first time audio is captured
    if (lsGet(VOICE_TOLD) === '1') return;
    lsSet(VOICE_TOLD, '1');
    bubble({ who: 'a', cmd: 'voice-privacy', text: t('voiceSaved'), html: esc(t('voiceSaved')) + ' <span class="lea-opts"><button type="button" data-voiceoff="1">' + esc(t('voiceOff')) + '</button></span>' });
  }
  var VOICE_OFF_RES = [/^(?:please\s+)?(?:stop|quit)\s+(?:saving|recording|keeping)\s+my\s+voice\b/i, /^(?:please\s+)?(?:do not|don['’]?t|dont|never)\s+(?:save|record|keep)\s+my\s+voice\b/i,
    /^(?:por favor\s+)?(?:no|deja de|dejar de)\s+(?:guardes|guardar|grabes|grabar)\s+mi\s+voz\b/i];
  var VOICE_ON_RES = [/^(?:please\s+)?(?:start\s+)?(?:saving|save|record|keep)\s+my\s+voice(?:\s+again)?\s*[.!]?$/i, /^(?:por favor\s+)?(?:guarda|guardar|graba|grabar)\s+mi\s+voz(?:\s+de nuevo)?\s*[.!]?$/i];
  function voicePrefCmd(text) {
    var s = String(text || '').trim();
    if (VOICE_OFF_RES.some(function (r) { return r.test(s); })) return false;
    if (VOICE_ON_RES.some(function (r) { return r.test(s); })) return true;
    return null;
  }
  function setVoicePref(on, via) {
    lsSet(VOICE_PREF, on ? '1' : '0');
    if (!on) { lsSet(VOICE_TOLD, '1'); obClear('command'); }   // also drop command samples still waiting on this device
    reply(t(on ? 'voiceOnDone' : 'voiceOffDone'), { cmd: on ? 'voice-on' : 'voice-off', cls: 'lea-ok' });
    window.dispatchEvent(new CustomEvent('le-agent:voicepref', { detail: { saveVoice: on, via: via } }));
  }
  function capStart() {
    if (!MR_OK || !saveVoiceOn() || lsGet(VOICE_CONFLICT) === '1') return null;
    voiceTell();
    var k = { chunks: [], t0: 0, dur: 0, mime: '', rec: null, stream: null, dead: false, timer: 0, stopped: null };
    k.ready = navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(function (stream) {
      if (k.dead) { stream.getTracks().forEach(function (x) { x.stop(); }); return; }
      k.stream = stream;
      var types = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'];
      var mt = types.filter(function (x) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x); })[0] || '';
      var o = { audioBitsPerSecond: 24000 }; if (mt) o.mimeType = mt;
      var rec = new MediaRecorder(stream, o);
      k.rec = rec; k.mime = rec.mimeType || mt || 'audio/webm';
      rec.ondataavailable = function (e) { if (e.data && e.data.size) k.chunks.push(e.data); };
      k.stopped = new Promise(function (res) { rec.onstop = res; rec.onerror = res; });
      rec.start(500); k.t0 = Date.now();
      k.timer = setTimeout(function () { capHalt(k); }, voiceMax() * 1000);   // size cap: keep the first voiceMax() seconds
    }).catch(function () { k.dead = true; capRelease(k); });
    return k;
  }
  function capHalt(k) { if (k.rec && k.rec.state !== 'inactive') { k.dur = (Date.now() - k.t0) / 1000; try { k.rec.stop(); } catch (e) { } } }
  function capRelease(k) { clearTimeout(k.timer); if (k.stream) k.stream.getTracks().forEach(function (x) { x.stop(); }); k.stream = null; }
  // keep: resolve {blob, mime, dur} for this utterance; otherwise discard. Never waits more than 1.5 s.
  function capFinish(k, keep) {
    if (!k) return Promise.resolve(null);
    k.dead = true;
    var out = (k.ready || Promise.resolve()).then(function () {
      if (!k.rec) return null;
      if (k.rec.state !== 'inactive') capHalt(k);
      return k.stopped;
    }).then(function () {
      capRelease(k);
      if (!keep || !k.rec || !k.chunks.length) { k.chunks = []; return null; }
      var mime = String(k.mime).split(';')[0] || 'audio/webm';
      var blob = new Blob(k.chunks, { type: mime }); k.chunks = [];
      return { blob: blob, mime: mime, dur: Math.round(Math.min(k.dur || (Date.now() - k.t0) / 1000, voiceMax()) * 10) / 10 };
    }).catch(function () { capRelease(k); return null; });
    return Promise.race([out, new Promise(function (res) { setTimeout(function () { res(null); }, 1500); })]);
  }
  function voiceSample(text, matched, clip) {
    if (!clip || !saveVoiceOn()) return;
    var u = Number(lsGet(VOICE_UNSUP)) || 0;
    if (u && Date.now() - u < 86400000) return;   // the backend said it does not take voice samples: try again tomorrow
    var id = newId('av-');
    obAdd({ id: id, kind: 'command', at: Date.now(), tries: 0, blob: clip.blob,
      payload: { action: CONF.voiceAction || 'agent_voice', batchId: 'agent_voice:' + id, device: device(), origin: location.origin,
        note: { id: id, kind: 'command', app: APP, page: location.pathname, lang: L(), transcript: String(text).slice(0, 500), utterance: String(text).slice(0, 500),
          matched: matched || '', timestamp: new Date().toISOString(), source: 'voice',
          durationSec: clip.dur, audioMime: clip.mime, audioBytes: clip.blob.size, audioB64: '' } } }).then(function () { obFlush(); });
  }

  /* ---------------------------------------------------------------- outbox: queued uploads (IndexedDB, survives navigation and offline; memory fallback) */
  var OB = { p: null, mem: [], busy: false, again: false, timer: 0, writes: [], wait: 30000 };
  var OB_MAX = 40, OB_TTL = 7 * 86400000, OB_TRIES = 8;
  function obDB() {
    if (OB.p) return OB.p;
    OB.p = new Promise(function (res) {
      try {
        var q = indexedDB.open('le-agent-outbox', 1);
        q.onupgradeneeded = function () { q.result.createObjectStore('q', { keyPath: 'id' }); };
        q.onsuccess = function () { res(q.result); };
        q.onerror = q.onblocked = function () { res(null); };
      } catch (e) { res(null); }
    });
    return OB.p;
  }
  function obTx(mode, fn) {
    return obDB().then(function (db) {
      if (!db) return fn(null);
      return new Promise(function (res) {
        try {
          var tx = db.transaction('q', mode), out = fn(tx.objectStore('q'));
          tx.oncomplete = function () { res(out && out.readyState ? out.result : out); };
          tx.onerror = tx.onabort = function () { res(null); };
        } catch (e) { res(fn(null)); }
      });
    });
  }
  function obAll() { return obTx('readonly', function (st) { return st ? st.getAll() : OB.mem.slice(); }).then(function (a) { return (a || []).sort(function (x, y) { return x.at - y.at; }); }); }
  function obDel(id) { return obTx('readwrite', function (st) { if (st) st.delete(id); else OB.mem = OB.mem.filter(function (x) { return x.id !== id; }); }); }
  function obPut(rec) { return obTx('readwrite', function (st) { if (st) st.put(rec); else { OB.mem = OB.mem.filter(function (x) { return x.id !== rec.id; }); OB.mem.push(rec); } }); }
  function obAdd(rec) {
    var w = obAll().then(function (a) {
      var drop = a.filter(function (x) { return x.kind === 'command'; }).slice(0, Math.max(0, a.length + 1 - OB_MAX));   // full: drop the oldest command samples, never notes
      return Promise.all(drop.map(function (x) { return obDel(x.id); }));
    }).then(function () { return obPut(rec); });
    OB.writes.push(w); w.then(function () { OB.writes = OB.writes.filter(function (x) { return x !== w; }); });
    return w;
  }
  function obClear(kind) { return obAll().then(function (a) { return Promise.all(a.filter(function (x) { return x.kind === kind; }).map(function (x) { return obDel(x.id); })); }); }
  function obWait() { return Promise.race([Promise.all(OB.writes), new Promise(function (r) { setTimeout(r, 600); })]); }
  function obFlush() {
    if (!notesURL()) return;
    if (OB.busy) { OB.again = true; return; }   // a flush is running: run once more when it ends, for items added meanwhile
    if (navigator.onLine === false) return;
    OB.busy = true; clearTimeout(OB.timer);
    obAll().then(function (a) {
      var i = 0;
      function next() {
        if (i >= a.length) { OB.busy = false; OB.wait = 30000; if (OB.again) { OB.again = false; setTimeout(obFlush, 0); } return; }
        var rec = a[i++];
        if (Date.now() - rec.at > OB_TTL || (rec.kind === 'command' && !saveVoiceOn())) { obDel(rec.id).then(next); return; }
        postRec(rec).then(function (res) {
          if (res.state === 'done' || res.state === 'drop') { obDel(rec.id).then(next); return; }
          rec.tries = (rec.tries || 0) + 1;
          if (rec.tries >= OB_TRIES) { obDel(rec.id).then(next); return; }
          obPut(rec).then(function () {   // offline / busy server: stop here and try again later (backoff up to 10 min)
            OB.busy = false; OB.again = false; OB.timer = setTimeout(obFlush, OB.wait); OB.wait = Math.min(OB.wait * 2, 600000);
          });
        });
      }
      next();
    }).catch(function () { OB.busy = false; });
  }
  function b64(blob) {
    return new Promise(function (res) {
      if (!blob) { res(''); return; }
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result || '').replace(/^data:[^,]*,/, '')); };
      fr.onerror = function () { res(''); };
      fr.readAsDataURL(blob);
    });
  }
  // one upload. state: done | drop (permanent refusal) | retry (server busy / not ok) | offline (network error)
  var PERM_VOICE = { unknown_action: 1, unauthorized: 1, token_not_configured: 1 };
  function postRec(rec) {
    var endpoint = notesURL();
    if (!endpoint) return Promise.resolve({ state: 'drop', error: 'no_endpoint' });
    if (navigator.onLine === false) return Promise.resolve({ state: 'offline', error: 'offline' });   // known offline: queue without a failing request
    return b64(rec.blob).then(function (a) {
      var p = JSON.parse(JSON.stringify(rec.payload));
      if (a && a.length <= MAX_B64) p.note.audioB64 = a;
      else { p.note.audioB64 = ''; p.note.audioMime = ''; p.note.audioBytes = 0; p.note.durationSec = 0; if (rec.kind === 'command') return { state: 'drop', error: 'audio_too_large' }; }
      var body = JSON.stringify(p);
      return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: body.length < 60000 })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'http_' + r.status }; }); })
        .then(function (j) {
          if (j && j.ok) return { state: 'done', j: j };
          var er = (j && j.error) || 'not_ok';
          if (rec.kind === 'command' && PERM_VOICE[er]) { lsSet(VOICE_UNSUP, String(Date.now())); return { state: 'drop', error: er }; }
          if (j && j.permanent || er === 'daily_note_limit') return { state: rec.kind === 'command' ? 'drop' : 'retry', error: er, permanent: true };
          return { state: 'retry', error: er };
        }, function () { return { state: 'offline', error: 'network' }; });
    });
  }
  window.addEventListener('online', function () { OB.wait = 30000; obFlush(); });

  /* ---------------------------------------------------------------- boot */
  function loadJSON(url) { return url ? fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(function () { return null; }) : Promise.resolve(null); }
  function boot() {
    Promise.all([loadJSON(D.commands), loadJSON(D.menu || '/p/_menu/menu.json')]).then(function (res) {
      var cj = res[0] || {}, mj = res[1];
      Object.keys(cj).forEach(function (k) { if (k !== 'commands') CONF[k] = cj[k]; });
      (cj.commands || []).forEach(addCmd);
      if (cj.builtins !== false) builtins().forEach(addCmd);
      if (mj && Array.isArray(mj.entries) && cj.menuApps !== false) {
        var ents = mj.entries.filter(function (e) { return e.released !== false && e.live && e.id !== APP; });
        var split = function (x) { return String(x || '').replace(/([a-z])([A-Z])/g, '$1 $2'); };
        var wc = {};   // how many entries use each word: words used by one entry only become aliases ("gallery", "cenotes")
        ents.forEach(function (e) { var seen = {}; [e.label && e.label.en, e.label && e.label.es].forEach(function (x) { toks(split(x), true).forEach(function (w) { if (!seen[w]) { seen[w] = 1; wc[w] = (wc[w] || 0) + 1; } }); }); });
        ents.forEach(function (e) {
          var le = (e.label && e.label.en) || e.id, ls = (e.label && e.label.es) || le;
          var al = [];
          [le, ls].forEach(function (x) { toks(split(x), true).forEach(function (w) { if (wc[w] === 1 && w.length >= 4 && w.charAt(0) !== '_' && al.indexOf(w) < 0) al.push(w); }); });
          addCmd({ id: 'app:' + e.id, group: 'app', label: { en: 'Open ' + le, es: 'Abrir ' + ls },
            phrases: { en: [le, split(le), 'open ' + le].concat(al), es: [ls, split(ls), 'abrir ' + ls] },
            action: { type: 'nav', path: e.live, external: !!e.external } });
        });
      }
      build(); gestures(); yieldWatch(); dodgeWatch();
      if (ssGet('le-agent-open') === '1') ssSet('le-agent-open', null);
      var p = null; try { p = JSON.parse(ssGet(PENDKEY) || 'null'); } catch (e) { }
      ssSet(PENDKEY, null);
      if (p && Date.now() - p.at < 20000) {
        if (p.type === 'stats') { var c = CMDS.filter(function (x) { return x.id === p.cmd; })[0]; if (c) doStats(c.action, c.id); }
        else if (p.type === 'say' && p.text) { showToast(p.text); speak(p.text, p.lang); }
      }
      setTimeout(obFlush, 1500);   // upload anything a previous page or an offline moment left queued
      root.setAttribute('data-ready', '1');
      window.dispatchEvent(new CustomEvent('le-agent:ready', { detail: { app: APP, commands: CMDS.length } }));
    });
  }
  window.LEAgent = {
    version: VERSION, name: function () { return NAME(); }, open: function (o) { openP((o && o.via) || 'api', o); }, close: closeP, isOpen: function () { return isOpen; }, run: run,
    listening: function () { return listening; }, noteBody: noteBody, voicePref: voicePrefCmd,
    saveVoice: function () { return saveVoiceOn(); }, outbox: function () { return obAll().then(function (a) { return a.map(function (x) { return { id: x.id, kind: x.kind, tries: x.tries || 0, bytes: x.blob ? x.blob.size : 0 }; }); }); }, flush: function () { obFlush(); },
    match: function (s) { var m = match(s); return m ? m.cmd.id : null; }, toks: toks,
    tokens: function () { return Object.assign({ cap: cap() }, tokState()); },
    commands: function () { return CMDS.map(function (c) { return { id: c.id, label: c.label, action: c.action }; }); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
