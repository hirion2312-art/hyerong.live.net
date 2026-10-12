/* 에테르나 공통 메뉴 — <script src=".../eterna/common/nav.js" data-site="hub|guide|enroll|codex" data-tone="light|dark"></script> */
(function () {
  "use strict";
  var me = document.currentScript, BASE = me && me.src ? me.src.replace(/[^/]*$/, "") : "";
  var site = (me && me.dataset.site) || "", tone = (me && me.dataset.tone) || "light";
  var LINKS = [
    { k: "hub", t: "정문", h: BASE + "../", i: '<path d="M4 20V10l8-6 8 6v10h-5v-6H9v6z"/>' },
    { k: "guide", t: "세계관", h: BASE + "../../academy-guide/", i: '<path d="M5 4h9a5 5 0 0 1 5 5v11H10a5 5 0 0 1-5-5zm3 4v2h8V8zm0 4v2h6v-2z"/>' },
    { k: "enroll", t: "입학", h: BASE + "../../academy/", i: '<path d="M12 2l2.4 6.3L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.6-.7z"/>' },
    { k: "codex", t: "도감", h: BASE + "../../academy-codex/", i: '<path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2zm9-2h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5z"/>' }
  ];
  var css = "\
#enav{--g:#c99a3e;--ink:#27305f;--glass:rgba(246,243,250,.66);--bd:rgba(255,255,255,.75);--sh:0 10px 30px -10px rgba(70,60,140,.35),0 2px 6px rgba(70,60,140,.08);--mute:#6a6f99;--act:linear-gradient(135deg,#fff6df,#f4dca4);\
position:fixed;z-index:65;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);width:min(900px,calc(100% - 20px));display:flex;align-items:center;gap:6px;padding:6px 6px 6px 12px;border-radius:99px;\
background:var(--glass);border:1px solid var(--bd);box-shadow:var(--sh);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;font-weight:700;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s}\
#enav.dark{--ink:#f2e9d4;--glass:rgba(16,22,52,.6);--bd:rgba(217,178,95,.32);--sh:0 10px 30px -8px rgba(0,0,0,.55);--mute:#a3abcc;--act:linear-gradient(135deg,rgba(244,223,166,.22),rgba(217,178,95,.12))}\
#enav.up{transform:translate(-50%,calc(-100% - 20px));opacity:0}\
#enav a,#enav button{font:inherit;color:inherit;text-decoration:none;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}\
#enav .lg{display:flex;align-items:center;flex:none;margin-right:auto}\
#enav .lg img{height:38px;width:auto;display:block;filter:drop-shadow(0 1px 1px rgba(40,40,110,.55)) drop-shadow(0 3px 8px rgba(80,70,160,.35));transition:transform .3s}\
#enav .lg:hover img{transform:rotate(-3deg) scale(1.05)}\
#enav nav{display:flex;gap:2px}\
#enav nav a{position:relative;display:flex;align-items:center;gap:6px;padding:9px 15px;border-radius:99px;color:var(--mute);font-size:15.5px;font-weight:800;letter-spacing:-.01em;transition:color .2s,background .2s}\
#enav nav a svg{width:16px;height:16px;fill:currentColor;opacity:.85}\
#enav nav a:hover{color:var(--ink);background:rgba(255,255,255,.35)}\
#enav.dark nav a:hover{background:rgba(255,255,255,.06)}\
#enav nav a[aria-current]{color:var(--ink);background:var(--act);box-shadow:inset 0 0 0 1px rgba(201,154,62,.35),0 4px 12px -6px rgba(201,154,62,.6)}\
#enav nav a[aria-current] svg{fill:var(--g);opacity:1}\
#enav .tg{display:flex;gap:2px;margin-left:6px;padding-left:6px;border-left:1px solid rgba(120,120,180,.18)}\
#enav .tg button{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--mute);transition:.2s}\
#enav .tg button:hover{color:var(--ink);background:rgba(255,255,255,.4)}\
#enav .tg button svg{width:19px;height:19px;fill:currentColor}\
#enav .tg button.off{opacity:.45}\
#enav a:focus-visible,#enav button:focus-visible{outline:2px solid var(--g);outline-offset:2px}\
@media(max-width:640px){#enav{padding:5px 5px 5px 8px;gap:2px}#enav .lg img{height:30px}#enav nav a{padding:8px 9px;font-size:14px}#enav nav a svg{display:none}#enav .tg{margin-left:2px;padding-left:2px}#enav .tg button{width:34px;height:34px}#enav .tg button svg{width:17px;height:17px}}\
@media(max-width:360px){#enav .lg{display:none}#enav nav{margin-right:auto}}\
";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var SPK = '<path d="M3 9v6h4l5 4V5L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>';
  var MUTE = '<path d="M3 9v6h4l5 4V5L7 9zm13.6 3 2.7-2.7-1.3-1.3-2.7 2.7-2.7-2.7-1.3 1.3 2.7 2.7-2.7 2.7 1.3 1.3 2.7-2.7 2.7 2.7 1.3-1.3z"/>';
  var NOTE = '<path d="M9 18.5a3 3 0 1 1-2-2.83V5l12-2v12.5a3 3 0 1 1-2-2.83V7.4l-8 1.33z"/>';
  var h = document.createElement("header"); h.id = "enav"; if (tone === "dark") h.className = "dark";
  h.innerHTML = '<a class="lg" href="' + LINKS[0].h + '" aria-label="에테르나 정문" data-sfx="click"><img src="' + BASE + 'img/logo_s.webp" alt="소환수 아카데미"></a><nav aria-label="사이트 메뉴">' +
    LINKS.map(function (l) { return '<a href="' + l.h + '" data-sfx="click" data-sfx-hover' + (l.k === site ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + l.i + '</svg>' + l.t + '</a>'; }).join("") +
    '</nav><div class="tg"><button id="enSfx" aria-label="효과음 켜기/끄기"></button><button id="enMus" aria-label="음악 플레이어 열기" data-sfx="open"><svg viewBox="0 0 24 24">' + NOTE + '</svg></button></div>';
  document.body.appendChild(h);
  var sb = h.querySelector("#enSfx");
  function syncS() { var on = !window.EternaSFX || EternaSFX.on; sb.innerHTML = '<svg viewBox="0 0 24 24">' + (on ? SPK : MUTE) + '</svg>'; sb.classList.toggle("off", !on); sb.setAttribute("aria-pressed", on); sb.title = on ? "효과음 켜짐" : "효과음 꺼짐"; }
  sb.onclick = function () { if (window.EternaSFX) { EternaSFX.toggle(); if (EternaSFX.on) EternaSFX.play("click"); } syncS(); };
  document.addEventListener("eterna-sfx", syncS); setTimeout(syncS, 0);
  h.querySelector("#enMus").onclick = function () { if (window.EternaMusic) EternaMusic.open(); };
  var ly = scrollY;
  addEventListener("scroll", function () { var y = scrollY; if (y > 140 && y > ly + 6) h.classList.add("up"); else if (y < ly - 6 || y < 140) h.classList.remove("up"); ly = y; }, { passive: true });
})();
