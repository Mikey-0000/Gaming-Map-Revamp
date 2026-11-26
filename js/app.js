/* =========================================================
   HISTORICAL GAMING MAP — REVAMP
   All interactivity: boot screen, star field, map, popups,
   archive, timeline, versus mode, quiz, search, achievements.
   Plain JavaScript, no libraries.
   ========================================================= */
(function () {
  "use strict";

  const { PATHS, GENRES, GAMES, FIGURES, MIX_LABELS, QUIZ, ACHIEVEMENTS } = window.ARCHIVE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const PATH = Object.fromEntries(PATHS.map((p) => [p.id, p]));
  const GAME_IDS = Object.keys(GAMES);

  /* which path a game belongs to (first path listing its genre) */
  const pathOfGenre = (g) => PATHS.find((p) => p.genres.includes(g));
  const pathOfGame = (id) => pathOfGenre(GAMES[id].genre);
  const colorOfGame = (id) => pathOfGame(id).color;

  /* ---------------- saved progress ---------------- */
  const KEY = "ghm-revamp-v1";
  const fresh = { xp: 0, ach: {}, games: [], paths: [], figures: [], sound: false };
  let S;
  try { S = Object.assign({}, fresh, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = Object.assign({}, fresh); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };

  /* ---------------- sound (Web Audio, off by default) ---------------- */
  let actx = null;
  function beep(freq = 660, dur = 0.08, type = "square", vol = 0.05, when = 0) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      const t = actx.currentTime + when;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = {
    blip: () => beep(880, 0.04, "square", 0.03),
    open: () => { beep(523, 0.07); beep(784, 0.09, "square", 0.05, 0.07); },
    close: () => beep(330, 0.06, "triangle", 0.05),
    coin: () => { beep(988, 0.06); beep(1319, 0.18, "square", 0.05, 0.06); },
    trophy: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, "square", 0.05, i * 0.09)),
    start: () => [262, 330, 392, 523, 659, 784].forEach((f, i) => beep(f, 0.09, "square", 0.05, i * 0.06)),
  };
  const soundBtn = $("#soundBtn");
  function renderSound() { soundBtn.textContent = S.sound ? "🔊" : "🔇"; soundBtn.setAttribute("aria-pressed", String(S.sound)); }
  soundBtn.addEventListener("click", () => { S.sound = !S.sound; save(); renderSound(); sfx.coin(); });
  renderSound();

  /* ---------------- particles & effects ---------------- */
  const fx = $("#fx");
  function burst(x, y, color = "#ffd23f", n = 18) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = x + "px"; p.style.top = y + "px";
      p.style.background = i % 3 === 0 ? "#fff" : color;
      fx.appendChild(p);
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
      p.animate([
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 30}px) scale(0)`, opacity: 0 },
      ], { duration: 600 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => p.remove();
    }
  }
  function xpPop(x, y, amount) {
    const t = document.createElement("div");
    t.className = "xp-pop"; t.textContent = "+" + amount + " XP";
    t.style.left = x + "px"; t.style.top = y + "px";
    fx.appendChild(t); setTimeout(() => t.remove(), 1000);
  }
  function coinRain(n = 40) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("img");
      c.src = i % 5 === 0 ? "assets/img/heart.png" : "assets/img/coin.png";
      c.className = "coin-rain pixel"; c.alt = "";
      c.style.left = Math.random() * 100 + "vw";
      c.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * 0.8 + "s";
      fx.appendChild(c); setTimeout(() => c.remove(), 4400);
    }
  }
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* ---------------- XP & achievements ---------------- */
  function renderXP() {
    $("#lvl").textContent = Math.floor(S.xp / 100) + 1;
    $("#xpFill").style.width = (S.xp % 100) + "%";
    $("#trophyCount").textContent = Object.keys(S.ach).length;
  }
  function addXP(n, el) {
    const before = Math.floor(S.xp / 100);
    S.xp += n; save(); renderXP();
    if (el) { const [x, y] = centerOf(el); xpPop(x, y - 20, n); }
    if (Math.floor(S.xp / 100) > before) toast("LEVEL UP!", "You reached level " + (Math.floor(S.xp / 100) + 1) + ".", "assets/img/coin.png", "NEW LEVEL");
  }
  function unlock(id) {
    if (S.ach[id]) return;
    S.ach[id] = Date.now(); save(); renderXP();
    const a = ACHIEVEMENTS[id];
    sfx.trophy();
    toast(a.name, a.text, "assets/img/trophy.png", "ACHIEVEMENT UNLOCKED");
    addXP(25);
    if (Object.keys(S.ach).length === Object.keys(ACHIEVEMENTS).length) setTimeout(() => { coinRain(70); toast("100% COMPLETE", "You found every achievement. Legend.", "assets/img/heart.png", "PLATINUM"); }, 1200);
  }
  function toast(title, text, img, small) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<img class="pixel" src="${img}" alt=""><div><small>${small}</small><b>${title}</b><span>${text}</span></div>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 3600);
  }

  /* ---------------- boot screen ---------------- */
  const boot = $("#boot");
  const bootLines = ["> LOADING ARCHIVE OS v2.0", "> MOUNTING 7 PATHS........ OK", "> INDEXING 27 GAME FILES... OK", "> CALIBRATING NOSTALGIA.... OK", "> READY PLAYER ONE"];
  document.body.classList.add("locked");
  (function runBoot() {
    const log = $("#bootLog"), bar = $("#bootBar");
    let i = 0;
    const step = () => {
      if (i < bootLines.length) {
        log.insertAdjacentHTML("beforeend", bootLines[i] + "<br>");
        bar.style.width = ((i + 1) / bootLines.length) * 100 + "%";
        i++; setTimeout(step, reduced ? 0 : 260);
      }
    };
    step();
  })();
  function start() {
    if (boot.classList.contains("gone")) return;
    sfx.start();
    boot.classList.add("gone");
    document.body.classList.remove("locked");
    setTimeout(() => { boot.remove(); unlock("boot"); }, 600);
    startHero();
  }
  $("#startBtn").addEventListener("click", start);
  $("#startBtn").focus();

  /* ---------------- star field ---------------- */
  const cv = $("#stars"), ctx = cv.getContext("2d");
  let W, H, stars = [], shooting = null, mx = 0, my = 0;
  function sizeStars() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((W * H) / 7000) }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.9 + 0.1, t: Math.random() * 6.28,
      c: ["#ffffff", "#3ee6c1", "#8b7bff", "#ffd23f"][Math.random() < 0.8 ? 0 : (Math.random() * 3 + 1) | 0],
    }));
  }
  function drawStars(time) {
    ctx.clearRect(0, 0, W, H);
    const sy = scrollY * 0.15;
    for (const s of stars) {
      const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(time / 600 + s.t);
      let x = s.x + mx * s.z * 18, y = (s.y - sy * s.z) % H;
      if (y < 0) y += H;
      ctx.globalAlpha = tw * s.z;
      ctx.fillStyle = s.c;
      const size = s.z > 0.75 ? 2 : 1;
      ctx.fillRect(x | 0, y | 0, size, size);
    }
    if (!reduced) {
      if (!shooting && Math.random() < 0.004) shooting = { x: Math.random() * W, y: Math.random() * H * 0.4, life: 0 };
      if (shooting) {
        shooting.life += 1;
        const len = 80, x = shooting.x + shooting.life * 9, y = shooting.y + shooting.life * 4;
        const g = ctx.createLinearGradient(x, y, x - len, y - len * 0.45);
        g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 1 - shooting.life / 40; ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len, y - len * 0.45); ctx.stroke();
        if (shooting.life > 40) shooting = null;
      }
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(drawStars);
  }
  sizeStars(); requestAnimationFrame(drawStars);
  addEventListener("resize", () => { sizeStars(); if (reduced) drawStars(0); layoutMap(); });

  /* cursor glow + star parallax */
  const glow = $("#cursorGlow");
  if (finePointer && !reduced) {
    addEventListener("pointermove", (e) => {
      glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
      mx = (e.clientX / W - 0.5); my = (e.clientY / H - 0.5);
    }, { passive: true });
  } else glow.remove();
  const setGlow = (c) => { if (glow.isConnected) glow.style.background = `radial-gradient(circle, ${c}22, transparent 65%)`; };

  /* ---------------- hero ---------------- */
  function startHero() {
    const lines = [
      "Navigate video game history through the actions that define how we play.",
      "Explore. Solve. Jump. Build. Fight. Run. Survive.",
      "Every node is a path. Every path is a piece of history.",
    ];
    const el = $("#typeLine");
    let li = 0, ci = 0, deleting = false;
    (function type() {
      const full = lines[li];
      if (reduced) { el.textContent = lines[0]; return; }
      el.textContent = full.slice(0, ci);
      if (!deleting && ci < full.length) { ci++; setTimeout(type, 28); }
      else if (!deleting) { deleting = true; setTimeout(type, 2600); }
      else if (ci > 0) { ci -= 2; setTimeout(type, 12); }
      else { deleting = false; li = (li + 1) % lines.length; setTimeout(type, 300); }
    })();
    $$("[data-count]").forEach((b) => {
      const end = +b.dataset.count, t0 = performance.now();
      const tick = (t) => { const k = Math.min(1, (t - t0) / 1200); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }

  /* ---------------- interactive map ---------------- */
  const wrap = $("#mapWrap"), nodesEl = $("#mapNodes"), linesSvg = $("#mapLines"), tip = $("#mapTip");
  nodesEl.innerHTML = PATHS.map((p, i) => `
    <button class="node ${S.paths.includes(p.id) ? "visited" : ""}" type="button" data-path="${p.id}" style="--c:${p.color}" aria-label="${p.name} path: ${p.tag}">
      <div class="node-orb" style="animation-delay:${-i * 0.7}s"><img class="pixel" src="assets/img/${p.id}.png" alt=""></div>
      <span class="node-num">PATH ${p.num}</span>
      <span class="node-name">${p.name.toUpperCase()}</span>
    </button>`).join("");
  function layoutMap() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    const rx = Math.min(w * 0.38, 420), ry = h * 0.34;
    let svg = "";
    $$(".node", nodesEl).forEach((n, i) => {
      const a = -Math.PI / 2 + (i / PATHS.length) * Math.PI * 2;
      const x = w / 2 + Math.cos(a) * rx, y = h / 2 + Math.sin(a) * ry - 10;
      n.style.left = x + "px"; n.style.top = y + "px";
      svg += `<line data-for="${n.dataset.path}" x1="${w / 2}" y1="${h / 2}" x2="${x}" y2="${y - 20}" stroke="${PATH[n.dataset.path].color}"/>`;
    });
    // ring connecting neighbours
    const pts = $$(".node", nodesEl).map((n) => [parseFloat(n.style.left), parseFloat(n.style.top) - 20]);
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; svg += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="rgba(140,160,255,.25)"/>`; });
    linesSvg.innerHTML = svg;
  }
  layoutMap();
  nodesEl.addEventListener("pointerover", (e) => {
    const n = e.target.closest(".node"); if (!n) return;
    const p = PATH[n.dataset.path];
    tip.innerHTML = `<b style="color:${p.color}">${p.num} // ${p.name.toUpperCase()}</b>${p.blurb}`;
    tip.classList.add("show");
    $$("line", linesSvg).forEach((l) => l.classList.toggle("hot", l.dataset.for === p.id));
    setGlow(p.color); sfx.blip();
  });
  nodesEl.addEventListener("pointerout", (e) => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(".node")) { tip.classList.remove("show"); $$("line", linesSvg).forEach((l) => l.classList.remove("hot")); } });
  nodesEl.addEventListener("click", (e) => {
    const n = e.target.closest(".node"); if (!n) return;
    const [x, y] = centerOf(n.querySelector(".node-orb"));
    burst(x, y, PATH[n.dataset.path].color, 24); sfx.coin();
    openPath(n.dataset.path, n);
  });

  /* ---------------- modal system ---------------- */
  const modal = $("#modal"), card = $(".modal-card", modal), body = $("#modalBody");
  let lastFocus = null;
  function openModal(html, color) {
    if (modal.hidden) lastFocus = document.activeElement;
    card.style.setProperty("--c", color || "var(--cyan)");
    body.innerHTML = html;
    modal.hidden = false; document.body.classList.add("locked");
    card.scrollTop = 0;
    // restart entrance animation on content swaps
    card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
    card.focus();
    sfx.open();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true; document.body.classList.remove("locked"); sfx.close();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = $$("button, select, a[href], [tabindex]:not([tabindex='-1'])", card).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* path popup */
  function openPath(id, fromEl) {
    const p = PATH[id];
    if (!S.paths.includes(id)) {
      S.paths.push(id); save(); addXP(20, fromEl);
      $(`.node[data-path="${id}"]`).classList.add("visited");
      unlock("firstPath");
      if (S.paths.length === PATHS.length) unlock("allPaths");
    }
    const genres = p.genres.map((g) => {
      const G = GENRES[g];
      return `<div class="m-genre">
        <h3>${G.name.toUpperCase()}</h3><span class="tag">${G.tag}</span>
        <p>${G.text}</p>
        <div class="carts">${G.games.map((gid, i) => `
          <button class="cart" type="button" data-game="${gid}" style="animation-delay:${i * 0.06}s">
            <img class="pixel" src="assets/img/${id}.png" alt="" width="28" height="28">
            <b>${GAMES[gid].short}</b><span>${GAMES[gid].year} · ${S.games.includes(gid) ? "✓ READ" : "NEW FILE"}</span>
          </button>`).join("")}</div>
      </div>`;
    }).join("");
    openModal(`
      <div class="m-hero">
        <img class="m-icon pixel" src="assets/img/${id}.png" alt="">
        <span class="m-kicker">PATH ${p.num} // ${p.tag.toUpperCase()}</span>
        <h2 id="modalTitle">${p.name}</h2>
        <p>${p.blurb}</p>
      </div>
      <div class="m-body">${genres}</div>`, p.color);
    body.dataset.path = id;
  }
  body.addEventListener("click", (e) => {
    const c = e.target.closest("[data-game]");
    if (c) { const [x, y] = centerOf(c); burst(x, y, colorOfGame(c.dataset.game), 14); openGame(c.dataset.game, body.dataset.path || null); return; }
    const b = e.target.closest("[data-back]");
    if (b) { openPath(b.dataset.back); return; }
    const t = e.target.closest(".tab");
    if (t) selectTab(t);
    const v = e.target.closest("[data-versus]");
    if (v) { closeModal(); setVersus(v.dataset.versus, null); $("#compare").scrollIntoView(); }
    const r = e.target.closest("[data-random]");
    if (r) { const pool = GAME_IDS.filter((g) => g !== r.dataset.random); openGame(pool[(Math.random() * pool.length) | 0], null); }
    const op = e.target.closest("[data-open-path]");
    if (op) openPath(op.dataset.openPath);
  });

  /* game popup */
  function openGame(id, backPath) {
    const g = GAMES[id], p = pathOfGame(id), G = GENRES[g.genre];
    if (!S.games.includes(id)) {
      S.games.push(id); save(); addXP(15);
      unlock("firstGame");
      if (S.games.length >= 10) unlock("tenGames");
      renderCards();
    }
    const mix = Object.entries(g.mix).map(([k, v]) => `
      <div class="mix-row"><span>${MIX_LABELS[k].toUpperCase()}</span>
        <div class="mix-bar">${Array.from({ length: 10 }, (_, i) => `<i class="${i < v ? "on" : ""}" style="animation-delay:${i * 0.04}s"></i>`).join("")}</div>
        <b>${v}</b></div>`).join("");
    openModal(`
      <div class="m-hero">
        <img class="m-icon pixel" src="assets/img/${p.id}.png" alt="">
        <span class="m-kicker">GAME FILE // ${G.name.toUpperCase()} // ${g.year}</span>
        <h2 id="modalTitle">${g.title}</h2>
        <p>${g.summary}</p>
      </div>
      <div class="m-body">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" aria-selected="true" data-tab="t1">OVERVIEW</button>
          <button class="tab" role="tab" aria-selected="false" data-tab="t2">LEGACY</button>
          <button class="tab" role="tab" aria-selected="false" data-tab="t3">MECHANIC MIX</button>
        </div>
        <div class="tabpanel" id="t1" role="tabpanel">
          <div class="data-grid">
            <div><small>RELEASED</small>${g.year}</div>
            <div><small>DEVELOPER</small>${g.dev}</div>
            <div><small>PUBLISHER</small>${g.pub}</div>
            <div><small>PLATFORM</small>${g.platform}</div>
          </div>
          <p class="muted">Filed under <b style="color:${p.color}">${p.name}</b> → ${G.name}. ${G.text.split(". ")[0]}.</p>
        </div>
        <div class="tabpanel" id="t2" role="tabpanel" hidden><p style="font-size:18px">${g.legacy}</p></div>
        <div class="tabpanel" id="t3" role="tabpanel" hidden>${mix}<p class="muted" style="font-size:13px">Archive estimate of how much each mechanic defines the game.</p></div>
        <div class="m-actions">
          ${backPath ? `<button class="btn btn-ghost" type="button" data-back="${backPath}">← BACK TO ${PATH[backPath].name.toUpperCase()}</button>` : `<button class="btn btn-ghost" type="button" data-open-path="${p.id}">OPEN ${p.name.toUpperCase()} PATH</button>`}
          <button class="btn btn-ghost" type="button" data-versus="${id}">⚔ SEND TO VERSUS</button>
          <button class="btn btn-ghost" type="button" data-random="${id}">🎲 RANDOM FILE</button>
        </div>
      </div>`, p.color);
  }
  function selectTab(t) {
    $$(".tab", body).forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    $$(".tabpanel", body).forEach((pn) => (pn.hidden = pn.id !== t.dataset.tab));
    sfx.blip();
  }

  /* ---------------- archive grid ---------------- */
  let filter = "all";
  const filtersEl = $("#filters");
  filtersEl.innerHTML = `<button class="chip" type="button" data-f="all" aria-pressed="true">ALL</button>` +
    PATHS.map((p) => `<button class="chip" type="button" data-f="${p.id}" style="--c:${p.color}" aria-pressed="false"><img class="pixel" src="assets/img/${p.id}.png" alt="">${p.name.toUpperCase()}</button>`).join("");
  filtersEl.addEventListener("click", (e) => {
    const c = e.target.closest(".chip"); if (!c) return;
    filter = c.dataset.f;
    $$(".chip", filtersEl).forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    sfx.blip(); renderCards();
  });
  $("#sortSel").addEventListener("change", renderCards);
  function renderCards() {
    let ids = GAME_IDS.filter((id) => filter === "all" || PATH[filter].genres.includes(GAMES[id].genre));
    const s = $("#sortSel").value;
    ids.sort((a, b) => s === "title" ? GAMES[a].short.localeCompare(GAMES[b].short) : s === "year-desc" ? GAMES[b].year - GAMES[a].year : GAMES[a].year - GAMES[b].year);
    $("#countLabel").textContent = `${ids.length} FILES · ${S.games.length}/${GAME_IDS.length} READ`;
    $("#cards").innerHTML = ids.map((id, i) => {
      const g = GAMES[id], p = filter === "all" ? pathOfGame(id) : PATH[filter];
      return `<button class="card" type="button" data-card="${id}" style="--c:${p.color};animation-delay:${Math.min(i, 12) * 0.03}s">
        <div class="card-art"><span class="card-year">${g.year}</span>${S.games.includes(id) ? `<span class="card-seen">✓ READ</span>` : ""}<img class="pixel" src="assets/img/${p.id}.png" alt=""></div>
        <div class="card-body"><h3>${g.short}</h3><p>${GENRES[g.genre].name} · ${g.dev}</p></div>
        <span class="card-shine"></span>
      </button>`;
    }).join("");
  }
  renderCards();
  const cardsEl = $("#cards");
  cardsEl.addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) { const [x, y] = centerOf(c); burst(x, y, getComputedStyle(c).getPropertyValue("--c").trim(), 16); openGame(c.dataset.card, null); } });
  if (finePointer && !reduced) {
    cardsEl.addEventListener("pointermove", (e) => {
      const c = e.target.closest(".card"); if (!c) return;
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 14}deg) translateY(-6px)`;
      c.style.setProperty("--mx", px * 100 + "%"); c.style.setProperty("--my", py * 100 + "%");
    });
    cardsEl.addEventListener("pointerout", (e) => { const c = e.target.closest(".card"); if (c && !c.contains(e.relatedTarget)) c.style.transform = ""; });
  }

  /* ---------------- timeline ---------------- */
  const track = $("#timelineTrack");
  track.innerHTML = FIGURES.map((f, i) => `
    <div class="tl-item ${S.figures.includes(i) ? "open" : ""}" data-fig="${i}">
      <span class="tl-pin"></span>
      <button class="tl-card" type="button" aria-expanded="${S.figures.includes(i)}">
        <span class="tl-year">${f.year}</span>
        <h3>${f.name}</h3>
        <span class="tl-role">${f.role.toUpperCase()}</span>
        <div class="tl-more"><p>${f.text}</p><p class="impact">IMPACT // ${f.impact}</p></div>
      </button>
    </div>`).join("") +
    GAME_IDS.slice().sort((a, b) => GAMES[a].year - GAMES[b].year).map((id) => `
    <div class="tl-item">
      <span class="tl-pin" style="border-color:${colorOfGame(id)};box-shadow:0 0 18px ${colorOfGame(id)}"></span>
      <button class="tl-card" type="button" data-game-tl="${id}">
        <span class="tl-year" style="color:${colorOfGame(id)}">${GAMES[id].year}</span>
        <h3>${GAMES[id].short}</h3>
        <span class="tl-role">${GENRES[GAMES[id].genre].name.toUpperCase()} · OPEN FILE →</span>
      </button>
    </div>`).join("");
  let drag = null, moved = false;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; drag = { x: e.clientX, s: track.scrollLeft }; moved = false; });
  addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { moved = true; track.classList.add("dragging"); } track.scrollLeft = drag.s - dx; });
  addEventListener("pointerup", () => { drag = null; track.classList.remove("dragging"); });
  track.addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.shiftKey === false) { const max = track.scrollWidth - track.clientWidth; if ((e.deltaY > 0 && track.scrollLeft < max) || (e.deltaY < 0 && track.scrollLeft > 0)) { track.scrollLeft += e.deltaY; e.preventDefault(); } } }, { passive: false });
  track.addEventListener("click", (e) => {
    if (moved) { moved = false; return; }
    const gt = e.target.closest("[data-game-tl]");
    if (gt) { openGame(gt.dataset.gameTl, null); return; }
    const it = e.target.closest("[data-fig]"); if (!it) return;
    const i = +it.dataset.fig;
    const open = it.classList.toggle("open");
    it.querySelector(".tl-card").setAttribute("aria-expanded", String(open));
    sfx.blip();
    if (open && !S.figures.includes(i)) {
      S.figures.push(i); save(); addXP(10, it);
      const [x, y] = centerOf(it.querySelector(".tl-pin")); burst(x, y, "#ffd23f", 14);
      if (S.figures.length === FIGURES.length) unlock("timeline");
    }
  });

  /* ---------------- versus mode ---------------- */
  const vsA = $("#vsA"), vsB = $("#vsB");
  const options = PATHS.map((p) => `<optgroup label="${p.name}">${GAME_IDS.filter((id) => pathOfGame(id).id === p.id).map((id) => `<option value="${id}">${GAMES[id].short} (${GAMES[id].year})</option>`).join("")}</optgroup>`).join("");
  vsA.innerHTML = options; vsB.innerHTML = options;
  vsA.value = "minecraft"; vsB.value = "terraria";
  const AX = Object.keys(MIX_LABELS);
  function radarPts(mix, R = 120) {
    return AX.map((k, i) => { const a = -Math.PI / 2 + (i / AX.length) * Math.PI * 2, r = (mix[k] / 10) * R; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(" ");
  }
  function renderVersus(userAction) {
    const A = GAMES[vsA.value], B = GAMES[vsB.value];
    let grid = "";
    [0.25, 0.5, 0.75, 1].forEach((k) => { grid += `<polygon class="grid" points="${radarPts(Object.fromEntries(AX.map((a) => [a, 10 * k])))}"/>`; });
    AX.forEach((k, i) => {
      const a = -Math.PI / 2 + (i / AX.length) * Math.PI * 2;
      grid += `<line class="axis" x1="0" y1="0" x2="${Math.cos(a) * 120}" y2="${Math.sin(a) * 120}"/>`;
      grid += `<text x="${Math.cos(a) * 142}" y="${Math.sin(a) * 142 + 3}" text-anchor="middle">${MIX_LABELS[k].toUpperCase()}</text>`;
    });
    $("#radar").innerHTML = grid +
      `<polygon class="shape" points="${radarPts(A.mix)}" fill="rgba(62,230,193,.25)" stroke="#3ee6c1" stroke-width="2"/>` +
      `<polygon class="shape" points="${radarPts(B.mix)}" fill="rgba(255,77,109,.22)" stroke="#ff4d6d" stroke-width="2"/>`;
    $("#vsBars").innerHTML = AX.map((k) => `
      <div class="vs-row">
        <div class="vs-track left"><div class="vs-fill" data-w="${A.mix[k] * 10}"></div></div>
        <span class="lbl">${MIX_LABELS[k].toUpperCase()}</span>
        <div class="vs-track right"><div class="vs-fill" data-w="${B.mix[k] * 10}"></div></div>
      </div>`).join("");
    requestAnimationFrame(() => $$(".vs-fill").forEach((f) => (f.style.width = f.dataset.w + "%")));
    const diffs = AX.map((k) => [k, A.mix[k] - B.mix[k]]);
    const aBest = diffs.reduce((m, d) => (d[1] > m[1] ? d : m)), bBest = diffs.reduce((m, d) => (d[1] < m[1] ? d : m));
    const shared = AX.filter((k) => A.mix[k] >= 6 && B.mix[k] >= 6).map((k) => MIX_LABELS[k]);
    const gap = Math.abs(A.year - B.year);
    let v;
    if (vsA.value === vsB.value) v = `<b>MIRROR MATCH!</b> ${A.short} vs itself. Pick a different P2.`;
    else v = `<b>RESULT:</b> ${aBest[1] > 0 ? `${A.short} leans harder into <em>${MIX_LABELS[aBest[0]]}</em> (+${aBest[1]})` : `${A.short} never out-scores ${B.short}`}, while ` +
      `${bBest[1] < 0 ? `${B.short} pushes <em>${MIX_LABELS[bBest[0]]}</em> (+${-bBest[1]})` : `${B.short} never out-scores ${A.short}`}. ` +
      (shared.length ? `Common ground: ${shared.join(", ")}. ` : "Almost nothing in common, a true clash of styles. ") +
      (gap ? `${gap} year${gap > 1 ? "s" : ""} of history between them.` : "Released the same year.");
    $("#vsVerdict").innerHTML = v;
    if (userAction && vsA.value !== vsB.value) { unlock("compare"); sfx.coin(); }
  }
  function setVersus(a, b) { if (a) vsA.value = a; if (b) vsB.value = b; renderVersus(true); }
  vsA.addEventListener("change", () => renderVersus(true));
  vsB.addEventListener("change", () => renderVersus(true));
  renderVersus(false);

  /* ---------------- quiz ---------------- */
  function openQuiz() {
    const score = {}; let qi = 0;
    const render = () => {
      if (qi >= QUIZ.length) return result();
      const q = QUIZ[qi];
      openModal(`
        <div class="m-hero"><img class="m-icon pixel" src="assets/img/controller.png" alt="">
          <span class="m-kicker">PATH QUIZ // QUESTION ${qi + 1} OF ${QUIZ.length}</span>
          <h2 id="modalTitle">Which path are you?</h2></div>
        <div class="m-body">
          <div class="quiz-progress">${QUIZ.map((_, i) => `<i class="${i <= qi ? "on" : ""}"></i>`).join("")}</div>
          <p class="quiz-q">${q.q}</p>
          <div class="quiz-opts">${q.a.map(([t, p]) => `<button class="quiz-opt" type="button" data-q="${p}">${t}</button>`).join("")}</div>
        </div>`, "#8b7bff");
    };
    const result = () => {
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      const p = PATH[best];
      openModal(`
        <div class="m-hero"><img class="m-icon pixel" src="assets/img/${p.id}.png" alt="">
          <span class="m-kicker">QUIZ RESULT // PATH ${p.num}</span>
          <h2 id="modalTitle">You're a ${p.name.toUpperCase()} player!</h2><p>${p.blurb}</p></div>
        <div class="m-body"><div class="m-actions" style="margin-top:0">
          <button class="btn btn-primary" type="button" data-open-path="${p.id}">OPEN MY PATH →</button>
          <button class="btn btn-ghost" type="button" data-open-quiz>RETAKE QUIZ</button>
        </div></div>`, p.color);
      coinRain(30); unlock("quiz");
    };
    render();
    body.onclick = (e) => {
      const o = e.target.closest(".quiz-opt"); if (!o) return;
      score[o.dataset.q] = (score[o.dataset.q] || 0) + 1;
      const [x, y] = centerOf(o); burst(x, y, PATH[o.dataset.q].color, 10);
      qi++; render();
    };
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-quiz]")) { body.onclick = null; openQuiz(); }
    else if (!e.target.closest(".quiz-opt") && !modal.contains(e.target)) body.onclick = null;
    else if (e.target.closest("[data-open-path],[data-game],[data-random],[data-versus]")) body.onclick = null;
  });

  /* ---------------- trophy room ---------------- */
  function openTrophies() {
    const ids = Object.keys(ACHIEVEMENTS), got = ids.filter((i) => S.ach[i]).length;
    openModal(`
      <div class="m-hero"><img class="m-icon pixel" src="assets/img/trophy.png" alt="">
        <span class="m-kicker">TROPHY ROOM // ${got} / ${ids.length} · LEVEL ${Math.floor(S.xp / 100) + 1} · ${S.xp} XP</span>
        <h2 id="modalTitle">Achievements</h2><p>Progress is saved in this browser.</p></div>
      <div class="m-body"><div class="trophy-grid">${ids.map((i) => `
        <div class="trophy ${S.ach[i] ? "got" : ""}"><img class="pixel" src="assets/img/trophy.png" alt="">
          <div><b>${S.ach[i] ? ACHIEVEMENTS[i].name : "???"}</b><span>${ACHIEVEMENTS[i].text}</span></div></div>`).join("")}
      </div>
      <div class="m-actions"><button class="btn btn-ghost" type="button" id="resetProgress">RESET PROGRESS</button></div></div>`, "#ffd23f");
    $("#resetProgress").addEventListener("click", () => {
      if (!confirm("Reset all XP, achievements and read files?")) return;
      S = Object.assign({}, fresh, { sound: S.sound }); save(); renderXP(); renderCards();
      $$(".node").forEach((n) => n.classList.remove("visited"));
      $$(".tl-item").forEach((n) => n.classList.remove("open"));
      openTrophies();
    });
  }
  $("#trophyBtn").addEventListener("click", openTrophies);
  $("#openTrophies").addEventListener("click", openTrophies);

  /* ---------------- search palette ---------------- */
  const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
  const index = [
    ...PATHS.map((p) => ({ label: p.name + " path", sub: "PATH " + p.num, hay: (p.name + " " + p.tag + " " + p.blurb).toLowerCase(), go: () => openPath(p.id) })),
    ...Object.entries(GENRES).map(([k, g]) => ({ label: g.name, sub: "GENRE", hay: (g.name + " " + g.tag).toLowerCase(), go: () => openPath(pathOfGenre(k).id) })),
    ...GAME_IDS.map((id) => { const g = GAMES[id]; return { label: g.title, sub: g.year + " · GAME", hay: [g.title, g.short, g.dev, g.pub, g.year, g.platform, GENRES[g.genre].name].join(" ").toLowerCase(), go: () => openGame(id, null) }; }),
    ...FIGURES.map((f, i) => ({ label: f.name, sub: f.year + " · PIONEER", hay: (f.name + " " + f.role + " " + f.text + " " + f.year).toLowerCase(), go: () => { closeModal(); $("#timeline").scrollIntoView(); const it = $(`[data-fig="${i}"]`); if (!it.classList.contains("open")) it.querySelector(".tl-card").click(); it.scrollIntoView({ inline: "center", block: "nearest" }); } })),
  ];
  let results = [], sel = 0;
  function renderPalette() {
    const q = pin.value.trim().toLowerCase();
    results = (q ? index.filter((r) => q.split(/\s+/).every((w) => r.hay.includes(w))) : index.filter((r) => r.sub.includes("GAME"))).slice(0, 12);
    sel = Math.min(sel, Math.max(0, results.length - 1));
    plist.innerHTML = results.length ? results.map((r, i) => `<li role="option" data-i="${i}" aria-selected="${i === sel}"><span>${r.label}</span><small>${r.sub}</small></li>`).join("") : `<li><span class="muted">No files match. Try "1991" or "Nintendo".</span></li>`;
  }
  function openPalette() { pal.hidden = false; pin.value = ""; sel = 0; renderPalette(); pin.focus(); sfx.open(); }
  function closePalette() { pal.hidden = true; }
  function choose(i) { const r = results[i]; if (!r) return; closePalette(); unlock("search"); r.go(); }
  $("#searchBtn").addEventListener("click", openPalette);
  pin.addEventListener("input", () => { sel = 0; renderPalette(); });
  pin.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, results.length - 1); renderPalette(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderPalette(); e.preventDefault(); }
    else if (e.key === "Enter") choose(sel);
  });
  plist.addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) choose(+li.dataset.i); });
  pal.addEventListener("click", (e) => { if (e.target.closest("[data-close-palette]")) closePalette(); });

  /* ---------------- keyboard: start, esc, search, konami ---------------- */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  addEventListener("keydown", (e) => {
    if (document.getElementById("boot") && !boot.classList.contains("gone")) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } return; }
    if (e.key === "Escape") { if (!pal.hidden) closePalette(); else closeModal(); return; }
    const typing = /INPUT|SELECT|TEXTAREA/.test((e.target.tagName || ""));
    if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); openPalette(); return; }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) {
      kpos = 0;
      document.body.classList.toggle("retro");
      coinRain(80); sfx.trophy(); unlock("konami");
      toast("RETRO MODE", document.body.classList.contains("retro") ? "CRT filter on. Enter the code again to turn it off." : "Retro mode off.", "assets/img/controller.png", "SECRET");
    }
  });

  /* ---------------- scroll reveal ---------------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 }) : null;
  $$(".section-head, .map-wrap, .versus, .vs-body, .final > *, .timeline").forEach((el) => { el.classList.add("reveal"); io ? io.observe(el) : el.classList.add("in"); });

  /* active nav link highlight */
  const navLinks = $$(".hud-nav a");
  const spy = "IntersectionObserver" in window ? new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => (a.style.color = a.getAttribute("href") === "#" + en.target.id ? "var(--accent)" : ""));
  }), { rootMargin: "-45% 0px -50% 0px" }) : null;
  if (spy) ["map", "archive", "timeline", "compare"].forEach((id) => spy.observe($("#" + id)));

  renderXP();
})();
