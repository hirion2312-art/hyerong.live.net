/* 에테르나 뮤직 플레이어 — 도감 사이트용 단독 스크립트.
   곡 추가: 아래 TRACKS에 한 줄 추가하고 music/ 폴더에 mp3를 넣으면 끝. (파일이 없으면 '준비 중'으로 흐리게 표시) */
(function () {
  "use strict";
  var BASE = (function () { var c = document.currentScript; if (c && c.src) return c.src.replace(/[^/]*$/, ""); return ""; })();
  var COVER = BASE + "music/cover.jpg", COVER_S = BASE + "music/cover_s.jpg";
  var TRACKS = [
    { t: "에테르나", s: "메인 테마", g: "ORIGINAL SOUND TRACK", f: BASE + "music/01_aeterna.mp3", c: "#d9b25f" },
    { t: "에테르나 아카데미", s: "아카데미 테마", g: "ORIGINAL SOUND TRACK", f: BASE + "music/02_academy.mp3", c: "#8fb7ff" },
    { t: "비어 있는 도감", s: "오프닝 주제가", g: "ORIGINAL SOUND TRACK", f: BASE + "music/03_empty_codex.mp3", c: "#ffd37a", open: true },
    { t: "너와 처음 만난 날", s: "파트너 테마", g: "ORIGINAL SOUND TRACK", f: BASE + "music/04_first_met.mp3", c: "#ffb38f" },
    { t: "에테르나 들길", s: "필드 테마", g: "ORIGINAL SOUND TRACK", f: BASE + "music/05_field_a.mp3", c: "#9be37a" },
    { t: "에테르나 들길 · 두 번째 길", s: "필드 테마 · 확장", g: "ORIGINAL SOUND TRACK", f: BASE + "music/06_field_b.mp3", c: "#8fe3b0" },
    { t: "에테르나의 일상", s: "교정의 하루", g: "ORIGINAL SOUND TRACK", f: BASE + "music/07_daily.mp3", c: "#ffe28f" },
    { t: "승부다, 라이벌!", s: "라이벌 테마", g: "ORIGINAL SOUND TRACK", f: BASE + "music/08_rival.mp3", c: "#ff8f8f" },
    { t: "다음 장에서 또 만나", s: "엔딩 주제가", g: "ORIGINAL SOUND TRACK", f: BASE + "music/09_next_chapter.mp3", c: "#9fd8ff" }
  ];


  var KEY = "eterna-music-v1", st = { vol: .7, idx: 0, t: 0, shuf: false, rep: 0 };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || "{}"); for (var k in raw) st[k] = raw[k]; } catch (e) {}
  function save() { st.at = Date.now(); st.on = !!(au && !au.paused); try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  /* ───────── CSS ───────── */
  var css = "\
#mp,#mp *{box-sizing:border-box}\
#mp{--c:#d9b25f;position:fixed;z-index:70;left:0;right:0;bottom:0;pointer-events:none;font-family:var(--f-body,'Noto Sans KR',sans-serif);color:#efe7d2}\
#mp button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}\
#mp button:focus-visible,#mp input:focus-visible{outline:2px solid var(--c);outline-offset:2px;border-radius:8px}\
.mp-pill{pointer-events:auto;position:relative;margin:0 auto 12px;margin-bottom:calc(12px + env(safe-area-inset-bottom,0px));width:min(620px,calc(100% - 20px));display:grid;grid-template-columns:auto 1fr auto auto auto;align-items:center;gap:12px;padding:10px 12px 14px 10px;border-radius:24px;border:1px solid rgba(217,178,95,.34);background:linear-gradient(180deg,rgba(24,32,70,.88),rgba(10,14,34,.92));backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);box-shadow:0 14px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .3s}\
.mp-pill.hide{transform:translateY(130%);opacity:0;pointer-events:none}\
.mp-disc{--sz:46px;position:relative;width:var(--sz);height:var(--sz);border-radius:50%;flex:none;display:grid;place-items:center;font-size:calc(var(--sz)*.42);color:rgba(255,255,255,.92);text-shadow:0 1px 6px rgba(0,0,0,.5);background:radial-gradient(circle at 50% 50%,#0b1026 0 14%,transparent 15%),conic-gradient(from 20deg,var(--c),#0b1026 30%,var(--c) 52%,#0b1026 78%,var(--c));box-shadow:0 0 0 2px rgba(255,255,255,.1),0 6px 18px rgba(0,0,0,.45),0 0 20px -4px var(--c);animation:mpSpin 9s linear infinite;animation-play-state:paused}\
.mp-disc::after{content:'';position:absolute;inset:34%;border-radius:50%;background:#0b1026;box-shadow:inset 0 0 0 2px var(--c)}\
.mp-disc span{position:relative;z-index:1;animation:mpSpin 9s linear infinite reverse;animation-play-state:paused;display:none}\
.playing .mp-disc,.playing .mp-disc span{animation-play-state:running}\
@keyframes mpSpin{to{transform:rotate(360deg)}}\
.mp-meta{min-width:0;display:grid;gap:1px;text-align:left;cursor:pointer}\
.mp-meta b{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.mp-meta small{font-size:12.5px;color:#a3abcc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.mp-ib{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#cdd3f0;transition:background .2s,color .2s,transform .15s}\
.mp-ib:hover{background:rgba(255,255,255,.08);color:#fff}.mp-ib:active{transform:scale(.92)}\
.mp-ib svg{width:24px;height:24px;fill:currentColor}\
#mp .mp-play{width:56px;height:56px;background:linear-gradient(145deg,#f4dfa6,var(--c));color:#1a1405!important;box-shadow:0 4px 14px -2px var(--c)}\
#mp .mp-play:hover{background:linear-gradient(145deg,#fff2c9,var(--c))!important}\
.mp-play svg{width:26px;height:26px}\
.mp-mini-bar{position:absolute;left:16px;right:16px;bottom:5px;height:4px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}\
.mp-mini-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--c),#fff2c9);border-radius:3px}\
.mp-cov{width:58px;height:58px;border-radius:15px;overflow:hidden;flex:none;cursor:pointer;box-shadow:0 0 0 1px rgba(255,255,255,.14),0 6px 16px rgba(0,0,0,.45),0 0 18px -6px var(--c)}\
.mp-cov img,.mp-row .ic img{width:100%;height:100%;object-fit:cover;display:block}\
.mp-art{overflow:visible}\
.mp-art .mp-disc{position:absolute;inset:0;width:100%;height:100%;transition:transform .7s cubic-bezier(.2,.8,.2,1)}\
.playing .mp-art .mp-disc{transform:translateX(22%)}\
.mp-cv{position:relative;width:100%;height:100%;object-fit:cover;border-radius:16px;display:block;z-index:1;box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.14),0 0 60px -10px var(--c)}\
.mp-art{margin-right:0}\
.mp-row .ic{overflow:hidden;background:none;padding:0}\
.mp-eq{display:none;align-items:flex-end;gap:2px;height:16px;width:16px;margin-right:2px}\
.playing .mp-eq{display:flex}.mp-eq i{flex:1;background:var(--c);border-radius:1px;height:30%;animation:mpEq 1s ease-in-out infinite}\
.mp-eq i:nth-child(2){animation-delay:-.4s}.mp-eq i:nth-child(3){animation-delay:-.7s}\
@keyframes mpEq{0%,100%{height:25%}50%{height:100%}}\
#mp .mp-fab{pointer-events:auto;position:absolute;right:16px;bottom:calc(18px + env(safe-area-inset-bottom,0px));height:64px;padding:0 22px 0 8px;border-radius:99px;display:none;align-items:center;gap:10px;border:1px solid rgba(244,223,166,.6);background:linear-gradient(145deg,rgba(40,52,110,.96),rgba(14,20,48,.96));backdrop-filter:blur(12px);box-shadow:0 10px 30px rgba(0,0,0,.55),0 0 0 4px rgba(217,178,95,.14),0 0 30px -4px var(--c);font-size:15px;font-weight:700;color:#f4dfa6;letter-spacing:.02em}\
.mp-fab img{width:48px;height:48px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px rgba(244,223,166,.5)}\
.mp-fab::before{content:'';position:absolute;inset:-6px;border-radius:99px;border:2px solid var(--c);opacity:.6;animation:mpFab 1.8s ease-out infinite;pointer-events:none}\
@keyframes mpFab{from{transform:scale(.96);opacity:.7}to{transform:scale(1.12,1.3);opacity:0}}\
.mp-fab:active{transform:scale(.96)}\
#mp .mp-fab.show{display:flex}\
\
.mp-sheet{pointer-events:none;position:fixed;inset:0;z-index:71;display:grid;align-items:end;justify-items:center;visibility:hidden;transition:visibility 0s .4s}\
.mp-open .mp-sheet{visibility:visible;transition-delay:0s;pointer-events:auto}\
.mp-back{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(0,0,0,.4),rgba(3,5,16,.8));backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .35s}\
.mp-open .mp-back{opacity:1}\
.mp-card{position:relative;width:min(980px,100%);height:min(720px,100dvh - 20px);margin-bottom:max(0px,env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:minmax(300px,380px) 1fr;border-radius:26px 26px 0 0;overflow:hidden;overflow:clip;border:1px solid rgba(217,178,95,.38);border-bottom:0;background:linear-gradient(180deg,#121a3c,#080b1b);box-shadow:0 -20px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.03) inset;transform:translateY(105%);transition:transform .45s cubic-bezier(.2,.85,.2,1)}\
.mp-open .mp-card{transform:none}\
.mp-glow{position:absolute;inset:-30%;background:radial-gradient(circle at 25% 30%,var(--c),transparent 45%);opacity:.22;filter:blur(40px);transition:background .6s;pointer-events:none}\
.mp-now{position:relative;overflow:hidden;overflow:clip;display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 24px 22px;text-align:center;border-right:1px solid rgba(160,172,230,.14);min-height:0}\
.mp-top{width:100%;display:flex;align-items:center;justify-content:space-between;font-family:var(--f-latin,'Cinzel',serif);letter-spacing:.2em;font-size:10.5px;color:#a3abcc}\
.mp-art{position:relative;width:min(250px,56vw);aspect-ratio:1;flex:none;margin-top:4px}\
.mp-art::before{content:'';position:absolute;inset:-10px;border-radius:50%;border:1px solid var(--c);opacity:.35;animation:mpPulse 2.6s ease-out infinite;animation-play-state:paused}\
.playing .mp-art::before{animation-play-state:running}\
@keyframes mpPulse{from{transform:scale(.96);opacity:.5}to{transform:scale(1.14);opacity:0}}\
.mp-vis{width:100%;height:46px;display:block}\
.mp-title{font-family:var(--f-book,'Gowun Batang',serif);font-size:clamp(19px,2.6vw,24px);font-weight:700;line-height:1.3;text-wrap:balance;color:#f4dfa6}\
.mp-sub{font-size:12.5px;color:#a3abcc;margin-top:-8px}\
.mp-seek{width:100%;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;gap:8px;font:11.5px var(--f-mono,'IBM Plex Mono',monospace);color:#a3abcc;font-variant-numeric:tabular-nums}\
.mp-seek span:first-child{text-align:right}\
.mp-rng{--p:0%;--b:0%;-webkit-appearance:none;appearance:none;width:100%;height:22px;background:none;cursor:pointer;margin:0;touch-action:none}\
.mp-rng::-webkit-slider-runnable-track{height:5px;border-radius:5px;background:linear-gradient(90deg,var(--c) var(--p),rgba(255,255,255,.28) var(--p) var(--b),rgba(255,255,255,.1) var(--b))}\
.mp-rng::-moz-range-track{height:5px;border-radius:5px;background:linear-gradient(90deg,var(--c) var(--p),rgba(255,255,255,.28) var(--p) var(--b),rgba(255,255,255,.1) var(--b))}\
.mp-rng::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;margin-top:-5px;background:#fff2c9;box-shadow:0 0 0 3px rgba(0,0,0,.25),0 0 12px var(--c);transition:transform .15s}\
.mp-rng::-moz-range-thumb{width:15px;height:15px;border:0;border-radius:50%;background:#fff2c9;box-shadow:0 0 12px var(--c)}\
.mp-rng:active::-webkit-slider-thumb{transform:scale(1.25)}\
.mp-ctrls{display:flex;align-items:center;justify-content:center;gap:6px}\
.mp-ctrls .mp-ib{width:44px;height:44px}.mp-ctrls .mp-play{width:60px;height:60px}.mp-ctrls .mp-play svg{width:28px;height:28px}\
.mp-ib.on{color:var(--c);background:rgba(255,255,255,.07)}\
.mp-ib{position:relative}.mp-ib .rb{position:absolute;right:7px;bottom:6px;font:700 8px/1 var(--f-mono,monospace);color:var(--c)}\
.mp-vol{display:flex;align-items:center;gap:6px;width:100%;max-width:240px;color:#a3abcc}\
.mp-vol svg{width:18px;height:18px;fill:currentColor;flex:none}\
\
.mp-list{position:relative;display:flex;flex-direction:column;min-height:0;min-width:0}\
.mp-lh{display:flex;align-items:center;justify-content:space-between;padding:20px 22px 12px;font-family:var(--f-latin,'Cinzel',serif);letter-spacing:.2em;font-size:11px;color:#f4dfa6}\
.mp-close{width:36px;height:36px;font-size:20px;border-radius:50%;color:#cdd3f0!important}\
.mp-close:hover{background:rgba(255,255,255,.08)}\
.mp-scroll{position:relative;overflow:auto;padding:0 12px 20px;scrollbar-width:thin;scrollbar-color:rgba(217,178,95,.4) transparent;overscroll-behavior:contain}\
.mp-gh{padding:14px 10px 6px;font-size:11.5px;letter-spacing:.14em;color:#6b7499;display:flex;align-items:center;gap:8px}\
.mp-gh::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(160,172,230,.2),transparent)}\
.mp-row{--c:#d9b25f;display:grid;grid-template-columns:30px 40px 1fr auto;align-items:center;gap:12px;width:100%;padding:8px 10px;border-radius:14px;text-align:left;transition:background .2s}\
.mp-row:hover{background:rgba(255,255,255,.05)}\
.mp-row.cur{background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.02));box-shadow:inset 3px 0 0 var(--c)}\
.mp-row .n{font:12px var(--f-mono,monospace);color:#6b7499;text-align:center}\
.mp-row.cur .n{color:var(--c)}\
.mp-row .ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:17px;color:#fff;background:linear-gradient(145deg,var(--c),#0b1026 140%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}\
.mp-row .tx{min-width:0;display:grid;gap:1px}\
.mp-row .tx b{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.mp-row.cur .tx b{color:#f4dfa6}\
.mp-row .tx small{font-size:11.5px;color:#a3abcc}\
.mp-row .du{font:11.5px var(--f-mono,monospace);color:#6b7499;font-variant-numeric:tabular-nums}\
.mp-row.na{opacity:.45}.mp-row.na .du{color:#8e7a4d}\
.mp-row .mp-eq{display:none}.mp-row.cur.pl .mp-eq{display:flex}.mp-row.cur.pl .du{display:none}\
.mp-toast{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);z-index:72;padding:9px 16px;border-radius:99px;font-size:12.5px;background:rgba(14,20,48,.95);border:1px solid rgba(217,178,95,.4);color:#efe7d2;opacity:0;pointer-events:none;transition:.3s}\
.mp-toast.show{opacity:1;transform:translate(-50%,0)}\
@media(max-width:760px){\
.mp-card{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);height:min(92dvh,760px);border-radius:22px 22px 0 0}\
.mp-now{border-right:0;border-bottom:1px solid rgba(160,172,230,.14);padding:16px 18px 12px;gap:10px}\
.mp-art{width:min(150px,34vw)}.mp-art .mp-disc{font-size:46px}.mp-vis{height:30px}\
.mp-vol{display:none}.mp-lh{padding-top:12px}\
.mp-pill{grid-template-columns:auto 1fr auto auto;gap:10px}#mp .mp-fab{height:54px;padding:0 16px 0 6px;font-size:14px;right:12px}.mp-fab img{width:42px;height:42px}.mp-pill .mp-prev{display:none}\
}\
@media(prefers-reduced-motion:reduce){.mp-disc,.mp-disc span,.mp-eq i,.mp-art::before,.mp-fab::before{animation:none!important}.mp-card{transition-duration:.01s}}\
";
  var sty = document.createElement("style"); sty.textContent = css; document.head.appendChild(sty);

  /* ───────── DOM ───────── */
  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM20 6.2v11.6a.8.8 0 0 1-1.25.66L10.5 12.7a.8.8 0 0 1 0-1.4l8.25-5.76A.8.8 0 0 1 20 6.2z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM4 6.2v11.6a.8.8 0 0 0 1.25.66l8.25-5.76a.8.8 0 0 0 0-1.4L5.25 5.54A.8.8 0 0 0 4 6.2z"/></svg>',
    shuf: '<svg viewBox="0 0 24 24"><path d="M16 4h4v4l-1.6-1.6L4.7 20.1 3.3 18.7 17 5 16 4zm0 16 1.6-1.6-3.2-3.2 1.4-1.4 3.2 3.2L20 16v4h-4zM3.3 5.3l1.4-1.4 5.1 5.1-1.4 1.4z"/></svg>',
    rep: '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
    vol: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
  };
  var root = document.createElement("div"); root.id = "mp";
  root.innerHTML =
    '<div class="mp-pill hide" id="mpPill">' +
      '<div class="mp-cov" id="mpD1"><img src="'+COVER_S+'" alt=""></div>' +
      '<button class="mp-meta" id="mpMeta" aria-label="플레이어 열기"><b id="mpT1">-</b><small id="mpS1">-</small></button>' +
      '<div class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<button class="mp-ib mp-prev" data-a="prev" aria-label="이전 곡">' + ICON.prev + '</button>' +
      '<button class="mp-ib mp-play" data-a="play" aria-label="재생">' + ICON.play + '</button>' +
      '<div class="mp-mini-bar"><i id="mpMB"></i></div>' +
    '</div>' +
    '<button class="mp-fab show" id="mpFab" aria-label="음악 열기"><img src="'+COVER_S+'" alt=""><span>♪ 음악 듣기</span></button>' +
    '<div class="mp-sheet" id="mpSheet"><div class="mp-back" id="mpBack"></div>' +
      '<div class="mp-card" role="dialog" aria-modal="true" aria-label="뮤직 플레이어"><div class="mp-glow"></div>' +
        '<div class="mp-now">' +
          '<div class="mp-top"><span>ETERNA MUSIC</span><span id="mpCnt">1 / 1</span></div>' +
          '<div class="mp-art"><div class="mp-disc" id="mpD2"></div><img class="mp-cv" src="'+COVER+'" alt="앨범 표지"></div>' +
          '<canvas class="mp-vis" id="mpVis" aria-hidden="true"></canvas>' +
          '<div class="mp-title" id="mpT2">-</div><div class="mp-sub" id="mpS2">-</div>' +
          '<div class="mp-seek"><span id="mpCur">0:00</span><input class="mp-rng" id="mpSeek" type="range" min="0" max="1000" value="0" aria-label="재생 위치"><span id="mpDur">0:00</span></div>' +
          '<div class="mp-ctrls">' +
            '<button class="mp-ib" data-a="shuf" aria-label="셔플" aria-pressed="false">' + ICON.shuf + '</button>' +
            '<button class="mp-ib" data-a="prev" aria-label="이전 곡">' + ICON.prev + '</button>' +
            '<button class="mp-ib mp-play" data-a="play" aria-label="재생">' + ICON.play + '</button>' +
            '<button class="mp-ib" data-a="next" aria-label="다음 곡">' + ICON.next + '</button>' +
            '<button class="mp-ib" data-a="rep" aria-label="반복">' + ICON.rep + '<span class="rb" id="mpRb"></span></button>' +
          '</div>' +
          '<div class="mp-vol">' + ICON.vol + '<input class="mp-rng" id="mpVol" type="range" min="0" max="100" value="70" aria-label="볼륨"></div>' +
        '</div>' +
        '<div class="mp-list"><div class="mp-lh"><span>PLAYLIST</span><button class="mp-close" id="mpClose" aria-label="닫기">✕</button></div><div class="mp-scroll" id="mpList"></div></div>' +
      '</div></div>';
  document.body.appendChild(root);
  var toastEl = document.createElement("div"); toastEl.className = "mp-toast"; document.body.appendChild(toastEl);

  function $(id) { return document.getElementById(id); }
  var au = new Audio(); au.preload = "metadata"; au.crossOrigin = "anonymous";
  var avail = {}, durs = {}, order = [], pos = 0, tmr, wantPlay = false, fadeT;

  function toast(m) { toastEl.textContent = m; toastEl.classList.add("show"); clearTimeout(tmr); tmr = setTimeout(function () { toastEl.classList.remove("show"); }, 2200); }
  function fmt(s) { if (!isFinite(s)) return "0:00"; s = Math.floor(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  /* 순서(셔플) */
  function buildOrder(keep) {
    order = TRACKS.map(function (_, i) { return i; });
    if (st.shuf) { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = order[i]; order[i] = order[j]; order[j] = x; } if (keep != null) { order.splice(order.indexOf(keep), 1); order.unshift(keep); } }
    pos = Math.max(0, order.indexOf(keep == null ? st.idx : keep));
  }

  /* 목록 */
  function renderList() {
    var h = "", last = "";
    TRACKS.forEach(function (tr, i) {
      if (tr.g !== last) { h += '<div class="mp-gh">' + tr.g + '</div>'; last = tr.g; }
      h += '<button class="mp-row' + (avail[i] === false ? " na" : "") + '" data-i="' + i + '" style="--c:' + tr.c + '"><span class="n">' + (i + 1) + '</span><span class="ic"><img src="' + COVER_S + '" alt=""></span><span class="tx"><b>' + tr.t + '</b><small>' + tr.s + '</small></span><span class="du">' + (avail[i] === false ? "준비 중" : (durs[i] ? fmt(durs[i]) : "")) + '</span><span class="mp-eq"><i></i><i></i><i></i></span></button>';
    });
    $("mpList").innerHTML = h; markCur();
  }
  function markCur() {
    var rows = $("mpList").querySelectorAll(".mp-row");
    for (var k = 0; k < rows.length; k++) { var on = +rows[k].dataset.i === st.idx; rows[k].classList.toggle("cur", on); rows[k].classList.toggle("pl", on && !au.paused); }
  }
  /* 길이 미리 읽기 (조용히) */
  function probe(i) { var a = new Audio(); a.preload = "metadata"; a.src = TRACKS[i].f; a.onloadedmetadata = function () { avail[i] = true; durs[i] = a.duration; renderList(); }; a.onerror = function () { avail[i] = false; renderList(); }; }

  /* 현재 곡 표시 */
  function paint() {
    var tr = TRACKS[st.idx];
    root.style.setProperty("--c", tr.c);
    $("mpT1").textContent = $("mpT2").textContent = tr.t;
    $("mpS1").textContent = $("mpS2").textContent = tr.s;
    
    $("mpCnt").textContent = (st.idx + 1) + " / " + TRACKS.length;
    markCur();
    if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: tr.t, artist: "소환수 아카데미", album: "소환수 아카데미 OST", artwork: [{ src: COVER, sizes: "640x640", type: "image/jpeg" }] });
  }
  function setPlayUI() {
    var pl = !au.paused;
    root.classList.toggle("playing", pl);
    var b = root.querySelectorAll('[data-a="play"]');
    for (var k = 0; k < b.length; k++) { b[k].innerHTML = pl ? ICON.pause : ICON.play; b[k].setAttribute("aria-label", pl ? "일시정지" : "재생"); }
    markCur();
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = pl ? "playing" : "paused";
  }

  /* 페이드 */
  function fadeTo(v, ms, done) { clearInterval(fadeT); var s = au.volume, t0 = performance.now(); fadeT = setInterval(function () { var p = Math.min(1, (performance.now() - t0) / ms); au.volume = Math.max(0, Math.min(1, s + (v - s) * p)); if (p >= 1) { clearInterval(fadeT); done && done(); } }, 30); }

  function load(i, autoplay, startAt) {
    st.idx = i; st.t = startAt || 0; save(); paint();
    au.src = TRACKS[i].f; au.load();
    $("mpSeek").value = 0; setRng(0, 0);
    if (startAt) au.addEventListener("loadedmetadata", function f() { au.removeEventListener("loadedmetadata", f); try { au.currentTime = startAt; } catch (e) {} });
    if (autoplay) play();
  }
  function play() {
    wantPlay = true; ensureCtx();
    au.volume = 0;
    var p = au.play();
    if (p && p.then) p.then(function () { fadeTo(st.vol, 600); }).catch(function (e) { if (e && e.name !== "AbortError") { setPlayUI(); } });
    root.querySelector("#mpPill").classList.remove("hide"); $("mpFab").classList.remove("show");
  }
  function pause() { wantPlay = false; fadeTo(0, 300, function () { au.pause(); au.volume = st.vol; }); }
  function toggle() { if (au.paused) play(); else pause(); }
  function step(d, auto) {
    var tries = TRACKS.length;
    while (tries--) {
      pos += d;
      if (pos >= order.length) { if (auto && st.rep === 0) { wantPlay = false; pos = order.length - 1; return; } pos = 0; }
      if (pos < 0) pos = order.length - 1;
      if (avail[order[pos]] !== false) { load(order[pos], true); return; }
    }
  }
  function setRng(p, b) { var e = $("mpSeek"); e.style.setProperty("--p", p + "%"); e.style.setProperty("--b", Math.max(p, b) + "%"); }

  /* 이벤트 */
  au.addEventListener("play", setPlayUI); au.addEventListener("pause", setPlayUI); au.addEventListener("pause", function () { if (!wantPlay) save(); });
  addEventListener("pagehide", function () { st.t = au.currentTime || st.t; var on = !au.paused; save(); st.on = on; try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} });
  au.addEventListener("ended", function () { if (st.rep === 2) { au.currentTime = 0; play(); } else step(1, true); });
  au.addEventListener("loadedmetadata", function () { $("mpDur").textContent = fmt(au.duration); durs[st.idx] = au.duration; avail[st.idx] = true; });
  au.addEventListener("error", function () {
    avail[st.idx] = false; renderList();
    if (wantPlay) { toast("‘" + TRACKS[st.idx].t + "’ 음원이 아직 없어요. 다음 곡으로 넘어갑니다."); var any = TRACKS.some(function (_, i) { return avail[i] !== false; }); if (any) step(1, true); else { wantPlay = false; setPlayUI(); toast("재생할 수 있는 곡이 아직 없어요 (music 폴더 확인)"); } }
  });
  var seeking = false;
  au.addEventListener("timeupdate", function () {
    if (seeking || !au.duration) return;
    var p = au.currentTime / au.duration * 100, b = 0;
    try { if (au.buffered.length) b = au.buffered.end(au.buffered.length - 1) / au.duration * 100; } catch (e) {}
    $("mpSeek").value = p * 10; setRng(p, b); $("mpMB").style.width = p + "%"; $("mpCur").textContent = fmt(au.currentTime);
    if (!(au._s && performance.now() - au._s < 3000)) { au._s = performance.now(); st.t = au.currentTime; save(); }
  });
  var sk = $("mpSeek");
  sk.addEventListener("input", function () { seeking = true; var p = sk.value / 10; setRng(p, p); $("mpCur").textContent = fmt(au.duration * p / 100); });
  sk.addEventListener("change", function () { if (au.duration) au.currentTime = au.duration * sk.value / 1000; seeking = false; });
  var vl = $("mpVol"); vl.value = st.vol * 100; vl.style.setProperty("--p", vl.value + "%"); vl.style.setProperty("--b", vl.value + "%");
  vl.addEventListener("input", function () { st.vol = vl.value / 100; au.volume = st.vol; vl.style.setProperty("--p", vl.value + "%"); vl.style.setProperty("--b", vl.value + "%"); save(); });

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-a]"); if (b) {
      var a = b.dataset.a;
      if (a === "play") { if (au.paused && avail[st.idx] === false) step(1, false); else toggle(); }
      else if (a === "next") step(1, false);
      else if (a === "prev") { if (au.currentTime > 4) au.currentTime = 0; else step(-1, false); }
      else if (a === "shuf") { st.shuf = !st.shuf; buildOrder(st.idx); syncModes(); toast(st.shuf ? "셔플 켬" : "셔플 끔"); save(); }
      else if (a === "rep") { st.rep = (st.rep + 1) % 3; syncModes(); toast(["반복 끔", "전체 반복", "한 곡 반복"][st.rep]); save(); }
      return;
    }
    var r = e.target.closest(".mp-row"); if (r) { var i = +r.dataset.i; if (avail[i] === false) { toast("이 곡의 음원은 아직 준비 중이에요"); return; } if (i === st.idx) toggle(); else { pos = order.indexOf(i); load(i, true); } }
  });
  function syncModes() {
    var s = root.querySelector('[data-a="shuf"]'), r = root.querySelector('[data-a="rep"]');
    s.classList.toggle("on", st.shuf); s.setAttribute("aria-pressed", st.shuf); r.classList.toggle("on", st.rep > 0); $("mpRb").textContent = st.rep === 2 ? "1" : "";
  }
  function open(v) { root.classList.toggle("mp-open", v); document.documentElement.style.overflow = v ? "hidden" : ""; if (v) { var c = $("mpList").querySelector(".cur"); if (c) { var L = $("mpList"); L.scrollTop = c.offsetTop - L.clientHeight / 2 + c.offsetHeight / 2; } $("mpClose").focus({ preventScroll: true }); } else if (!root.querySelector("#mpPill").classList.contains("hide")) { } }
  $("mpMeta").onclick = $("mpD1").onclick = function () { open(true); };
  $("mpFab").onclick = function () { open(true); };
  $("mpClose").onclick = $("mpBack").onclick = function () { open(false); };
  addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("mp-open")) { open(false); return; }
    if (!root.classList.contains("mp-open")) return;
    var tg = e.target && e.target.tagName; if (tg === "INPUT" && e.key !== " ") { if (e.key === "ArrowLeft" || e.key === "ArrowRight") return; }
    if (e.key === " " && tg !== "BUTTON") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight" && tg !== "INPUT") au.currentTime = Math.min(au.duration || 0, au.currentTime + 5);
    else if (e.key === "ArrowLeft" && tg !== "INPUT") au.currentTime = Math.max(0, au.currentTime - 5);
    else if (e.key === "ArrowUp") { e.preventDefault(); vl.value = Math.min(100, +vl.value + 5); vl.dispatchEvent(new Event("input")); }
    else if (e.key === "ArrowDown") { e.preventDefault(); vl.value = Math.max(0, +vl.value - 5); vl.dispatchEvent(new Event("input")); }
  });
  if ("mediaSession" in navigator) {
    var ms = navigator.mediaSession;
    ms.setActionHandler("play", play); ms.setActionHandler("pause", pause);
    ms.setActionHandler("previoustrack", function () { step(-1, false); }); ms.setActionHandler("nexttrack", function () { step(1, false); });
    try { ms.setActionHandler("seekto", function (d) { au.currentTime = d.seekTime; }); } catch (e) {}
  }

  /* 비주얼라이저 (Web Audio, 실패하면 장식 파형) */
  var ctx, an, data, cv = $("mpVis"), cx = cv.getContext("2d"), fake = false;
  function ensureCtx() {
    if (ctx || fake) { if (ctx && ctx.state === "suspended") ctx.resume(); return; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext; ctx = new AC();
      var src = ctx.createMediaElementSource(au); an = ctx.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = .82;
      src.connect(an); an.connect(ctx.destination); data = new Uint8Array(an.frequencyBinCount);
    } catch (e) { fake = true; ctx = null; }
  }
  function sizeCv() { var d = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(); cv.width = r.width * d; cv.height = r.height * d; }
  addEventListener("resize", sizeCv);
  var RMo = matchMedia("(prefers-reduced-motion:reduce)").matches;
  function frame(t) {
    requestAnimationFrame(frame);
    if (!root.classList.contains("mp-open")) return;
    if (!cv.width) sizeCv();
    var w = cv.width, h = cv.height, n = 40, bw = w / n, col = getComputedStyle(root).getPropertyValue("--c") || "#d9b25f";
    cx.clearRect(0, 0, w, h);
    if (an && !au.paused) an.getByteFrequencyData(data);
    for (var i = 0; i < n; i++) {
      var v;
      if (an && !au.paused) v = data[Math.floor(i / n * data.length * .75)] / 255;
      else if (!au.paused && !RMo) v = .25 + .35 * Math.abs(Math.sin(t / 380 + i * .55)) * Math.abs(Math.cos(t / 900 + i * .21));
      else v = .06;
      var bh = Math.max(3, v * h * .95);
      var g = cx.createLinearGradient(0, h, 0, h - bh); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,242,201,.9)");
      cx.fillStyle = g; var x = i * bw + bw * .18, ww = bw * .64, r = Math.min(ww / 2, 4);
      cx.beginPath(); cx.moveTo(x, h); cx.lineTo(x, h - bh + r); cx.quadraticCurveTo(x, h - bh, x + r, h - bh); cx.lineTo(x + ww - r, h - bh); cx.quadraticCurveTo(x + ww, h - bh, x + ww, h - bh + r); cx.lineTo(x + ww, h); cx.fill();
    }
  }
  requestAnimationFrame(frame);

  /* 시작 */
  var OPEN = 0; TRACKS.forEach(function (t, i) { if (t.open) OPEN = i; });
  var RESUME = st.at && Date.now() - st.at < 30 * 60 * 1000 && st.on && st.idx >= 0 && st.idx < TRACKS.length;
  if (!RESUME) { st.idx = OPEN; st.t = 0; }
  buildOrder(st.idx); renderList(); paint(); syncModes(); au.volume = st.vol;
  au.src = TRACKS[st.idx].f; if (st.t) au.addEventListener("loadedmetadata", function f() { au.removeEventListener("loadedmetadata", f); try { au.currentTime = st.t; } catch (e) {} });
  TRACKS.forEach(function (_, i) { if (i !== st.idx) setTimeout(function () { probe(i); }, 200 + i * 120); });
  /* 입장 시 오프닝곡 자동 재생: 브라우저가 막으면 첫 터치/클릭/키 입력 때 시작 */
  (function () {
    var started = false;
    function go() { if (started) return; started = true; off(); play(); }
    var ev = ["pointerdown", "touchstart", "keydown", "wheel"];
    function off() { ev.forEach(function (e) { removeEventListener(e, onG, true); }); }
    function onG(e) { if (e.target && e.target.closest && e.target.closest("#mp")) { started = true; off(); return; } go(); }
    ev.forEach(function (e) { addEventListener(e, onG, true); });
    var p; try { au.volume = 0; p = au.play(); } catch (e) {}
    if (p && p.then) p.then(function () { started = true; off(); wantPlay = true; ensureCtx(); fadeTo(st.vol, 1200); root.querySelector("#mpPill").classList.remove("hide"); $("mpFab").classList.remove("show"); }).catch(function () { setTimeout(function () { if (!started) toast("화면을 한 번 터치하면 오프닝 음악이 시작돼요 ♪"); }, 1500); });
  })();
  window.EternaMusic = { open: function () { open(true); }, play: play, pause: pause, tracks: TRACKS,
    playIndex: function (i) { if (i === st.idx) { toggle(); return; } pos = order.indexOf(i); load(i, true); },
    state: function () { return { idx: st.idx, playing: !au.paused }; } };
  function emit() { document.dispatchEvent(new CustomEvent("eterna-music", { detail: { idx: st.idx, playing: !au.paused } })); }
  au.addEventListener("play", emit); au.addEventListener("pause", emit); au.addEventListener("loadstart", emit);
})();
