/* =========================================================
   HISTORICAL GAMING MAP — INTERACTIVE LAYER
   Loaded on every page after the original markup. It never
   rewrites the original content; it only adds behaviour:
   animated map, walk-the-map mode, popups for every path,
   3D archive models, mini-games, versus radar, search,
   progress + achievements, sound, page transitions.
   ========================================================= */
(function () {
    "use strict";

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var PAGE = (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";

    /* ---------------------------------------------------------
       ARCHIVE DATA
       --------------------------------------------------------- */
    // game pages that exist in the original site
    var PAGES = {
        zelda:          { t: "Ocarina of Time", y: 1998, g: "Adventure", game: "explore", e: "001" },
        uncharted2:     { t: "Uncharted 2", y: 2009, g: "Adventure", game: "explore", e: "002" },
        lifeisstrange:  { t: "Life is Strange", y: 2015, g: "Adventure", game: "explore", e: "003" },
        gta3:           { t: "Grand Theft Auto III", y: 2001, g: "Open World", game: "explore", e: "001" },
        skyrim:         { t: "Skyrim", y: 2011, g: "Open World", game: "explore", e: "002" },
        breathofthewild:{ t: "Breath of the Wild", y: 2017, g: "Open World", game: "explore", e: "003" },
        minecraft:      { t: "Minecraft", y: 2011, g: "Sandbox", game: "build", e: "001" },
        gta5:           { t: "Grand Theft Auto V", y: 2013, g: "Sandbox", game: "build", e: "002" },
        terraria:       { t: "Terraria", y: 2011, g: "Sandbox", game: "build", e: "003" },
        residentevil:   { t: "Resident Evil", y: 1996, g: "Survival", game: "survive", e: "001" },
        dontstarve:     { t: "Don't Starve", y: 2013, g: "Survival", game: "survive", e: "002" },
        subnautica:     { t: "Subnautica", y: 2018, g: "Survival", game: "survive", e: "003" }
    };
    var GENRE_PAGES = {
        adventure: { t: "Adventure", game: "explore" }, openworld: { t: "Open World", game: "explore" },
        genre: { t: "Sandbox", game: "build" }, survival: { t: "Survival", game: "survive" }
    };
    var OTHER_PAGES = { index: "Main Map", map: "Explore Path", figures: "Influential Figures", compare: "Game Comparison" };

    // games that have no page yet: shown as archive files in popups
    var FILES = {
        tetris:   { t: "Tetris", y: 1984, dev: "Alexey Pajitnov", plat: "Electronika 60", g: "Puzzle", s: "Falling shapes made of four squares are rotated and fitted together to clear lines.", l: "One of the most widely played and ported games ever: simple rules with near-endless depth." },
        myst:     { t: "Myst", y: 1993, dev: "Cyan", plat: "Mac", g: "Puzzle", s: "A quiet island of mechanisms and books, solved by observing the world around you.", l: "A landmark of the CD-ROM era that showed atmosphere and observation could carry a game." },
        portal:   { t: "Portal", y: 2007, dev: "Valve", plat: "PC, Xbox 360", g: "Puzzle", s: "Linked portals let the player bend space to solve first-person test chambers.", l: "Proved a short, tightly designed puzzle game could stand beside blockbusters." },
        smb:      { t: "Super Mario Bros.", y: 1985, dev: "Nintendo R&D4", plat: "NES", g: "Platformer", s: "A side-scrolling run through the Mushroom Kingdom, jumping between platforms and over enemies.", l: "Defined the side-scrolling platformer: momentum, secrets and level design." },
        sonic:    { t: "Sonic the Hedgehog", y: 1991, dev: "Sonic Team", plat: "Mega Drive / Genesis", g: "Platformer", s: "High-speed platforming through loops, slopes and springs.", l: "Built a platformer around speed and momentum." },
        celeste:  { t: "Celeste", y: 2018, dev: "Maddy Makes Games", plat: "PC, Switch, PS4, Xbox One", g: "Platformer", s: "A precision platformer about climbing a mountain with a tight dash-and-climb move set.", l: "Paired demanding platforming with accessible assist options." },
        simcity:  { t: "SimCity", y: 1989, dev: "Maxis", plat: "Amiga, Mac", g: "City Builder", s: "Zone land, build infrastructure and balance a budget as a city grows.", l: "Popularised the city-building simulation and games without a fixed win condition." },
        rct:      { t: "RollerCoaster Tycoon", y: 1999, dev: "Chris Sawyer", plat: "PC", g: "Management", s: "Design rides, set prices and keep guests happy in your own theme park.", l: "A defining management sim, programmed largely in assembly language by one developer." },
        sf2:      { t: "Street Fighter II", y: 1991, dev: "Capcom", plat: "Arcade", g: "Fighting", s: "One-on-one combat between distinct fighters with special moves and combos.", l: "Set the template for the competitive fighting game." },
        doom:     { t: "Doom", y: 1993, dev: "id Software", plat: "MS-DOS", g: "Shooter", s: "Fast first-person combat through maze-like bases.", l: "Popularised the first-person shooter, online deathmatch and player-made mods." },
        darksouls:{ t: "Dark Souls", y: 2011, dev: "FromSoftware", plat: "PS3, Xbox 360", g: "Action RPG", s: "Deliberate, punishing combat in an interconnected world where every death teaches something.", l: "So influential it named its own sub-genre, the 'soulslike'." },
        pacman:   { t: "Pac-Man", y: 1980, dev: "Namco", plat: "Arcade", g: "Maze Chase", s: "Clear every dot in the maze while four ghosts give chase.", l: "One of gaming's first pop-culture icons; each ghost has its own chase behaviour." },
        granturismo: { t: "Gran Turismo", y: 1997, dev: "Polyphony Digital", plat: "PlayStation", g: "Racing", s: "A driving simulator with licensed cars, tuning and licence tests.", l: "Brought realistic handling and car collecting to home consoles." },
        templerun:{ t: "Temple Run", y: 2011, dev: "Imangi Studios", plat: "iOS", g: "Endless Runner", s: "Swipe to turn, jump and slide while fleeing along an endless path.", l: "Helped popularise the endless runner on smartphones." }
    };

    // the seven mechanic paths on the main map
    var PATHS = {
        explore: { n: "01", name: "EXPLORE", sub: "DISCOVER WORLDS.", tag: "Discovery // Worlds // Navigation", page: "map.html",
            text: "Genres built around navigation, discovery and player-driven exploration." },
        solve:   { n: "02", name: "SOLVE", sub: "THINK TO PLAY.", tag: "Logic // Puzzles // Strategy",
            text: "Games that turn reasoning into play, from falling blocks to portals that bend space.", files: ["tetris", "myst", "portal"] },
        jump:    { n: "03", name: "JUMP", sub: "MASTER THE ARC.", tag: "Movement // Timing // Platforms",
            text: "Precision, rhythm and momentum: the platformer made the jump one of gaming's most expressive verbs.", files: ["smb", "sonic", "celeste"] },
        build:   { n: "04", name: "BUILD", sub: "SHAPE THE WORLD.", tag: "Creation // Systems // Sandbox", page: "genre.html",
            text: "Games that hand players the tools, from block-by-block worlds to whole cities.", pages: ["minecraft", "terraria", "gta5"], files: ["simcity", "rct"] },
        fight:   { n: "05", name: "FIGHT", sub: "READ YOUR RIVAL.", tag: "Combat // Action // Competition",
            text: "Reflexes, mastery and rivalry: the fighter, the first-person shooter and the punishing action RPG.", files: ["sf2", "doom", "darksouls"] },
        run:     { n: "06", name: "RUN", sub: "NEVER STOP.", tag: "Speed // Movement // Reaction",
            text: "Games built on going fast: maze chases, racing lines and endless runs.", files: ["pacman", "granturismo", "templerun"] },
        survive: { n: "07", name: "SURVIVE", sub: "MAKE IT TO MORNING.", tag: "Resources // Risk // Endurance", page: "survival.html",
            text: "Scarcity creates tension: every item, every night and every decision matters.", pages: ["residentevil", "dontstarve", "subnautica"] }
    };
    var PATH_COLORS = { explore: "#0084ff", solve: "#9b59b6", jump: "#e58b2a", build: "#4f9f45", fight: "#222222", run: "#0084ff", survive: "#e58b2a" };

    // mechanic mix used by Versus mode (archive estimate, 0-10)
    var MIX = {
        minecraft: [8, 1, 10, 4, 4, 1], terraria: [8, 1, 8, 8, 2, 3], gta5: [9, 8, 1, 7, 1, 8], gta3: [8, 6, 0, 7, 1, 7],
        skyrim: [10, 7, 3, 7, 3, 2], breathofthewild: [10, 5, 3, 6, 7, 3], zelda: [9, 7, 1, 6, 8, 3], uncharted2: [6, 9, 0, 7, 4, 5],
        lifeisstrange: [5, 10, 0, 0, 5, 1], residentevil: [6, 6, 0, 5, 7, 1], dontstarve: [7, 2, 6, 4, 4, 1], subnautica: [10, 6, 7, 1, 3, 2],
        rdr2: [9, 10, 1, 7, 1, 3], smb: [4, 1, 0, 3, 2, 7], sonic: [3, 1, 0, 2, 1, 10]
    };
    var MIX_AXES = ["EXPLORE", "STORY", "BUILD", "COMBAT", "PUZZLE", "SPEED"];
    var MIX_NAMES = { rdr2: "Red Dead Redemption 2", smb: "Super Mario Bros.", sonic: "Sonic the Hedgehog" };

    var ACH = {
        online:   ["Archive Online", "Opened the Historical Gaming Map."],
        path:     ["Pathfinder", "Opened your first path."],
        allPaths: ["Cartographer", "Opened all 7 paths."],
        entry:    ["Archivist", "Read your first game entry."],
        entries5: ["Collector", "Read 5 game entries."],
        entries12:["Completionist", "Read all 12 game entries."],
        walker:   ["Player One", "Walked the map with the keyboard."],
        bits:     ["Data Miner", "Collected every data bit on a map."],
        builder:  ["Architect", "Placed 50 blocks in Build mode."],
        fog:      ["Fog Lifter", "Found every landmark in Explore mode."],
        survivor: ["Still Breathing", "Survived 5 days in Survive mode."],
        versus:   ["Versus Mode", "Compared two games."],
        search:   ["Seeker", "Used archive search."],
        konami:   ["Old School", "Entered the secret code."]
    };

    /* ---------------------------------------------------------
       SAVED PROGRESS
       --------------------------------------------------------- */
    var KEY = "hgm-archive-v1";
    var S = { xp: 0, ach: {}, pages: [], paths: [], sound: false, blocks: 0, best: 0, terminal: false };
    try { var saved = JSON.parse(localStorage.getItem(KEY) || "{}"); for (var k in saved) S[k] = saved[k]; } catch (e) { /* storage blocked */ }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } }
    if (S.terminal) document.documentElement.classList.add("fx-terminal");

    /* ---------------------------------------------------------
       SOUND (off by default)
       --------------------------------------------------------- */
    var actx = null;
    function tone(f, d, when, type) {
        if (!S.sound) return;
        try {
            actx = actx || new (window.AudioContext || window.webkitAudioContext)();
            var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + (when || 0);
            o.type = type || "square"; o.frequency.value = f;
            g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (d || 0.07));
            o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + (d || 0.07) + 0.02);
        } catch (e) { /* audio blocked */ }
    }
    var sfx = {
        tick: function () { tone(1200, 0.025); },
        step: function () { tone(220, 0.03, 0, "triangle"); },
        open: function () { tone(523, 0.06); tone(784, 0.08, 0.06); },
        bit: function () { tone(988, 0.05); tone(1319, 0.12, 0.05); },
        win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.1, i * 0.08); }); },
        bad: function () { tone(160, 0.2, 0, "sawtooth"); }
    };

    /* ---------------------------------------------------------
       SMALL HELPERS
       --------------------------------------------------------- */
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function center(e) { var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    function sparks(x, y, n) {
        if (reduced) return;
        for (var i = 0; i < (n || 12); i++) {
            var p = el("div", "fx-spark"); p.style.left = x + "px"; p.style.top = y + "px"; document.body.appendChild(p);
            var a = Math.random() * 6.28, d = 30 + Math.random() * 60;
            var an = p.animate([{ transform: "translate(-50%,-50%)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d + "px) scale(0)", opacity: 0 }], { duration: 550 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)" });
            an.onfinish = (function (q) { return function () { q.remove(); }; })(p);
        }
    }
    function xpPop(n, x, y) {
        var t = el("div", "fx-xp", "+" + n + " XP"); t.style.left = x + "px"; t.style.top = y + "px";
        document.body.appendChild(t); setTimeout(function () { t.remove(); }, 1000);
    }

    /* ---------------------------------------------------------
       HUD, XP, ACHIEVEMENTS, TOASTS
       --------------------------------------------------------- */
    var toasts = el("div", "fx-toasts"); toasts.setAttribute("aria-live", "polite"); document.body.appendChild(toasts);
    function toast(small, title, text, img) {
        var t = el("div", "fx-toast", '<img class="px" src="assets/img/' + (img || "trophy") + '.png" alt=""><div><small>' + small + "</small><b>" + title + "</b><span>" + text + "</span></div>");
        toasts.appendChild(t);
        setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 350); }, 3600);
    }
    var hud = el("div", "fx-hud");
    hud.innerHTML =
        '<div class="fx-hud-prog"><span class="fx-hud-label">ARCHIVE // </span><b id="fxLv">LV 1</b> · <span id="fxRead">00/12</span> ENTRIES<div class="fx-hud-bar"><i id="fxBar"></i></div></div>' +
        '<button type="button" id="fxSearchBtn" aria-label="Search the archive (press /)">/ SEARCH</button>' +
        '<button type="button" id="fxTrophyBtn" aria-label="Achievements">★ <span class="fx-count" id="fxAchCount">0</span></button>' +
        '<button type="button" id="fxSoundBtn" aria-pressed="false" aria-label="Toggle sound">SND OFF</button>';
    document.body.appendChild(hud);
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function renderHud() {
        var read = S.pages.filter(function (p) { return PAGES[p]; }).length;
        $("#fxLv").textContent = "LV " + (Math.floor(S.xp / 100) + 1);
        $("#fxRead").textContent = pad(read) + "/12";
        $("#fxBar").style.width = (S.xp % 100) + "%";
        $("#fxAchCount").textContent = Object.keys(S.ach).length + "/" + Object.keys(ACH).length;
        var sb = $("#fxSoundBtn"); sb.textContent = S.sound ? "SND ON" : "SND OFF"; sb.setAttribute("aria-pressed", String(S.sound));
    }
    function addXP(n, node) {
        var lv = Math.floor(S.xp / 100);
        S.xp += n; save(); renderHud();
        if (node) { var c = center(node); xpPop(n, c[0], c[1] - 20); }
        if (Math.floor(S.xp / 100) > lv) toast("// LEVEL UP", "LEVEL " + (Math.floor(S.xp / 100) + 1), "Archive clearance increased.", "coin");
    }
    function unlock(id) {
        if (S.ach[id] || !ACH[id]) return;
        S.ach[id] = Date.now(); save(); renderHud(); sfx.win();
        toast("// ACHIEVEMENT UNLOCKED", ACH[id][0], ACH[id][1]);
        addXP(25);
    }
    $("#fxSoundBtn").addEventListener("click", function () { S.sound = !S.sound; save(); renderHud(); sfx.open(); });

    /* page visit bookkeeping */
    function markPath(id) {
        if (S.paths.indexOf(id) < 0) { S.paths.push(id); save(); addXP(15); }
        unlock("path"); if (S.paths.length >= 7) unlock("allPaths");
    }
    if (S.pages.indexOf(PAGE) < 0) {
        S.pages.push(PAGE); save();
        if (PAGES[PAGE]) setTimeout(function () { addXP(20); }, 900);
    }
    if (PAGE === "map") markPath("explore");
    if (PAGE === "genre") markPath("build");
    if (PAGE === "survival") markPath("survive");
    var readCount = S.pages.filter(function (p) { return PAGES[p]; }).length;
    setTimeout(function () {
        unlock("online");
        if (readCount >= 1) unlock("entry");
        if (readCount >= 5) unlock("entries5");
        if (readCount >= 12) unlock("entries12");
    }, 700);
    renderHud();

    /* ---------------------------------------------------------
       MODAL
       --------------------------------------------------------- */
    var modal = el("div", "fx-modal");
    modal.hidden = true;
    modal.innerHTML = '<div class="fx-modal-bg" data-fx-close></div><div class="fx-modal-card" role="dialog" aria-modal="true" tabindex="-1"><div class="fx-modal-top"><span id="fxModalCrumb">ARCHIVE</span><button class="fx-close" type="button" data-fx-close>CLOSE [ESC]</button></div><div id="fxModalBody"></div></div>';
    document.body.appendChild(modal);
    var mCard = $(".fx-modal-card", modal), mBody = $("#fxModalBody"), lastFocus = null;
    function openModal(crumb, html) {
        if (modal.hidden) lastFocus = document.activeElement;
        $("#fxModalCrumb").textContent = crumb; mBody.innerHTML = html;
        modal.hidden = false; mCard.scrollTop = 0;
        mCard.style.animation = "none"; void mCard.offsetWidth; mCard.style.animation = "";
        mCard.focus(); sfx.open();
        setTimeout(function () { $$(".fx-bar i[data-w]", mBody).forEach(function (b) { b.style.width = b.dataset.w + "%"; }); }, 60);
    }
    function closeModal() { if (modal.hidden) return; modal.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    modal.addEventListener("click", function (e) {
        if (e.target.closest("[data-fx-close]")) { closeModal(); return; }
        var f = e.target.closest("[data-fx-file]"); if (f) { openFile(f.dataset.fxFile, f.dataset.fxFrom); return; }
        var p = e.target.closest("[data-fx-path]"); if (p) { openPath(p.dataset.fxPath); }
    });

    function openPath(id) {
        var p = PATHS[id]; if (!p) return;
        markPath(id);
        var body = "";
        if (p.pages) {
            body += '<p class="fx-sub">// ARCHIVE ENTRIES</p><div class="fx-entries">' + p.pages.map(function (k, i) {
                var g = PAGES[k];
                return '<a class="fx-entry" href="' + k + '.html" style="animation-delay:' + i * 0.05 + 's"><small><span>ENTRY // ' + g.e + "</span><span>" + g.y + "</span></small><b>" + g.t + "</b><p>" + g.g.toUpperCase() + "</p><em>" + (S.pages.indexOf(k) >= 0 ? "✓ READ · " : "") + "VIEW ENTRY →</em></a>";
            }).join("") + "</div>";
        }
        if (p.files) {
            body += '<p class="fx-sub">// ' + (p.pages ? "MORE FROM THE ARCHIVE" : "ARCHIVE FILES") + '</p><div class="fx-entries">' + p.files.map(function (k, i) {
                var g = FILES[k];
                return '<button type="button" class="fx-entry" data-fx-file="' + k + '" data-fx-from="' + id + '" style="animation-delay:' + i * 0.05 + 's"><small><span>FILE // ' + pad(i + 1) + "</span><span>" + g.y + "</span></small><b>" + g.t + "</b><p>" + g.g.toUpperCase() + " // " + g.dev + "</p><em>OPEN FILE →</em></button>";
            }).join("") + "</div>";
        }
        var actions = p.page ? '<div class="fx-actions"><a class="fx-btn blue" href="' + p.page + '">ENTER FULL PATH →</a></div>' : "";
        openModal("PATH // " + p.n + " // " + p.name,
            '<div class="fx-modal-head"><div><span class="fx-label">SELECTED PATH // ' + p.n + "</span><h2>" + p.name + "<br><span>" + p.sub + "</span></h2><p>" + p.text + '</p></div><img class="px" src="assets/img/' + id + '.png" alt=""></div>' +
            '<div class="fx-modal-body">' + body + actions + "</div>");
        var node = $(".node-" + id); if (node) node.classList.remove("fx-unvisited"), node.classList.add("fx-visited");
    }
    function openFile(k, from) {
        var g = FILES[k];
        var back = from ? '<button type="button" class="fx-btn" data-fx-path="' + from + '">← BACK TO ' + PATHS[from].name + "</button>" : "";
        openModal("FILE // " + g.t.toUpperCase(),
            '<div class="fx-modal-head"><div><span class="fx-label">ARCHIVE FILE // ' + g.g.toUpperCase() + " // " + g.y + "</span><h2>" + g.t.toUpperCase() + "</h2><p>" + g.s + "</p></div></div>" +
            '<div class="fx-modal-body"><div class="fx-data"><div><small>RELEASED</small>' + g.y + "</div><div><small>DEVELOPER</small>" + g.dev + "</div><div><small>PLATFORM</small>" + g.plat + "</div><div><small>GENRE</small>" + g.g + "</div></div>" +
            '<p class="fx-sub">// WHY IT MATTERS</p><p>' + g.l + "</p>" +
            '<p class="fx-sub">// STATUS</p><p>Full archive entry pending. This file is a preview of a future page.</p><div class="fx-actions">' + back + "</div></div>");
    }

    /* ---------------------------------------------------------
       SEARCH PALETTE ( / or Ctrl+K )
       --------------------------------------------------------- */
    var index = [];
    Object.keys(PAGES).forEach(function (k) { index.push({ l: PAGES[k].t, s: PAGES[k].g.toUpperCase() + " // " + PAGES[k].y, h: k + ".html" }); });
    Object.keys(GENRE_PAGES).forEach(function (k) { index.push({ l: GENRE_PAGES[k].t, s: "GENRE", h: k + ".html" }); });
    Object.keys(OTHER_PAGES).forEach(function (k) { index.push({ l: OTHER_PAGES[k], s: "PAGE", h: k + ".html" }); });
    Object.keys(PATHS).forEach(function (k) { index.push({ l: PATHS[k].name + " path", s: "PATH // " + PATHS[k].n, path: k }); });
    Object.keys(FILES).forEach(function (k) { index.push({ l: FILES[k].t, s: FILES[k].g.toUpperCase() + " // " + FILES[k].y, file: k, x: FILES[k].dev }); });
    var srch = el("div", "fx-modal fx-search");
    srch.hidden = true;
    srch.innerHTML = '<div class="fx-modal-bg" data-fx-sclose></div><div class="fx-modal-card" role="dialog" aria-modal="true" aria-label="Search the archive"><input id="fxQ" type="search" placeholder="> search games, genres, years, developers…" autocomplete="off"><ul id="fxRes" role="listbox"></ul><p>↑ ↓ MOVE · ENTER OPEN · ESC CLOSE</p></div>';
    document.body.appendChild(srch);
    var res = [], sel = 0, q = $("#fxQ"), list = $("#fxRes");
    function renderSearch() {
        var words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
        res = index.filter(function (r) { var h = (r.l + " " + r.s + " " + (r.x || "")).toLowerCase(); return words.every(function (w) { return h.indexOf(w) >= 0; }); }).slice(0, 12);
        sel = Math.min(sel, Math.max(0, res.length - 1));
        list.innerHTML = res.length ? res.map(function (r, i) { return '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span>' + r.l + "</span><small>" + r.s + "</small></li>"; }).join("") : '<li><span>NO MATCH // try "2011" or "Nintendo"</span></li>';
    }
    function openSearch() { srch.hidden = false; q.value = ""; sel = 0; renderSearch(); q.focus(); sfx.open(); }
    function closeSearch() { srch.hidden = true; }
    function go(i) {
        var r = res[i]; if (!r) return;
        closeSearch(); unlock("search");
        if (r.h) navigate(r.h); else if (r.path) openPath(r.path); else openFile(r.file);
    }
    q.addEventListener("input", function () { sel = 0; renderSearch(); });
    q.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { sel = Math.min(sel + 1, res.length - 1); renderSearch(); e.preventDefault(); }
        else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); renderSearch(); e.preventDefault(); }
        else if (e.key === "Enter") go(sel);
    });
    list.addEventListener("click", function (e) { var li = e.target.closest("[data-i]"); if (li) go(+li.dataset.i); });
    srch.addEventListener("click", function (e) { if (e.target.closest("[data-fx-sclose]")) closeSearch(); });
    $("#fxSearchBtn").addEventListener("click", openSearch);

    /* trophy room */
    $("#fxTrophyBtn").addEventListener("click", function () {
        var ids = Object.keys(ACH);
        openModal("ARCHIVE // ACHIEVEMENTS",
            '<div class="fx-modal-head"><div><span class="fx-label">PROGRESS // ' + Object.keys(S.ach).length + " OF " + ids.length + " · LEVEL " + (Math.floor(S.xp / 100) + 1) + " · " + S.xp + ' XP</span><h2>ACHIEVEMENTS<br><span>UNLOCKED.</span></h2><p>Progress is saved in this browser.</p></div><img class="px" src="assets/img/trophy.png" alt=""></div>' +
            '<div class="fx-modal-body"><div class="fx-entries">' + ids.map(function (i, n) {
                var got = !!S.ach[i];
                return '<div class="fx-entry" style="--c:' + (got ? "#0084ff" : "#dddddd") + ";animation-delay:" + n * 0.03 + 's;cursor:default"><small><span>' + (got ? "UNLOCKED" : "LOCKED") + "</span><span>" + pad(n + 1) + "</span></small><b>" + (got ? ACH[i][0] : "???") + "</b><p>" + ACH[i][1] + "</p></div>";
            }).join("") + '</div><div class="fx-actions"><button class="fx-btn" type="button" id="fxReset">RESET PROGRESS</button></div></div>');
        $("#fxReset").addEventListener("click", function () {
            if (!confirm("Reset all XP, achievements and read entries?")) return;
            try { localStorage.removeItem(KEY); } catch (e) { /* storage blocked */ }
            location.reload();
        });
    });

    /* ---------------------------------------------------------
       PAGE TRANSITIONS + SCROLL PROGRESS
       --------------------------------------------------------- */
    var prog = el("div", "fx-progress"); document.body.appendChild(prog);
    addEventListener("scroll", function () {
        var h = document.documentElement.scrollHeight - innerHeight;
        prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    }, { passive: true });
    if (!reduced) { var scan = el("div", "fx-scan"); document.body.appendChild(scan); setTimeout(function () { scan.remove(); }, 1000); }

    var wipe = null;
    function navigate(href, x, y) {
        if (reduced) { location.href = href; return; }
        wipe = el("div", "fx-wipe"); wipe.style.left = (x == null ? innerWidth / 2 : x) + "px"; wipe.style.top = (y == null ? innerHeight / 2 : y) + "px";
        document.body.appendChild(wipe); void wipe.offsetWidth; wipe.classList.add("full"); sfx.open();
        setTimeout(function () { location.href = href; }, 430);
    }
    addEventListener("pageshow", function () { if (wipe) { wipe.remove(); wipe = null; } });
    document.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest("a[href]"); if (!a || a.target === "_blank") return;
        var href = a.getAttribute("href");
        // dead nodes on the main map open their path popup instead
        if (href === "#" && a.classList.contains("mechanic-node")) {
            e.preventDefault();
            var id = (a.className.match(/node-(\w+)/) || [])[1];
            var c = center(a.querySelector(".node-dot") || a); sparks(c[0], c[1], 14);
            openPath(id); return;
        }
        if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
        e.preventDefault();
        closeModal();
        var at = e.clientX || e.clientY ? [e.clientX, e.clientY] : center(a);
        navigate(href, at[0], at[1]);
    });

    /* ---------------------------------------------------------
       HEADING DECODE + REVEAL + STAT BARS
       --------------------------------------------------------- */
    var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_";
    function decode(h) {
        if (reduced || !h) return;
        var nodes = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null);
        while (w.nextNode()) if (w.currentNode.nodeValue.trim()) nodes.push({ n: w.currentNode, t: w.currentNode.nodeValue });
        var frame = 0, total = 22;
        (function step() {
            frame++;
            nodes.forEach(function (o) {
                var keep = Math.floor((frame / total) * o.t.length);
                o.n.nodeValue = o.t.split("").map(function (ch, i) { return i < keep || ch === " " || ch === "\n" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }).join("");
            });
            if (frame < total) setTimeout(step, 30); else nodes.forEach(function (o) { o.n.nodeValue = o.t; });
        })();
    }
    decode($("h1"));

    // stat bars fill when they scroll into view
    var bars = $$(".stat-bar > *, .compare-stat .stat-fill");
    bars.forEach(function (b) { b.dataset.fxW = getComputedStyle(b).width; b.style.transition = "width 1s cubic-bezier(.2,.9,.3,1.1)"; b.style.width = "0"; });

    var revealSel = ".wiki-section, .genre-section, .home-about, .archive-entry, .figure-entry, .comparison-section, .explore-about, .gameplay-box, .comparison-option, .timeline-event, .timeline-item, .home-archive";
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
            if (!en.isIntersecting) return;
            var t = en.target; io.unobserve(t);
            if (t.dataset.fxW != null) { t.style.width = t.dataset.fxW; return; }
            t.classList.add("in");
        });
    }, { threshold: 0.12 }) : null;
    $$(revealSel).forEach(function (t, i) {
        if (!io) return;
        t.classList.add("fx-reveal");
        if (/timeline|gameplay-box|archive-entry|comparison-option/.test(t.className)) t.style.transitionDelay = (i % 4) * 0.08 + "s";
        io.observe(t);
    });
    bars.forEach(function (b) { if (io) io.observe(b); else b.style.width = b.dataset.fxW; });

    /* ---------------------------------------------------------
       MAPS: draw-in, crosshair, icons, visited state, walk mode
       --------------------------------------------------------- */
    var GENRE_ICON = { adventure: "explore", comparison: "fight", "open-world": "run", sandbox: "build", survival: "survive" };
    $$(".mechanic-map, .genre-map").forEach(function (map) {
        var isMain = map.classList.contains("mechanic-map");
        var nodes = $$(".mechanic-node, .genre-map-node", map);
        $$(".map-line, .genre-line", map).forEach(function (l, i) { l.classList.add("fx-draw"); l.style.animationDelay = 0.2 + i * 0.15 + "s"; });
        nodes.forEach(function (n, i) {
            n.classList.add("fx-pop"); n.style.animationDelay = 0.3 + i * 0.09 + "s";
            var key, icon, done;
            if (isMain) { key = (n.className.match(/node-(\w+)/) || [])[1]; icon = key; done = S.paths.indexOf(key) >= 0; }
            else {
                key = (n.className.match(/genre-(adventure|comparison|open-world|sandbox|survival)/) || [])[1]; icon = GENRE_ICON[key] || "controller";
                var href = (n.getAttribute("href") || "").replace("./", "").replace(".html", ""); done = S.pages.indexOf(href) >= 0;
            }
            n.style.position = n.style.position || "";
            var img = el("img", "fx-node-icon px"); img.src = "assets/img/" + icon + ".png"; img.alt = ""; n.appendChild(img);
            n.classList.add(done ? "fx-visited" : "fx-unvisited");
        });

        // crosshair + coordinates readout
        var cx = el("div", "fx-cross-x"), cy = el("div", "fx-cross-y"), co = el("div", "fx-coords");
        map.appendChild(cx); map.appendChild(cy); map.appendChild(co);
        map.addEventListener("pointermove", function (e) {
            if (e.pointerType !== "mouse") return;
            var r = map.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            map.classList.add("fx-maphover");
            cx.style.top = y + "px"; cy.style.left = x + "px";
            co.style.left = Math.min(x + 12, r.width - 130) + "px"; co.style.top = Math.max(y - 26, 4) + "px";
            co.textContent = "X // " + ("000" + Math.round(x)).slice(-4) + "  Y // " + ("000" + Math.round(y)).slice(-4);
        });
        map.addEventListener("pointerleave", function () { map.classList.remove("fx-maphover"); });
        nodes.forEach(function (n) { n.addEventListener("pointerenter", sfx.tick); });

        setupWalk(map, nodes, isMain);
    });

    function setupWalk(map, nodes, isMain) {
        var instr = $(".map-instruction, .genre-map-instruction", map);
        var btn = el("button", "fx-play-btn", "▶ WALK THE MAP");
        btn.type = "button"; btn.setAttribute("aria-pressed", "false");
        btn.title = "Move with arrow keys or WASD, press Enter on a node";
        (instr || map).appendChild(btn);
        var left = $(".map-interface-left, .genre-interface-left", map);
        var bitLine = el("p", "", "");
        if (left) left.appendChild(bitLine);
        var padEl = el("div", "fx-pad", '<span></span><button type="button" data-d="0,-1" aria-label="Up">↑</button><span></span><button type="button" data-d="-1,0" aria-label="Left">←</button><button type="button" data-d="enter" aria-label="Enter">↵</button><button type="button" data-d="1,0" aria-label="Right">→</button><span></span><button type="button" data-d="0,1" aria-label="Down">↓</button><span></span>');
        map.appendChild(padEl);

        var playing = false, px = 0, py = 0, player = null, hint = null, bits = [], got = 0, near = null, STEP = 25, TOTAL = 10;
        function W() { return map.clientWidth; } function H() { return map.clientHeight; }
        function anchors() {
            var r = map.getBoundingClientRect();
            return nodes.map(function (n) { var d = (n.querySelector(".node-dot, .genre-dot") || n).getBoundingClientRect(); return { n: n, x: d.left - r.left + d.width / 2, y: d.top - r.top + d.height / 2 }; });
        }
        function spawnBits() {
            bits.forEach(function (b) { b.el.remove(); }); bits = []; got = 0;
            var an = anchors();
            while (bits.length < TOTAL) {
                var x = STEP * (2 + Math.floor(Math.random() * (W() / STEP - 4))), y = STEP * (3 + Math.floor(Math.random() * ((H() - 60) / STEP - 4)));
                if (an.some(function (a) { return Math.abs(a.x - x) < 60 && Math.abs(a.y - y) < 50; })) continue;
                if (bits.some(function (b) { return b.x === x && b.y === y; })) continue;
                var b = el("div", "fx-bit"); b.style.left = x - 4 + "px"; b.style.top = y - 4 + "px"; map.appendChild(b);
                bits.push({ x: x, y: y, el: b });
            }
            bitLine.textContent = "DATA BITS // 00/" + TOTAL;
        }
        function place() {
            player.style.left = px - 7 + "px"; player.style.top = py - 7 + "px";
            if (!reduced) { var t = el("div", "fx-trail"); t.style.left = px - 3 + "px"; t.style.top = py - 3 + "px"; map.appendChild(t); setTimeout(function () { t.remove(); }, 1400); }
            bits = bits.filter(function (b) {
                if (Math.abs(b.x - px) < 14 && Math.abs(b.y - py) < 14) {
                    b.el.remove(); got++; sfx.bit(); var c = center(player); sparks(c[0], c[1], 10);
                    bitLine.textContent = "DATA BITS // " + pad(got) + "/" + TOTAL;
                    if (got === TOTAL) { unlock("bits"); addXP(30, player); }
                    return false;
                }
                return true;
            });
            var best = null;
            anchors().forEach(function (a) { var d = Math.hypot(a.x - px, a.y - py); if (d < 40 && (!best || d < best.d)) best = { n: a.n, d: d, x: a.x, y: a.y }; });
            if (near && (!best || best.n !== near)) near.classList.remove("fx-near");
            near = best ? best.n : null;
            if (near) {
                near.classList.add("fx-near");
                hint.style.display = "block"; hint.style.left = Math.min(best.x + 16, W() - 110) + "px"; hint.style.top = best.y - 30 + "px";
            } else hint.style.display = "none";
        }
        function move(dx, dy) {
            px = Math.max(STEP, Math.min(W() - STEP, px + dx * STEP));
            py = Math.max(STEP, Math.min(H() - 50, py + dy * STEP));
            sfx.step(); place();
        }
        function enter() { if (near) { var c = center(near); sparks(c[0], c[1], 16); near.click(); } }
        function start() {
            playing = true; btn.setAttribute("aria-pressed", "true"); btn.textContent = "■ STOP [ESC]";
            map.classList.add("fx-playing");
            player = el("div", "fx-player"); hint = el("div", "fx-hint", "↵ PRESS ENTER"); hint.style.display = "none";
            map.appendChild(player); map.appendChild(hint);
            px = Math.round(W() / 2 / STEP) * STEP; py = Math.round((H() - 60) / 2 / STEP) * STEP;
            spawnBits(); place(); unlock("walker");
            map.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
        }
        function stop() {
            playing = false; btn.setAttribute("aria-pressed", "false"); btn.textContent = "▶ WALK THE MAP";
            map.classList.remove("fx-playing");
            if (player) player.remove(); if (hint) hint.remove(); player = hint = null;
            if (near) near.classList.remove("fx-near"); near = null;
            bits.forEach(function (b) { b.el.remove(); }); bits = []; bitLine.textContent = "";
        }
        btn.addEventListener("click", function (e) { e.stopPropagation(); playing ? stop() : start(); });
        padEl.addEventListener("click", function (e) {
            var b = e.target.closest("[data-d]"); if (!b || !playing) return;
            if (b.dataset.d === "enter") enter(); else { var d = b.dataset.d.split(","); move(+d[0], +d[1]); }
        });
        addEventListener("keydown", function (e) {
            if (!playing || !modal.hidden || !srch.hidden) return;
            var k = e.key, d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] }[k];
            if (d) { e.preventDefault(); move(d[0], d[1]); }
            else if (k === "Enter" || k === " ") { e.preventDefault(); enter(); }
            else if (k === "Escape") stop();
        });
    }

    /* ---------------------------------------------------------
       3D ARCHIVE MODEL on game pages (drag to rotate)
       --------------------------------------------------------- */
    var info = PAGES[PAGE];
    if (info) {
        var hero = $(".game-hero-main") || $(".genre-header");
        var heroBox = $(".game-hero") || $(".genre-header");
        var color = heroBox ? getComputedStyle(heroBox).backgroundColor : "#0084ff";
        var icon = { explore: "explore", build: "build", survive: "survive" }[info.game];
        var wrap = el("div", "fx-model-wrap");
        wrap.title = "Drag to rotate";
        wrap.innerHTML = '<div class="fx-model" style="--c:' + color + '">' +
            '<div class="fx-face f1 c"><span>ENTRY // ' + info.e + "</span><b>" + info.y + "</b><span>" + info.g.toUpperCase() + "</span></div>" +
            '<div class="fx-face f2"><span>// TITLE</span><b>' + info.t.toUpperCase() + "</b><span>ARCHIVE</span></div>" +
            '<div class="fx-face f3"><img class="px" src="assets/img/' + icon + '.png" alt=""><span>PATH // ' + info.game.toUpperCase() + "</span></div>" +
            '<div class="fx-face f4 c"><span>HGM</span><b>' + info.e + "</b><span>FILE</span></div>" +
            '<div class="fx-face f5"><span>// TOP</span><b>' + info.g.toUpperCase() + "</b></div>" +
            '<div class="fx-face f6"><span>// BASE</span><b>' + info.y + "</b></div></div>" +
            '<div class="fx-model-hint">DRAG TO ROTATE</div>';
        if (hero) {
            hero.classList.add("fx-has-model");
            var yearBox = $(".game-hero-year", hero);
            if (yearBox) hero.insertBefore(wrap, yearBox); else hero.appendChild(wrap);
            var model = $(".fx-model", wrap), rx = -18, ry = 30, vx = 0, vy = 0.35, drag = null;
            wrap.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY }; wrap.setPointerCapture(e.pointerId); });
            wrap.addEventListener("pointermove", function (e) {
                if (!drag) return;
                vy = (e.clientX - drag.x) * 0.5; vx = -(e.clientY - drag.y) * 0.5;
                ry += vy; rx += vx; drag = { x: e.clientX, y: e.clientY };
            });
            wrap.addEventListener("pointerup", function () { drag = null; });
            (function spin() {
                if (!drag) { vy += (0.35 - vy) * 0.03; vx *= 0.94; ry += vy; rx += vx; rx += (-18 - rx) * 0.02; }
                model.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
                if (!reduced) requestAnimationFrame(spin);
            })();
        }
    }

    /* ---------------------------------------------------------
       MINI-GAMES (one per genre)
       --------------------------------------------------------- */
    var gameType = (PAGES[PAGE] || GENRE_PAGES[PAGE] || {}).game;
    var host = $(".game-wiki-page") || $(".genre-page");
    if (gameType && host) {
        var box = el("section", "fx-game");
        var titles = { build: ["BUILD", "PLACE BLOCKS. MAKE SOMETHING."], explore: ["EXPLORE", "LIFT THE FOG. FIND THE LANDMARKS."], survive: ["SURVIVE", "LAST THE NIGHT."] };
        box.innerHTML = '<div class="fx-game-top"><h2><span>//</span> PLAY THE MECHANIC: ' + titles[gameType][0] + '</h2><span>INTERACTIVE DEMO // ' + titles[gameType][1] + '</span></div><div class="fx-game-body"></div>';
        var anchor = $(".game-page-navigation", host) || $(".related-section", host);
        if (anchor) anchor.parentNode.insertBefore(box, anchor); else host.appendChild(box);
        var gb = $(".fx-game-body", box);
        if (gameType === "build") buildGame(gb); else if (gameType === "explore") exploreGame(gb); else surviveGame(gb);
    }

    function buildGame(root) {
        var C = 32, R = 16, SZ = 20, key = "hgm-build-" + PAGE, grid;
        try { grid = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { grid = null; }
        if (!grid || grid.length !== C * R) { grid = new Array(C * R).fill(0); for (var x = 0; x < C; x++) { grid[(R - 1) * C + x] = 1; grid[(R - 2) * C + x] = x % 7 === 3 ? 0 : 2; } }
        var COLORS = [null, "#222222", "#777777", "#0084ff", "#9cdcfe", "#4f9f45", "#e58b2a", "#9b59b6", "#ffffff"];
        root.innerHTML = "<p>Sandbox games are about creative freedom. Click or drag to place blocks, pick a colour below, and build anything. Your build saves automatically on this page.</p>" +
            '<div class="fx-stats"><div>BLOCKS PLACED<b id="fxPlaced">' + S.blocks + '</b></div><div>TALLEST STRUCTURE<b id="fxTall">0</b></div><div>TOOL<b id="fxTool">BLOCK</b></div></div>' +
            '<div class="fx-canvas-wrap"><canvas id="fxBuild" width="' + C * SZ + '" height="' + R * SZ + '" aria-label="Building grid"></canvas></div>' +
            '<div class="fx-tools" id="fxSw"></div>';
        var cv = $("#fxBuild", root), ctx = cv.getContext("2d"), cur = 3, painting = false, mode = 1;
        var sw = $("#fxSw", root);
        COLORS.forEach(function (c, i) { if (!c) return; var b = el("button", "fx-swatch"); b.type = "button"; b.style.background = c; b.dataset.c = i; b.setAttribute("aria-label", "Colour " + i); b.setAttribute("aria-pressed", String(i === cur)); sw.appendChild(b); });
        sw.insertAdjacentHTML("beforeend", '<button type="button" class="fx-btn" data-c="0">ERASER</button><button type="button" class="fx-btn" id="fxClear">CLEAR</button>');
        sw.addEventListener("click", function (e) {
            if (e.target.id === "fxClear") { grid = grid.map(function (v, i) { return i >= (R - 2) * C ? v : 0; }); draw(); store(); return; }
            var b = e.target.closest("[data-c]"); if (!b) return;
            cur = +b.dataset.c; $$("[data-c]", sw).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
            $("#fxTool", root).textContent = cur ? "BLOCK" : "ERASER"; sfx.tick();
        });
        function draw() {
            ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.strokeStyle = "#eeeeee"; ctx.lineWidth = 1;
            for (var x = 0; x <= C; x++) { ctx.beginPath(); ctx.moveTo(x * SZ + .5, 0); ctx.lineTo(x * SZ + .5, cv.height); ctx.stroke(); }
            for (var y = 0; y <= R; y++) { ctx.beginPath(); ctx.moveTo(0, y * SZ + .5); ctx.lineTo(cv.width, y * SZ + .5); ctx.stroke(); }
            var tall = 0;
            grid.forEach(function (v, i) {
                if (!v) return;
                var gx = i % C, gy = (i / C) | 0;
                ctx.fillStyle = COLORS[v]; ctx.fillRect(gx * SZ, gy * SZ, SZ, SZ);
                ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(gx * SZ, gy * SZ, SZ, 3);
                ctx.strokeStyle = "#222222"; ctx.strokeRect(gx * SZ + .5, gy * SZ + .5, SZ - 1, SZ - 1);
                if (gy < R - 2) tall = Math.max(tall, R - 2 - gy);
            });
            $("#fxTall", root).textContent = tall;
        }
        function store() { try { localStorage.setItem(key, JSON.stringify(grid)); } catch (e) { /* storage blocked */ } }
        function cell(e) { var r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * C), Math.floor((e.clientY - r.top) / r.height * R)]; }
        function paint(e) {
            var p = cell(e); if (p[0] < 0 || p[1] < 0 || p[0] >= C || p[1] >= R) return;
            var i = p[1] * C + p[0], v = mode ? cur : 0;
            if (grid[i] === v) return;
            if (v && !grid[i]) { S.blocks++; save(); $("#fxPlaced", root).textContent = S.blocks; if (S.blocks >= 50) unlock("builder"); }
            grid[i] = v; sfx.step(); draw();
        }
        cv.addEventListener("pointerdown", function (e) { painting = true; mode = e.button === 2 ? 0 : 1; cv.setPointerCapture(e.pointerId); paint(e); });
        cv.addEventListener("pointermove", function (e) { if (painting) paint(e); });
        cv.addEventListener("pointerup", function () { painting = false; store(); });
        cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });
        draw();
    }

    function exploreGame(root) {
        var C = 32, R = 16, SZ = 20;
        root.innerHTML = "<p>Open-world and adventure games reward curiosity. Move the blue square with the arrow keys or WASD (or tap a nearby cell) to clear the fog and find all five landmarks.</p>" +
            '<div class="fx-stats"><div>EXPLORED<b id="fxPct">0%</b></div><div>LANDMARKS<b id="fxLm">0/5</b></div><div>STEPS<b id="fxSteps">0</b></div></div>' +
            '<div class="fx-canvas-wrap" tabindex="0" id="fxExWrap" aria-label="Exploration map. Focus and use arrow keys."><canvas id="fxEx" width="' + C * SZ + '" height="' + R * SZ + '"></canvas></div>' +
            '<div class="fx-tools"><button type="button" class="fx-btn blue" id="fxNewWorld">NEW WORLD</button><span style="font-size:10px;color:#777">Click the map first so the arrow keys move you instead of the page.</span></div>';
        var cv = $("#fxEx", root), ctx = cv.getContext("2d"), wrapEl = $("#fxExWrap", root);
        var icons = ["heart", "coin", "trophy", "controller", "explore"].map(function (n) { var im = new Image(); im.src = "assets/img/" + n + ".png"; im.onload = function () { draw(); }; return im; });
        var terr, fog, lm, pos, steps, found;
        function seed() {
            terr = []; fog = []; lm = []; steps = 0; found = 0;
            var ox = Math.random() * 100, oy = Math.random() * 100;
            for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
                var n = Math.sin((x + ox) * 0.35) + Math.cos((y + oy) * 0.45) + Math.sin((x + y + ox) * 0.2);
                terr.push(n > 1.4 ? 3 : n > 0.6 ? 2 : n < -1.3 ? 0 : 1); fog.push(1);
            }
            while (lm.length < 5) { var p = [(Math.random() * C) | 0, (Math.random() * R) | 0]; if (terr[p[1] * C + p[0]] !== 0 && !lm.some(function (q) { return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 6; })) lm.push([p[0], p[1], false]); }
            pos = [C >> 1, R >> 1]; terr[pos[1] * C + pos[0]] = 1; reveal(); update(); draw();
        }
        function reveal() { for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) { var x = pos[0] + dx, y = pos[1] + dy; if (x >= 0 && y >= 0 && x < C && y < R && dx * dx + dy * dy <= 10) fog[y * C + x] = 0; } }
        function update() {
            var open = fog.filter(function (f) { return !f; }).length;
            $("#fxPct", root).textContent = Math.round(open / fog.length * 100) + "%";
            $("#fxLm", root).textContent = found + "/5"; $("#fxSteps", root).textContent = steps;
        }
        var TC = ["#9cdcfe", "#ffffff", "#e8f3e6", "#dddddd"];
        function draw() {
            for (var i = 0; i < C * R; i++) {
                var x = i % C, y = (i / C) | 0;
                ctx.fillStyle = TC[terr[i]]; ctx.fillRect(x * SZ, y * SZ, SZ, SZ);
                ctx.strokeStyle = "#eeeeee"; ctx.strokeRect(x * SZ + .5, y * SZ + .5, SZ, SZ);
                if (terr[i] === 2 && (x + y) % 2 === 0) { ctx.fillStyle = "#4f9f45"; ctx.fillRect(x * SZ + 7, y * SZ + 5, 6, 10); }
                if (terr[i] === 3) { ctx.fillStyle = "#777777"; ctx.beginPath(); ctx.moveTo(x * SZ + 3, y * SZ + 17); ctx.lineTo(x * SZ + 10, y * SZ + 4); ctx.lineTo(x * SZ + 17, y * SZ + 17); ctx.fill(); }
            }
            lm.forEach(function (l, k) { if (!fog[l[1] * C + l[0]] && icons[k].complete) ctx.drawImage(icons[k], l[0] * SZ, l[1] * SZ, SZ, SZ); });
            for (i = 0; i < C * R; i++) if (fog[i]) {
                x = i % C; y = (i / C) | 0;
                ctx.fillStyle = "#f5f5f5"; ctx.fillRect(x * SZ, y * SZ, SZ, SZ);
                ctx.fillStyle = "#e3e3e3"; if ((x + y) % 2) ctx.fillRect(x * SZ + 8, y * SZ + 8, 4, 4);
            }
            ctx.fillStyle = "#0084ff"; ctx.fillRect(pos[0] * SZ + 3, pos[1] * SZ + 3, SZ - 6, SZ - 6);
            ctx.strokeStyle = "#222222"; ctx.lineWidth = 1; ctx.strokeRect(pos[0] * SZ + 3.5, pos[1] * SZ + 3.5, SZ - 7, SZ - 7);
        }
        function step(dx, dy) {
            var nx = pos[0] + dx, ny = pos[1] + dy;
            if (nx < 0 || ny < 0 || nx >= C || ny >= R) return;
            if (terr[ny * C + nx] === 0) { sfx.bad(); return; } // water blocks the way
            pos = [nx, ny]; steps++; reveal(); sfx.step();
            lm.forEach(function (l, k) {
                if (!l[2] && !fog[l[1] * C + l[0]]) { l[2] = true; found++; sfx.bit(); toast("// LANDMARK FOUND", "LANDMARK " + pad(found) + " / 05", "Keep exploring.", ["heart", "coin", "trophy", "controller", "explore"][k]); if (found === 5) { unlock("fog"); addXP(30, cv); } }
            });
            update(); draw();
        }
        wrapEl.addEventListener("keydown", function (e) {
            var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key.length === 1 ? e.key.toLowerCase() : e.key];
            if (d) { e.preventDefault(); step(d[0], d[1]); }
        });
        cv.addEventListener("pointerdown", function (e) {
            wrapEl.focus();
            var r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * C), y = Math.floor((e.clientY - r.top) / r.height * R);
            var dx = Math.sign(x - pos[0]), dy = Math.sign(y - pos[1]);
            if (Math.abs(x - pos[0]) >= Math.abs(y - pos[1])) step(dx, 0); else step(0, dy);
        });
        $("#fxNewWorld", root).addEventListener("click", function () { seed(); sfx.open(); });
        seed();
    }

    function surviveGame(root) {
        root.innerHTML = "<p>Survival games make resources precious. Each day has four actions. Gather, eat and keep a fire going. When night falls the cold arrives. How many days can you last?</p>" +
            '<div class="fx-stats"><div>DAY<b id="fxDay">1</b></div><div>ACTIONS LEFT<b id="fxAct">4</b></div><div>WOOD<b id="fxWood">2</b></div><div>FOOD<b id="fxFood">1</b></div><div>BEST RUN<b id="fxBest">' + S.best + ' DAYS</b></div></div>' +
            '<div class="fx-meter" id="mHealth"><span>HEALTH <b></b></span><div class="fx-bar"><i></i></div></div>' +
            '<div class="fx-meter" id="mHunger"><span>HUNGER <b></b></span><div class="fx-bar"><i></i></div></div>' +
            '<div class="fx-meter" id="mWarm"><span>WARMTH <b></b></span><div class="fx-bar"><i></i></div></div>' +
            '<div class="fx-tools"><button type="button" class="fx-btn" data-a="wood">GATHER WOOD</button><button type="button" class="fx-btn" data-a="food">FORAGE</button><button type="button" class="fx-btn" data-a="eat">EAT</button><button type="button" class="fx-btn" data-a="fire">LIGHT FIRE (2 WOOD)</button><button type="button" class="fx-btn blue" data-a="restart">RESTART</button></div>' +
            '<div class="fx-log" id="fxLog" aria-live="polite"></div>';
        var st;
        function reset() { st = { day: 1, act: 4, wood: 2, food: 1, hp: 100, hun: 80, warm: 80, fire: 0, dead: false }; $("#fxLog", root).innerHTML = ""; log("DAY 1 // You wake up somewhere unfamiliar."); render(); }
        function log(m) { var lg = $("#fxLog", root); lg.insertBefore(el("p", "", m), lg.firstChild); }
        function meter(id, v) { var m = $("#" + id, root); m.querySelector("b").textContent = Math.round(v); m.querySelector("i").style.width = Math.max(0, v) + "%"; m.classList.toggle("low", v < 30); }
        function render() {
            $("#fxDay", root).textContent = st.day; $("#fxAct", root).textContent = st.act; $("#fxWood", root).textContent = st.wood; $("#fxFood", root).textContent = st.food;
            meter("mHealth", st.hp); meter("mHunger", st.hun); meter("mWarm", st.warm);
            $$("[data-a]", root).forEach(function (b) { if (b.dataset.a !== "restart") b.disabled = st.dead; });
        }
        function night() {
            if (st.fire) { st.warm = Math.min(100, st.warm + 10); log("NIGHT // The fire keeps you warm."); st.fire = 0; }
            else { st.warm -= 40; log("NIGHT // No fire. The cold bites hard."); }
            if (Math.random() < 0.3) { st.hp -= 15; log("NIGHT // Something moved in the dark. You were hurt."); sfx.bad(); }
            st.day++; st.act = 4;
            if (!st.dead) { log("DAY " + st.day + " // You survived the night."); if (st.day - 1 > S.best) { S.best = st.day - 1; save(); $("#fxBest", root).textContent = S.best + " DAYS"; } if (st.day - 1 >= 5) unlock("survivor"); }
        }
        function act(a) {
            if (st.dead) return;
            if (a === "wood") { var w = 1 + ((Math.random() * 3) | 0); st.wood += w; st.hun -= 10; log("+" + w + " WOOD // Hard work."); }
            else if (a === "food") { if (Math.random() < 0.6) { st.food++; log("+1 FOOD // Berries."); } else log("FORAGE // Nothing found."); st.hun -= 8; }
            else if (a === "eat") { if (!st.food) { log("EAT // No food left."); sfx.bad(); return; } st.food--; st.hun = Math.min(100, st.hun + 35); st.hp = Math.min(100, st.hp + 5); log("EAT // You feel stronger."); }
            else if (a === "fire") { if (st.wood < 2) { log("FIRE // Need 2 wood."); sfx.bad(); return; } st.wood -= 2; st.fire = 1; st.warm = Math.min(100, st.warm + 25); log("FIRE // The fire crackles."); }
            sfx.tick();
            st.warm -= 5;
            if (st.hun <= 0) { st.hun = 0; st.hp -= 15; log("STARVING // Health falling."); }
            if (st.warm <= 0) { st.warm = 0; st.hp -= 15; log("FREEZING // Health falling."); }
            st.act--;
            if (st.act <= 0 && st.hp > 0) night();
            if (st.hp <= 0) { st.hp = 0; st.dead = true; log("GAME OVER // You lasted " + (st.day - 1) + " day" + (st.day - 1 === 1 ? "" : "s") + ". Press RESTART."); sfx.bad(); }
            render();
        }
        root.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (!b) return; if (b.dataset.a === "restart") { reset(); sfx.open(); } else act(b.dataset.a); });
        reset();
    }

    /* ---------------------------------------------------------
       VERSUS RADAR (compare page)
       --------------------------------------------------------- */
    var cmp = $(".compare-page");
    if (cmp) {
        var name = function (k) { return MIX_NAMES[k] || PAGES[k].t; };
        var opts = Object.keys(MIX).map(function (k) { return '<option value="' + k + '">' + name(k) + "</option>"; }).join("");
        var sec = el("section", "fx-game fx-versus");
        sec.innerHTML = '<div class="fx-game-top"><h2><span>//</span> VERSUS MODE</h2><span>PICK ANY TWO // ARCHIVE ESTIMATE OF EACH MECHANIC, NOT AN OFFICIAL RATING</span></div>' +
            '<div class="fx-game-body"><div class="fx-pick"><select id="fxA" aria-label="First game">' + opts + '</select><b>VS</b><select id="fxB" aria-label="Second game">' + opts + "</select></div>" +
            '<div class="fx-versus-grid"><svg id="fxRadar" viewBox="-160 -160 320 320" role="img" aria-label="Radar chart comparing both games"></svg><div id="fxRows"></div></div><p class="fx-verdict" id="fxVerdict"></p></div>';
        var anchorEl = $(".game-page-navigation", cmp);
        if (anchorEl) anchorEl.parentNode.insertBefore(sec, anchorEl); else cmp.appendChild(sec);
        var A = $("#fxA"), B = $("#fxB"); A.value = "minecraft"; B.value = "terraria";
        var pts = function (v, R) { return v.map(function (n, i) { var a = -Math.PI / 2 + i / 6 * Math.PI * 2, r = n / 10 * (R || 120); return (Math.cos(a) * r).toFixed(1) + "," + (Math.sin(a) * r).toFixed(1); }).join(" "); };
        var renderVs = function (user) {
            var a = MIX[A.value], b = MIX[B.value], svg = "";
            [2.5, 5, 7.5, 10].forEach(function (k) { svg += '<polygon points="' + pts([k, k, k, k, k, k]) + '" fill="none" stroke="#dddddd"/>'; });
            MIX_AXES.forEach(function (l, i) { var an = -Math.PI / 2 + i / 6 * Math.PI * 2; svg += '<line x1="0" y1="0" x2="' + Math.cos(an) * 120 + '" y2="' + Math.sin(an) * 120 + '" stroke="#dddddd"/><text x="' + Math.cos(an) * 142 + '" y="' + (Math.sin(an) * 142 + 3) + '" text-anchor="middle">' + l + "</text>"; });
            svg += '<polygon class="shape" points="' + pts(a) + '" fill="rgba(0,132,255,.18)" stroke="#0084ff" stroke-width="2"/><polygon class="shape" points="' + pts(b) + '" fill="rgba(229,139,42,.18)" stroke="#e58b2a" stroke-width="2"/>';
            $("#fxRadar").innerHTML = svg;
            $("#fxRows").innerHTML = '<div class="fx-vrow"><b style="text-align:right;color:#0084ff">' + name(A.value).toUpperCase() + '</b><span></span><b style="color:#e58b2a">' + name(B.value).toUpperCase() + "</b></div>" + MIX_AXES.map(function (l, i) {
                return '<div class="fx-vrow"><div class="fx-bar l"><i data-w="' + a[i] * 10 + '"></i></div><span>' + l + '</span><div class="fx-bar r"><i data-w="' + b[i] * 10 + '"></i></div></div>';
            }).join("");
            requestAnimationFrame(function () { $$("#fxRows i").forEach(function (i) { i.style.width = i.dataset.w + "%"; }); });
            var d = a.map(function (v, i) { return v - b[i]; }), ia = d.indexOf(Math.max.apply(null, d)), ib = d.indexOf(Math.min.apply(null, d));
            var shared = MIX_AXES.filter(function (l, i) { return a[i] >= 6 && b[i] >= 6; });
            $("#fxVerdict").innerHTML = A.value === B.value ? "<b>// MIRROR MATCH.</b> Pick a different second game." :
                "<b>// RESULT.</b> " + name(A.value) + (d[ia] > 0 ? " leans harder into <b>" + MIX_AXES[ia] + "</b> (+" + d[ia] + ")" : " never out-scores its rival") + ", while " + name(B.value) + (d[ib] < 0 ? " pushes <b>" + MIX_AXES[ib] + "</b> (+" + (-d[ib]) + ")." : " never out-scores its rival.") +
                (shared.length ? " Common ground: " + shared.join(", ") + "." : " Almost nothing in common.");
            if (user && A.value !== B.value) { unlock("versus"); sfx.bit(); }
        };
        A.addEventListener("change", function () { renderVs(true); });
        B.addEventListener("change", function () { renderVs(true); });
        renderVs(false);
    }

    /* ---------------------------------------------------------
       KEYBOARD: search, escape, secret code
       --------------------------------------------------------- */
    var CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], kp = 0;
    addEventListener("keydown", function (e) {
        if (e.key === "Escape") { if (!srch.hidden) closeSearch(); else closeModal(); return; }
        var typing = /INPUT|SELECT|TEXTAREA/.test(e.target.tagName || "");
        if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); openSearch(); return; }
        if (typing) return;
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        kp = k === CODE[kp] ? kp + 1 : (k === CODE[0] ? 1 : 0);
        if (kp === CODE.length) {
            kp = 0; S.terminal = !S.terminal; save();
            document.documentElement.classList.toggle("fx-terminal", S.terminal);
            unlock("konami"); sfx.win();
            toast("// SECRET", "TERMINAL MODE " + (S.terminal ? "ON" : "OFF"), "Enter the code again to switch back.", "controller");
        }
    });
})();
