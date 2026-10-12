/* 에테르나 효과음 — 파일 없이 Web Audio로 합성. 기본 켜짐, 메뉴의 스피커 버튼으로 끄고 켬(세 사이트 공유).
   사용: EternaSFX.play("click") / 요소에 data-sfx="sparkle" 를 달면 클릭 시 자동 재생. */
(function () {
  "use strict";
  var KEY = "eterna-sfx", on = true;
  try { on = localStorage.getItem(KEY) !== "0"; } catch (e) {}
  var ctx, master, lastHover = 0;

  function ac() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = .55;
        var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(f, t0, dur, type, vol, f2, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + .05);
  }
  function bell(f, t0, vol, dur) { tone(f, t0, dur || 1.2, "sine", vol); tone(f * 2.76, t0, (dur || 1.2) * .5, "sine", vol * .25); tone(f * 5.4, t0, (dur || 1.2) * .25, "sine", vol * .08); }
  var noiseBuf;
  function noise(t0, dur, from, to, vol, q) {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = "bandpass"; f.Q.value = q || 1.2;
    f.frequency.setValueAtTime(from, t0); f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + .05);
  }
  var PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3, 10 / 3, 4];

  var LIB = {
    hover: function (t) { tone(1760 + Math.random() * 300, t, .09, "sine", .035); },
    click: function (t) { bell(1318.5, t, .08, .5); bell(1975.5, t + .06, .05, .45); },
    tab: function (t) { tone(880, t, .12, "triangle", .05); tone(1320, t + .04, .14, "sine", .04); },
    open: function (t) { noise(t, .55, 400, 3200, .12, .8); bell(1046.5, t + .12, .06, .8); },
    close: function (t) { noise(t, .4, 2600, 500, .08, .8); },
    sparkle: function (t) { for (var i = 0; i < 6; i++) bell(1046.5 * PENTA[3 + i], t + i * .055, .045, .7); },
    page: function (t) { noise(t, .28, 1800, 5200, .07, .6); },
    success: function (t) { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { bell(f, t + i * .08, .07, 1.1); }); },
    error: function (t) { tone(330, t, .18, "triangle", .07); tone(262, t + .12, .26, "triangle", .07); },
    /* 소환 연출용 */
    charge: function (t, d) { d = d || 2.4; noise(t, d, 200, 4800, .14, .7); tone(110, t, d, "sawtooth", .03, 440); tone(220, t, d, "sine", .05, 880); },
    pillar: function (t) { noise(t, 1.4, 6000, 900, .18, .5); tone(196, t, 1.6, "sine", .1); tone(293.66, t, 1.6, "sine", .07); bell(1567.98, t + .05, .06, 1.6); },
    upgrade: function (t) { [783.99, 1046.5, 1318.5, 1567.98, 2093].forEach(function (f, i) { bell(f, t + i * .05, .06, .9); }); noise(t, .5, 1200, 7000, .08, .7); },
    reveal: function (t, grade) {
      var root = { 일반: 392, 희귀: 440, 영웅: 523.25, 전설: 587.33 }[grade] || 440;
      [1, 5 / 4, 3 / 2, 2].forEach(function (m) { tone(root * m, t, 2.4, "sine", .07); tone(root * m * 1.003, t, 2.4, "triangle", .025); });
      for (var i = 0; i < 9; i++) bell(root * 2 * PENTA[i], t + .15 + i * .07, .04, 1.2);
      if (grade === "전설" || grade === "영웅") { tone(root / 2, t, 2.6, "sine", .12); noise(t, 1.8, 300, 8000, .1, .4); }
    },
    stamp: function (t) { tone(140, t, .22, "sine", .22, 60); noise(t, .12, 900, 300, .12, 1); }
  };

  function play(name, arg) {
    if (!on || !LIB[name]) return;
    if (name === "hover") { var n = performance.now(); if (n - lastHover < 70) return; lastHover = n; if (!ctx || ctx.state !== "running") return; }
    if (!ac()) return;
    try { LIB[name](ctx.currentTime + .01, arg); } catch (e) {}
  }
  function set(v) { on = v; try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} document.dispatchEvent(new CustomEvent("eterna-sfx", { detail: on })); }

  /* 자동 연결: data-sfx 클릭, data-sfx-hover 호버 */
  document.addEventListener("click", function (e) { var el = e.target.closest && e.target.closest("[data-sfx]"); if (el) play(el.getAttribute("data-sfx") || "click"); }, true);
  document.addEventListener("pointerover", function (e) { if (e.pointerType !== "mouse") return; var el = e.target.closest && e.target.closest("[data-sfx-hover]"); if (el && !el.contains(e.relatedTarget)) play("hover"); }, true);
  ["pointerdown", "keydown"].forEach(function (ev) { addEventListener(ev, function () { if (on) ac(); }, { once: true, capture: true }); });

  window.EternaSFX = { play: play, get on() { return on; }, set: set, toggle: function () { set(!on); return on; } };
})();
