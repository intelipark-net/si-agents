/* SI Agents ⇄ RunningMan panel bridge (preview). agent.js / agent.css stay byte-identical to LE v0.4.1.
 * The panel's config points agentBackend at 'sia-bridge:agent'. This file answers that URL inside the page:
 *   1) a fast local es-MX / English intent parser (0 tokens) that drives window.SIA (app.js);
 *   2) anything it does not understand goes to Grok through the Apps Script 'agent' action (function-call schema of app actions).
 * Replies come back in the {reply, tokens_used, tokens_left, cap} shape agent.js already speaks (text + TTS).
 * The panel meter is relabelled to the app's 10 free homework per browser (then bring-your-own key).
 * No keys or secrets here. A pasted xAI key is never sent to the model: it is only stored by the app's own connect form. */
(function () {
  'use strict';
  var BRIDGE = 'sia-bridge:agent';
  var BIG = 1000000000;
  var nativeFetch = window.fetch.bind(window);
  var pending = null;          // 'prompt' | 'name' after "dicta el prompt" / "dictate my name"
  var pendingOffer = null;     // action to run if the user says yes
  var guide = { step: '', mode: '' }; // choose | intro | file | confirm | done

  var agentGenerated = false;  // a generation started from the panel: announce the PDF when it is ready

  function SIA() { return window.SIA; }
  function L() { return /^en/i.test(document.documentElement.lang || '') ? 'en' : 'es'; }
  function tr(es, en) { return L() === 'en' ? en : es; }
  function fold(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function has(f, re) { return re.test(f); }
  function stripLead(s) { return String(s || '').replace(/^[\s:,\-–—"“'«]+|[\s"”'»]+$/g, ''); }

  /* ---------------------------------------------------------------- help knowledge base */
  var KB = [
    { k: /archivo|archivos|file|files|subir|sube|cargar|upload|adjunt|attach|arrastr|drag|drop|foto|imagen|image|pdf de entrada/,
      es: 'Archivos: di o escribe “subir archivos” y se abre el selector; también puedes arrastrarlos al recuadro “Archivos de la tarea” o soltarlos sobre este panel. Acepta cualquier formato; las imágenes JPG/PNG y los textos se leen. Para quitarlos di “quita los archivos”.',
      en: 'Files: say or type “upload files” and the file picker opens; you can also drag them onto “Homework files” or drop them on this panel. Any format is accepted; JPG/PNG images and text files are read. To remove them, say “clear the files”.' },
    { k: /prompt|instruccion|instruction|dictar|dicta|dictate|escribir|type/,
      es: 'Prompt: di “escribe el prompt: …” con lo que quieres, o di “dicta el prompt”, toca el micrófono y habla. “Agrega al prompt: …” lo añade al final y “borra el prompt” lo limpia.',
      en: 'Prompt: say “set the prompt to: …”, or say “dictate the prompt”, tap the mic and speak. “Add to the prompt: …” appends and “clear the prompt” empties it.' },
    { k: /paleta propia|mi propia paleta|crear paleta|crea.*paleta|construir|own palette|custom palette|create.*palette|make.*palette|build.*palette/,
      es: 'Paleta propia: descríbela, por ejemplo “crea una paleta con fondo verde más oscuro y botones dorados, llamada Selva Noche”. Puedes nombrar el fondo, el panel, los botones, el acento y el texto, con colores y “más oscuro” o “más claro”. Se guarda en este navegador y queda como paleta por defecto, también en el PDF.',
      en: 'Custom palette: describe it, for example “create a palette with a darker green background and gold buttons, called Night Jungle”. You can name the background, panel, buttons, accent and text, with colors and “darker” or “lighter”. It is saved in this browser and becomes the default, in the PDF too.' },
    { k: /paleta|palette|color|colores|tema|theme|estilo por defecto|default style/,
      es: 'Paletas: di “cambia la paleta a Caribe Turquesa” o “usa la paleta por defecto” (Verde Selva). “Qué paletas hay” las lista. La paleta elegida se usa en la app y en el PDF.',
      en: 'Palettes: say “switch the palette to Caribe Turquesa” or “use the default palette” (Verde Selva). “List palettes” shows them. The chosen palette is used in the app and in the PDF.' },
    { k: /hoja de estilo|style sheet|stylesheet/,
      es: 'Hoja de estilo: di “subir hoja de estilo” para reemplazar la de Verde Selva con tu archivo; “usa el estilo por defecto” la restablece.',
      en: 'Style sheet: say “upload a style sheet” to replace Verde Selva with your file; “use the default style” restores it.' },
    { k: /nombre|name|anonim|anonym/,
      es: 'Nombre: di “mi nombre es …”. Si no pones nombre, la tarea sale como anónima; di “sin nombre” para borrarlo.',
      en: 'Name: say “my name is …”. Without a name the PDF is anonymous; say “no name” to clear it.' },
    { k: /generar|genera|generate|crear la tarea|hacer la tarea|make the homework|pdf listo/,
      es: 'Generar: con el prompt listo di “genera la tarea”. El PDF aparece en pantalla en unos segundos y te aviso cuando esté.',
      en: 'Generate: with the prompt ready, say “generate the homework”. The PDF shows up in a few seconds and I let you know.' },
    { k: /compart|share|whatsapp|enviar|send/,
      es: 'Compartir: después de generar di “comparte por WhatsApp”. También puedes compartir cualquier tarea desde “Mis tareas”.',
      en: 'Share: after generating, say “share on WhatsApp”. You can also share any homework from “My homework”.' },
    { k: /mis tareas|my homework|historial|history|lista de tareas|anteriores|previous/,
      es: 'Mis tareas: di “mis tareas” para ver los PDF hechos en este navegador, con enlaces para abrir y compartir.',
      en: 'My homework: say “my homework” to see the PDFs made in this browser, with open and share links.' },
    { k: /limite|limit|cuantas|how many|quedan|left|tokens|clave|key|propio agente|own agent|gratis|free/,
      es: 'Límite: cada navegador tiene 10 tareas gratis. Después conecta tu propia clave de xAI (di “conectar mi clave”); se guarda solo en este navegador.',
      en: 'Limit: each browser gets 10 free homework. After that connect your own xAI key (say “connect my key”); it stays in this browser only.' },
    { k: /idioma|language|ingles|english|espanol|spanish/,
      es: 'Idioma: di “cambia a inglés” o “en español”. La app y yo cambiamos juntos.',
      en: 'Language: say “switch to Spanish” or “English”. The app and I switch together.' },
    { k: /voz|voice|microfono|mic|hablar|speak|silencio|mute/,
      es: 'Voz: al abrir el panel ya te escucho; toca el micrófono para hablar otra vez. Di “silencio” para que me calle o usa la bocina para silenciarme.',
      en: 'Voice: opening the panel starts listening; tap the mic to speak again. Say “stop” to quiet me or use the speaker button to mute.' }
  ];
  function helpOverview() {
    return tr('Puedo manejar toda la app. Prueba: “subir archivos”, “escribe el prompt: …”, “mi nombre es …”, “cambia la paleta a Caribe Turquesa”, “crea una paleta con fondo verde más oscuro y botones dorados”, “mis tareas”, “genera la tarea”, “comparte por WhatsApp”, “cambia a inglés”, “¿cuántas tareas me quedan?”. Pregúntame “¿cómo …?” sobre cualquier paso.',
      'I can run the whole app. Try: “upload files”, “set the prompt to: …”, “my name is …”, “switch the palette to Caribe Turquesa”, “create a palette with a darker green background and gold buttons”, “my homework”, “generate the homework”, “share on WhatsApp”, “switch to Spanish”, “how many are left?”. Ask me “how do I …?” about any step.');
  }
  function helpFor(f) {
    var hit = KB.filter(function (k) { return k.k.test(f); });
    return hit.length ? hit.slice(0, 2).map(function (k) { return k[L()]; }).join(' ') : '';
  }

  /* ---------------------------------------------------------------- colors for the palette builder */
  var COLORS = {
    verde: '#2E7D32', green: '#2E7D32', esmeralda: '#00A86B', emerald: '#00A86B', jade: '#00A36C', oliva: '#6B7B2A', olive: '#6B7B2A', selva: '#1A2613', jungle: '#1A2613', musgo: '#3C4A32', moss: '#3C4A32', lima: '#9BD13B', lime: '#9BD13B',
    dorado: '#D4A440', dorados: '#D4A440', oro: '#D4A440', gold: '#D4A440', golden: '#D4A440', ambar: '#FFBF00', amber: '#FFBF00',
    amarillo: '#F4D03F', amarillos: '#F4D03F', yellow: '#F4D03F', naranja: '#E67E22', naranjas: '#E67E22', orange: '#E67E22',
    rojo: '#C0392B', rojos: '#C0392B', red: '#C0392B', vino: '#6D1A36', burgundy: '#6D1A36', coral: '#FF6F61', rosa: '#E86AA6', rosas: '#E86AA6', pink: '#E86AA6',
    morado: '#6C3483', morados: '#6C3483', purple: '#6C3483', violeta: '#7D3C98', violet: '#7D3C98', lavanda: '#B497D6', lavender: '#B497D6',
    azul: '#1F5FA8', azules: '#1F5FA8', blue: '#1F5FA8', marino: '#00112D', navy: '#00112D', celeste: '#6EC1E4', cielo: '#6EC1E4', sky: '#6EC1E4',
    turquesa: '#0CB3C7', turquoise: '#0CB3C7', teal: '#0CB3C7', aqua: '#59D4DF', cian: '#00BCD4', cyan: '#00BCD4', caribe: '#0CB3C7',
    negro: '#0B0B0B', negros: '#0B0B0B', black: '#0B0B0B', blanco: '#FFFFFF', blancos: '#FFFFFF', white: '#FFFFFF', crema: '#F5E9D0', cream: '#F5E9D0', beige: '#E8D8B8',
    gris: '#7F8C8D', grises: '#7F8C8D', gray: '#7F8C8D', grey: '#7F8C8D', plata: '#C0C7CE', silver: '#C0C7CE',
    cafe: '#6F4E37', marron: '#6F4E37', brown: '#6F4E37', terracota: '#C1663F', terracotta: '#C1663F', arena: '#D8C59A', sand: '#D8C59A'
  };
  function hexToHsl(h) {
    var r = parseInt(h.substr(1, 2), 16) / 255, g = parseInt(h.substr(3, 2), 16) / 255, b = parseInt(h.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, hh = 0, d = mx - mn;
    if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh /= 6; }
    return [hh, s, l];
  }
  function hslToHex(h, s, l) {
    function f(n) { var k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); var c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return ('0' + Math.round(c * 255).toString(16)).slice(-2); }
    return ('#' + f(0) + f(8) + f(4)).toUpperCase();
  }
  function withL(hex, l) { var x = hexToHsl(hex); return hslToHex(x[0], x[1], Math.max(0, Math.min(1, l))); }
  function shift(hex, d) { var x = hexToHsl(hex); return hslToHex(x[0], x[1], Math.max(0, Math.min(1, x[2] + d))); }
  var TARGETS = [
    ['bg', /fondo|background|pagina|page|bg\b/], ['panel', /panel|tarjeta|tarjetas|cajas|recuadro|recuadros|card|cards|box|boxes/],
    ['button', /boton|botones|button|buttons|cta/], ['accent2', /secundari|secondary|turquesa de acento/],
    ['accent', /acento|acentos|accent|accents|borde|bordes|border|borders|linea|lineas|line|lines|detalle|detalles|detail/],
    ['text', /texto|letra|letras|text|font/]
  ];
  function parsePaletteSpec(raw, base) {
    var f = fold(raw), p = {}, touched = 0;
    var nm = /(?:llamada|llamala|que se llame|con el nombre|nombre|called|named|name it|call it)\s+["“']?([^,"”']{2,40})/i.exec(raw);
    var segs = f.split(/,|;| y | and | con | with /);
    var lastTarget = null;
    segs.forEach(function (sg) {
      var tg = null; TARGETS.forEach(function (t) { if (!tg && t[1].test(sg)) tg = t[0]; });
      var hex = (/#([0-9a-f]{6})\b/i.exec(sg) || [])[0];
      var cw = null; sg.split(' ').forEach(function (w) { if (!cw && COLORS[w]) cw = w; });
      var dark = /mas oscur|muy oscur|oscur|darker|dark|deep|profund|nocturn|night/.test(sg), light = /mas clar|clar|lighter|light|pastel|brillante|bright/.test(sg);
      if (!tg && (hex || cw || dark || light)) tg = lastTarget || 'bg';
      if (!tg) return;
      lastTarget = tg;
      var col = hex ? hex.toUpperCase() : cw ? COLORS[cw] : null;
      if (tg === 'bg') {
        var b = col || base.bottom;
        var lb = col ? 0.14 : hexToHsl(base.bottom)[2], lt = col ? 0.07 : hexToHsl(base.top)[2];
        if (dark) { lb = col ? 0.09 : lb * 0.6; lt = col ? 0.045 : lt * 0.6; } else if (light) { lb = col ? 0.24 : lb + 0.08; lt = col ? 0.12 : lt + 0.05; }
        if (col && /blanco|white|crema|cream|beige|arena|sand/.test(sg)) { lb = light ? 0.97 : 0.9; lt = 0.95; p.text = '#13201A'; }
        p.bottom = withL(b, lb); p.top = withL(col || base.top, lt); touched++;
      } else if (tg === 'panel') {
        var pl = col ? 0.2 : hexToHsl(base.panel)[2]; if (dark) pl = col ? 0.14 : pl * 0.7; else if (light) pl = col ? 0.3 : pl + 0.08;
        p.panel = withL(col || base.panel, pl); touched++;
      } else if (tg === 'text') { p.text = col || (dark ? '#13201A' : '#FFFFFF'); touched++; }
      else {
        var k = tg, cur = base[k], c2 = col || cur;
        p[k] = dark ? (col ? withL(c2, 0.42) : shift(cur, -0.12)) : light ? (col ? withL(c2, 0.72) : shift(cur, 0.12)) : c2; touched++;
      }
    });
    if (nm) p.name = stripLead(nm[1]).replace(/\s+(y|and|con|with)\s.*$/i, '').trim();
    return touched ? p : null;
  }
  function describePalette(p) {
    return tr('fondo ' + p.top + '→' + p.bottom + ', panel ' + p.panel + ', botones ' + p.button + ', acento ' + p.accent + ', texto ' + p.text,
      'background ' + p.top + '→' + p.bottom + ', panel ' + p.panel + ', buttons ' + p.button + ', accent ' + p.accent + ', text ' + p.text);
  }
  function nextPaletteName() { var n = SIA().palettes().filter(function (p) { return !p.builtin; }).length + 1; return tr('Mi paleta ', 'My palette ') + n; }

  function urlErrMsg(code) {
    code = String(code || '');
    if (/not_public|http_403|http_401/.test(code)) return tr('No pude abrir ese enlace: el archivo no es público. Compártelo como “cualquiera con el enlace puede ver”.', 'I could not open that link: the file is not public. Share it as “anyone with the link can view”.');
    if (/http_404/.test(code)) return tr('No encontré ese archivo en el enlace.', 'I did not find that file at the link.');
    if (/too_large/.test(code)) return tr('Ese archivo pasa de 15 MB.', 'That file is over 15 MB.');
    if (/blocked_host|bad_url/.test(code)) return tr('Ese enlace no es válido. Pega un enlace completo de Drive o web.', 'That link is not valid. Paste a full Drive or web link.');
    if (/url_daily_limit/.test(code)) return tr('Hoy ya descargué muchos enlaces para este navegador. Sube el archivo directamente.', 'I already downloaded many links for this browser today. Upload the file directly.');
    return tr('No pude descargar ese enlace.', 'I could not download that link.');
  }
  function markProfileAsked() { try { localStorage.setItem('sia-profile-asked', '1'); } catch (e) { } }
  var suppressGenSuggest = false;
  function generateAndWait(s) {
    return new Promise(function (resolve) {
      var done = false, iv, to;
      function fin(v) { if (done) return; done = true; window.removeEventListener('sia:generated', onGen); clearInterval(iv); clearTimeout(to); resolve(v); }
      function onGen(e) { var r = e.detail || {}; fin(tr('Tu PDF está listo: “' + (r.title || '') + '”.', 'Your PDF is ready: “' + (r.title || '') + '”.')); }
      window.addEventListener('sia:generated', onGen);
      var fe = document.getElementById('formError');
      iv = setInterval(function () {
        if (!fe.hidden && fe.textContent) fin({ msg: fe.textContent, halt: true });
        else if (s.view() === 'cap') fin({ msg: tr('Llegaste al límite de tareas; abrí la pantalla para pedir más o conectar tu clave.', 'You hit the homework limit; I opened the screen to ask for more or connect your key.'), halt: true });
      }, 400);
      to = setTimeout(function () { fin({ msg: tr('La tarea tarda más de lo normal; revísala en Mis tareas.', 'The homework is taking longer than usual; check My homework.'), halt: true }); }, 170000);
      suppressGenSuggest = true;
      s.generate();
    });
  }

  /* ---------------------------------------------------------------- action executor (shared by the local parser and Grok) */
  function doAction(a, ctx) {
    var s = SIA(); a = a || {}; ctx = ctx || {}; var v = a.value;
    switch (a.type) {
      case 'open_file_picker': s.openFilePicker(); return tr('Abrí el selector de archivos. Si no aparece, toca “Archivos de la tarea” o suelta los archivos sobre este panel.', 'I opened the file picker. If it does not show, tap “Homework files” or drop the files on this panel.');
      case 'open_style_picker': s.openStylePicker(); return tr('Abrí el selector de hoja de estilo.', 'I opened the style sheet picker.');
      case 'clear_files': s.clearFiles(); return tr('Quité los archivos.', 'Files cleared.');
      case 'reset_style': s.resetStyle(); return tr('Listo, se usa la hoja de estilo por defecto.', 'Done, the default style sheet is back.');
      case 'set_prompt': { if (!v) { pending = 'prompt'; return tr('Te escucho: di o escribe el prompt.', 'Go ahead: say or type the prompt.'); } var out = s.setPrompt(String(v), !!a.append); return tr('Prompt ' + (a.append ? 'actualizado' : 'listo') + ': “' + out + '”.', 'Prompt ' + (a.append ? 'updated' : 'set') + ': “' + out + '”.'); }
      case 'clear_prompt': s.setPrompt(''); return tr('Borré el prompt.', 'Prompt cleared.');
      case 'start_prompt_dictation': pending = 'prompt'; return tr('Te escucho: toca el micrófono y dicta el prompt (o escríbelo aquí).', 'Listening for the prompt: tap the mic and dictate it (or type it here).');
      case 'set_name': { s.setName(v ? String(v) : ''); return v ? tr('Tu nombre quedó como ' + v + '.', 'Your name is set to ' + v + '.') : tr('Sin nombre: la tarea saldrá como anónima.', 'No name: the homework will be anonymous.'); }
      case 'set_language': { var l = /^en/i.test(v) ? 'en' : 'es'; s.setLang(l); return l === 'en' ? 'Switched to English.' : 'Cambiado a español.'; }
      case 'set_palette': { var p = s.setDefaultPalette(String(v || '')); return p ? tr('Paleta por defecto: ' + p.name + '.', 'Default palette: ' + p.name + '.') : tr('No encontré esa paleta. Hay: ', 'I did not find that palette. There are: ') + s.palettes().map(function (x) { return x.name; }).join(', ') + '.'; }
      case 'list_palettes': { var act = s.activePalette().id; s.show('main'); document.getElementById('paletteBox').scrollIntoView({ block: 'center' }); return tr('Paletas: ', 'Palettes: ') + s.palettes().map(function (x) { return x.name + (x.id === act ? tr(' (por defecto)', ' (default)') : ''); }).join(', ') + '.'; }
      case 'create_palette': {
        var spec = a.palette || {}; if (!spec.name) spec.name = nextPaletteName();
        var c = s.savePalette(s.cleanPalette(spec), a.make_default !== false);
        s.show('main'); document.getElementById('paletteBox').scrollIntoView({ block: 'center' });
        return tr('Creé y guardé la paleta “' + c.name + '”' + (a.make_default !== false ? ' como paleta por defecto' : '') + ': ', 'I created and saved “' + c.name + '”' + (a.make_default !== false ? ' as the default palette' : '') + ': ') + describePalette(c) + '.';
      }
      case 'delete_palette': { var d = s.deletePalette(String(v || '')); return d ? tr('Borré la paleta ' + d.name + '.', 'Deleted the palette ' + d.name + '.') : tr('Solo puedo borrar paletas propias.', 'I can only delete your own palettes.'); }
      case 'open_list': return { async: s.listItems().then(function (items) {
        s.renderList(items);
        if (!items.length) return tr('Aún no hay tareas en este navegador.', 'No homework in this browser yet.');
        return tr('Tienes ' + items.length + ' tarea' + (items.length === 1 ? '' : 's') + '. La más reciente: “' + (items[0].description || items[0].prompt || '') + '”.', 'You have ' + items.length + ' homework. The latest: “' + (items[0].description || items[0].prompt || '') + '”.');
      }) };
      case 'show_main': s.show('main'); return tr('Listo, estás en Nueva tarea.', 'Done, you are on New homework.');
      case 'open_pdf': { var r = s.lastResult(); if (r && r.pdfUrl) { var w = window.open(r.pdfUrl, '_blank'); if (w) try { w.opener = null; } catch (e) { } return !w ? tr('Toca “Descargar PDF” para abrirlo.', 'Tap “Download PDF” to open it.') : tr('Abrí el PDF en otra pestaña.', 'Opened the PDF in a new tab.'); } return tr('Todavía no hay un PDF en esta sesión. Di “mis tareas” para ver los anteriores.', 'No PDF in this session yet. Say “my homework” to see earlier ones.'); }
      case 'generate': {
        if (!s.prompt().trim()) { pending = 'prompt'; return tr('Primero necesito el prompt. Dímelo o escríbelo y luego di “genera”.', 'I need the prompt first. Say or type it, then say “generate”.'); }
        var m = s.meter();
        if (m.remaining <= 0 && !m.ownKey) {
          s.show('cap');
          if (m.cap < (m.max || 200)) { pendingOffer = { type: 'request_more' }; return tr('Ya usaste tus ' + m.cap + ' tareas. ¿Agrego 10 más?', 'You used your ' + m.cap + ' homework. Shall I add 10 more?'); }
          return tr('Llegaste al límite de ' + (m.max || 200) + ' tareas gratis. Conecta tu propia clave de xAI en la pantalla que abrí.', 'You reached the limit of ' + (m.max || 200) + ' free homework. Connect your own xAI key on the screen I opened.');
        }
        guide.step = guide.step ? 'done' : guide.step;
        if (ctx && ctx.wait) { return { async: generateAndWait(s) }; }
        agentGenerated = true; s.generate();
        setTimeout(function () { if (window.LEAgent) window.LEAgent.close(); }, 1600);
        return tr('Generando tu tarea' + (s.files().length ? ' con ' + s.files().length + ' archivo(s)' : '') + '. Te aviso cuando el PDF esté listo.', 'Generating your homework' + (s.files().length ? ' with ' + s.files().length + ' file(s)' : '') + '. I will tell you when the PDF is ready.');
      }
      case 'share': {
        var lr = s.lastResult();
        if (lr && lr.waUrl) { var ww = window.open(lr.waUrl, '_blank'); if (ww) try { ww.opener = null; } catch (e) { } if (!ww) { s.show('result'); return tr('Toca “Compartir por WhatsApp” en pantalla.', 'Tap “Share to WhatsApp” on screen.'); } return tr('Abrí WhatsApp con el enlace del PDF.', 'Opened WhatsApp with the PDF link.'); }
        return { async: s.listItems().then(function (items) { s.renderList(items); return items.length ? tr('Abrí Mis tareas: toca “Compartir por WhatsApp” en la tarea que quieras.', 'Opened My homework: tap “Share to WhatsApp” on the one you want.') : tr('Aún no hay tareas para compartir. Genera una primero.', 'No homework to share yet. Generate one first.'); }) };
      }
      case 'show_meter': return { async: s.api('meter', { browserId: s.browserId() }).then(function (res) {
        s.reloadMeter(); var m2 = (res && res.meter) || s.meter();
        if (s.hasOwnKey()) return tr('Usas tu propia clave: sin límite de la app. Llevas ' + m2.used + ' de las 10 gratis.', 'You are on your own key: no app limit. ' + m2.used + ' of the 10 free used.');
        return tr('Te quedan ' + m2.remaining + ' de 10 tareas gratis en este navegador.', 'You have ' + m2.remaining + ' of 10 free homework left in this browser.');
      }) };
      case 'connect_key': s.show('cap'); setTimeout(function () { var k = document.getElementById('userKey'); if (k) k.focus(); }, 300);
        return tr('Pega tu clave de xAI en el campo “Conectar tu propio agente” y toca Conectar. No la escribas aquí: se queda solo en este navegador.', 'Paste your xAI key into “Connect your own agent” and tap Connect. Do not type it here: it stays in this browser only.');
      case 'remove_key': s.setOwnKey(''); return tr('Quité tu clave de este navegador.', 'Removed your key from this browser.');
      case 'mute': { var mb = document.querySelector('.lea-mute'); var isM = mb && mb.getAttribute('aria-pressed') === 'true'; if (mb && isM !== !!v) mb.click(); return v ? tr('Voz apagada.', 'Voice off.') : tr('Voz encendida.', 'Voice on.'); }
      case 'close_panel': setTimeout(function () { if (window.LEAgent) window.LEAgent.close(); }, 900); return tr('Cierro el panel.', 'Closing the panel.');
      case 'status': return { async: s.api('bootstrap', {}).then(function (r) {
        var b = (r && r.bootstrap) || {}, m3 = s.meter();
        return tr('Configuración: idioma español, paleta ' + s.activePalette().name + ', nombre ' + (s.name() || 'anónimo') + ', ' + s.files().length + ' archivo(s), motor ' + (b.model || '?') + (b.engineReady ? ' listo' : ' sin configurar') + ', ' + m3.used + '/' + (b.cap || 10) + ' tareas gratis' + (m3.ownKey ? ', con tu clave' : '') + '.',
          'Settings: language English, palette ' + s.activePalette().name + ', name ' + (s.name() || 'anonymous') + ', ' + s.files().length + ' file(s), engine ' + (b.model || '?') + (b.engineReady ? ' ready' : ' not set up') + ', ' + m3.used + '/' + (b.cap || 10) + ' free homework' + (m3.ownKey ? ', on your key' : '') + '.');
      }) };
      case 'help': return String(v || '') || helpOverview();
      case 'remove_file': {
        var n = s.removeFile ? s.removeFile(String(v || '')) : 0;
        return n ? tr('Quité ' + n + ' archivo(s).', 'Removed ' + n + ' file(s).') : tr('No encontré ese archivo.', 'I did not find that file.');
      }
      case 'paste_files': return { async: (s.pasteFromClipboard ? s.pasteFromClipboard() : Promise.resolve({ added: 0 })).then(function (r) {
        if (r && r.added) { if (guide.step === 'file') guide.step = 'confirm'; return tr('Pegé ' + r.added + ' elemento(s) en la tarea.', 'Pasted ' + r.added + ' item(s) into the homework.'); }
        if (r && r.dup) return tr('Ya estaba adjunto.', 'Already attached.');
        return tr('No encontré nada para pegar. Copia un archivo, una imagen o una tabla y vuelve a decir “pega”.', 'I found nothing to paste. Copy a file, an image or a table and say “paste” again.');
      }) };
      case 'request_more': return { async: s.requestMore(v || 'Panel').then(function (r) {
        var msg = s.requestMoreMsg(r);
        if (r && r.status === 'limit') { s.show('cap'); msg += ' ' + tr('Abrí la pantalla para conectar tu propia clave.', 'I opened the screen to connect your own key.'); }
        pendingOffer = null;
        return msg;
      }) };
      case 'request_status': return { async: s.requestStatus().then(function (r) {
        if (!r || r.status === 'none') return tr('Todavía no has pedido más. Tienes ' + r.cap + ' tareas en total y llevas ' + r.used + '.', 'You have not asked for more yet. You have ' + r.cap + ' in total and used ' + r.used + '.');
        return tr('Tu último pedido quedó como “' + r.status + '”. Tu cupo es ' + r.cap + ', llevas ' + r.used + ' y te quedan ' + r.remaining + '.', 'Your last request is “' + r.status + '”. Your cap is ' + r.cap + ', you used ' + r.used + ' and have ' + r.remaining + ' left.');
      }) };
      case 'attach_file': {
        var q = String(v || '').trim();
        if (!q) return { async: Promise.resolve({ msg: tr('¿Qué archivo adjunto? Dime el nombre o pega un enlace de Drive o web.', 'Which file shall I attach? Tell me its name or paste a Drive or web link.'), halt: true }) };
        var pr = /^https?:\/\//i.test(q) ? s.attachUrl(q) : s.attachByName(q);
        return { async: pr.then(function (r) {
          if (r.status === 'already') return tr('“' + r.name + '” ya está adjunto; lo uso.', '“' + r.name + '” is already attached; I will use it.');
          if (r.status === 'source') return tr('Adjunté “' + r.name + '” de tus tareas anteriores.', 'I attached “' + r.name + '” from your earlier homework.');
          if (r.status === 'url') return tr('Descargué y adjunté “' + r.name + '”.', 'I downloaded and attached “' + r.name + '”.');
          if (r.status === 'picker') return { msg: tr('No encontré ese archivo entre tus tareas anteriores. Abrí el selector: elige ' + r.name + '.', 'I did not find that file among your earlier homework. I opened the picker: choose ' + r.name + '.'), halt: true };
          return { msg: urlErrMsg(r.error), halt: true };
        }) };
      }
      case 'set_grupo': { s.setGrupo(v ? String(v) : ''); markProfileAsked(); return v ? tr('Tu grupo quedó como ' + v + '.', 'Your group is ' + v + '.') : tr('Sin grupo.', 'No group.'); }
      case 'set_maestro': { s.setMaestro(v ? String(v) : ''); markProfileAsked(); return v ? tr('Tu maestro(a): ' + v + '.', 'Your teacher: ' + v + '.') : tr('Sin maestro.', 'No teacher.'); }
      case 'apply_proposal': { s.setPrompt(String(v || '')); guide.step = guide.step ? 'done' : guide.step; pendingOffer = null; return doAction({ type: 'generate' }, ctx); }
      case 'apply_prompt': { s.setPrompt(String(v || '')); pendingOffer = null; return tr('Listo, actualicé el prompt. ¿Genero la tarea?', 'Done, I updated the prompt. Shall I generate the homework?'); }
      case 'suggest_off': try { localStorage.setItem('sia-suggest-off', '1'); } catch (e) { } return tr('Listo, no te haré más sugerencias. Di “activa los avisos” para volver a verlas.', 'Done, no more suggestions. Say “turn suggestions on” to see them again.');
      case 'suggest_on': try { localStorage.removeItem('sia-suggest-off'); } catch (e) { } return tr('Listo, vuelvo a darte sugerencias.', 'Done, suggestions are back on.');
      case 'import_students':
      case 'open_admin': s.openAdmin(); return tr('Abrí el directorio. Si te pide la clave de admin, escríbela en ese campo (no aquí).', 'I opened the directory. If it asks for the admin key, type it in that field (not here).');
      case 'choose_voice': return startGuide('voice');
      case 'choose_text': return startGuide('text');
      default: return '';

    }
  }

  /* ---------------------------------------------------------------- local parser: es-MX + English, flexible phrasing */
  function localParse(raw) {
    var t = String(raw || '').trim(), f = fold(t), s = SIA();
    if (/\bxai-[A-Za-z0-9]{10,}/.test(t)) return [{ type: 'connect_key' }];   // never echo or forward a pasted key
    if (/^(prefiero voz|quiero voz|usar voz|voice|i want voice)$/.test(f)) return [{ type: 'choose_voice' }];
    if (/^(prefiero texto|quiero texto|usar texto|text|type|i want text|escribir)$/.test(f)) return [{ type: 'choose_text' }];
    if (pendingOffer && /^(si|sí|yes|ok|okay|dale|va|hazlo|hazlo tu|hazlo tú|por favor|please|do it|go ahead|claro)$/.test(f)) {
      var act = pendingOffer; pendingOffer = null; return [act];
    }
    if (/^(no|nel|luego|ahora no|not now|no thanks|no gracias|dejarla asi|keep mine)$/.test(f) && (pendingOffer || guide.step !== 'confirm')) { pendingOffer = null; return [{ type: 'help', value: tr('De acuerdo, aquí estoy cuando quieras.', 'All right, I am here when you want.') }]; }
    if (/^(no mas avisos|no mas sugerencias|desactiva los avisos|no more suggestions|turn suggestions off)$/.test(f)) return [{ type: 'suggest_off' }];
    if (/^(activa los avisos|activa las sugerencias|turn suggestions on)$/.test(f)) return [{ type: 'suggest_on' }];
    if (/^(quiero cambiar la tarea|cambiar la tarea|change the task)$/.test(f)) return [{ type: 'start_prompt_dictation' }];
    var guided = guidedParse(t, f, s);
    if (guided) return guided;
    // several actions in one sentence ("adjunta X, hazla con Y y mándala por WhatsApp") -> Grok chains them with full state
    var fams = [/\b(adjunta|adjuntar|sube|subir|carga|cargar|attach|upload)\b/, /\b(haz|hazla|hazlo|genera|generala|elabora|elaborala|crea|creala|make|generate|create|do it)\b/, /\b(manda|mandala|mandalo|mandame|envia|enviala|compartela|comparte|share|send)\b/, /\b(pon|cambia|escribe|usa)\b.*\b(prompt|nombre|grupo|maestro)\b/];
    if (f.split(' ').length >= 5 && /(,| y | luego | despues | then | and )/.test(' ' + f + ' ') && fams.filter(function (r) { return r.test(f); }).length >= 2) return null;
    // profile: grupo / maestro
    var gm = /^(?:mi grupo es|soy del grupo|estoy en el grupo|my group is|i am in group)\s+([A-Za-z0-9\-\.]{1,30})\s*$/i.exec(t);
    if (gm) return [{ type: 'set_grupo', value: gm[1] }];
    var tm = /^(?:mi (?:maestro|maestra|profesor|profesora|docente) es|my teacher is)\s+(.{2,60})$/i.exec(t);
    if (tm) return [{ type: 'set_maestro', value: stripLead(tm[1]) }];
    // attach by URL (Drive / web) or by file name; chained sentences go to Grok
    var CHAIN = /(,| y (haz|genera|crea|elabora|mand|compart|envia|hazla|hazlo)|\bthen\b|\band (make|generate|send|share|create))/;
    var um = /(https?:\/\/\S+)/i.exec(t);
    if (um && /(adjunta|adjuntar|sube|subir|usa|usar|descarga|baja|agrega|carga|toma|attach|upload|use|download|add|load|fetch)/.test(f) && !CHAIN.test(t.replace(um[1], ''))) return [{ type: 'attach_file', value: um[1].replace(/[.,;)]+$/, '') }];
    var nmAtt = /^(?:por favor |please )?(?:sube|subir|adjunta|adjuntar|agrega|agregar|anade|carga|cargar|usa|usar|attach|upload|add|use|load)\s+(?:el |la |mi |los |las |the |my )?(?:archivo|file|documento|document)\s+["“']?(.+?)["”']?\s*$/i.exec(t);
    if (nmAtt && !CHAIN.test(t)) return [{ type: 'attach_file', value: stripLead(nmAtt[1]) }];
    var nmAtt2 = /^(?:por favor |please )?(?:adjunta|adjuntar|attach)\s+(?:el |la |mi |the |my )?(?!archivos?\b|files?\b|foto|imagen|image)(.{3,60})$/i.exec(t);
    if (nmAtt2 && !CHAIN.test(t)) return [{ type: 'attach_file', value: stripLead(nmAtt2[1]) }];
    // dictation follow-up
    if (pending === 'prompt' && !/^(cancela|cancel|olvidalo|never mind)/.test(f)) { pending = null; return [{ type: 'set_prompt', value: t }]; }
    var DISMISS = /^(ahora no|no gracias|no|nel|luego|despues|not now|no thanks|later)$/;
    if (pending === 'name' && DISMISS.test(f)) { pending = null; }
    else if (pending === 'name') { pending = null; if (/^(sin nombre|anonim[oa]|anonymous)$/.test(f)) return [{ type: 'set_name', value: '' }]; return [{ type: 'set_name', value: t.replace(/^(me llamo|mi nombre es|my name is|soy)\s+/i, '') }]; }
    pending = null;
    var Q = /^(como|como puedo|como hago|como se|que hago|donde|how|how do|how can|what is|que es|que son|para que|por que|why|puedo|can i|se puede|explica|explain)\b/;
    // help
    if (/^(lista de comandos|comandos|list commands|commands|command list|que comandos hay|que puedo decir|what can i say)$/.test(f)) return [{ type: 'help' }];
    if (/^(help|ayuda|ayudame|auxilio|que puedes hacer|que sabes hacer|what can you do|what can i say|instrucciones|tutorial|como funciona|como se usa|how does (this|it) work|how do i use (this|the app)|guia|guide)$/.test(f)) return [{ type: 'help' }];
    if (/(cuantas|cuantos|how many|me quedan|quedan|left|remaining)/.test(f) && !/(how do|how can|como (puedo|hago|se))/.test(f) && f.split(' ').length <= 10) return [{ type: 'show_meter' }];
    if (/(configuracion|ajustes|settings|config|que modelo|which model|what model)\b/.test(f) && f.split(' ').length <= 8 && !/(cambia|change|como|how)/.test(f)) return [{ type: 'status' }];
    if (Q.test(f) || /\b(ayuda con|help (me )?with)\b/.test(f) || /^(que es esta app|que es esto|what is this app|que hago primero|what should i do first)$/.test(f)) {
      return null; // Grok answers with the full guide; local help is the fallback
    }
    // pasted key / connect
    if (/(conect|connect|usar|use|poner|pon|agrega|add).*(mi |my |propia |own )?(clave|llave|key|api key|propio agente|own agent)/.test(f) && !/(quita|borra|elimina|remove|delete|forget)/.test(f)) return [{ type: 'connect_key' }];
    if (/(quita|borra|elimina|olvida|remove|delete|forget).*(clave|llave|key)/.test(f)) return [{ type: 'remove_key' }];
    // palettes
    var palWord = /(paleta|paletas|palette|palettes|colores|colors|colours|tema|theme)\b/.test(f);
    var styleAttr = /(fondo|background|botones|buttons|panel|acento|accent|bordes|borders)\b/.test(f) && /(oscur|clar|dark|light|#[0-9a-f]{6}|\b(verde|green|dorad|oro|gold|azul|blue|rojo|red|negro|black|blanco|white|morado|purple|turquesa|teal|naranja|orange|rosa|pink|gris|gray|grey|amarill|yellow|cafe|brown|marino|navy|crema|cream|vino|coral|jade|esmeralda|emerald|oliva|olive)\b)/.test(f);
    if (palWord || styleAttr) {
      if (/(que|cuales|lista|list|muestra|show|ver|see|which|what).*(paletas|palettes)/.test(f) || /^(paletas|palettes)$/.test(f)) return [{ type: 'list_palettes' }];
      if (/(borra|elimina|quita|delete|remove)/.test(f)) { var dn = t.replace(/^.*?(paleta|palette)\s*/i, ''); return [{ type: 'delete_palette', value: dn }]; }
      var creating = /(crea|crear|creame|haz|hazme|construye|arma|disena|nueva|nuevo|personaliza|make|create|build|design|new|custom|my own|propia|mia)/.test(f) || (styleAttr && !/(usa|use|cambia a|switch to|pon la|set the palette|selecciona|elige|pick|choose)\b/.test(f));
      if (creating && styleAttr) {
        var spec = parsePaletteSpec(t, s.activePalette());
        if (spec) return [{ type: 'create_palette', palette: spec, make_default: !/(sin aplicar|no la apliques|don.?t apply|without applying)/.test(f) }];
        return null;   // Grok builds it
      }
      if (creating) return null;   // "create a palette that feels like the sea at night" → Grok builds it
      var pals = s.palettes(), hit = null, best = 0;
      pals.forEach(function (p) {
        var fn = fold(p.name), words = fn.replace(/\b(si agents|estilo|de|paleta|la|el)\b/g, ' ').split(' ').filter(function (w) { return w.length >= 4; });
        var sc = f.indexOf(fn) >= 0 ? 100 : words.filter(function (w) { return f.indexOf(w) >= 0; }).length / Math.max(1, words.length);
        if (sc > 0 && sc >= best) { best = sc; hit = p; }   // ties go to the later (custom) palette
      });
      if (hit && best >= 0.5) return [{ type: 'set_palette', value: hit.id }];
      if (/(defecto|default|original|predeterminad|reset|restablece)/.test(f)) return [{ type: 'set_palette', value: 'verde-selva' }];
      if (hit) return [{ type: 'set_palette', value: hit.id }];
      return [{ type: 'list_palettes' }];
    }
    // style sheet
    if (/(hoja de estilo|style ?sheet)/.test(f)) {
      if (/(defecto|default|original|restablece|reset|quita|remove)/.test(f)) return [{ type: 'reset_style' }];
      return [{ type: 'open_style_picker' }];
    }
    if (/(abre|abrir|ver|muestra|open|show|see|view)\b.*\b(pdf|resultado|result)\b/.test(f) && !/(archivo|archivos|file|files|selector|picker|sube|subir|upload|adjunt|attach)/.test(f)) return [{ type: 'open_pdf' }];
    // paste
    if (/^(pega|pegar|paste|pega el archivo|pega la captura|paste the (file|screenshot|image)|paste it)$/.test(f) || /^(pega|paste)\b/.test(f) && f.split(' ').length <= 6) return [{ type: 'paste_files' }];
    // files
    if (/(quita|borra|elimina|limpia|clear|remove|delete)\s+(todos|todas|all)\s+(los |las |the )?(archivos|files)/.test(f) || /^(quita todos|clear all|remove all files)$/.test(f)) return [{ type: 'clear_files' }];
    var rm = /(?:quita|borra|elimina|saca|remove|delete)\s+(?:el |la |los |las |the )?(?:archivo|file)?\s*["“']?(.+?)["”']?\s*$/i.exec(t);
    if (rm && !/todos|todas|all files/.test(f) && stripLead(rm[1]).length > 1 && !/prompt|clave|key|nombre|name/.test(fold(rm[1]))) return [{ type: 'remove_file', value: stripLead(rm[1]) }];
    if (/(quita|borra|elimina|limpia|clear|remove|delete).*(archivos|archivo|files|file|adjuntos)/.test(f) && /todos|all/.test(f)) return [{ type: 'clear_files' }];

    if (/(sub|carg|adjunt|agreg|anad|abr|selecciona|elige|busca|upload|attach|add|load|open|choose|pick|select|browse).*(archivo|archivos|file|files|documento|documentos|document|foto|fotos|photo|imagen|imagenes|image|images|pdf|excel|word)/.test(f) || /^(archivos|files|subir|upload)$/.test(f)) return [{ type: 'open_file_picker' }];
    // prompt
    if (/^(dicta|dictar|dictate|voy a dictar|i will dictate|quiero dictar)\b.*(prompt|instruccion|consigna)?$/.test(f) && !/(:)/.test(t)) {
      if (/(nombre|name)/.test(f)) { pending = 'name'; return [{ type: 'help', value: tr('Te escucho: di tu nombre.', 'Go ahead: say your name.') }]; }
      return [{ type: 'start_prompt_dictation' }];
    }
    if (/(borra|limpia|quita|clear|erase|delete).*(prompt|instrucciones)/.test(f)) return [{ type: 'clear_prompt' }];
    var pm = /^(?:(?:por favor|please)\s+)?(?:(escribe|pon|ponle|dicta|cambia|establece|redacta|agrega|anade|añade|suma|write|type|set|put|change|add|append)\s+)?(?:(?:en|a|al|to|in|into)\s+)?(?:(?:el|la|the|my|mi)\s+)?(?:prompt|instrucciones?|consigna)\s*(?:(?:es|sea|como|que diga|diciendo|a|to|is|as|says|saying|with|con)\b)?\s*[:=,\-–]?\s*([\s\S]+)$/i.exec(t);
    if (pm && stripLead(pm[2]).length > 2) {
      var verb = fold(pm[1] || ''), body = stripLead(pm[2]);
      return [{ type: 'set_prompt', value: body, append: /^(agrega|anade|añade|suma|add|append)$/.test(verb) }];
    }
    // name
    if (/^(sin nombre|anonimo|anonima|anonymous|no name|borra (mi|el) nombre|clear (my|the) name|quita (mi|el) nombre)$/.test(f)) return [{ type: 'set_name', value: '' }];
    var nmx = /^(?:(?:hola|hi|hello)[, ]+)?(?:mi nombre es|me llamo|my name is|call me|llamame|(?:pon|ponle|ponme)\s+(?:de|como)\s+nombre|nombre\s*[:=]|name\s*[:=]|(?:pon|ponle|cambia|set|change|put)\s+(?:mi |el |my |the )?(?:nombre|name)\s*(?:a|como|en|to|as)?\s*:?)\s*(.{2,60})$/i.exec(t);
    if (nmx) return [{ type: 'set_name', value: stripLead(nmx[1]).replace(/[.!]+$/, '') }];
    // language (long sentences the native matcher does not cover)
    if (/(idioma|language|lengua|habla|speak|talk|cambia|switch|pon|change).*(ingles|english)/.test(f)) return [{ type: 'set_language', value: 'en' }];
    if (/(idioma|language|lengua|habla|speak|talk|cambia|switch|pon|change).*(espanol|spanish|castellano)/.test(f)) return [{ type: 'set_language', value: 'es' }];
    // list / main / pdf
    if (/(mis tareas|mis pdfs|my homework|my tasks|my pdfs|lista de tareas|historial|history|tareas anteriores|previous homework|ver (las |mis )?tareas|show (my )?homework|tareas hechas)/.test(f)) return [{ type: 'open_list' }];
    if (/^(nueva tarea|new homework|inicio|home|pantalla principal|main screen|regresa|regresar|volver|vuelve|atras|back|go back)( .*)?$/.test(f) && f.split(' ').length <= 5) return [{ type: 'show_main' }];
    if (/(abre|abrir|ver|muestra|open|show|see).*(el |the )?(pdf|resultado|result)\b/.test(f)) return [{ type: 'open_pdf' }];
    // share before generate ("envía la tarea")
    if (/(compart|share|whatsapp|wasap|whats|manda|envia|send)/.test(f)) return [{ type: 'share' }];
    if (/(genera|generar|generala|crea la tarea|crear la tarea|haz la tarea|hazla|haz el pdf|arma el pdf|elabora la tarea|resuelve|generate|create the homework|make the homework|make the pdf|build the pdf|do the homework|run it|go ahead|adelante|dale)/.test(f)) return [{ type: 'generate' }];
    if (/(importa|import|carga|load).*(lista|list|estudiantes|alumnos|students|maestros|directorio)/.test(f) || /^(importa la lista de estudiantes)$/.test(f)) return [{ type: 'import_students' }];
    if (/(ya me aprobaron|me aprobaron|ya me la aprobaron|was i approved|am i approved|did they approve|request status|estado de mi solicitud)/.test(f)) return [{ type: 'request_status' }];
    if (/(quiero mas tareas|pide mas tareas|pedir mas tareas|request more|need more homework|mas tareas gratis|aumenta (el|mi) (limite|cupo))/.test(f) || /^(pedir mas tareas|request more homeworks)$/.test(f)) return [{ type: 'request_more' }];
    // meter / status
    if (/(cuantas|cuantos|how many|me quedan|quedan|left|remaining|contador|counter|limite|limit|gratis|free)/.test(f) && f.split(' ').length <= 10) return [{ type: 'show_meter' }];
    if (/^(estado|status|configuracion|config|ajustes|settings|que modelo|which model|what model)( .*)?$/.test(f)) return [{ type: 'status' }];
    if (/(silencia|mute|sin voz|apaga la voz|voice off|no hables)/.test(f)) return [{ type: 'mute', value: true }];
    if (/(activa la voz|enciende la voz|unmute|voice on|habla otra vez|con voz)/.test(f)) return [{ type: 'mute', value: false }];
    return null;
  }

  /* ---------------------------------------------------------------- run actions, build the agent.js reply */
  function runActions(list, prefix) {
    var parts = prefix ? [prefix] : [];
    list = list || [];
    return new Promise(function (resolve) {
      var i = 0;
      function finish() { resolve(parts.filter(Boolean).join(' ')); }
      function next() {
        if (i >= list.length) return finish();
        var a = list[i++], r;
        var ctx = { wait: i < list.length };   // chained steps after this one: generate waits for the PDF
        try { r = doAction(a, ctx); } catch (e) { r = tr('No pude hacer eso.', 'I could not do that.'); }
        if (r && r.async) {
          r.async.catch(function () { return tr('El servidor no respondió.', 'The server did not answer.'); }).then(function (x) {
            var halt = false;
            if (x && typeof x === 'object') { halt = !!x.halt; x = x.msg; }
            if (x) parts.push(x);
            if (halt) return finish();
            next();
          });
        } else { if (r) parts.push(r); next(); }
      }
      next();
    });
  }
  function respond(obj) { return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
  function snapshot() {
    var s = SIA();
    return { view: s.view(), lang: L(), name: s.name(), grupo: s.grupo(), maestro: s.maestro(), prompt: s.prompt().slice(0, 400), files: s.files(),
      filesInfo: s.fileInfo(), palette: s.activePalette(),
      palettes: s.palettes().map(function (p) { return { id: p.id, name: p.name }; }), meter: s.meter(), hasResult: !!s.lastResult(),
      guide: { step: guide.step, mode: guide.mode }, homework: s.homework() };
  }
  function handle(req) {
    var text = String(req && req.text || '');
    if (!SIA()) return Promise.resolve(respond({ ok: false, error: 'app_not_ready' }));
    var acts = null;
    try { acts = localParse(text); } catch (e) { acts = null; }
    if (acts) {   // synchronous first step (inside the user's gesture, so the file picker / WhatsApp may open)
      return runActions(acts).then(function (out) {
        return respond({ ok: true, reply: out || helpOverview(), tokens_used: 0, tokens_left: BIG, cap: BIG, source: 'local' });
      });
    }
    // Grok through the backend
    var s = SIA();
    return s.api('agent', { text: text.slice(0, 800), lang: L(), browserId: s.browserId(), state: snapshot() }).then(function (j) {
      var acts2 = Array.isArray(j.actions) ? j.actions : [];
      if (j.offer_action) pendingOffer = { type: j.offer_action, value: j.offer_value };
      var prefix = String(j.reply || '');
      if (j.offer_action && prefix && prefix.indexOf('quieres que lo haga') < 0 && prefix.toLowerCase().indexOf('want me to') < 0) {
        prefix += ' ' + tr('¿Quieres que lo haga por ti?', 'Want me to do it for you?');
      }
      return runActions(acts2, prefix).then(function (out) {
        var used = Number(j.usage && j.usage.total) || 0;
        return respond({ ok: true, reply: out || helpOverview(), tokens_used: used, tokens_left: BIG, cap: BIG, source: 'grok' });
      });
    }).catch(function (e) {
      var h = helpFor(fold(text));
      if (h) {
        var offer = offerFor(fold(text));
        if (offer) { pendingOffer = offer; h += ' ' + tr('¿Quieres que lo haga por ti?', 'Want me to do it for you?'); }
        return respond({ ok: true, reply: h, tokens_used: 0, tokens_left: BIG, cap: BIG, source: 'fallback' });
      }
      return respond({ ok: true, reply: tr('No entendí eso. ', 'I did not get that. ') + helpOverview(), tokens_used: 0, tokens_left: BIG, cap: BIG, source: 'fallback', error: String(e && e.message || e) });
    });
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url === BRIDGE) {
      var body = {}; try { body = JSON.parse((init && init.body) || '{}'); } catch (e) { body = {}; }
      return handle(body);
    }
    return nativeFetch(input, init);
  };
  window.SIAAgent = { parse: localParse, parsePaletteSpec: parsePaletteSpec, help: helpFor, run: function (t) { return handle({ text: t }).then(function (r) { return r.json(); }); } };

  /* ---------------------------------------------------------------- panel meter = 10 free homework per browser */
  var meterState = null;
  function meterText() {
    if (!meterState) return null;
    if (meterState.ownKey) return tr('Tu clave · ' + meterState.used + ' / ' + meterState.cap + ' gratis usadas', 'Your key · ' + meterState.used + ' / ' + meterState.cap + ' free used');
    return tr(meterState.used + ' / ' + meterState.cap + ' tareas gratis', meterState.used + ' / ' + meterState.cap + ' free homework');
  }
  function paintMeter() {
    var m = document.querySelector('#lea-root .lea-meter'); if (!m || !meterState) return;
    var mv = m.querySelector('.lea-mv'), ml = m.querySelector('.lea-mleft'), cm = m.querySelector('.lea-capmsg');
    var txt = meterText(); if (mv.textContent !== txt) mv.textContent = txt;
    var tl = tr('Tareas gratis de este navegador; después, tu propia clave', 'Free homework for this browser; then your own key'); if (mv.title !== tl) mv.title = tl;
    var left = Math.max(0, meterState.cap - meterState.used);
    var lt = meterState.ownKey ? '' : tr('quedan ' + left, left + ' left');
    if (ml.textContent !== lt) ml.textContent = lt; if (ml.hidden !== (!lt || meterState.full)) ml.hidden = !lt || meterState.full;
    var ct = tr('Límite alcanzado: conecta tu propia clave', 'Limit reached: connect your own key');
    if (cm.textContent !== ct) cm.textContent = ct; if (cm.hidden !== !meterState.full) cm.hidden = !meterState.full;
    if (m.classList.contains('lea-full') !== meterState.full) m.classList.toggle('lea-full', meterState.full);
    var warn = !meterState.full && !meterState.ownKey && left <= 2; if (m.classList.contains('lea-warn') !== warn) m.classList.toggle('lea-warn', warn);
    if (m.getAttribute('data-sia-left') !== String(left)) m.setAttribute('data-sia-left', String(left));
  }
  window.addEventListener('sia:meter', function (e) {
    meterState = e.detail; paintMeter();
    offerOneLeft(e.detail);
  });
  var mo = null;
  function watchMeter() {
    var m = document.querySelector('#lea-root .lea-meter'); if (!m) return false;
    if (!meterState && SIA()) { var x = SIA().meter(); meterState = { used: x.used, cap: x.cap, remaining: x.remaining, ownKey: x.ownKey, full: x.remaining <= 0 && !x.ownKey }; }
    mo = new MutationObserver(function () { paintMeter(); });
    mo.observe(m, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden', 'title'] });
    paintMeter(); return true;
  }

  /* ---------------------------------------------------------------- drop files on the panel; announce a finished PDF */
  function wirePanel() {
    var root = document.getElementById('lea-root'); if (!root) return;
    ['dragenter', 'dragover'].forEach(function (ev) { root.addEventListener(ev, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) { e.preventDefault(); root.classList.add('sia-dropping'); } }); });
    ['dragleave', 'drop'].forEach(function (ev) { root.addEventListener(ev, function () { root.classList.remove('sia-dropping'); }); });
    root.addEventListener('paste', function (e) {
      if (e.target && e.target.closest && e.target.closest('.lea-in')) {
        var dt = e.clipboardData;
        if (dt && dt.files && dt.files.length) { e.preventDefault(); SIA().addFiles(dt.files); onFilesArrived(dt.files.length); }
        return;
      }
      if (e.clipboardData) { e.preventDefault(); SIA().ingestClipboard(e.clipboardData).then(function (r) { if (r && r.added) onFilesArrived(r.added); }); }
    });
    root.addEventListener('drop', function (e) {
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      e.preventDefault(); SIA().addFiles(e.dataTransfer.files);
      onFilesArrived(e.dataTransfer.files.length);
    });
    var form = document.getElementById('formError');
    new MutationObserver(function () { if (agentGenerated && !form.hidden && form.textContent) { agentGenerated = false; say(form.textContent); } }).observe(form, { attributes: true, childList: true, characterData: true, subtree: true });
  }
  // a reply outside a command (drop, PDF ready): same bubble classes + same TTS rules as agent.js (es-MX / en-US, mute respected)
  function speak(text) {
    var muted = false; try { muted = localStorage.getItem('le-agent-mute') === '1'; } catch (e) { }
    if (!muted && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text); u.lang = L() === 'en' ? 'en-US' : 'es-MX'; speechSynthesis.speak(u); } catch (e) { }
    }
    window.dispatchEvent(new CustomEvent('le-agent:say', { detail: { text: text, spoken: !muted, lang: L(), source: 'sia' } }));
  }
  function say(text) {
    var log = document.querySelector('#lea-root .lea-log');
    if (log) { var d = document.createElement('div'); d.className = 'lea-msg lea-a'; d.setAttribute('data-who', 'a'); d.setAttribute('data-cmd', 'sia'); d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; }
    speak(text);
  }
  // a reply with buttons: each button runs its data-run text through the panel like a typed command
  function sayButtons(text, buttons) {
    var log = document.querySelector('#lea-root .lea-log');
    if (log) {
      var d = document.createElement('div'); d.className = 'lea-msg lea-a'; d.setAttribute('data-who', 'a'); d.setAttribute('data-cmd', 'sia');
      var tx = document.createElement('div'); tx.textContent = text; d.appendChild(tx);
      var o = document.createElement('div'); o.className = 'lea-opts';
      buttons.forEach(function (b) {
        var x = document.createElement('button'); x.type = 'button'; x.setAttribute('data-run', b.run); x.textContent = b.label;
        if (b.ghost) x.className = 'lea-ghost';
        o.appendChild(x);
      });
      d.appendChild(o); log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    speak(text);
  }
  window.addEventListener('le-agent:ready', function () { if (!watchMeter()) setTimeout(watchMeter, 300); wirePanel(); setTimeout(bootGuide, 400); });

  function offerFor(f) {
    if (/archivo|file|subir|upload|pega|paste/.test(f)) return { type: 'open_file_picker' };
    if (/paleta|palette|color/.test(f)) return { type: 'list_palettes' };
    if (/compart|share|whatsapp/.test(f)) return { type: 'share' };
    if (/genera|generate/.test(f)) return { type: 'generate' };
    if (/tareas|homework|lista|list/.test(f) && !/mas|more/.test(f)) return { type: 'open_list' };
    return null;
  }
  function onFilesArrived(n) {
    say(tr('Agregué ' + n + ' archivo(s) a la tarea.', 'Added ' + n + ' file(s) to the homework.'));
  }
  function startGuide(mode, direct) {
    guide.mode = mode; guide.step = 'intro';
    try { localStorage.setItem('sia-guide-mode', mode); sessionStorage.setItem('sia-guide-started', '1'); } catch (e) {}
    if (mode === 'text') {
      try { sessionStorage.setItem('le-agent-micblocked', '1'); } catch (e2) {}
    }
    var msg = tr('¡Hola! Soy Ix Ajaw. ¿Cómo te llamas? ¿Qué tarea traes hoy?', 'Hi! I am Ix Ajaw. What is your name? What homework are you bringing today?');
    if (direct) say(msg);
    return msg;
  }
  function bootGuide() {
    var mode = null; try { mode = localStorage.getItem('sia-guide-mode'); } catch (e) {}
    var started = false; try { started = sessionStorage.getItem('sia-guide-started') === '1'; } catch (e2) {}
    if (started) { guide.mode = mode || ''; return; }
    if (mode === 'voice' || mode === 'text') { startGuide(mode, true); return; }
    var q = tr('Hola, soy Ix Ajaw. ¿Prefieres voz o texto?', 'Hi, I am Ix Ajaw. Would you like voice or text?');
    sayButtons(q, [{ label: tr('Voz', 'Voice'), run: 'prefiero voz' }, { label: tr('Texto', 'Text'), run: 'prefiero texto' }]);
  }

  /* ---- guided conversation: name/task -> grupo -> maestro -> file -> proposal -> generate */
  var Q_FILE_ES = '¿Me pasas el archivo de la tarea? Puedes subirlo, pegarlo, arrastrarlo, decirme su nombre o darme un enlace de Drive.';
  var Q_FILE_EN = 'Can you send the homework file? You can upload it, paste it, drop it, tell me its name or give me a Drive link.';
  function profileAsked() { try { return localStorage.getItem('sia-profile-asked') === '1'; } catch (e) { return false; } }
  function nextProfileStep(s) {
    if (!profileAsked()) { if (!s.grupo()) return 'grupo'; if (!s.maestro()) return 'maestro'; }
    return 'file';
  }
  function questionFor(step) {
    if (step === 'grupo') return tr('¿De qué grupo eres? (por ejemplo 3A)', 'Which group are you in? (for example 3A)');
    if (step === 'maestro') return tr('¿Y quién es tu maestro o maestra? Puedes decir “no sé”.', 'And who is your teacher? You can say “I do not know”.');
    return tr(Q_FILE_ES, Q_FILE_EN);
  }
  function goStep(step, s) {
    guide.step = step;
    if (step === 'file') { markProfileAsked(); if (s.fileInfo().length) setTimeout(fileSuggest, 200); }
    return { type: 'help', value: questionFor(step) };
  }
  var SKIP = /^(no se|no sé|ninguno|ninguna|saltar|omitir|paso|skip|none|no tengo|despues|luego|i do not know|i dont know|dont know)$/;
  function looksLikeCommand(f) {
    return /^(sube|subir|adjunta|adjuntar|pega|pegar|genera|generar|comparte|compartir|abre|abrir|cambia|cierra|ayuda|help|mis tareas|quiero|pide|pedir|quita|borra|crea|usa|upload|attach|paste|generate|share|open|change|close|remove|clear|create|what|how|como|que|donde|cuantas|ya me)\b/.test(f);
  }
  function guidedParse(t, f, s) {
    if (!guide.step || guide.step === 'choose' || guide.step === 'done') return null;
    if (looksLikeCommand(f) && guide.step !== 'confirm') return null;
    if (guide.step === 'intro') {
      var name = '', rest = t;
      var gmi = /\b(?:del\s+)?grupo\s+([A-Za-z0-9\-]{1,12})\b/i.exec(rest);
      var acts = [];
      if (gmi) { s.setGrupo(gmi[1]); acts.push({ type: 'set_grupo', value: gmi[1] }); rest = rest.replace(gmi[0], ' ').replace(/\s+,/g, ',').trim(); }
      var nm = /(?:me llamo|mi nombre es|soy|my name is|i am|i'm)\s+([^,.]+)/i.exec(rest);
      if (nm) name = stripLead(nm[1]);
      else if (rest.split(/[,.]/).length && rest.length <= 40 && !/tarea|balanza|archivo|homework|file/.test(fold(rest))) name = rest;
      if (name) rest = rest.replace(nm ? nm[0] : rest, '').replace(/^[\s,.;]+/, '');
      if (name && name.length >= 2) { name = name.replace(/[.!]+$/, ''); s.setName(name); acts.push({ type: 'set_name', value: name }); }
      var task = stripLead(rest);
      var tv = /^(?:traigo|tengo|necesito|quiero|vengo con|vengo por|i have|i need|i want)\s+(?:hacer\s+|elaborar\s+|a\s+)?(.+)$/i.exec(task);
      if (tv) task = tr('Elabora ', 'Prepare ') + tv[1];
      if (task && task.length > 6) { s.setPrompt(task); acts.push({ type: 'set_prompt', value: task }); }
      var nx = nextProfileStep(s);
      var hello = (name ? tr('Mucho gusto, ' + name + '. ', 'Nice to meet you, ' + name + '. ') : '');
      var q = goStep(nx, s);
      q.value = hello + q.value;
      acts.push(q);
      return acts;
    }
    if (guide.step === 'grupo') {
      var gv = '';
      if (!SKIP.test(f)) { gv = stripLead(t.replace(/^(?:mi grupo es|soy del grupo|soy del|es el grupo|grupo|gpo|my group is|group)\s+/i, '')); if (gv.length > 20) gv = ''; }
      var out = [];
      if (gv) { s.setGrupo(gv); out.push({ type: 'set_grupo', value: gv }); }
      out.push(goStep(!s.maestro() && !profileAsked() ? 'maestro' : 'file', s));
      if (guide.step === 'file') markProfileAsked();
      return out;
    }
    if (guide.step === 'maestro') {
      var mv = '';
      if (!SKIP.test(f)) { mv = stripLead(t.replace(/^(?:mi (?:maestro|maestra|profesor|profesora|docente) es|es el maestro|es la maestra|es el|es la|my teacher is|teacher)\s+/i, '')); if (mv.length > 60) mv = ''; }
      var out2 = [];
      if (mv) { s.setMaestro(mv); out2.push({ type: 'set_maestro', value: mv }); }
      out2.push(goStep('file', s));
      return out2;
    }
    if (guide.step === 'file') {
      if (s.fileInfo().length) {
        guide.step = 'confirm';
        var task2 = s.prompt() || '';
        return [{ type: 'help', value: tr('Ya tengo el archivo. ¿Quieres que elabore' + (task2 ? ': “' + task2 + '”' : ' la tarea') + '?', 'I have the file. Shall I prepare' + (task2 ? ': “' + task2 + '”' : ' the homework') + '?') }];
      }
      return null;
    }
    if (guide.step === 'confirm' && /^(si|sí|yes|ok|dale|va|hazlo|genera|adelante|go ahead|do it)$/.test(f)) {
      guide.step = 'done';
      return [{ type: 'generate' }];
    }
    return null;
  }

  /* ---- 1 homework left: the panel opens by itself and offers +10 (auto-approved, max 200) */
  var queuedOneLeft = null;
  function panelReady() { return !!document.querySelector('#lea-root .lea-log'); }
  function offerOneLeft(m) {
    if (!m || m.ownKey || m.remaining !== 1) return;
    if (m.cap >= (m.max || 200)) return;
    if (!panelReady() || !SIA()) { queuedOneLeft = m; return; }
    var key = 'sia-offer1-' + SIA().browserId() + '-' + m.cap;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) { }
    pendingOffer = { type: 'request_more' };
    if (window.LEAgent && !window.LEAgent.isOpen()) window.LEAgent.open({ via: 'auto' });
    sayButtons(tr('Te queda 1 tarea, ¿agrego 10 más?', 'You have 1 homework left, shall I add 10 more?'),
      [{ label: tr('Sí', 'Yes'), run: 'sí' }, { label: tr('Ahora no', 'Not now'), run: 'ahora no', ghost: true }]);
  }
  window.addEventListener('le-agent:ready', function () { setTimeout(function () { if (queuedOneLeft) { var q = queuedOneLeft; queuedOneLeft = null; offerOneLeft(q); } }, 900); });

  /* ---- proactive guidance: at most one suggestion per state change, always dismissible */
  var suggested = {};
  function suggestOff() { try { return localStorage.getItem('sia-suggest-off') === '1'; } catch (e) { return false; } }
  function guideActive() { return guide.step && guide.step !== 'done'; }
  function busyNow() { var b = document.getElementById('busy'); return !!(b && !b.hidden); }
  function once(key) { if (suggested[key]) return false; suggested[key] = 1; return true; }
  var NOMORE = function () { return { label: tr('No más avisos', 'No more tips'), run: 'no más avisos', ghost: true }; };
  var NO = function () { return { label: '✕', run: 'ahora no', ghost: true }; };

  function fileSuggest() {
    var s = SIA(); if (!s || !s.fileInfo().length || suggestOff() || busyNow()) return;
    if (guide.step === 'grupo' || guide.step === 'maestro') return;       // finish the questions first; goStep('file') retries
    var key = 'file:' + s.fileInfo().map(function (f) { return f.name + f.size; }).join('|');
    if (!once(key)) return;
    if (s.hasPrompt()) {
      if (guide.step === 'file' || guide.step === 'intro') {
        guide.step = 'confirm';
        say(tr('Ya tengo el archivo. ¿Quieres que elabore: “' + s.prompt().trim() + '”?', 'I have the file. Shall I prepare: “' + s.prompt().trim() + '”?'));
      }
      return;
    }
    s.suggest('summary').then(function (r) {
      if (!r || !r.ok || !r.task) throw new Error('no suggestion');
      pendingOffer = { type: 'apply_proposal', value: r.task };
      if (guide.step === 'file' || guide.step === 'intro') guide.step = 'confirm';
      sayButtons(tr('Vi tu archivo: ' + r.summary + ' Te propongo: “' + r.task + '”. ¿La hago?', 'I looked at your file: ' + r.summary + ' I suggest: “' + r.task + '”. Shall I do it?'),
        [{ label: tr('Sí, hazla', 'Yes, do it'), run: 'sí' }, { label: tr('Cambiar', 'Change'), run: 'quiero cambiar la tarea', ghost: true }, NO(), NOMORE()]);
    }).catch(function () {
      pending = 'prompt';
      if (guide.step === 'file' || guide.step === 'intro') guide.step = 'confirm';
      say(tr('Recibí el archivo. ¿Qué quieres que haga con él? Dímelo o escríbelo en el prompt.', 'I got the file. What do you want me to do with it? Tell me or type it in the prompt.'));
    });
  }
  function maybeAskName() {
    var s = SIA(); if (!s || suggestOff() || guideActive() || s.name() || busyNow()) return;
    if (!once('noname')) return;
    pending = 'name';
    sayButtons(tr('Aún no sé tu nombre. ¿Cómo te llamas? Así sale en tu PDF.', 'I do not know your name yet. What is it? It goes on your PDF.'),
      [{ label: tr('Anónimo', 'Anonymous'), run: 'sin nombre', ghost: true }, NO(), NOMORE()]);
  }
  function isVague(p) {
    p = String(p || '').trim(); if (!p) return false;
    var words = p.split(/\s+/);
    return words.length < 4 || (words.length < 6 && /^(hazla|hazlo|haz la tarea|la tarea|tarea|ayuda|help|do it|homework|resuelve|resuelvela|resuelvelo)\b/i.test(fold(p)));
  }
  function vagueSuggest() {
    var s = SIA(); if (!s || suggestOff() || busyNow() || guideActive()) return;
    var p = s.prompt().trim();
    if (!isVague(p)) { if (p) maybeAskName(); return; }
    if (!once('vague:' + fold(p))) return;
    if (s.fileInfo().length) {
      s.suggest('improve').then(function (r) {
        if (!r || !r.ok || !r.task) throw new Error('no suggestion');
        pendingOffer = { type: 'apply_prompt', value: r.task };
        sayButtons(tr('Tu instrucción es corta. ¿Qué tal esta: “' + r.task + '”?', 'Your instruction is short. How about: “' + r.task + '”?'),
          [{ label: tr('Sí, usa esa', 'Yes, use it'), run: 'sí' }, { label: tr('Dejarla así', 'Keep mine'), run: 'ahora no', ghost: true }, NOMORE()]);
      }).catch(function () { });
    } else {
      sayButtons(tr('Tu instrucción es muy corta. Cuéntame qué quieres que arme, por ejemplo: “balanza de comprobación con saldos iniciales, cargos y abonos”.', 'Your instruction is very short. Tell me what to build, for example: “trial balance with opening balances, debits and credits”.'),
        [NO(), NOMORE()]);
    }
  }
  function fmtN(n) { var x = Number(n); return isFinite(x) ? x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(n); }
  var seenPdf = {};
  function afterGenerated(res) {
    if (suppressGenSuggest) { suppressGenSuggest = false; return; }
    if (suggestOff() || !res || seenPdf[res.pdfId]) return;
    seenPdf[res.pdfId] = 1;
    var hw = res.homework || {}, k = hw.kpis || {}, comp = hw.comprobacion || null;
    var warns = (res.extraction && res.extraction.warnings) || [];
    var parts = [tr('Tu PDF está listo: “' + (res.title || '') + '”.', 'Your PDF is ready: “' + (res.title || '') + '”.')];
    var bad = (comp && comp.ok === false) || k.cuadra === false;
    if (bad) parts.push(tr('Ojo: el debe y el haber no cuadran' + (comp ? ' (' + fmtN(comp.debe) + ' contra ' + fmtN(comp.haber) + ')' : '') + '. Revisa los movimientos del archivo.', 'Heads up: debit and credit do not match' + (comp ? ' (' + fmtN(comp.debe) + ' vs ' + fmtN(comp.haber) + ')' : '') + '. Check the movements in the file.'));
    else if (comp && comp.ok) parts.push(tr('La comprobación cuadra: debe = haber = ' + fmtN(comp.debe) + '.', 'The check ties: debit = credit = ' + fmtN(comp.debe) + '.'));
    if (warns.length) parts.push(tr('No pude leer bien: ' + warns.map(function (w) { return w.file || w.text || w; }).join(', ') + '. ¿Lo subes en otro formato?', 'I could not read well: ' + warns.map(function (w) { return w.file || w.text || w; }).join(', ') + '. Can you upload it in another format?'));
    if (res.meter && res.meter.remaining === 1 && !res.usedOwnKey) return;   // the 1-left offer takes this slot
    parts.push(tr('¿La mando por WhatsApp?', 'Shall I send it on WhatsApp?'));
    pendingOffer = { type: 'share' };
    sayButtons(parts.join(' '), [{ label: 'WhatsApp', run: 'sí' }, { label: tr('Abrir PDF', 'Open PDF'), run: 'abre el pdf', ghost: true }, NO(), NOMORE()]);
  }
  var tFiles = null, tPrompt = null, lastFileCount = 0;
  window.addEventListener('sia:files', function (e) {
    var n = (e.detail && e.detail.n) || 0;
    var grew = n > lastFileCount; lastFileCount = n;
    if (!grew) return;
    clearTimeout(tFiles);
    tFiles = setTimeout(function () {
      var s = SIA(); if (!s) return;
      if (!s.hasPrompt()) fileSuggest(); else { fileSuggest(); if (!guideActive()) maybeAskName(); }
    }, 1000);
  });
  window.addEventListener('sia:generated', function (e) { afterGenerated(e.detail); });
  function wirePrompt() {
    var pr = document.getElementById('prompt');
    if (pr) pr.addEventListener('input', function () { clearTimeout(tPrompt); tPrompt = setTimeout(vagueSuggest, 2600); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePrompt); else wirePrompt();

})();
