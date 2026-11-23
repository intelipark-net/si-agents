/* SI Agents preview: cloud voice for the panel (xAI TTS + STT through the Apps Script backend).
 * - Mode per browser: localStorage 'sia-guide-mode' = 'voice' | 'text'. Text mode never speaks and never opens the mic by itself.
 * - TTS: backend action 'tts' (xAI voice 'ara' es-MX / 'eve' en), mp3 played on one Audio element unlocked on the first tap (iOS).
 *   Long replies are split into short chunks; the next chunk is fetched while the current one plays.
 *   Fallback only: speechSynthesis with the best local voice (enhanced/premium Paulina, Mónica…, never compact).
 * - STT: MediaRecorder (audio/mp4 on iOS, webm/opus elsewhere), ends on silence or on a second tap; backend action 'stt'.
 * agent.js stays byte-identical: its speechSynthesis calls are routed here, its mic button is taken over in capture phase. No keys here. */
(function () {
  'use strict';
  var SILENT = 'data:audio/mpeg;base64,SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYxLjcuMTAzAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAJAAAEIABFRUVFRUVFRUVFRV1dXV1dXV1dXV1ddHR0dHR0dHR0dHSLi4uLi4uLi4uLi6KioqKioqKioqKiurq6urq6urq6urrR0dHR0dHR0dHR0ejo6Ojo6Ojo6Ojo//////////////8AAAAATGF2YzYxLjE5AAAAAAAAAAAAAAAAJAPwAAAAAAAABCAN5n8eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/80TEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEUwAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TEpgAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy7/80TErAAAA0gAAAAAMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80TErAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
  function SIA() { return window.SIA; }
  function L() { return /^en/i.test(document.documentElement.lang || '') ? 'en' : 'es'; }
  function tr(es, en) { return L() === 'en' ? en : es; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------------- mode */
  function mode() { var m = ls('sia-guide-mode'); return m === 'voice' || m === 'text' ? m : ''; }
  function muted() { return ls('le-agent-mute') === '1'; }
  function syncMuteIcon(wantMuted) {
    var b = document.querySelector('#lea-root .lea-mute');
    ls('le-agent-mute', wantMuted ? '1' : '0');
    if (!b) return;
    if ((b.getAttribute('aria-pressed') === 'true') !== wantMuted) { ls('le-agent-mute', wantMuted ? '0' : '1'); b.click(); }   // agent.js setMute(!muted()) relabels the icon
  }
  function setMode(m) {
    ls('sia-guide-mode', m);
    if (m === 'text') { stopAll(); stopRec(true); }
    syncMuteIcon(m !== 'voice');
    document.documentElement.setAttribute('data-sia-mode', m);
    window.dispatchEvent(new CustomEvent('sia:mode', { detail: { mode: m } }));
  }
  // before agent.js boots (it reads le-agent-mute when it builds the panel)
  if (mode() === 'text') ls('le-agent-mute', '1');
  if (mode() === 'voice') ls('le-agent-mute', '0');
  if (mode()) document.documentElement.setAttribute('data-sia-mode', mode());

  /* ---------------- audio element + iOS unlock */
  var audio = new Audio(); audio.preload = 'auto'; audio.setAttribute('playsinline', '');
  var unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { audio.src = SILENT; var p = audio.play(); if (p && p.catch) p.catch(function () { unlocked = false; }); } catch (e) { unlocked = false; }
  }
  ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) { document.addEventListener(ev, unlock, true); });

  /* ---------------- speech queue */
  var origSpeak = window.speechSynthesis && window.speechSynthesis.speak ? window.speechSynthesis.speak.bind(window.speechSynthesis) : null;
  var origCancel = window.speechSynthesis && window.speechSynthesis.cancel ? window.speechSynthesis.cancel.bind(window.speechSynthesis) : null;
  var gen = 0, speaking = false, stats = { cloud: 0, local: 0, errors: [] };
  function splitText(t) {
    var parts = String(t || '').replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*/g) || [];
    var out = [], cur = '';
    parts.forEach(function (p) { p = p.trim(); if (!p) return; if ((cur + ' ' + p).length > 220 && cur) { out.push(cur); cur = p; } else cur = (cur ? cur + ' ' : '') + p; });
    if (cur) out.push(cur);
    return out;
  }
  function clean(t) {
    return String(t || '').replace(/\d+\s*tokens?$/i, '').replace(/https?:\/\/\S+/g, tr('el enlace', 'the link')).replace(/[“”"«»*_#]/g, '').trim();
  }
  function bestLocalVoice(lang) {
    var vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    var want = lang === 'en' ? 'en' : 'es';
    var best = null, bs = -1e9;
    vs.forEach(function (v) {
      var l = String(v.lang || '').toLowerCase(), n = String(v.name || '') + ' ' + String(v.voiceURI || '');
      if (l.indexOf(want) !== 0) return;
      var sc = 0;
      if (want === 'es') { if (/es-mx/.test(l)) sc += 30; else if (/es-us|es-419/.test(l)) sc += 20; else sc += 5; if (/paulina|m[oó]nica|marisol|ang[eé]lica|dalia|sabina|francisca|camila/i.test(n)) sc += 15; }
      else { if (/en-us/.test(l)) sc += 20; if (/samantha|ava|allison|zoe|jenny|aria/i.test(n)) sc += 15; }
      if (/enhanced|premium|mejorad|neural|natural|siri/i.test(n)) sc += 40;
      if (/compact|eloquence|espeak|robot|novelty|grandma|grandpa|bad news|bells|bubbles|jester|organ|trinoids|whisper|zarvox|albert|bahh|boing|cellos|wobble|superstar|fred|junior|ralph|kathy|rocko|shelley|flo|eddy|reed|sandy/i.test(n)) sc -= 60;
      if (v.localService === false) sc += 3;
      if (sc > bs) { bs = sc; best = v; }
    });
    return best;
  }
  function speakLocal(text, lang) {
    return new Promise(function (res) {
      if (!origSpeak || !window.SpeechSynthesisUtterance) return res(false);
      try {
        var u = new SpeechSynthesisUtterance(text); u.lang = lang === 'en' ? 'en-US' : 'es-MX'; u.rate = 1;
        var v = bestLocalVoice(lang); if (v) u.voice = v;
        u.onend = u.onerror = function () { res(true); };
        stats.local++; origSpeak(u);
      } catch (e) { res(false); }
    });
  }
  function fetchTts(text, lang) {
    var s = SIA(); if (!s) return Promise.reject(new Error('app_not_ready'));
    return s.api('tts', { browserId: s.browserId(), text: text, lang: lang });
  }
  function playB64(b64, mime, myGen) {
    return new Promise(function (res, rej) {
      if (myGen !== gen) return res(false);
      audio.onended = function () { res(true); };
      audio.onerror = function () { rej(new Error('audio_error')); };
      audio.src = 'data:' + (mime || 'audio/mpeg') + ';base64,' + b64;
      var p = audio.play(); stats.cloud++;
      window.dispatchEvent(new CustomEvent('sia:tts-play', { detail: { bytes: b64.length } }));
      if (p && p.catch) p.catch(function (e) { rej(e); });
    });
  }
  // speak(text, opts): opts.first = {audio, mime, text} returned inline with the agent reply
  function speak(text, opts) {
    opts = opts || {};
    if (mode() !== 'voice' || muted()) return Promise.resolve(false);
    var lang = opts.lang || L();
    stopAll();
    var myGen = ++gen;
    var full = clean(text);
    var chunks = splitText(full);
    var firstAudio = null;
    if (opts.first && opts.first.audio) {
      var ft = clean(opts.first.text || '');
      if (ft && full.indexOf(ft) === 0) { firstAudio = opts.first; chunks = splitText(full.slice(ft.length)); }
    }
    if (!chunks.length && !firstAudio) return Promise.resolve(false);
    speaking = true;
    window.dispatchEvent(new CustomEvent('sia:speaking', { detail: { on: true } }));
    var pending = chunks.map(function () { return null; });
    function get(i) { if (!pending[i]) pending[i] = fetchTts(chunks[i], lang); return pending[i]; }
    var cloudFailed = false;
    function playIdx(i) {
      if (myGen !== gen) return Promise.resolve();
      if (i >= chunks.length) return Promise.resolve();
      if (cloudFailed) return speakLocal(chunks[i], lang).then(function () { return playIdx(i + 1); });
      var cur = get(i);
      if (i + 1 < chunks.length) get(i + 1);   // prefetch while this one plays
      return cur.then(function (r) { return playB64(r.audio, r.mime, myGen); })
        .catch(function (e) { stats.errors.push(String(e && e.message || e)); cloudFailed = true; return speakLocal(chunks[i], lang); })
        .then(function () { return playIdx(i + 1); });
    }
    var start = firstAudio
      ? playB64(firstAudio.audio, firstAudio.mime, myGen).catch(function (e) { stats.errors.push(String(e && e.message || e)); return speakLocal(clean(firstAudio.text), lang); })
      : Promise.resolve();
    if (!firstAudio && chunks.length) get(0);
    return start.then(function () { return playIdx(0); }).then(function () {
      if (myGen === gen) { speaking = false; window.dispatchEvent(new CustomEvent('sia:speaking', { detail: { on: false, text: full } })); }
      return true;
    });
  }
  function stopAll() {
    gen++;
    try { audio.pause(); } catch (e) { }
    if (origCancel) try { origCancel(); } catch (e2) { }
    if (speaking) { speaking = false; window.dispatchEvent(new CustomEvent('sia:speaking', { detail: { on: false, stopped: true } })); }
  }
  // agent.js speaks through speechSynthesis: route it here (respects text mode and mute)
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.speak = function (u) {
        var lang = /^en/i.test((u && u.lang) || '') ? 'en' : 'es';
        speak(u && u.text, { lang: lang }).then(function () { if (u && typeof u.onend === 'function') try { u.onend(); } catch (e) { } });
      };
      window.speechSynthesis.cancel = function () { stopAll(); };
    } catch (e) { }
  }

  /* ---------------- recorder (cloud STT) */
  var rec = null;   // { stream, mr, chunks, ctx, raf, resolve, mime, t0, heard, cancel }
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    var c = ['audio/mp4', 'audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < c.length; i++) if (MediaRecorder.isTypeSupported(c[i])) return c[i];
    return '';
  }
  function canRecord() { return !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia); }
  function ui(on, msg) {
    var root = document.getElementById('lea-root'); if (!root) return;
    var mic = root.querySelector('.lea-mic'), bar = root.querySelector('.lea-listen'), ll = root.querySelector('.lea-ll');
    root.classList.toggle('lea-listening', !!on);
    if (mic) mic.setAttribute('aria-pressed', String(!!on));
    if (bar) bar.hidden = !on && !msg;
    if (ll) ll.textContent = msg || (on ? tr('Te escucho… toca el micrófono cuando termines.', 'Listening… tap the mic when you finish.') : '');
  }
  function blobToB64(b) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).replace(/^data:[^,]*,/, '')); }; r.onerror = rej; r.readAsDataURL(b); });
  }
  // listen(): resolves { text } | { error }
  function listen(opts) {
    opts = opts || {};
    if (rec) { stopRec(false); return Promise.resolve({ error: 'already' }); }
    if (!canRecord()) return Promise.resolve({ error: 'no_recorder' });
    stopAll();
    return new Promise(function (resolve) {
      var r = rec = { chunks: [], resolve: resolve, heard: false, t0: Date.now(), mime: pickMime() };
      navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then(function (stream) {
        if (rec !== r) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
        r.stream = stream;
        var o = r.mime ? { mimeType: r.mime, audioBitsPerSecond: 48000 } : {};
        var mr; try { mr = new MediaRecorder(stream, o); } catch (e) { mr = new MediaRecorder(stream); }
        r.mr = mr; r.mime = mr.mimeType || r.mime || 'audio/webm';
        mr.ondataavailable = function (e) { if (e.data && e.data.size) r.chunks.push(e.data); };
        mr.onstop = function () { finish(r); };
        mr.start(250);
        ui(true);
        // silence detection
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          var ctx = r.ctx = new AC(); var src = ctx.createMediaStreamSource(stream); var an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
          var buf = new Float32Array(an.fftSize), lastLoud = Date.now(), loudMs = 0, prev = Date.now();
          (function tick() {
            if (rec !== r) return;
            an.getFloatTimeDomainData(buf);
            var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
            var rms = Math.sqrt(sum / buf.length), now = Date.now(), dt = now - prev; prev = now;
            if (rms > (opts.threshold || 0.018)) { loudMs += dt; lastLoud = now; if (loudMs > 180) r.heard = true; }
            if (r.heard && now - lastLoud > (opts.silenceMs || 1300)) return stopRec(false);
            if (!r.heard && now - r.t0 > (opts.noSpeechMs || 7000)) { r.noSpeech = true; return stopRec(false); }
            if (now - r.t0 > (opts.maxMs || 20000)) return stopRec(false);
            r.raf = setTimeout(tick, 60);
          })();
        } catch (e) { r.heard = true; r.raf = setTimeout(function () { stopRec(false); }, opts.maxMs || 12000); }
      }).catch(function (e) {
        if (rec === r) rec = null;
        ui(false, tr('No tengo permiso para el micrófono. Actívalo en el navegador o escribe tu mensaje.', 'No microphone permission. Allow it in the browser or type your message.'));
        resolve({ error: 'mic_denied', detail: String(e && e.name || e) });
      });
    });
  }
  function stopRec(cancel) {
    var r = rec; if (!r) return;
    r.cancel = !!cancel;
    clearTimeout(r.raf);
    try { if (r.mr && r.mr.state !== 'inactive') r.mr.stop(); else finish(r); } catch (e) { finish(r); }
  }
  function finish(r) {
    if (r.done) return; r.done = true;
    if (rec === r) rec = null;
    try { r.stream && r.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { }
    try { r.ctx && r.ctx.close(); } catch (e2) { }
    if (r.cancel) { ui(false); return r.resolve({ error: 'cancelled' }); }
    if (r.noSpeech && !r.heard) { ui(false, tr('No te escuché. Toca el micrófono y habla, o escribe.', 'I did not hear you. Tap the mic and speak, or type.')); return r.resolve({ error: 'no_speech' }); }
    var blob = new Blob(r.chunks, { type: r.mime });
    ui(false, tr('Transcribiendo…', 'Transcribing…'));
    transcribe(blob, r.mime).then(function (x) { ui(false); r.resolve(x); }, function (e) {
      ui(false, tr('No pude entender el audio. Inténtalo otra vez o escribe.', 'I could not understand the audio. Try again or type.'));
      r.resolve({ error: String(e && e.message || e) });
    });
  }
  function transcribe(blob, mime) {
    var s = SIA();
    return blobToB64(blob).then(function (b64) {
      return s.api('stt', { browserId: s.browserId(), audioBase64: b64, mime: mime, lang: L() });
    }).then(function (j) { return { text: String(j.text || '').trim(), duration: j.duration, language: j.language }; });
  }

  window.SIAVoice = {
    mode: mode, setMode: setMode, speak: speak, stop: stopAll, listen: listen, stopListening: function () { stopRec(false); },
    cancelListening: function () { stopRec(true); }, listening: function () { return !!rec; }, speaking: function () { return speaking; },
    transcribe: transcribe, canRecord: canRecord, bestLocalVoice: bestLocalVoice, stats: stats, audio: audio, syncMuteIcon: syncMuteIcon
  };
})();
