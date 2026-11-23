(function () {
  var I18N = {
    es: {
      sub: 'Tareas de <span class="kw">Contaduría</span> · UT Tulum',
      tareas: 'Mis tareas', tokens: '{used} / {cap} tareas',
      mainTitle: 'Nueva tarea',
      lede: 'Sube los archivos, escribe el prompt y elige el estilo. El agente arma un PDF listo para compartir.',
      filesH: 'Archivos de la tarea',
      filesHint: 'Arrastra cualquier formato o tócalo para subir (en el teléfono, usa el selector).',
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
      capTitle: 'Llegaste al límite de 10 tareas',
      capLede: 'Las 10 tareas incluidas se usaron en este navegador. Conecta tu propio agente para seguir con tus tokens.',
      connectH: 'Conectar tu propio agente',
      connectLede: 'Pega tu clave de xAI. Se guarda solo en este navegador, no en la base de datos.',
      connectPh: 'xai-…', connectCta: 'Conectar agente', keySaved: 'Clave guardada en este navegador.',
      hello: '¡Hola! ¿En qué te ayudo?', inputPh: 'Escribe un comando',
      working: 'Generando tu tarea…', capMsg: 'Límite alcanzado. Conecta tu propio agente para seguir.',
      errGeneric: 'No se pudo generar la tarea. Inténtalo de nuevo.',
      errCap: 'Llegaste al límite de 10 tareas en este navegador.',
      palH: 'Paleta de colores', palHint: 'Elige la paleta por defecto o pídele al agente que cree una (por ejemplo “fondo verde más oscuro y botones dorados”).', palActive: 'por defecto'
    },
    en: {
      sub: '<span class="kw">Accounting</span> homework · UT Tulum',
      tareas: 'My homework', tokens: '{used} / {cap} homework',
      mainTitle: 'New homework',
      lede: 'Upload the files, write the prompt and choose a style. The agent builds a PDF ready to share.',
      filesH: 'Homework files',
      filesHint: 'Drag any format, or tap to upload (on a phone, use the file picker).',
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
      capTitle: 'You have used all 10 homework slots',
      capLede: 'The 10 included homework slots for this browser are used up. Connect your own agent to keep going on your tokens.',
      connectH: 'Connect your own agent',
      connectLede: 'Paste your xAI key. It stays in this browser only, not in the database.',
      connectPh: 'xai-…', connectCta: 'Connect agent', keySaved: 'Key saved in this browser.',
      hello: 'Hi! How can I help?', inputPh: 'Type a command',
      working: 'Generating your homework…', capMsg: 'Cap reached. Connect your own agent to continue.',
      errGeneric: 'Could not generate the homework. Please try again.',
      errCap: 'You have used all 10 homework slots in this browser.',
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

  var meter = { used: 0, cap: CAP, remaining: CAP };
  function refreshMeterLabels() {
    var label = t('tokens', { used: meter.used, cap: meter.cap });
    document.getElementById('meterLabel').textContent = label;
    var chip = document.getElementById('meterChip');
    var full = meter.remaining <= 0 && !ownKey();
    chip.classList.toggle('cap', full);
    chip.classList.toggle('ok', !full);
    window.dispatchEvent(new CustomEvent('sia:meter', { detail: { used: meter.used, cap: meter.cap, remaining: meter.remaining, full: full, ownKey: !!ownKey(), label: label } }));
    document.getElementById('capBig').textContent = meter.used + ' / ' + meter.cap;
  }
  function loadMeter() {
    siaApi('meter', { browserId: browserId() })
      .then(function (res) { meter = (res && res.meter) || meter; refreshMeterLabels(); })
      .catch(function () {});
  }

  function show(view) {
    ['main', 'result', 'list', 'cap'].forEach(function (v) {
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
  function renderFiles() {
    fileList.innerHTML = '';
    files.forEach(function (f, i) {
      var s = document.createElement('span');
      s.className = 'filepill';
      s.textContent = f.name;
      s.title = 'Quitar';
      s.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); files.splice(i, 1); renderFiles(); });
      fileList.appendChild(s);
    });
  }
  function addFiles(list) {
    Array.from(list || []).forEach(function (f) { files.push(f); });
    renderFiles();
  }
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); });
  document.querySelectorAll('.drop').forEach(function (zone) {
    ['dragenter', 'dragover'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('over'); });
    });
    zone.addEventListener('drop', function (e) {
      var kind = zone.getAttribute('data-kind');
      if (kind === 'files') addFiles(e.dataTransfer.files);
      if (kind === 'style' && e.dataTransfer.files[0]) {
        styleName = e.dataTransfer.files[0].name;
        document.getElementById('stylePill').textContent = styleName;
      }
    });
    if (zone.getAttribute('data-kind') === 'files') {
      zone.addEventListener('click', function (e) {
        if (e.target.closest('textarea, input, .filepill')) return;
        fileInput.click();
      });
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
    if (res.meter) { meter = res.meter; refreshMeterLabels(); }
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
    var v = ['main', 'result', 'list', 'cap'].filter(function (x) { return !document.getElementById('view-' + x).hidden; });
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
    addFiles: function (list) { show('main'); addFiles(list); },
    clearFiles: function () { files = []; renderFiles(); },
    files: function () { return files.map(function (f) { return f.name; }); },
    setPrompt: function (v, append) { show('main'); var el = document.getElementById('prompt'); el.value = append && el.value ? el.value.replace(/\s*$/, ' ') + v : v; el.dispatchEvent(new Event('input')); return el.value; },
    prompt: function () { return document.getElementById('prompt').value; },
    setName: function (v) { show('main'); document.getElementById('sia-name').value = v || ''; return v; },
    name: function () { return document.getElementById('sia-name').value; },
    generate: function () { show('main'); var f = document.getElementById('formMain'); if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true })); },
    lastResult: function () { return lastResult; },
    shareUrl: function () { return lastResult && lastResult.waUrl || ''; },
    meter: function () { return { used: meter.used, cap: meter.cap, remaining: meter.remaining, ownKey: !!ownKey() }; },
    reloadMeter: loadMeter,
    setOwnKey: function (v) { setOwnKey(v); refreshMeterLabels(); },
    hasOwnKey: function () { return !!ownKey(); },
    palettes: allPalettes, activePalette: activePalette, setDefaultPalette: setDefaultPalette,
    savePalette: savePalette, deletePalette: deletePalette, cleanPalette: cleanPalette, previewPalette: applyPalette,
    resetStyle: function () { styleName = null; document.getElementById('stylePill').textContent = t('styleDefault'); }
  };
  window.dispatchEvent(new CustomEvent('sia:ready'));

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
