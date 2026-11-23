(function () {
  var I18N = {
    es: {
      sub: 'Tareas de <span class="kw">Contaduría</span> · UT Tulum',
      tareas: 'Mis tareas', tokens: '{used} / {cap} tareas',
      mainTitle: 'Nueva tarea',
      lede: 'Sube los archivos, escribe el prompt y elige el estilo. El agente arma un PDF listo para compartir.',
      filesH: 'Archivos de la tarea',
      filesHint: 'Arrastra, pega (Ctrl+V) o toca para subir cualquier formato: Word, Excel, PDF, imágenes, tablas…',
      promptH: 'Prompt', promptHint: 'Describe lo que debe hacer el agente con esos archivos.',
      promptPh: 'Ejemplo: elabora una balanza de comprobación a partir de los asientos y explícala en un párrafo.',
      styleH: 'Hoja de estilo',
      styleHint: 'Por defecto se usa SI Agents – Verde Selva (Valeria). Puedes sustituirla arrastrando otra hoja.',
      styleDefault: 'SI Agents – Verde Selva (Valeria)',
      nameL: 'Tu nombre (opcional)', nameSub: 'Si lo dejas vacío, la tarea sale como anónima.',
      namePh: 'Anónimo', cta: 'Generar tarea',
      footer: 'SI Agents · Contaduría · UT Tulum',
      resultTitle: 'Tu PDF está listo',
      resultLede: 'Tarea para {name}. Revisa, descarga o compártela por WhatsApp.',
      download: 'Descargar PDF', share: 'Compartir por WhatsApp',
      listTitle: 'Mis tareas', listLede: 'PDFs hechos en este navegador.',
      open: 'Abrir', emptyList: 'Aún no hay tareas en este navegador.',
      capTitle: 'Llegaste al límite de {cap} tareas',
      capLede: 'Usaste las {cap} tareas de este navegador. Pide 10 más (se aprueban al instante) o conecta tu propio agente.',
      capLimitTitle: 'Límite de {max} tareas alcanzado',
      capLimitLede: 'Este navegador llegó al máximo de {max} tareas gratis. Conecta tu propio agente de xAI para seguir con tus tokens.',
      connectH: 'Conectar tu propio agente',
      connectLede: 'Pega tu clave de xAI. Se guarda solo en este navegador, no en la base de datos.',
      connectPh: 'xai-…', connectCta: 'Conectar agente', keySaved: 'Clave guardada en este navegador.',
      hello: '¡Hola! ¿En qué te ayudo?', inputPh: 'Escribe un comando',
      working: 'Generando tu tarea…', capMsg: 'Límite alcanzado. Conecta tu propio agente para seguir.',
      errGeneric: 'No se pudo generar la tarea. Inténtalo de nuevo.',
      errCap: 'Llegaste al límite de 10 tareas en este navegador.',
      clearAll: 'Quitar todos', removeFile: 'Quitar', alreadyAttached: 'Ya adjuntado',
      pasteHere: 'Pega aquí una imagen, un archivo o una tabla',
      pastedTable: 'tabla-pegada.tsv', pastedText: 'texto-pegado.txt', pastedImage: 'captura.png',
      fileWarn: 'Algunos archivos pueden no leerse bien: {names}',
      extractWarn: 'Hubo problemas al leer archivos: {names}',
      requestMore: 'Pedir más tareas',
      requestOk: 'Listo: te agregué {added} tareas. Ahora tienes {cap} (te quedan {rem}).',
      requestNotYet: 'Aún te quedan {rem} tareas. Cuando te quede 1 puedes pedir 10 más.',
      requestLimit: 'Llegaste al límite de {max} tareas gratis. Conecta tu propio agente de xAI para seguir.',
      errDaily: 'Hoy se alcanzó el límite global de tareas gratis. Inténtalo mañana o conecta tu propio agente.',
      grupoL: 'Tu grupo', grupoSub: 'Se pregunta una sola vez.', grupoPh: 'Ej. 3A',
      maestroL: 'Tu maestro(a)', maestroSub: 'Para enviarle el resumen del grupo.', maestroPh: 'Nombre del maestro',
      batchH: 'Preparar lote para un maestro', batchLede: 'Elige grupo o maestro y un rango de fechas. Se arma un resumen en PDF con enlaces y un borrador de correo; no se envía nada solo.',
      batchGrupo: 'Grupo', batchMaestro: 'Maestro', batchFrom: 'Desde', batchTo: 'Hasta', batchGo: 'Preparar lote', batchSend: 'Enviar este borrador',
      batchDone: 'Lote {id}: {n} tareas de {m} estudiantes.', batchNoTo: 'Sin destinatarios: agrega el correo del maestro en la pestaña Maestros.',
      batchConfirm: '¿Enviar este correo a {to}? Esta acción envía el mensaje de verdad.',
      requestNeed: 'Cuéntame por qué las necesitas, o pulsa de nuevo para enviar la solicitud.',
      adminTitle: 'Directorio (admin)',
      adminLede: 'Importa la lista de estudiantes o maestros desde Excel, CSV, Word, PDF o una lista pegada.',
      adminKeyL: 'Clave de administración', adminUnlock: 'Entrar', adminBad: 'Clave incorrecta.',
      adminFilesH: 'Archivo o lista', adminFilesHint: 'Sube, arrastra o pega la lista. Revisa la vista previa antes de guardar.',
      adminPastePh: 'Pega aquí una lista…', adminParse: 'Vista previa', adminSave: 'Guardar',
      adminPreview: '{n} filas ({added} nuevas, {updated} que ya existían).',
      adminSaved: 'Guardado: {added} altas, {updated} actualizaciones.',
      palH: 'Paleta de colores', palHint: 'Elige la paleta por defecto o pídele al agente que cree una (por ejemplo “fondo verde más oscuro y botones dorados”).', palActive: 'por defecto'
    },
    en: {
      sub: '<span class="kw">Accounting</span> homework · UT Tulum',
      tareas: 'My homework', tokens: '{used} / {cap} homework',
      mainTitle: 'New homework',
      lede: 'Upload the files, write the prompt and choose a style. The agent builds a PDF ready to share.',
      filesH: 'Homework files',
      filesHint: 'Drag, paste (Ctrl+V) or tap to upload any format: Word, Excel, PDF, images, tables…',
      promptH: 'Prompt', promptHint: 'Tell the agent what to do with those files.',
      promptPh: 'Example: prepare a trial balance from the journal entries and explain it in one paragraph.',
      styleH: 'Style sheet',
      styleHint: 'Defaults to SI Agents – Verde Selva (Valeria). Drop another style sheet to replace it.',
      styleDefault: 'SI Agents – Verde Selva (Valeria)',
      nameL: 'Your name (optional)', nameSub: 'Leave it blank and the PDF stays anonymous.',
      namePh: 'Anonymous', cta: 'Generate homework',
      footer: 'SI Agents · Accounting · UT Tulum',
      resultTitle: 'Your PDF is ready',
      resultLede: 'Homework for {name}. Review it, download it, or share it on WhatsApp.',
      download: 'Download PDF', share: 'Share to WhatsApp',
      listTitle: 'My homework', listLede: 'PDFs made in this browser.',
      open: 'Open', emptyList: 'No homework in this browser yet.',
      capTitle: 'You have used all {cap} homework slots',
      capLede: 'You used the {cap} homework slots of this browser. Ask for 10 more (approved instantly) or connect your own agent.',
      capLimitTitle: 'Limit of {max} homework reached',
      capLimitLede: 'This browser reached the maximum of {max} free homework. Connect your own xAI agent to keep going on your tokens.',
      connectH: 'Connect your own agent',
      connectLede: 'Paste your xAI key. It stays in this browser only, not in the database.',
      connectPh: 'xai-…', connectCta: 'Connect agent', keySaved: 'Key saved in this browser.',
      hello: 'Hi! How can I help?', inputPh: 'Type a command',
      working: 'Generating your homework…', capMsg: 'Cap reached. Connect your own agent to continue.',
      errGeneric: 'Could not generate the homework. Please try again.',
      errCap: 'You have used all 10 homework slots in this browser.',
      clearAll: 'Clear all', removeFile: 'Remove', alreadyAttached: 'Already attached',
      pasteHere: 'Paste an image, a file or a table here',
      pastedTable: 'pasted-table.tsv', pastedText: 'pasted-text.txt', pastedImage: 'screenshot.png',
      fileWarn: 'Some files may not be readable: {names}',
      extractWarn: 'There were problems reading files: {names}',
      requestMore: 'Request more homework',
      requestOk: 'Done: I added {added} homework. You now have {cap} ({rem} left).',
      requestNotYet: 'You still have {rem} left. When 1 is left you can ask for 10 more.',
      requestLimit: 'You reached the limit of {max} free homework. Connect your own xAI agent to keep going.',
      errDaily: 'Today the global free homework limit was reached. Try tomorrow or connect your own agent.',
      grupoL: 'Your group', grupoSub: 'Asked only once.', grupoPh: 'e.g. 3A',
      maestroL: 'Your teacher', maestroSub: 'So the group summary can reach them.', maestroPh: 'Teacher name',
      batchH: 'Prepare a batch for a teacher', batchLede: 'Pick a group or teacher and a date range. It builds a summary PDF with links and an email draft; nothing is sent on its own.',
      batchGrupo: 'Group', batchMaestro: 'Teacher', batchFrom: 'From', batchTo: 'To', batchGo: 'Prepare batch', batchSend: 'Send this draft',
      batchDone: 'Batch {id}: {n} homework from {m} students.', batchNoTo: 'No recipients: add the teacher email in the Maestros tab.',
      batchConfirm: 'Send this email to {to}? This really sends the message.',
      requestNeed: 'Tell me why you need them, or press again to send the request.',
      adminTitle: 'Directory (admin)',
      adminLede: 'Import the student or teacher list from Excel, CSV, Word, PDF or a pasted list.',
      adminKeyL: 'Admin key', adminUnlock: 'Enter', adminBad: 'Wrong key.',
      adminFilesH: 'File or list', adminFilesHint: 'Upload, drag or paste the list. Review the preview before saving.',
      adminPastePh: 'Paste a list here…', adminParse: 'Preview', adminSave: 'Save',
      adminPreview: '{n} rows ({added} new, {updated} already there).',
      adminSaved: 'Saved: {added} added, {updated} updated.',
      palH: 'Color palette', palHint: 'Pick the default palette or ask the agent to build one (for example “darker green background, gold buttons”).', palActive: 'default'
    }
  };


  var SIA_API = 'https://script.google.com/macros/s/AKfycbyxG6n4aLkt8X_Rj1t2jX1AwndUf23u24YuJI9licEHo8g0ZeiU_45eb44Y8NQPfyfWhg/exec';
  function siaApi(action, data) {
    return fetch(SIA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action }, data || {}))
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      if (j && j.ok === false) {
        var err = new Error(j.error || 'request failed');
        throw err;
      }
      return j;
    });
  }

  var CAP = 10;
  var files = [];
  var styleName = null;
  var lastResult = null;
  var lastHomework = null;
  try { lastHomework = JSON.parse(sessionStorage.getItem('sia-homework') || 'null'); } catch (e0) {}

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'es'; }
  function t(k, vars) {
    var s = (I18N[lang()] && I18N[lang()][k]) || I18N.es[k] || k;
    vars = vars || {};
    return String(s).replace(/\{(\w+)\}/g, function (_, n) { return vars[n] != null ? vars[n] : ''; });
  }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var html = t(el.getAttribute('data-i18n'));
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = html;
      else el.textContent = html;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang() ? 'true' : 'false');
    });
    refreshMeterLabels();
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.documentElement.lang = b.getAttribute('data-lang') || 'es';
      try { localStorage.setItem('sia-lang', document.documentElement.lang); } catch (e) {}
      applyI18n();
    });
  });
    
  function noteAt(id, msg) {
    var el = document.getElementById(id); if (!el) return;
    el.hidden = !msg; el.textContent = msg || '';
  }
  function applyRequestResult(r) {
    if (r && r.cap != null) { meter.cap = r.cap; meter.used = r.used; meter.remaining = Math.max(0, r.cap - r.used); meter.max = r.max || meter.max; refreshMeterLabels(); }
    return r;
  }
  function requestMoreMsg(r) {
    if (!r) return t('errGeneric');
    if (r.status === 'approved') return t('requestOk', { added: r.added, cap: r.cap, rem: r.remaining });
    if (r.status === 'limit') return t('requestLimit', { max: r.max || 200 });
    if (r.status === 'not_yet') return t('requestNotYet', { rem: r.remaining });
    return t('errGeneric');
  }
  function doRequestMore(reason) {
    return siaApi('requestMore', { browserId: browserId(), name: document.getElementById('sia-name').value.trim(), reason: reason || 'Uso intenso' }).then(applyRequestResult);
  }
  document.getElementById('btnRequestMore').addEventListener('click', function () {
    doRequestMore('Botón Pedir más tareas')
      .then(function (r) {
        noteAt('requestNote', requestMoreMsg(r));
        if (r && r.status === 'approved') setTimeout(function () { show('main'); }, 1400);
      })
      .catch(function (e) { noteAt('requestNote', t('errGeneric')); });
  });

  var adminFiles = [];
  var adminPreviewRows = [];
  function adminKeyVal() { return (document.getElementById('adminKey') && document.getElementById('adminKey').value) || (function(){ try { return sessionStorage.getItem('sia-admin-key') || ''; } catch (e) { return ''; } })(); }
  function setAdminSession(k) { try { if (k) sessionStorage.setItem('sia-admin-key', k); } catch (e) {} }
  function showAdminBody(on) {
    document.getElementById('adminGate').hidden = !!on;
    document.getElementById('adminBody').hidden = !on;
  }
  document.getElementById('btnAdminUnlock').addEventListener('click', function () {
    var k = document.getElementById('adminKey').value;
    siaApi('adminAuth', { adminKey: k }).then(function () {
      setAdminSession(k); showAdminBody(true); noteAt('adminGateNote', '');
    }).catch(function () { noteAt('adminGateNote', t('adminBad')); });
  });
  document.getElementById('btnAdminBack').addEventListener('click', function () { show('main'); });
  document.getElementById('adminFileInput').addEventListener('change', function () {
    Array.from(this.files || []).forEach(function (f) { adminFiles.push(f); });
    this.value = '';
    document.getElementById('adminFileList').textContent = adminFiles.map(function (f) { return f.name; }).join(', ');
  });
  document.getElementById('btnAdminParse').addEventListener('click', function () {
    noteAt('adminNote', t('working'));
    Promise.all(adminFiles.map(readFile)).then(function (encoded) {
      return siaApi('parseStudents', { adminKey: adminKeyVal(), files: encoded, text: document.getElementById('adminPaste').value, lang: lang() });
    }).then(function (r) {
      adminPreviewRows = (r && r.rows) || [];
      var box = document.getElementById('adminPreview');
      box.hidden = !adminPreviewRows.length;
      box.innerHTML = '';
      adminPreviewRows.forEach(function (row) {
        var div = document.createElement('div');
        div.className = 'admin-row' + (row.duplicate ? ' dup' : '');
        div.textContent = (row.duplicate ? '↺ ' : '+ ') + row.nombre + ' · ' + (row.grupo || '—') + ' · ' + (row.rol || '') + (row.email ? ' · ' + row.email : '') + (row.repeatedInFile ? ' · ⧉ ×' + row.repeatedInFile + ' en el archivo (se fusiona)' : '');
        box.appendChild(div);
      });
      document.getElementById('btnAdminSave').hidden = !adminPreviewRows.length;
      noteAt('adminNote', t('adminPreview', { n: adminPreviewRows.length, added: r.added, updated: r.updated }));
    }).catch(function (e) { noteAt('adminNote', (e && e.message) || t('errGeneric')); });
  });
  document.getElementById('btnAdminSave').addEventListener('click', function () {
    siaApi('saveStudents', { adminKey: adminKeyVal(), rows: adminPreviewRows }).then(function (r) {
      noteAt('adminNote', t('adminSaved', { added: r.added, updated: r.updated }));
    }).catch(function (e) { noteAt('adminNote', (e && e.message) || t('errGeneric')); });
  });

  try {
    var savedLang = localStorage.getItem('sia-lang');
    if (savedLang === 'en' || savedLang === 'es') document.documentElement.lang = savedLang;
  } catch (e) {}

  function browserId() {
    var k = 'sia-browser-id';
    try {
      var v = localStorage.getItem(k);
      if (v && v.length >= 8) return v;
      v = 'b-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, v);
      return v;
    } catch (e) {
      return 'b-session-' + Date.now();
    }
  }
  function ownKey() {
    try { return localStorage.getItem('sia-xai-key') || ''; } catch (e) { return ''; }
  }
  function setOwnKey(v) {
    try {
      if (v) localStorage.setItem('sia-xai-key', v);
      else localStorage.removeItem('sia-xai-key');
    } catch (e) {}
  }

  ['grupo', 'maestro'].forEach(function (k) {
    var el = document.getElementById('sia-' + k); if (!el) return;
    try { el.value = localStorage.getItem('sia-' + k) || ''; } catch (e) {}
    el.addEventListener('input', function () { try { localStorage.setItem('sia-' + k, el.value.trim()); } catch (e2) {} window.dispatchEvent(new CustomEvent('sia:profile')); });
  });
  var meter = { used: 0, cap: CAP, remaining: CAP };
  function refreshMeterLabels() {
    var label = t('tokens', { used: meter.used, cap: meter.cap });
    document.getElementById('meterLabel').textContent = label;
    var chip = document.getElementById('meterChip');
    var full = meter.remaining <= 0 && !ownKey();
    chip.classList.toggle('cap', full);
    chip.classList.toggle('ok', !full);
    window.dispatchEvent(new CustomEvent('sia:meter', { detail: { used: meter.used, cap: meter.cap, remaining: meter.remaining, max: meter.max || 200, full: full, ownKey: !!ownKey(), label: label } }));
    document.getElementById('capBig').textContent = meter.used + ' / ' + meter.cap;
    var atMax = meter.cap >= (meter.max || 200);
    var ct = document.getElementById('capTitle'), cl = document.getElementById('capLede');
    if (ct) ct.textContent = atMax ? t('capLimitTitle', { max: meter.max || 200 }) : t('capTitle', { cap: meter.cap });
    if (cl) cl.textContent = atMax ? t('capLimitLede', { max: meter.max || 200 }) : t('capLede', { cap: meter.cap });
  }
  function loadMeter() {
    siaApi('meter', { browserId: browserId() })
      .then(function (res) { meter = (res && res.meter) || meter; refreshMeterLabels(); })
      .catch(function () {});
  }

  function show(view) {
    ['main', 'result', 'list', 'cap', 'admin'].forEach(function (v) {
      document.getElementById('view-' + v).hidden = (v !== view);
    });
    window.scrollTo(0, 0);
  }

  document.getElementById('btnTareas').addEventListener('click', function () { openList(); });
  document.getElementById('btnNewFromResult').addEventListener('click', function () { show('main'); });
  document.getElementById('btnNewFromList').addEventListener('click', function () { show('main'); });

  // files
  var fileInput = document.getElementById('fileInput');
  var fileList = document.getElementById('fileList');
  var KNOWN_EXT = /\.(docx?|odt|rtf|xlsx?|ods|csv|tsv|pptx?|odp|pdf|txt|md|json|jpe?g|png|webp|heic|heif|gif)$/i;
  function fileKey(f) { return String(f.name || '') + '|' + String(f.size || 0) + '|' + String(f.lastModified || 0); }
  function showFileNote(msg) {
    var n = document.getElementById('fileNote');
    if (!n) return;
    n.hidden = !msg;
    n.textContent = msg || '';
    if (msg) setTimeout(function () { if (n.textContent === msg) n.hidden = true; }, 3500);
  }
  function renderFiles() {
    fileList.innerHTML = '';
    files.forEach(function (f, i) {
      var sEl = document.createElement('span');
      sEl.className = 'filepill';
      var nm = document.createElement('span');
      nm.className = 'filepill-name';
      nm.textContent = f.name;
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'filepill-x';
      x.setAttribute('aria-label', t('removeFile') + ' ' + f.name);
      x.textContent = '×';
      x.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        files.splice(i, 1);
        fileInput.value = '';
        renderFiles();
      });
      sEl.appendChild(nm);
      sEl.appendChild(x);
      fileList.appendChild(sEl);
    });
    var clr = document.getElementById('btnClearFiles');
    if (clr) clr.hidden = !files.length;
    updateFileWarn();
    window.dispatchEvent(new CustomEvent('sia:files', { detail: { n: files.length } }));
  }
  function addFiles(list, opts) {
    opts = opts || {};
    var added = 0, dup = 0;
    Array.from(list || []).forEach(function (f) {
      if (!f) return;
      var k = fileKey(f);
      if (files.some(function (x) { return fileKey(x) === k; })) { dup++; return; }
      files.push(f); added++;
    });
    fileInput.value = '';
    renderFiles();
    if (dup && !added) showFileNote(t('alreadyAttached'));
    else if (dup) showFileNote(t('alreadyAttached') + ' · ' + added + ' +');
    return { added: added, dup: dup };
  }
  function foldName(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function nameScore(q, n) {
    q = foldName(q); n = foldName(n);
    if (!q || !n) return 0;
    if (q === n) return 4;
    if (n.indexOf(q) >= 0 || q.indexOf(n) >= 0) return 3;
    var stop = { el: 1, la: 1, los: 1, las: 1, de: 1, del: 1, archivo: 1, file: 1, the: 1, mi: 1, my: 1 };
    var qt = q.split(' ').filter(function (w) { return w.length > 2 && !stop[w]; });
    if (!qt.length) return 0;
    var hit = qt.filter(function (w) { return n.indexOf(w) >= 0; }).length;
    return hit && hit >= Math.ceil(qt.length / 2) ? 1 + hit / qt.length : 0;
  }
  function b64ToFile(b64, name, mime) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new File([arr], name, { type: mime || 'application/octet-stream', lastModified: 1 });
  }
  function extHint(q) {
    q = String(q || '').toLowerCase();
    if (/\b(docx?|word)\b/.test(q)) return /\.docx?$/;
    if (/\b(xlsx?|excel|csv|hoja de c[aá]lculo|spreadsheet)\b/.test(q)) return /\.(xlsx?|csv|tsv)$/;
    if (/\bpdf\b/.test(q)) return /\.pdf$/;
    return null;
  }
  function attachByName(q) {
    show('main');
    var hint = extHint(q);
    var best = null, bs = 0;
    files.forEach(function (f) { if (hint && !hint.test(String(f.name).toLowerCase())) return; var sc = nameScore(q, f.name); if (sc > bs) { best = f; bs = sc; } });
    if (best) return Promise.resolve({ status: 'already', name: best.name });
    var pickName = hint
      ? siaApi('sourceList', { browserId: browserId() }).then(function (r) {
          var c = ((r && r.sources) || []).filter(function (x) { return hint.test(String(x.name).toLowerCase()); });
          var top = null, ts = -1;
          c.forEach(function (x) { var sc = nameScore(q, x.name); if (sc > ts) { top = x; ts = sc; } });
          return top ? top.name : q;
        }).catch(function () { return q; })
      : Promise.resolve(q);
    return pickName.then(function (nm) { return siaApi('sourceFetch', { browserId: browserId(), name: nm }); }).then(function (r) {
      if (r && r.found) {
        var res = addFiles([b64ToFile(r.dataBase64, r.name, r.mime)]);
        return { status: res.added ? 'source' : 'already', name: r.name };
      }
      try { fileInput.click(); } catch (e) {}
      return { status: 'picker', name: q };
    }).catch(function () { try { fileInput.click(); } catch (e) {} return { status: 'picker', name: q }; });
  }
  function attachUrl(url) {
    show('main');
    return siaApi('fetchUrl', { browserId: browserId(), url: url }).then(function (r) {
      var res = addFiles([b64ToFile(r.dataBase64, r.name, r.mime)]);
      return { status: res.added ? 'url' : 'already', name: r.name };
    }).catch(function (e) { return { status: 'error', error: String(e && e.message || e) }; });
  }
  function suggestFiles(mode) {
    var pick = files.slice(0, 2), total = 0;
    pick.forEach(function (f) { total += f.size || 0; });
    if (!pick.length || total > 6 * 1024 * 1024) return Promise.resolve({ ok: false, error: 'no_files_or_big' });
    return Promise.all(pick.map(readFile)).then(function (enc) {
      return siaApi('suggest', { browserId: browserId(), lang: lang(), mode: mode || 'summary', prompt: document.getElementById('prompt').value, files: enc });
    });
  }
  function removeFileNamed(name) {
    var f = String(name || '').toLowerCase();
    var before = files.length;
    files = files.filter(function (x) { return String(x.name || '').toLowerCase().indexOf(f) < 0; });
    fileInput.value = '';
    renderFiles();
    return before - files.length;
  }
  function htmlTableToTsv(html) {
    var doc = new DOMParser().parseFromString(html || '', 'text/html');
    var tables = doc.querySelectorAll('table');
    if (!tables.length) return '';
    var out = [];
    tables.forEach(function (tb) {
      tb.querySelectorAll('tr').forEach(function (tr) {
        var cells = [];
        tr.querySelectorAll('th,td').forEach(function (td) { cells.push((td.innerText || '').replace(/\s+/g, ' ').trim()); });
        if (cells.length) out.push(cells.join('\t'));
      });
      out.push('');
    });
    return out.join('\n').trim();
  }
  function ingestClipboardData(dt) {
    if (!dt) return Promise.resolve({ added: 0, dup: 0 });
    var got = [];
    if (dt.files && dt.files.length) Array.from(dt.files).forEach(function (f) { got.push(f); });
    var items = dt.items ? Array.from(dt.items) : [];
    items.forEach(function (it) {
      if (it.kind === 'file') {
        var f = it.getAsFile && it.getAsFile();
        if (f && !got.some(function (x) { return fileKey(x) === fileKey(f); })) got.push(f);
      }
    });
    var html = '';
    try { html = dt.getData && dt.getData('text/html') || ''; } catch (e) { html = ''; }
    var text = '';
    try { text = dt.getData && dt.getData('text/plain') || ''; } catch (e2) { text = ''; }
    var tsv = html ? htmlTableToTsv(html) : '';
    if (tsv) got.push(new File([tsv], t('pastedTable'), { type: 'text/tab-separated-values' }));
    else if (text && !got.length) got.push(new File([text], t('pastedText'), { type: 'text/plain' }));
    return Promise.resolve(addFiles(got));
  }
  function pasteFromClipboard() {
    if (navigator.clipboard && navigator.clipboard.read) {
      return navigator.clipboard.read().then(function (items) {
        var jobs = [];
        items.forEach(function (item) {
          item.types.forEach(function (type) {
            jobs.push(item.getType(type).then(function (blob) {
              var name = type.indexOf('image/') === 0 ? t('pastedImage').replace('.png', type.indexOf('jpeg') >= 0 ? '.jpg' : '.png')
                : type === 'text/html' ? 'paste.html' : t('pastedText');
              if (type === 'text/html') {
                return blob.text().then(function (html) {
                  var tsv = htmlTableToTsv(html);
                  return tsv ? new File([tsv], t('pastedTable'), { type: 'text/tab-separated-values' }) : null;
                });
              }
              return new File([blob], name, { type: type });
            }));
          });
        });
        return Promise.all(jobs).then(function (list) { return addFiles(list.filter(Boolean)); });
      }).catch(function () {
        if (navigator.clipboard.readText) {
          return navigator.clipboard.readText().then(function (text) {
            if (!text) return { added: 0, dup: 0 };
            return addFiles([new File([text], t('pastedText'), { type: 'text/plain' })]);
          });
        }
        return { added: 0, dup: 0 };
      });
    }
    if (navigator.clipboard && navigator.clipboard.readText) {
      return navigator.clipboard.readText().then(function (text) {
        if (!text) return { added: 0, dup: 0 };
        return addFiles([new File([text], t('pastedText'), { type: 'text/plain' })]);
      });
    }
    return Promise.resolve({ added: 0, dup: 0 });
  }
  function updateFileWarn() {
    var el = document.getElementById('extractWarn');
    if (!el) return;
    var odd = files.filter(function (f) {
      var typ = f.type || '';
      return !KNOWN_EXT.test(f.name || '') && typ.indexOf('image/') !== 0 && typ.indexOf('text/') !== 0;
    });
    if (!odd.length) { if (!el.getAttribute('data-from-api')) { el.hidden = true; el.textContent = ''; } return; }
    el.hidden = false;
    el.removeAttribute('data-from-api');
    el.textContent = t('fileWarn', { names: odd.map(function (f) { return f.name; }).join(', ') });
  }
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); });
  var btnClear = document.getElementById('btnClearFiles');
  if (btnClear) btnClear.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); files = []; fileInput.value = ''; renderFiles(); });
  var pasteEl = document.getElementById('filePaste');
  if (pasteEl) {
    pasteEl.addEventListener('paste', function (e) {
      e.preventDefault();
      ingestClipboardData(e.clipboardData);
      pasteEl.textContent = '';
    });
  }
  document.addEventListener('paste', function (e) {
    var tEl = e.target;
    if (tEl && tEl.closest && tEl.closest('textarea, input, .lea-in, #adminPaste, #adminKey, #userKey, #sia-name, #prompt')) return;
    if (e.clipboardData && ((e.clipboardData.files && e.clipboardData.files.length) || (e.clipboardData.types && Array.prototype.slice.call(e.clipboardData.types).some(function (x) { return /^image\//.test(x) || x === 'Files' || x === 'text/html'; })))) {
      e.preventDefault();
      ingestClipboardData(e.clipboardData);
    }
  });

  document.getElementById('styleInput').addEventListener('change', function () {
    if (this.files[0]) {
      styleName = this.files[0].name;
      document.getElementById('stylePill').textContent = styleName;
    }
  });

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        var res = String(r.result || '');
        var b64 = res.replace(/^data:[^;]+;base64,/, '');
        resolve({ name: file.name, mime: file.type || 'application/octet-stream', dataBase64: b64 });
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function setBusy(on) {
    document.getElementById('busy').hidden = !on;
    document.getElementById('btnGenerate').disabled = !!on;
  }
  function showError(msg) {
    var el = document.getElementById('formError');
    el.hidden = !msg;
    el.textContent = msg || '';
  }

  document.getElementById('formMain').addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');
    if (meter.remaining <= 0 && !ownKey()) { show('cap'); return; }
    var prompt = document.getElementById('prompt').value.trim();
    if (!prompt) { showError(t('promptHint')); return; }
    setBusy(true);
    Promise.all(files.map(readFile)).then(function (encoded) {
      var payload = {
        browserId: browserId(),
        name: document.getElementById('sia-name').value.trim(),
        prompt: prompt,
        lang: lang(),
        styleName: styleName || paletteLabel(),
        files: encoded,
        grupo: (document.getElementById('sia-grupo').value || '').trim(),
        maestro: (document.getElementById('sia-maestro').value || '').trim(),
        userApiKey: ownKey(),
        palette: activePalette()
      };
      siaApi('generate', { payload: payload })
        .then(onGenerated)
        .catch(onFail);
    }).catch(function () { setBusy(false); showError(t('errGeneric')); });
  });

  function onGenerated(res) {
    setBusy(false);
    if (!res || !res.ok) { showError(t('errGeneric')); return; }
    lastResult = res;
    if (res.homework) { lastHomework = res.homework; try { sessionStorage.setItem('sia-homework', JSON.stringify(res.homework)); } catch (e) {} }
    if (res.meter) { meter = res.meter; refreshMeterLabels(); }
    window.dispatchEvent(new CustomEvent('sia:generated', { detail: res }));
    var ew = document.getElementById('extractWarn');
    var warns = (res.extraction && res.extraction.warnings) || [];
    if (ew && warns.length) {
      ew.hidden = false;
      ew.setAttribute('data-from-api', '1');
      ew.textContent = t('extractWarn', { names: warns.map(function (w) { return w.file || w.text || w; }).join(', ') });
    } else if (ew) { ew.hidden = true; ew.removeAttribute('data-from-api'); }
    var name = res.name || t('namePh');
    document.getElementById('resultLede').textContent = t('resultLede', { name: name });
    document.getElementById('resultTitle').textContent = res.title || '';
    document.getElementById('resultMeta').textContent = (res.model ? res.model + ' · ' : '') + (res.usage && res.usage.total ? res.usage.total + ' tokens' : '');
    document.getElementById('resultName').textContent = name + ' · ' + (styleName || paletteLabel());
    var preview = (res.pdfUrl || '').replace(/\/view\?.*$/, '/preview');
    document.getElementById('pdfFrame').src = preview;
    document.getElementById('btnDownload').href = res.pdfUrl;
    document.getElementById('btnWa').href = res.waUrl;
    show('result');
  }
  function onFail(err) {
    setBusy(false);
    var msg = (err && (err.message || err)) ? String(err.message || err) : '';
    if (msg.indexOf('CAP_REACHED') !== -1) { show('cap'); return; }
    if (msg.indexOf('DAILY_CAP') !== -1) { showError(t('errDaily')); return; }
    showError(t('errGeneric'));
  }

  function renderList(items) {
    var ul = document.getElementById('hwList');
    ul.innerHTML = '';
    if (!items || !items.length) {
      var p = document.createElement('li');
      p.className = 'item';
      p.innerHTML = '<div><h2></h2></div>';
      p.querySelector('h2').textContent = t('emptyList');
      ul.appendChild(p);
    } else {
      items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'item';
        var wa = 'https://wa.me/?text=' + encodeURIComponent((lang() === 'en' ? 'SI Agents homework: ' : 'Tarea SI Agents: ') + (it.description || '') + ' — ' + (it.pdfUrl || ''));
        li.innerHTML = '<div><h2></h2><p class="meta"></p></div><div class="item-acts"><a target="_blank" rel="noopener" class="open"></a><a target="_blank" rel="noopener" class="wa"></a></div>';
        li.querySelector('h2').textContent = it.description || it.prompt || '';
        li.querySelector('.meta').textContent = (it.local || '') + ' · ' + (it.name || '');
        var a = li.querySelector('.open'); a.href = it.pdfUrl || '#'; a.textContent = t('open');
        var w = li.querySelector('.wa'); w.href = wa; w.textContent = t('share');
        ul.appendChild(li);
      });
    }
    show('list');
  }
  function openList() {
    siaApi('list', { browserId: browserId() })
      .then(function (res) { renderList((res && res.items) || []); })
      .catch(function () { show('list'); });
  }

  document.getElementById('btnSaveKey').addEventListener('click', function () {
    var v = document.getElementById('userKey').value.trim();
    if (!v) return;
    setOwnKey(v);
    document.getElementById('userKey').value = '';
    var note = document.getElementById('keyNote');
    note.hidden = false;
    note.textContent = t('keySaved');
    refreshMeterLabels();
    show('main');
  });


  /* ---------- palettes (per browser, localStorage) ---------- */
  var PAL_KEY = 'sia-palettes', PAL_DEF = 'sia-palette-default';
  var BUILTIN_PALETTES = [
    { id: 'verde-selva', name: 'SI Agents – Verde Selva (Valeria)', builtin: true,
      top: '#00112D', bottom: '#1A2613', panel: '#0B334F', button: '#FECE61', accent: '#CB9A47', accent2: '#0CB3C7', text: '#FFFFFF' },
    { id: 'valeria-navy', name: 'Estilo SI Agents de Valeria (Navy)', builtin: true,
      top: '#00112D', bottom: '#002E55', panel: '#002E55', button: '#FECE61', accent: '#CB9A47', accent2: '#0CB3C7', text: '#FFFFFF' },
    { id: 'caribe', name: 'Caribe Turquesa', builtin: true,
      top: '#002A3A', bottom: '#006D95', panel: '#00405A', button: '#59D4DF', accent: '#CB9A47', accent2: '#FECE61', text: '#FFFFFF' }
  ];
  var HEX = /^#[0-9a-fA-F]{6}$/;
  function lsJSON(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function customPalettes() { var a = lsJSON(PAL_KEY, []); return Array.isArray(a) ? a.filter(function (p) { return p && p.id && p.name; }) : []; }
  function allPalettes() { return BUILTIN_PALETTES.concat(customPalettes()); }
  function findPalette(q) {
    if (!q) return null;
    var all = allPalettes(), f = function (x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    var fq = f(q);
    return all.filter(function (p) { return p.id === q || f(p.name) === fq; })[0]
      || all.filter(function (p) { return f(p.name).indexOf(fq) >= 0 || fq.indexOf(f(p.id).replace(/-/g, ' ')) >= 0; })[0] || null;
  }
  function activePaletteId() { try { return localStorage.getItem(PAL_DEF) || 'verde-selva'; } catch (e) { return 'verde-selva'; } }
  function activePalette() { return findPalette(activePaletteId()) || BUILTIN_PALETTES[0]; }
  function paletteLabel() { return activePalette().name; }
  function cleanPalette(p, base) {
    base = base || activePalette();
    var o = { id: p.id || ('custom-' + Date.now().toString(36)), name: String(p.name || 'Mi paleta').slice(0, 60) };
    ['top', 'bottom', 'panel', 'button', 'accent', 'accent2', 'text'].forEach(function (k) { o[k] = HEX.test(p[k] || '') ? p[k].toUpperCase() : base[k]; });
    return o;
  }
  function applyPalette(p) {
    var r = document.documentElement.style;
    var mid = 'color-mix(in srgb,' + p.top + ' 50%,' + p.bottom + ' 50%)';
    r.setProperty('--navy', p.top);
    r.setProperty('--bg', 'linear-gradient(180deg,' + p.top + ' 0%,' + p.top + ' 45%,' + mid + ' 75%,' + p.bottom + ' 100%)');
    r.setProperty('--panel', p.panel); r.setProperty('--panel-solid', p.panel); r.setProperty('--deep', p.panel);
    r.setProperty('--gold-lt', p.button); r.setProperty('--gold', p.accent); r.setProperty('--teal', p.accent2);
    r.setProperty('--line', 'color-mix(in srgb,' + p.accent + ' 45%, transparent)');
    r.setProperty('--white', p.text);
    document.documentElement.setAttribute('data-palette', p.id);
    renderPalettes();
  }
  function setDefaultPalette(idOrName) {
    var p = findPalette(idOrName); if (!p) return null;
    try { localStorage.setItem(PAL_DEF, p.id); } catch (e) {}
    applyPalette(p); return p;
  }
  function savePalette(p, makeDefault) {
    var c = cleanPalette(p), list = customPalettes().filter(function (x) { return x.id !== c.id && x.name !== c.name; });
    list.push(c); try { localStorage.setItem(PAL_KEY, JSON.stringify(list.slice(-12))); } catch (e) {}
    if (makeDefault !== false) setDefaultPalette(c.id); else renderPalettes();
    return c;
  }
  function deletePalette(idOrName) {
    var p = findPalette(idOrName); if (!p || p.builtin) return null;
    try { localStorage.setItem(PAL_KEY, JSON.stringify(customPalettes().filter(function (x) { return x.id !== p.id; }))); } catch (e) {}
    if (activePaletteId() === p.id) setDefaultPalette('verde-selva'); else renderPalettes();
    return p;
  }
  function renderPalettes() {
    var box = document.getElementById('palList'); if (!box) return;
    var act = activePaletteId();
    box.innerHTML = '';
    allPalettes().forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pal' + (p.id === act ? ' on' : '');
      b.setAttribute('aria-pressed', p.id === act ? 'true' : 'false'); b.setAttribute('data-pal', p.id);
      b.innerHTML = '<span class="sw"></span><span class="pn"></span>';
      var sw = b.querySelector('.sw');
      [p.top, p.bottom, p.panel, p.button, p.accent2].forEach(function (c) { var i = document.createElement('i'); i.style.background = c; sw.appendChild(i); });
      b.querySelector('.pn').textContent = p.name + (p.id === act ? ' · ' + t('palActive') : '');
      b.addEventListener('click', function () { setDefaultPalette(p.id); });
      box.appendChild(b);
    });
  }
  applyPalette(activePalette());
  document.querySelectorAll('.lang button').forEach(function (b) { b.addEventListener('click', renderPalettes); });

  // hidden hook for the agent's native "refresh" command (refreshSelector)
  var rf = document.getElementById('siaRefresh');
  if (rf) rf.addEventListener('click', function () { loadMeter(); });

  function currentView() {
    var v = ['main', 'result', 'list', 'cap', 'admin'].filter(function (x) { return !document.getElementById('view-' + x).hidden; });
    return v[0] || 'main';
  }

  /* ---------- the app API the agent panel drives (sia-agent.js) ---------- */
  window.SIA = {
    api: siaApi, browserId: browserId, lang: lang, t: t,
    setLang: function (l) { var b = document.querySelector('.lang button[data-lang="' + l + '"]'); if (b) b.click(); },
    show: show, view: currentView, openList: openList, renderList: renderList,
    listItems: function () { return siaApi('list', { browserId: browserId() }).then(function (r) { return (r && r.items) || []; }); },
    openFilePicker: function () { show('main'); fileInput.click(); },
    openStylePicker: function () { show('main'); document.getElementById('styleInput').click(); },
    addFiles: function (list) { show('main'); return addFiles(list); },
    clearFiles: function () { files = []; fileInput.value = ''; renderFiles(); },
    removeFile: function (name) { return removeFileNamed(name); },
    pasteFromClipboard: function () { show('main'); return pasteFromClipboard(); },
    ingestClipboard: function (dt) { return ingestClipboardData(dt); },
    files: function () { return files.map(function (f) { return f.name; }); },
    setPrompt: function (v, append) { show('main'); var el = document.getElementById('prompt'); el.value = append && el.value ? el.value.replace(/\s*$/, ' ') + v : v; el.dispatchEvent(new Event('input')); return el.value; },
    prompt: function () { return document.getElementById('prompt').value; },
    setName: function (v) { show('main'); document.getElementById('sia-name').value = v || ''; return v; },
    name: function () { return document.getElementById('sia-name').value; },
    generate: function () { show('main'); var f = document.getElementById('formMain'); if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true })); },
    lastResult: function () { return lastResult; },
    shareUrl: function () { return lastResult && lastResult.waUrl || ''; },
    meter: function () { return { used: meter.used, cap: meter.cap, remaining: meter.remaining, max: meter.max || 200, ownKey: !!ownKey() }; },
    reloadMeter: loadMeter,
    setOwnKey: function (v) { setOwnKey(v); refreshMeterLabels(); },
    hasOwnKey: function () { return !!ownKey(); },
    requestMore: function (reason) { return doRequestMore(reason || ''); },
    requestMoreMsg: requestMoreMsg,
    grupo: function () { return document.getElementById('sia-grupo').value.trim(); },
    maestro: function () { return document.getElementById('sia-maestro').value.trim(); },
    setGrupo: function (v) { var el = document.getElementById('sia-grupo'); el.value = v || ''; el.dispatchEvent(new Event('input')); return el.value; },
    setMaestro: function (v) { var el = document.getElementById('sia-maestro'); el.value = v || ''; el.dispatchEvent(new Event('input')); return el.value; },
    homework: function () { return lastHomework; },
    attachByName: attachByName,
    attachUrl: attachUrl,
    suggest: suggestFiles,
    fileInfo: function () { return files.map(function (f) { return { name: f.name, size: f.size, type: f.type }; }); },
    hasPrompt: function () { return !!document.getElementById('prompt').value.trim(); },
    requestStatus: function () { return siaApi('requestStatus', { browserId: browserId() }); },
    openAdmin: function () { show('admin'); },
    adminKey: function () { try { return sessionStorage.getItem('sia-admin-key') || ''; } catch (e) { return ''; } },
    palettes: allPalettes, activePalette: activePalette, setDefaultPalette: setDefaultPalette,
    savePalette: savePalette, deletePalette: deletePalette, cleanPalette: cleanPalette, previewPalette: applyPalette,
    resetStyle: function () { styleName = null; document.getElementById('stylePill').textContent = t('styleDefault'); }
  };
  window.dispatchEvent(new CustomEvent('sia:ready'));

  var lastBatch = null;
  document.getElementById('btnBatchGo').addEventListener('click', function () {
    noteAt('batchNote', t('working'));
    document.getElementById('batchOut').hidden = true;
    siaApi('batchPrepare', { adminKey: adminKeyVal(), grupo: document.getElementById('batchGrupo').value, maestro: document.getElementById('batchMaestro').value,
      from: document.getElementById('batchFrom').value, to: document.getElementById('batchTo').value }).then(function (r) {
      lastBatch = r;
      noteAt('batchNote', t('batchDone', { id: r.loteId, n: r.count, m: r.students }) + (r.noRecipients ? ' ' + t('batchNoTo') : ''));
      var a = document.getElementById('batchSummary'); a.href = r.summaryUrl; a.textContent = r.summaryUrl;
      document.getElementById('batchTo2').textContent = (r.draft.to || []).join(', ') || '—';
      document.getElementById('batchSubject').textContent = r.draft.subject;
      document.getElementById('batchBody').value = r.draft.body;
      document.getElementById('batchOut').hidden = false;
      document.getElementById('btnBatchSend').hidden = !(r.draft.to || []).length;
    }).catch(function (e) { noteAt('batchNote', (e && e.message) || t('errGeneric')); });
  });
  document.getElementById('btnBatchSend').addEventListener('click', function () {
    if (!lastBatch || !(lastBatch.draft.to || []).length) return;
    if (!window.confirm(t('batchConfirm', { to: lastBatch.draft.to.join(', ') }))) return;
    siaApi('batchSend', { adminKey: adminKeyVal(), loteId: lastBatch.loteId, confirm: true, body: document.getElementById('batchBody').value })
      .then(function (r) { noteAt('batchNote', r.sent ? '✓ ' + r.to : (r.error || t('errGeneric'))); })
      .catch(function (e) { noteAt('batchNote', (e && e.message) || t('errGeneric')); });
  });

  applyI18n();
  try {
    var params = new URLSearchParams(location.search || '');
    var bid = params.get('bid');
    if (bid && bid.length >= 8) {
      try { localStorage.setItem('sia-browser-id', bid); } catch (e2) {}
    }
    var initialView = params.get('view');
    loadMeter();
    if (initialView === 'list') openList();
    else if (initialView === 'cap' || initialView === 'tokens') show('cap');
    else if (initialView === 'result') {
      siaApi('list', { browserId: browserId() })
        .then(function (res) {
          var items = (res && res.items) || [];
          if (items[0]) {
            onGenerated({
              ok: true,
              title: items[0].description || items[0].prompt || '',
              name: items[0].name || '',
              pdfUrl: items[0].pdfUrl || '',
              waUrl: 'https://wa.me/?text=' + encodeURIComponent((lang() === 'en' ? 'SI Agents homework: ' : 'Tarea SI Agents: ') + (items[0].description || '') + ' — ' + (items[0].pdfUrl || '')),
              model: '',
              usage: {},
              meter: meter
            });
          }
        });
    }
  } catch (e3) {
    loadMeter();
  }
})();
