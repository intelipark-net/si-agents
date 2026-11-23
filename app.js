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
      errCap: 'Llegaste al límite de 10 tareas en este navegador.'
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
      errCap: 'You have used all 10 homework slots in this browser.'
    }
  };


  var SIA_API = 'https://script.google.com/macros/s/AKfycbzvNn8C_9bvhe0LmcHJs3PdOIye1s6UTVCWsfqhbQ9MftpxQSP--ya1RF3eMCypFT0tqw/exec';
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
    document.getElementById('leaMeter').textContent = label;
    var chip = document.getElementById('meterChip');
    var full = meter.remaining <= 0 && !ownKey();
    chip.classList.toggle('cap', full);
    chip.classList.toggle('ok', !full);
    var capEl = document.getElementById('leaCap');
    capEl.hidden = !full;
    capEl.textContent = t('capMsg');
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
        styleName: styleName || t('styleDefault'),
        files: encoded,
        userApiKey: ownKey()
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
    document.getElementById('resultName').textContent = name + ' · ' + t('styleDefault');
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

  // panel
  var root = document.getElementById('lea-root');
  function openPanel() {
    root.classList.add('lea-open');
    document.documentElement.classList.add('lea-open');
    document.getElementById('lea-panel').setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
  }
  function closePanel() {
    root.classList.remove('lea-open');
    document.documentElement.classList.remove('lea-open');
    document.getElementById('lea-panel').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('panel-open');
  }
  document.getElementById('leaHandle').addEventListener('click', openPanel);
  document.getElementById('leaLaunch').addEventListener('click', openPanel);
  document.getElementById('leaBack').addEventListener('click', closePanel);
  document.getElementById('leaClose').addEventListener('click', closePanel);
  document.getElementById('leaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = document.getElementById('leaInput').value.trim();
    if (!v) return;
    document.getElementById('leaInput').value = '';
    var log = document.querySelector('.lea-log');
    var u = document.createElement('div'); u.className = 'lea-msg lea-u'; u.textContent = v; log.appendChild(u);
    var a = document.createElement('div'); a.className = 'lea-msg lea-a';
    var cmd = v.toLowerCase();
    if (/tarea|homework|lista|list/.test(cmd)) { a.textContent = t('tareas'); openList(); }
    else if (/nuevo|new/.test(cmd)) { a.textContent = t('mainTitle'); show('main'); }
    else a.textContent = t('hello');
    log.appendChild(a);
    log.scrollTop = log.scrollHeight;
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
