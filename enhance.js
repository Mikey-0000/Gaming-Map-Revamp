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
        subnautica:     { t: "Subnautica", y: 2018, g: "Survival", game: "survive", e: "003" },
        tetris:         { t: "Tetris", y: 1984, g: "Puzzle", game: "solve", e: "001" },
        myst:           { t: "Myst", y: 1993, g: "Puzzle Adventure", game: "solve", e: "002" },
        portal:         { t: "Portal", y: 2007, g: "Puzzle", game: "solve", e: "003" },
        smb:            { t: "Super Mario Bros.", y: 1985, g: "Platformer", game: "jump", e: "001" },
        sonic:          { t: "Sonic the Hedgehog", y: 1991, g: "Platformer", game: "jump", e: "002" },
        celeste:        { t: "Celeste", y: 2018, g: "Platformer", game: "jump", e: "003" },
        simcity:        { t: "SimCity", y: 1989, g: "City Builder", game: "build", e: "004" },
        rct:            { t: "RollerCoaster Tycoon", y: 1999, g: "Management", game: "build", e: "005" },
        sf2:            { t: "Street Fighter II", y: 1991, g: "Fighting", game: "fight", e: "001" },
        doom:           { t: "Doom", y: 1993, g: "Shooter", game: "fight", e: "002" },
        darksouls:      { t: "Dark Souls", y: 2011, g: "Action RPG", game: "fight", e: "003" },
        pacman:         { t: "Pac-Man", y: 1980, g: "Maze Chase", game: "run", e: "001" },
        granturismo:    { t: "Gran Turismo", y: 1997, g: "Racing", game: "run", e: "002" },
        templerun:      { t: "Temple Run", y: 2011, g: "Endless Runner", game: "run", e: "003" }
    };
    var TOTAL = Object.keys(PAGES).length;
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
            text: "Games that turn reasoning into play, from falling blocks to portals that bend space.", pages: ["tetris", "myst", "portal"] },
        jump:    { n: "03", name: "JUMP", sub: "MASTER THE ARC.", tag: "Movement // Timing // Platforms",
            text: "Precision, rhythm and momentum: the platformer made the jump one of gaming's most expressive verbs.", pages: ["smb", "sonic", "celeste"] },
        build:   { n: "04", name: "BUILD", sub: "SHAPE THE WORLD.", tag: "Creation // Systems // Sandbox", page: "genre.html",
            text: "Games that hand players the tools, from block-by-block worlds to whole cities.", pages: ["minecraft", "terraria", "gta5", "simcity", "rct"] },
        fight:   { n: "05", name: "FIGHT", sub: "READ YOUR RIVAL.", tag: "Combat // Action // Competition",
            text: "Reflexes, mastery and rivalry: the fighter, the first-person shooter and the punishing action RPG.", pages: ["sf2", "doom", "darksouls"] },
        run:     { n: "06", name: "RUN", sub: "NEVER STOP.", tag: "Speed // Movement // Reaction",
            text: "Games built on going fast: maze chases, racing lines and endless runs.", pages: ["pacman", "granturismo", "templerun"] },
        survive: { n: "07", name: "SURVIVE", sub: "MAKE IT TO MORNING.", tag: "Resources // Risk // Endurance", page: "survival.html",
            text: "Scarcity creates tension: every item, every night and every decision matters.", pages: ["residentevil", "dontstarve", "subnautica"] }
    };
    var PATH_COLORS = { explore: "#0084ff", solve: "#9b59b6", jump: "#e58b2a", build: "#4f9f45", fight: "#222222", run: "#0084ff", survive: "#e58b2a" };

    // mechanic mix used by Versus mode (archive estimate, 0-10)
    var MIX = {
        minecraft: [8, 1, 10, 4, 4, 1], terraria: [8, 1, 8, 8, 2, 3], gta5: [9, 8, 1, 7, 1, 8], gta3: [8, 6, 0, 7, 1, 7],
        skyrim: [10, 7, 3, 7, 3, 2], breathofthewild: [10, 5, 3, 6, 7, 3], zelda: [9, 7, 1, 6, 8, 3], uncharted2: [6, 9, 0, 7, 4, 5],
        lifeisstrange: [5, 10, 0, 0, 5, 1], residentevil: [6, 6, 0, 5, 7, 1], dontstarve: [7, 2, 6, 4, 4, 1], subnautica: [10, 6, 7, 1, 3, 2],
        tetris: [0, 0, 5, 0, 10, 8], myst: [8, 7, 0, 0, 10, 0], portal: [3, 6, 0, 0, 10, 4], celeste: [4, 7, 0, 0, 5, 8],
        simcity: [1, 0, 10, 0, 6, 1], rct: [1, 0, 10, 0, 5, 2], sf2: [0, 1, 0, 10, 3, 7], doom: [5, 1, 0, 10, 2, 9],
        darksouls: [8, 5, 1, 10, 3, 3], pacman: [2, 0, 0, 2, 5, 8], granturismo: [1, 0, 4, 0, 2, 10], templerun: [1, 0, 0, 0, 1, 10],
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
        entries12:["Completionist", "Read every game entry in the archive."],
        walker:   ["Player One", "Walked the map with the keyboard."],
        bits:     ["Data Miner", "Collected every data bit on a map."],
        builder:  ["Architect", "Placed 50 blocks in Build mode."],
        fog:      ["Fog Lifter", "Found every landmark in Explore mode."],
        survivor: ["Still Breathing", "Survived 5 days in Survive mode."],
        versus:   ["Versus Mode", "Compared two games."],
        search:   ["Seeker", "Used archive search."],
        konami:   ["Old School", "Entered the secret code."],
        solve:    ["Signal Restored", "Solved a circuit in Solve mode."],
        jump:     ["Airborne", "Scored 500 in Jump mode."],
        fight:    ["Champion", "Beat the Archive Sentinel in Fight mode."],
        run:      ["Afterburner", "Lasted 30 seconds in Run mode."],
        time:     ["Time Traveller", "Scrubbed through all of gaming history."],
        world:    ["World Mapper", "Visited all 7 paths on the World Map."],
        boss:     ["Grand Archivist", "Defeated the Archive Guardian in the Final Archive."]
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
        '<div class="fx-hud-prog"><span class="fx-hud-label">ARCHIVE // </span><b id="fxLv">LV 1</b> · <span id="fxRead">00/26</span> ENTRIES<div class="fx-hud-bar"><i id="fxBar"></i></div></div>' +
        '<button type="button" id="fxSearchBtn" aria-label="Search the archive (press /)">/ SEARCH</button>' +
        '<button type="button" id="fxTrophyBtn" aria-label="Achievements">★ <span class="fx-count" id="fxAchCount">0</span></button>' +
        '<button type="button" id="fxWorldBtn" aria-label="Open the World Map (press M)">⌖ WORLD</button>' +
        '<button type="button" id="fxSoundBtn" aria-pressed="false" aria-label="Toggle sound">SND OFF</button>';
    document.body.appendChild(hud);
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function renderHud() {
        var read = S.pages.filter(function (p) { return PAGES[p]; }).length;
        $("#fxLv").textContent = "LV " + (Math.floor(S.xp / 100) + 1);
        $("#fxRead").textContent = pad(read) + "/" + TOTAL;
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
        if (window.fxUpdateBoss) window.fxUpdateBoss();
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
        if (readCount >= TOTAL) unlock("entries12");
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
    var stopMini = null;
    function endMini() { if (stopMini) { stopMini(); stopMini = null; } }
    function openModal(crumb, html) {
        endMini();
        if (modal.hidden) lastFocus = document.activeElement;
        $("#fxModalCrumb").textContent = crumb; mBody.innerHTML = html;
        modal.hidden = false; mCard.scrollTop = 0;
        mCard.style.animation = "none"; void mCard.offsetWidth; mCard.style.animation = "";
        mCard.focus(); sfx.open();
        setTimeout(function () { $$(".fx-bar i[data-w]", mBody).forEach(function (b) { b.style.width = b.dataset.w + "%"; }); }, 60);
    }
    function closeModal() { if (modal.hidden) return; endMini(); modal.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
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
            '<div class="fx-modal-body">' + (MINI[id] ? '<p class="fx-sub">// PLAY THE MECHANIC: ' + p.name + '</p><div class="fx-mini" id="fxMini"></div>' : "") + body + actions + "</div>");
        if (MINI[id]) stopMini = MINI[id]($("#fxMini"));
        var node = $(".node-" + id); if (node) node.classList.remove("fx-unvisited"), node.classList.add("fx-visited");
    }
    function openFile(k, from) {
        var g = FILES[k];
        S.files = S.files || []; if (S.files.indexOf(k) < 0) { S.files.push(k); save(); }
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
    Object.keys(PAGES).forEach(function (k) { index.push({ l: PAGES[k].t, s: PAGES[k].g.toUpperCase() + " // " + PAGES[k].y, h: k + ".html", x: FILES[k] ? FILES[k].dev : "" }); });
    Object.keys(GENRE_PAGES).forEach(function (k) { index.push({ l: GENRE_PAGES[k].t, s: "GENRE", h: k + ".html" }); });
    Object.keys(OTHER_PAGES).forEach(function (k) { index.push({ l: OTHER_PAGES[k], s: "PAGE", h: k + ".html" }); });
    Object.keys(PATHS).forEach(function (k) { index.push({ l: PATHS[k].name + " path", s: "PATH // " + PATHS[k].n, path: k }); });
    Object.keys(FILES).forEach(function (k) { if (PAGES[k]) return; index.push({ l: FILES[k].t, s: FILES[k].g.toUpperCase() + " // " + FILES[k].y, file: k, x: FILES[k].dev }); });
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
        if (r.h) navigate(r.h); else if (r.path) openPath(r.path); else if (r.world) window.fxOpenWorld(); else if (r.boss) window.fxOpenBoss(); else openFile(r.file);
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
        if (href === "#" && a.classList.contains("fx-final")) { e.preventDefault(); var cf = center(a.querySelector(".node-dot") || a); sparks(cf[0], cf[1], 14); window.fxOpenBoss(); return; }
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
        // time-based, so it always finishes on schedule even if the browser slows timers in a background tab
        var DUR = 650, t0 = Date.now(), done = false;
        function finish() { if (done) return; done = true; nodes.forEach(function (o) { o.n.nodeValue = o.t; }); }
        (function step() {
            if (done) return;
            var p = (Date.now() - t0) / DUR;
            if (p >= 1) return finish();
            nodes.forEach(function (o) {
                var keep = Math.floor(p * o.t.length);
                o.n.nodeValue = o.t.split("").map(function (ch, i) { return i < keep || ch === " " || ch === "\n" ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }).join("");
            });
            setTimeout(step, 30);
        })();
        setTimeout(finish, DUR + 50);
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

    /* the 8th node (boss) joins the main map before the map code runs */
    (function () {
        var mm = $(".mechanic-map"); if (!mm) return;
        var node = el("a", "mechanic-node node-final fx-final", '<span class="node-number">08</span><span class="node-dot"></span><strong>FINAL ARCHIVE</strong><span class="node-description" id="fxFinalDesc"></span><span class="node-enter" id="fxFinalEnter"></span>');
        node.href = "#"; node.setAttribute("aria-label", "Final Archive boss node");
        mm.appendChild(node);
    })();

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
            if (isMain) { key = (n.className.match(/node-(\w+)/) || [])[1]; icon = key === "final" ? "trophy" : key; done = key === "final" ? !!S.bossWins : S.paths.indexOf(key) >= 0; }
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
            if (!playing || !modal.hidden || !srch.hidden || worldOpen) return;
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
        var icon = info.game;
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
        var titles = { build: ["BUILD", "PLACE BLOCKS. MAKE SOMETHING."], explore: ["EXPLORE", "LIFT THE FOG. FIND THE LANDMARKS."], survive: ["SURVIVE", "LAST THE NIGHT."],
            solve: ["SOLVE", "ROUTE THE SIGNAL."], jump: ["JUMP", "TIME EVERY LEAP."], fight: ["FIGHT", "READ YOUR RIVAL."], run: ["RUN", "NEVER STOP."] };
        box.innerHTML = '<div class="fx-game-top"><h2><span>//</span> PLAY THE MECHANIC: ' + titles[gameType][0] + '</h2><span>INTERACTIVE DEMO // ' + titles[gameType][1] + '</span></div><div class="fx-game-body"></div>';
        var anchor = $(".game-page-navigation", host) || $(".related-section", host);
        if (anchor) anchor.parentNode.insertBefore(box, anchor); else host.appendChild(box);
        var gb = $(".fx-game-body", box);
        if (gameType === "build") buildGame(gb); else if (gameType === "explore") exploreGame(gb); else if (gameType === "survive") surviveGame(gb);
        else setTimeout(function () { MINI[gameType](gb); }, 0); // MINI is defined further down
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
       PATH MINI-GAMES (inside the path popups on the main map)
       Each takes a container and returns a stop() function.
       --------------------------------------------------------- */
    function best(key, v) {
        S.bests = S.bests || {};
        if (v != null && v > (S.bests[key] || 0)) { S.bests[key] = v; save(); }
        return S.bests[key] || 0;
    }
    function keyGuard(fn, root) {
        // only react while the popup is open and nothing is being typed
        return function (e) {
            if (!srch.hidden || worldOpen || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName || "")) return;
            if (root && !modal.contains(root)) { if (!root.contains(document.activeElement)) return; } // on a page: only while the game is focused
            else if (modal.hidden) return;
            fn(e);
        };
    }
    var MINI = {};

    /* SOLVE: rotate circuit tiles to route the signal across */
    MINI.solve = function (root) {
        var N = 6, tiles, sr, tr, moves, solved;
        var SHAPES = { I: [0, 2], L: [0, 1], T: [0, 1, 3] };
        root.innerHTML = '<p class="fx-mini-intro">Click tiles to rotate them. Route the blue signal from the left port to the right port.</p>' +
            '<div class="fx-stats"><div>MOVES<b id="fxMv">0</b></div><div>STATUS<b id="fxSt">OFFLINE</b></div><div>BEST (FEWEST)<b id="fxSb">—</b></div></div>' +
            '<div class="fx-pipes-wrap"><span class="fx-port in" id="fxIn">IN</span><div class="fx-pipes" id="fxPipes" role="grid" aria-label="Circuit puzzle"></div><span class="fx-port out" id="fxOut">OUT</span></div>' +
            '<div class="fx-tools"><button type="button" class="fx-btn blue" id="fxNewCircuit">NEW CIRCUIT</button></div>';
        var grid = $("#fxPipes", root);
        function open(t) { return SHAPES[t.s].map(function (d) { return (d + t.r) % 4; }); }
        function gen() {
            sr = (Math.random() * N) | 0; tr = (Math.random() * N) | 0;
            // random self-avoiding walk from the left column to the right column
            var path;
            for (var tries = 0; tries < 200 && !path; tries++) {
                var p = [[0, sr]], seen = {}; seen[0 + "," + sr] = 1;
                while (p.length < 60) {
                    var c = p[p.length - 1];
                    if (c[0] === N - 1 && c[1] === tr) { path = p; break; }
                    var opts = [[1, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].map(function (d) { return [c[0] + d[0], c[1] + d[1]]; })
                        .filter(function (n) { return n[0] >= 0 && n[1] >= 0 && n[0] < N && n[1] < N && !seen[n[0] + "," + n[1]]; });
                    if (!opts.length) break;
                    var nx = opts[(Math.random() * opts.length) | 0]; seen[nx[0] + "," + nx[1]] = 1; p.push(nx);
                }
            }
            if (!path) { // fallback: straight across, then down/up to the exit row
                path = []; for (var fx = 0; fx < N; fx++) path.push([fx, sr]);
                for (var fy = sr; fy !== tr;) { fy += tr > sr ? 1 : -1; path.push([N - 1, fy]); }
            }
            tiles = [];
            for (var i = 0; i < N * N; i++) tiles.push({ s: ["I", "L", "T"][(Math.random() * 3) | 0], r: 0 });
            path.forEach(function (c, i) {
                var dirs = [];
                var prev = i === 0 ? [c[0] - 1, c[1]] : path[i - 1], next = i === path.length - 1 ? [c[0] + 1, c[1]] : path[i + 1];
                [prev, next].forEach(function (o) { var dx = o[0] - c[0], dy = o[1] - c[1]; dirs.push(dy === -1 ? 0 : dx === 1 ? 1 : dy === 1 ? 2 : 3); });
                tiles[c[1] * N + c[0]] = { s: (dirs[0] + 2) % 4 === dirs[1] ? "I" : "L", r: 0 };
            });
            tiles.forEach(function (t) { t.r = (Math.random() * 4) | 0; });
            moves = 0; solved = false;
            $("#fxIn", root).style.top = (sr + 0.5) / N * 100 + "%"; $("#fxOut", root).style.top = (tr + 0.5) / N * 100 + "%";
            render();
        }
        function lit() {
            var on = {}, q = [];
            if (open(tiles[sr * N]).indexOf(3) >= 0) { on[sr * N] = 1; q.push([0, sr]); }
            while (q.length) {
                var c = q.shift();
                open(tiles[c[1] * N + c[0]]).forEach(function (d) {
                    var n = [c[0] + [0, 1, 0, -1][d], c[1] + [-1, 0, 1, 0][d]];
                    if (n[0] < 0 || n[1] < 0 || n[0] >= N || n[1] >= N) return;
                    var k = n[1] * N + n[0];
                    if (!on[k] && open(tiles[k]).indexOf((d + 2) % 4) >= 0) { on[k] = 1; q.push(n); }
                });
            }
            return on;
        }
        function svg(t, on) {
            var c = on ? "#0084ff" : "#222222", w = on ? 7 : 5;
            var ends = { 0: "25,0", 1: "50,25", 2: "25,50", 3: "0,25" };
            return '<svg viewBox="0 0 50 50" aria-hidden="true">' + open(t).map(function (d) { return '<polyline points="25,25 ' + ends[d] + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="square"/>'; }).join("") +
                '<rect x="20" y="20" width="10" height="10" fill="' + (on ? "#0084ff" : "#ffffff") + '" stroke="' + c + '" stroke-width="2"/></svg>';
        }
        function render() {
            var on = lit(), end = tr * N + N - 1;
            solved = !!on[end] && open(tiles[end]).indexOf(1) >= 0;
            grid.innerHTML = tiles.map(function (t, i) { return '<button type="button" class="fx-pipe' + (on[i] ? " on" : "") + '" data-i="' + i + '" aria-label="Tile ' + (i % N + 1) + "," + ((i / N | 0) + 1) + '">' + svg(t, on[i]) + "</button>"; }).join("");
            $("#fxMv", root).textContent = moves;
            $("#fxSt", root).textContent = solved ? "ONLINE ✓" : "OFFLINE";
            $("#fxOut", root).classList.toggle("on", solved);
            var b = S.bests && S.bests.solveFew; $("#fxSb", root).textContent = b ? b : "—";
            if (solved) {
                grid.classList.add("solved"); sfx.win(); unlock("solve");
                if (!b || moves < b) { S.bests = S.bests || {}; S.bests.solveFew = moves; save(); $("#fxSb", root).textContent = moves; }
                var c = center(grid); sparks(c[0], c[1], 24);
            } else grid.classList.remove("solved");
        }
        grid.addEventListener("click", function (e) {
            var b = e.target.closest("[data-i]"); if (!b || solved) return;
            tiles[+b.dataset.i].r = (tiles[+b.dataset.i].r + 1) % 4; moves++; sfx.tick(); render();
            var nb = grid.querySelector('[data-i="' + b.dataset.i + '"]'); if (nb) nb.focus();
        });
        $("#fxNewCircuit", root).addEventListener("click", function () { gen(); sfx.open(); });
        gen();
        return function () {};
    };

    /* shared canvas loop helper for the action games */
    function arcade(root, opts) {
        root.innerHTML = '<p class="fx-mini-intro">' + opts.intro + '</p>' +
            '<div class="fx-stats"><div>SCORE<b class="fx-sc">0</b></div><div>BEST<b class="fx-bs">' + best(opts.key) + '</b></div><div>STATUS<b class="fx-ss">READY</b></div></div>' +
            '<div class="fx-canvas-wrap fx-arcade" tabindex="0"><canvas width="640" height="220" aria-label="' + opts.label + '"></canvas><div class="fx-overlay">' + opts.start + "</div></div>";
        var cv = $("canvas", root), ctx = cv.getContext("2d"), ov = $(".fx-overlay", root), raf = 0, state = "ready", g = {};
        function setStatus(t) { $(".fx-ss", root).textContent = t; }
        function begin() { g = opts.init(); state = "play"; ov.style.display = "none"; setStatus("PLAYING"); sfx.open(); last = performance.now(); loop(last); }
        function over() {
            state = "over"; cancelAnimationFrame(raf); sfx.bad();
            var sc = Math.floor(g.score), b = best(opts.key, sc);
            $(".fx-bs", root).textContent = b; setStatus("GAME OVER");
            ov.innerHTML = "GAME OVER // SCORE " + sc + "<br><small>" + opts.again + "</small>"; ov.style.display = "flex";
            if (opts.win && opts.win(g)) unlock(opts.ach);
        }
        var last = 0;
        function loop(t) {
            var dt = Math.min(2.5, (t - last) / 16.67); last = t;
            if (opts.step(g, dt) === false) { opts.draw(ctx, g); over(); return; }
            opts.draw(ctx, g);
            $(".fx-sc", root).textContent = Math.floor(g.score);
            raf = requestAnimationFrame(loop);
        }
        function press(kind) { if (state !== "play") { begin(); return; } opts.input(g, kind); }
        var onKey = keyGuard(function (e) {
            var k = opts.keys[e.key]; if (!k) return;
            e.preventDefault(); press(k);
        }, root);
        addEventListener("keydown", onKey);
        var wrapEl = $(".fx-arcade", root);
        cv.addEventListener("pointerdown", function (e) { wrapEl.focus({ preventScroll: true }); var r = cv.getBoundingClientRect(); press(opts.tap ? opts.tap((e.clientY - r.top) / r.height) : "act"); });
        ov.addEventListener("pointerdown", function () { wrapEl.focus({ preventScroll: true }); press("act"); });
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 640, 220); opts.draw(ctx, opts.init());
        return function () { cancelAnimationFrame(raf); removeEventListener("keydown", onKey); };
    }
    function gridBg(ctx, off) {
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 640, 220);
        ctx.strokeStyle = "#eeeeee"; ctx.lineWidth = 1;
        for (var x = -((off || 0) % 25); x < 640; x += 25) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, 220); ctx.stroke(); }
        for (var y = 0; y < 220; y += 25) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(640, y + .5); ctx.stroke(); }
    }

    /* JUMP: time your jumps over pillars and gaps */
    MINI.jump = function (root) {
        var GROUND = 170;
        return arcade(root, {
            key: "jump", ach: "jump", label: "Jump game",
            intro: "Your square runs on its own. Press SPACE, ↑ or tap to jump over black pillars and gaps in the line. Hold for a higher jump.",
            start: "CLICK HERE, THEN PRESS SPACE / TAP TO START", again: "PRESS SPACE / TAP TO RETRY",
            keys: { " ": "act", ArrowUp: "act", w: "act", W: "act" },
            win: function (g) { return g.score >= 500; },
            init: function () { return { x: 0, y: GROUND, vy: 0, on: true, speed: 4.2, obs: [], score: 0, nextAt: 520, hold: 0 }; },
            input: function (g) { if (g.on) { g.vy = -9.6; g.on = false; g.hold = 10; sfx.step(); } },
            step: function (g, dt) {
                g.x += g.speed * dt; g.speed = Math.min(9, g.speed + 0.0016 * dt); g.score = g.x / 10;
                if (g.hold > 0) { g.hold -= dt; g.vy -= 0.25 * dt; }
                g.vy += 0.62 * dt; g.y += g.vy * dt;
                var px = g.x + 80;
                var overGap = g.obs.some(function (o) { return o.t === "gap" && px + 12 > o.x + 4 && px + 2 < o.x + o.w - 4; });
                if (g.y >= GROUND && !overGap) { g.y = GROUND; g.vy = 0; g.on = true; }
                if (g.y > 230) return false;
                if (g.x + 640 > g.nextAt) {
                    var t = Math.random() < 0.55 ? "pillar" : "gap";
                    g.obs.push(t === "pillar" ? { t: t, x: g.nextAt, w: 18 + Math.random() * 10, h: 22 + Math.random() * 34 } : { t: t, x: g.nextAt, w: 44 + Math.random() * 36 });
                    g.nextAt += 210 + Math.random() * 190 + g.speed * 10;
                }
                g.obs = g.obs.filter(function (o) { return o.x + o.w > g.x - 50; });
                for (var i = 0; i < g.obs.length; i++) {
                    var o = g.obs[i];
                    if (o.t === "pillar" && px + 14 > o.x && px < o.x + o.w && g.y > GROUND - o.h) return false;
                }
            },
            draw: function (ctx, g) {
                gridBg(ctx, g.x);
                ctx.fillStyle = "#222222";
                var gaps = g.obs.filter(function (o) { return o.t === "gap"; }).sort(function (a, b) { return a.x - b.x; }), sx = 0;
                gaps.forEach(function (o) { var gx = o.x - g.x; if (gx > sx) ctx.fillRect(sx, GROUND + 14, gx - sx, 3); sx = Math.max(sx, gx + o.w); });
                if (sx < 640) ctx.fillRect(sx, GROUND + 14, 640 - sx, 3);
                g.obs.forEach(function (o) { if (o.t === "pillar") { ctx.fillStyle = "#222222"; ctx.fillRect(o.x - g.x, GROUND + 14 - o.h, o.w, o.h); } });
                ctx.fillStyle = "#0084ff"; ctx.fillRect(80, g.y, 14, 14);
                ctx.fillStyle = "rgba(0,132,255,.15)"; ctx.fillRect(76, g.y - 4, 22, 22);
                ctx.fillStyle = "#777777"; ctx.font = "10px Consolas, monospace"; ctx.fillText("DIST // " + Math.floor(g.score), 10, 18);
            }
        });
    };

    /* RUN: switch lanes to dodge walls, grab data bits */
    MINI.run = function (root) {
        var LANES = [45, 110, 175];
        return arcade(root, {
            key: "run", ach: "run", label: "Run game",
            intro: "Three lanes, no brakes. Use ↑ / ↓ (or W / S, or tap the top or bottom half) to switch lanes. Dodge the walls and grab blue bits for bonus points. Last 30 seconds for an achievement.",
            start: "CLICK HERE, THEN PRESS ↑ / ↓ OR TAP TO START", again: "PRESS ↑ / ↓ OR TAP TO RETRY",
            keys: { ArrowUp: "up", ArrowDown: "down", w: "up", s: "down", W: "up", S: "down", " ": "act" },
            tap: function (fy) { return fy < 0.5 ? "up" : "down"; },
            win: function (g) { return g.time >= 30; },
            init: function () { return { lane: 1, y: LANES[1], speed: 5, walls: [], bits: [], score: 0, time: 0, next: 60, off: 0 }; },
            input: function (g, k) { if (k === "up" && g.lane > 0) g.lane--; if (k === "down" && g.lane < 2) g.lane++; sfx.step(); },
            step: function (g, dt) {
                g.time += dt / 60; g.off += g.speed * dt; g.speed = Math.min(12, 5 + g.time * 0.18);
                g.score = g.time * 10 + (g.bonus || 0);
                g.y += (LANES[g.lane] - g.y) * Math.min(1, 0.35 * dt);
                g.next -= g.speed * dt;
                if (g.next <= 0) {
                    var free = (Math.random() * 3) | 0, lanes = [0, 1, 2].filter(function (l) { return l !== free && Math.random() < 0.75; });
                    if (!lanes.length) lanes = [(free + 1) % 3];
                    lanes.forEach(function (l) { g.walls.push({ x: 660, l: l }); });
                    if (Math.random() < 0.6) g.bits.push({ x: 700, l: free });
                    g.next = 170 + Math.random() * 120;
                }
                g.walls.forEach(function (w) { w.x -= g.speed * dt; });
                g.bits.forEach(function (b) { b.x -= g.speed * dt; });
                g.walls = g.walls.filter(function (w) { return w.x > -30; });
                var hit = g.walls.some(function (w) { return w.x < 102 && w.x + 22 > 80 && Math.abs(LANES[w.l] - g.y) < 20; });
                if (hit) return false;
                g.bits = g.bits.filter(function (b) {
                    if (b.x < 100 && b.x > 70 && Math.abs(LANES[b.l] - g.y) < 20) { g.bonus = (g.bonus || 0) + 25; sfx.bit(); return false; }
                    return b.x > -20;
                });
            },
            draw: function (ctx, g) {
                gridBg(ctx, g.off);
                ctx.strokeStyle = "#bdbdbd"; ctx.setLineDash([8, 8]);
                [77, 142].forEach(function (y) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(640, y + .5); ctx.stroke(); });
                ctx.setLineDash([]);
                ctx.fillStyle = "#222222"; g.walls.forEach(function (w) { ctx.fillRect(w.x, LANES[w.l] - 22, 22, 44); });
                g.bits.forEach(function (b) { ctx.save(); ctx.translate(b.x, LANES[b.l]); ctx.rotate(Math.PI / 4); ctx.strokeStyle = "#0084ff"; ctx.lineWidth = 2; ctx.strokeRect(-5, -5, 10, 10); ctx.restore(); });
                ctx.fillStyle = "rgba(0,132,255,.18)"; for (var i = 1; i < 5; i++) ctx.fillRect(84 - i * 10, g.y - 6, 6, 12);
                ctx.fillStyle = "#0084ff"; ctx.fillRect(84, g.y - 8, 16, 16);
                ctx.fillStyle = "#777777"; ctx.font = "10px Consolas, monospace"; ctx.fillText("TIME // " + g.time.toFixed(1) + "s", 10, 16);
            }
        });
    };

    /* FIGHT: read the Archive Sentinel (strike > feint > guard > strike) */
    MINI.fight = function (root) {
        var MOVES = ["STRIKE", "GUARD", "FEINT"], BEATS = { 0: 2, 1: 0, 2: 1 }; // strike beats feint, guard beats strike, feint beats guard
        root.innerHTML = '<p class="fx-mini-intro">A duel of reads. <b>STRIKE</b> beats FEINT, <b>GUARD</b> beats STRIKE, <b>FEINT</b> beats GUARD. The Sentinel learns your habits, so mix it up. Keys 1 / 2 / 3.</p>' +
            '<div class="fx-arena"><div class="fx-fighter p"><span class="fx-tag">P1 // YOU</span><div class="fx-hp" id="fxHpP"></div><div class="fx-body blue"></div><b id="fxMvP">—</b></div>' +
            '<div class="fx-vs">VS</div>' +
            '<div class="fx-fighter e"><span class="fx-tag">ARCHIVE SENTINEL</span><div class="fx-hp" id="fxHpE"></div><div class="fx-body"></div><b id="fxMvE">—</b></div></div>' +
            '<div class="fx-tools fx-moves"><button type="button" class="fx-btn" data-m="0">[1] STRIKE</button><button type="button" class="fx-btn" data-m="1">[2] GUARD</button><button type="button" class="fx-btn" data-m="2">[3] FEINT</button><button type="button" class="fx-btn blue" id="fxRematch">REMATCH</button></div>' +
            '<div class="fx-log" id="fxFLog" aria-live="polite"></div>';
        var hp, ehp, hist, done, wins = best("fightWins");
        function hearts(n) { var h = ""; for (var i = 0; i < 5; i++) h += '<img class="px" src="assets/img/heart.png" alt="" style="opacity:' + (i < n ? 1 : 0.15) + '">'; return h; }
        function log(m) { var lg = $("#fxFLog", root); lg.insertBefore(el("p", "", m), lg.firstChild); }
        function render() { $("#fxHpP", root).innerHTML = hearts(hp); $("#fxHpE", root).innerHTML = hearts(ehp); $$("[data-m]", root).forEach(function (b) { b.disabled = done; }); }
        function reset() { hp = 5; ehp = 5; hist = [0, 0, 0]; done = false; $("#fxFLog", root).innerHTML = ""; log("ROUND 1 // The Sentinel waits. Wins so far: " + wins + "."); $("#fxMvP", root).textContent = "—"; $("#fxMvE", root).textContent = "—"; render(); }
        function shake(sel) { var b = $(sel + " .fx-body", root); b.classList.remove("hit"); void b.offsetWidth; b.classList.add("hit"); }
        function play(m) {
            if (done) return;
            // Sentinel predicts your most-used move and counters it 60% of the time
            var fav = hist.indexOf(Math.max.apply(null, hist)), counter = +Object.keys(BEATS).filter(function (k) { return BEATS[k] === fav; })[0];
            var e = hist[0] + hist[1] + hist[2] > 1 && Math.random() < 0.6 ? counter : (Math.random() * 3) | 0;
            hist[m]++;
            $("#fxMvP", root).textContent = MOVES[m]; $("#fxMvE", root).textContent = MOVES[e];
            if (m === e) { log(MOVES[m] + " vs " + MOVES[e] + " // Clash. No damage."); sfx.tick(); }
            else if (BEATS[m] === e) { ehp--; log(MOVES[m] + " beats " + MOVES[e] + " // You land a hit."); sfx.bit(); shake(".e"); }
            else { hp--; log(MOVES[e] + " beats " + MOVES[m] + " // The Sentinel read you."); sfx.bad(); shake(".p"); }
            if (ehp <= 0) { done = true; wins = best("fightWins", wins + 1); log("K.O. // You win! Total wins: " + wins + "."); unlock("fight"); sfx.win(); var c = center($(".fx-fighter.e", root)); sparks(c[0], c[1], 30); }
            else if (hp <= 0) { done = true; log("DEFEAT // The Sentinel stands. Press REMATCH."); }
            render();
        }
        root.addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (b) play(+b.dataset.m); if (e.target.id === "fxRematch") { reset(); sfx.open(); } });
        var onKey = keyGuard(function (e) { var i = ["1", "2", "3"].indexOf(e.key); if (i >= 0) { e.preventDefault(); play(i); } }, root);
        addEventListener("keydown", onKey);
        reset();
        return function () { removeEventListener("keydown", onKey); };
    };

    /* ---------------------------------------------------------
       HISTORY SCRUBBER (main page): drag through 1952 → today
       --------------------------------------------------------- */
    var archiveSec = $(".featured-archive");
    if (archiveSec) {
        var FIRST = { run: 1980, solve: 1984, jump: 1985, build: 1989, fight: 1991, survive: 1996, explore: 1998 };
        var ERAS = [[1952, "LAB EXPERIMENTS"], [1970, "THE ARCADE AGE"], [1983, "HOME CONSOLES"], [1993, "THE 3D LEAP"], [2001, "OPEN WORLDS"], [2008, "INDIE + SANDBOX"]];
        var EV = [
            { y: 1952, t: "OXO", s: "A. S. DOUGLAS", h: "figures.html" }, { y: 1958, t: "Tennis for Two", s: "W. HIGINBOTHAM", h: "figures.html" },
            { y: 1962, t: "Spacewar!", s: "STEVE RUSSELL", h: "figures.html" }, { y: 1972, t: "Magnavox Odyssey", s: "RALPH BAER", h: "figures.html" },
            { y: 1972, t: "Pong / Atari", s: "NOLAN BUSHNELL", h: "figures.html" }
        ];
        Object.keys(PAGES).forEach(function (k) { EV.push({ y: PAGES[k].y, t: PAGES[k].t, s: PAGES[k].g.toUpperCase(), h: k + ".html" }); });
        Object.keys(FILES).forEach(function (k) { if (PAGES[k]) return; EV.push({ y: FILES[k].y, t: FILES[k].t, s: FILES[k].g.toUpperCase(), file: k }); });
        EV.sort(function (a, b) { return a.y - b.y; });
        var MIN = 1952, MAX = 2018;
        var ts = el("section", "fx-scrub");
        ts.innerHTML = '<div class="home-section-label"><span>// TRAVEL THROUGH TIME</span><span>004</span></div>' +
            '<div class="fx-scrub-head"><div><span class="fx-label">YEAR // ERA</span><div class="fx-year" id="fxYear">' + MAX + '</div><div class="fx-era" id="fxEra"></div></div>' +
            '<div class="fx-scrub-side"><p>Drag the slider or press play to watch the archive fill up. Paths come online when their first archived game arrives, and the main map above follows along.</p><div class="fx-paths" id="fxPaths"></div></div></div>' +
            '<div class="fx-track" id="fxTrack"></div>' +
            '<div class="fx-slider"><button type="button" class="fx-btn blue" id="fxPlayYears">▶ PLAY HISTORY</button><input type="range" id="fxRange" min="' + MIN + '" max="' + MAX + '" value="' + MAX + '" aria-label="Year"><span id="fxCount"></span></div>' +
            '<p class="fx-sub">// ARRIVED MOST RECENTLY</p><div class="fx-entries" id="fxRecent"></div>';
        archiveSec.parentNode.insertBefore(ts, archiveSec.nextSibling);
        var track = $("#fxTrack"), range = $("#fxRange"), seenMin = MAX, seenMax = MAX;
        var pos = function (y) { return 1.5 + (y - MIN) / (MAX - MIN) * 97; }; // keep edge markers inside the box
        var stacks = {};
        track.innerHTML = '<div class="fx-track-line"></div>' + [1960, 1970, 1980, 1990, 2000, 2010].map(function (d) { return '<span class="fx-tick" style="left:' + pos(d) + '%">' + d + "</span>"; }).join("") +
            EV.map(function (e, i) { var n = stacks[e.y] = (stacks[e.y] || 0) + 1; return '<button type="button" class="fx-ev" data-ev="' + i + '" style="left:' + pos(e.y) + "%;bottom:" + (22 + (n - 1) * 15) + 'px" title="' + e.y + " // " + e.t + '" aria-label="' + e.y + ", " + e.t + '"></button>'; }).join("");
        $("#fxPaths").innerHTML = Object.keys(PATHS).map(function (k) { return '<span class="fx-pchip" data-p="' + k + '"><img class="px" src="assets/img/' + k + '.png" alt="">' + PATHS[k].name + "<small>" + FIRST[k] + "</small></span>"; }).join("");
        function openEv(e) { if (e.h) navigate(e.h); else openFile(e.file); }
        function setYear(y, quiet) {
            y = +y; $("#fxYear").textContent = y === MAX ? y + "+" : y;
            var era = ERAS.filter(function (e) { return e[0] <= y; }).pop(); $("#fxEra").textContent = era ? era[1] : "";
            var live = EV.filter(function (e) { return e.y <= y; });
            $$(".fx-ev", track).forEach(function (b) { b.classList.toggle("on", EV[+b.dataset.ev].y <= y); });
            $("#fxCount").textContent = pad(live.length) + "/" + EV.length + " IN THE ARCHIVE";
            $$(".fx-pchip").forEach(function (c) { c.classList.toggle("on", FIRST[c.dataset.p] <= y); });
            $$(".mechanic-node").forEach(function (n) {
                var id = (n.className.match(/node-(\w+)/) || [])[1];
                n.classList.toggle("fx-future", FIRST[id] > y);
            });
            $("#fxRecent").innerHTML = live.slice(-4).reverse().map(function (e, i) {
                return '<button type="button" class="fx-entry" data-ev="' + EV.indexOf(e) + '" style="animation-delay:' + i * 0.04 + 's"><small><span>' + e.s + "</span><span>" + e.y + "</span></small><b>" + e.t + "</b><em>OPEN →</em></button>";
            }).join("") || '<p class="muted">Nothing yet. Keep going.</p>';
            if (!quiet) { seenMin = Math.min(seenMin, y); seenMax = Math.max(seenMax, y); if (seenMin <= 1960 && seenMax >= MAX && y === MAX) unlock("time"); }
        }
        range.addEventListener("input", function () { setYear(range.value); sfx.tick(); });
        ts.addEventListener("click", function (e) { var b = e.target.closest("[data-ev]"); if (b) openEv(EV[+b.dataset.ev]); });
        var playing = 0;
        $("#fxPlayYears").addEventListener("click", function () {
            var btn = this;
            if (playing) { clearInterval(playing); playing = 0; btn.textContent = "▶ PLAY HISTORY"; return; }
            var y = +range.value >= MAX ? MIN : +range.value;
            btn.textContent = "■ PAUSE";
            playing = setInterval(function () {
                range.value = y; setYear(y);
                if (EV.some(function (e) { return e.y === y; })) sfx.tick();
                if (++y > MAX) { clearInterval(playing); playing = 0; btn.textContent = "▶ PLAY HISTORY"; }
            }, reduced ? 20 : 140);
        });
        setYear(MAX, true);
    }

    /* ---------------------------------------------------------
       WORLD MAP: one zoomable grid holding every path, genre
       and game. Drag to pan, scroll / pinch / +- to zoom.
       --------------------------------------------------------- */
    var worldOpen = false;
    (function () {
        var WG = {
            explore: [["Adventure", "adventure.html", ["zelda", "uncharted2", "lifeisstrange"]], ["Open World", "openworld.html", ["gta3", "skyrim", "breathofthewild"]]],
            solve:   [["Puzzle", null, ["tetris", "myst", "portal"]]],
            jump:    [["Platformer", null, ["smb", "sonic", "celeste"]]],
            build:   [["Sandbox", "genre.html", ["minecraft", "terraria", "gta5"]], ["Management", null, ["simcity", "rct"]]],
            fight:   [["Fighting", null, ["sf2"]], ["Shooter", null, ["doom"]], ["Action RPG", null, ["darksouls"]]],
            run:     [["Maze Chase", null, ["pacman"]], ["Racing", null, ["granturismo"]], ["Endless Runner", null, ["templerun"]]],
            survive: [["Survival", "survival.html", ["residentevil", "dontstarve", "subnautica"]]]
        };
        var SIZE = 2800, C = SIZE / 2, nodes = [], links = [];
        var pathIds = Object.keys(PATHS);
        pathIds.forEach(function (pid, i) {
            var a = -Math.PI / 2 + i / pathIds.length * Math.PI * 2;
            var px = C + Math.cos(a) * 620, py = C + Math.sin(a) * 620;
            var pn = { id: "p-" + pid, kind: "path", pid: pid, x: px, y: py, a: a, label: PATHS[pid].name, sub: "PATH " + PATHS[pid].n + " // " + PATHS[pid].tag.toUpperCase(), text: PATHS[pid].text };
            nodes.push(pn); links.push([{ x: C, y: C }, pn]);
            var gs = WG[pid];
            gs.forEach(function (g, j) {
                var ga = a + (gs.length === 1 ? 0 : (j / (gs.length - 1) - 0.5) * 0.95);
                var gx = px + Math.cos(ga) * 330, gy = py + Math.sin(ga) * 330;
                var gn = { id: "g-" + pid + j, kind: "genre", pid: pid, x: gx, y: gy, label: g[0], href: g[1], sub: "GENRE // " + g[2].length + " GAME" + (g[2].length > 1 ? "S" : ""), kids: g[2] };
                nodes.push(gn); links.push([pn, gn]);
                g[2].forEach(function (k, m) {
                    var ka = ga + (g[2].length === 1 ? 0 : (m / (g[2].length - 1) - 0.5) * 1.5);
                    var info = PAGES[k] || FILES[k];
                    var kn = { id: "k-" + k, kind: "game", pid: pid, key: k, x: gx + Math.cos(ka) * 175, y: gy + Math.sin(ka) * 175, label: info.t, sub: info.y + " // " + (PAGES[k] ? "ARCHIVE ENTRY" : "ARCHIVE FILE"), year: info.y, page: !!PAGES[k] };
                    nodes.push(kn); links.push([gn, kn]);
                });
            });
        });

        var ov = el("div", "fx-world");
        ov.hidden = true;
        ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "World map");
        ov.innerHTML =
            '<div class="fx-w-top"><span><b>WORLD MAP</b> // DRAG TO PAN · SCROLL OR PINCH TO ZOOM · CLICK A NODE</span><span id="fxWDisc"></span><button type="button" class="fx-close" data-w="close">CLOSE [ESC]</button></div>' +
            '<div class="fx-w-view" id="fxWView" tabindex="0"><div class="fx-w-plane" id="fxWPlane" style="width:' + SIZE + "px;height:" + SIZE + 'px">' +
            '<svg class="fx-w-links" width="' + SIZE + '" height="' + SIZE + '" aria-hidden="true">' +
            [300, 620, 950, 1180].map(function (r) { return '<circle cx="' + C + '" cy="' + C + '" r="' + r + '" fill="none" stroke="#e2e2e2" stroke-dasharray="4 8"/>'; }).join("") +
            links.map(function (l) { return '<line data-to="' + l[1].id + '" data-pid="' + l[1].pid + '" x1="' + l[0].x + '" y1="' + l[0].y + '" x2="' + l[1].x + '" y2="' + l[1].y + '"/>'; }).join("") + "</svg>" +
            '<div class="fx-w-core" style="left:' + C + "px;top:" + C + 'px"><span>GAMING</span><span>HISTORY</span><small>1952 — PRESENT</small></div>' +
            nodes.map(function (n) {
                return '<button type="button" class="fx-wn ' + n.kind + '" data-id="' + n.id + '" style="left:' + n.x + "px;top:" + n.y + 'px" aria-label="' + n.label + '">' +
                    (n.kind === "path" ? '<img class="px" src="assets/img/' + n.pid + '.png" alt="">' : '<i class="fx-wdot"></i>') +
                    '<span class="fx-wl"><b>' + n.label + "</b><small>" + n.sub + "</small></span></button>";
            }).join("") + "</div></div>" +
            '<div class="fx-w-zoom"><button type="button" data-w="in" aria-label="Zoom in">+</button><button type="button" data-w="out" aria-label="Zoom out">−</button><button type="button" data-w="fit" aria-label="Show everything">⌂</button></div>' +
            '<div class="fx-w-mini"><canvas id="fxWMini" width="150" height="150" aria-label="Minimap"></canvas><span id="fxWZoom">ZOOM // 100%</span></div>' +
            '<div class="fx-w-info" id="fxWInfo"></div>';
        document.body.appendChild(ov);

        var view = $("#fxWView"), plane = $("#fxWPlane"), info = $("#fxWInfo"), mini = $("#fxWMini"), mctx = mini.getContext("2d");
        var tx = 0, ty = 0, k = 1, anim = 0, selected = null;
        var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });

        function seen(n) {
            if (n.kind === "path") return S.paths.indexOf(n.pid) >= 0;
            if (n.kind === "genre") return n.href ? S.pages.indexOf(n.href.replace(".html", "")) >= 0 : n.kids.some(function (kk) { return (S.files || []).indexOf(kk) >= 0; });
            return n.page ? S.pages.indexOf(n.key) >= 0 : (S.files || []).indexOf(n.key) >= 0;
        }
        function refreshSeen() {
            $$(".fx-wn", plane).forEach(function (b) { b.classList.toggle("seen", seen(byId[b.dataset.id])); });
            var games = nodes.filter(function (n) { return n.kind === "game"; });
            $("#fxWDisc").textContent = "DISCOVERED // " + pad(games.filter(seen).length) + "/" + games.length + " GAMES";
            if (window.fxUpdateBoss) window.fxUpdateBoss();
        }
        function apply() {
            plane.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")";
            plane.style.setProperty("--lp", Math.max(1, 0.55 / k));
            plane.style.setProperty("--lg", Math.max(1, 0.8 / k));
            plane.classList.toggle("z-genre", k >= 0.42);
            plane.classList.toggle("z-game", k >= 0.72);
            plane.classList.toggle("z-detail", k >= 1.5);
            $("#fxWZoom").textContent = "ZOOM // " + Math.round(k * 100) + "%";
            drawMini();
        }
        function clampK(v) { return Math.max(0.15, Math.min(3, v)); }
        function zoomAt(f, cx, cy) {
            var nk = clampK(k * f); f = nk / k;
            tx = cx - (cx - tx) * f; ty = cy - (cy - ty) * f; k = nk; apply();
        }
        function fitK() { return Math.min(view.clientWidth, view.clientHeight) / 2700; }
        function flyTo(x, y, nk, ms) {
            cancelAnimationFrame(anim);
            var vw = view.clientWidth, vh = view.clientHeight;
            var s0 = { x: tx, y: ty, k: k }, s1k = clampK(nk), s1 = { x: vw / 2 - x * s1k, y: vh / 2 - y * s1k, k: s1k };
            if (reduced || !ms) { tx = s1.x; ty = s1.y; k = s1.k; apply(); return; }
            var t0 = performance.now();
            (function step(t) {
                var p = Math.min(1, (t - t0) / ms), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                tx = s0.x + (s1.x - s0.x) * e; ty = s0.y + (s1.y - s0.y) * e; k = s0.k + (s1.k - s0.k) * e; apply();
                if (p < 1) anim = requestAnimationFrame(step);
            })(t0);
        }
        // centre between a node and the branch growing out of it
        function focusNode(n, ms) {
            var dx = n.x - C, dy = n.y - C, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
            if (n.kind === "path") flyTo(n.x + ux * 230, n.y + uy * 230, 0.8, ms);
            else if (n.kind === "genre") flyTo(n.x + ux * 80, n.y + uy * 80, 1.35, ms);
            else flyTo(n.x, n.y, Math.max(k, 1.7), ms);
        }
        function drawMini() {
            var s = 150 / SIZE;
            mctx.fillStyle = "#ffffff"; mctx.fillRect(0, 0, 150, 150);
            nodes.forEach(function (n) {
                mctx.fillStyle = n.kind === "path" ? "#0084ff" : seen(n) ? "#0084ff" : "#bbbbbb";
                var r = n.kind === "path" ? 3 : n.kind === "genre" ? 2 : 1.5;
                mctx.fillRect(n.x * s - r, n.y * s - r, r * 2, r * 2);
            });
            mctx.strokeStyle = "#222222"; mctx.lineWidth = 1.5;
            mctx.strokeRect(-tx / k * s, -ty / k * s, view.clientWidth / k * s, view.clientHeight / k * s);
        }
        mini.addEventListener("pointerdown", function (e) {
            var r = mini.getBoundingClientRect();
            flyTo((e.clientX - r.left) / r.width * SIZE, (e.clientY - r.top) / r.height * SIZE, k, 350);
        });

        function select(n) {
            selected = n;
            $$(".fx-wn.sel", plane).forEach(function (b) { b.classList.remove("sel"); });
            $$("line.hot", plane).forEach(function (l) { l.classList.remove("hot"); });
            if (!n) { info.innerHTML = '<span class="fx-label">// SELECT A NODE</span><p>Paths sit on the inner ring, genres branch outward, and games sit at the edge. Zoom in to read more.</p>'; return; }
            $('.fx-wn[data-id="' + n.id + '"]', plane).classList.add("sel");
            $$('line[data-pid="' + n.pid + '"]', plane).forEach(function (l) { l.classList.add("hot"); });
            var acts = "";
            if (n.kind === "path") {
                markPath(n.pid);
                S.worldPaths = S.worldPaths || []; if (S.worldPaths.indexOf(n.pid) < 0) { S.worldPaths.push(n.pid); save(); if (S.worldPaths.length >= 7) unlock("world"); }
                acts = '<button type="button" class="fx-btn blue" data-w="path">' + (MINI[n.pid] ? "▶ PLAY " + n.label : "OPEN PATH") + "</button>";
                if (PATHS[n.pid].page) acts += '<button type="button" class="fx-btn" data-w="go" data-href="' + PATHS[n.pid].page + '">FULL PATH PAGE →</button>';
            } else if (n.kind === "genre") {
                acts = n.href ? '<button type="button" class="fx-btn blue" data-w="go" data-href="' + n.href + '">OPEN GENRE PAGE →</button>' : "";
            } else {
                acts = n.page ? '<button type="button" class="fx-btn blue" data-w="go" data-href="' + n.key + '.html">VIEW ENTRY →</button>' : '<button type="button" class="fx-btn blue" data-w="file">OPEN FILE →</button>';
            }
            var desc = n.text || (n.kind === "genre" ? "Games: " + n.kids.map(function (kk) { return (PAGES[kk] || FILES[kk]).t; }).join(", ") + "." : (PAGES[n.key] ? PAGES[n.key].g + " // entry " + PAGES[n.key].e : FILES[n.key].s));
            info.innerHTML = '<span class="fx-label">' + n.kind.toUpperCase() + " // " + PATHS[n.pid].name + '</span><h3>' + n.label + "</h3><p>" + n.sub + "</p><p>" + desc + '</p><div class="fx-actions">' + acts + "</div>";
            refreshSeen(); sfx.tick();
        }
        info.addEventListener("click", function (e) {
            var b = e.target.closest("[data-w]"); if (!b || !selected) return;
            if (b.dataset.w === "go") { closeWorld(); navigate(b.dataset.href); }
            else if (b.dataset.w === "path") openPath(selected.pid);
            else if (b.dataset.w === "file") { openFile(selected.key, selected.pid); refreshSeen(); }
        });

        /* pan, zoom, click */
        var ptrs = {}, dragStart = null, moved = false, pinch = null;
        view.addEventListener("pointerdown", function (e) {
            view.setPointerCapture(e.pointerId);
            ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
            var ids = Object.keys(ptrs);
            if (ids.length === 1) { dragStart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty }; moved = false; cancelAnimationFrame(anim); }
            if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: k }; moved = true; }
        });
        view.addEventListener("pointermove", function (e) {
            if (!ptrs[e.pointerId]) return;
            ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
            var ids = Object.keys(ptrs), r = view.getBoundingClientRect();
            if (ids.length === 2 && pinch) {
                var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
                zoomAt(clampK(pinch.k * d / pinch.d) / k, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
            } else if (dragStart) {
                var dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
                if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
                if (moved) { tx = dragStart.tx + dx; ty = dragStart.ty + dy; apply(); view.classList.add("grabbing"); }
            }
        });
        function up(e) {
            delete ptrs[e.pointerId];
            if (Object.keys(ptrs).length < 2) pinch = null;
            if (!Object.keys(ptrs).length) {
                view.classList.remove("grabbing");
                if (!moved && dragStart) {
                    var hit = document.elementFromPoint(e.clientX, e.clientY), b = hit && hit.closest(".fx-wn");
                    if (b) {
                        var n = byId[b.dataset.id]; select(n);
                        focusNode(n, 600);
                    } else if (hit && hit.closest(".fx-w-core")) window.fxOpenBoss();
                    else select(null);
                }
                dragStart = null;
            }
        }
        view.addEventListener("pointerup", up);
        view.addEventListener("pointercancel", up);
        view.addEventListener("wheel", function (e) {
            e.preventDefault(); cancelAnimationFrame(anim);
            var r = view.getBoundingClientRect();
            zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
        }, { passive: false });
        ov.addEventListener("click", function (e) {
            var b = e.target.closest("[data-w]"); if (!b || info.contains(b)) return;
            var w = b.dataset.w, cx = view.clientWidth / 2, cy = view.clientHeight / 2;
            if (w === "close") closeWorld();
            else if (w === "in") zoomAt(1.4, cx, cy);
            else if (w === "out") zoomAt(1 / 1.4, cx, cy);
            else if (w === "fit") { select(null); flyTo(C, C, fitK(), 600); }
        });
        // keyboard: arrows pan, +/- zoom, Enter on focused node, Esc closes
        addEventListener("keydown", function (e) {
            if (!worldOpen || !modal.hidden || !srch.hidden) return;
            var cx = view.clientWidth / 2, cy = view.clientHeight / 2, P = 80;
            if (e.key === "Escape") { closeWorld(); return; }
            if (e.key === "+" || e.key === "=") { zoomAt(1.25, cx, cy); e.preventDefault(); }
            else if (e.key === "-" || e.key === "_") { zoomAt(0.8, cx, cy); e.preventDefault(); }
            else if (e.key === "ArrowLeft") { tx += P; apply(); e.preventDefault(); }
            else if (e.key === "ArrowRight") { tx -= P; apply(); e.preventDefault(); }
            else if (e.key === "ArrowUp") { ty += P; apply(); e.preventDefault(); }
            else if (e.key === "ArrowDown") { ty -= P; apply(); e.preventDefault(); }
            else if (e.key === "Enter" && document.activeElement && document.activeElement.classList.contains("fx-wn")) {
                var n = byId[document.activeElement.dataset.id]; select(n); focusNode(n, 500); e.preventDefault();
            }
        });
        addEventListener("resize", function () { if (worldOpen) apply(); });

        var prevOverflow = "";
        function openWorld() {
            if (worldOpen) return;
            worldOpen = true; ov.hidden = false; prevOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
            refreshSeen(); select(null);
            var fk = fitK(); tx = view.clientWidth / 2 - C * fk * 0.6; ty = view.clientHeight / 2 - C * fk * 0.6; k = fk * 0.6; apply();
            flyTo(C, C, fk, reduced ? 0 : 900);
            view.focus(); sfx.open();
        }
        function closeWorld() {
            if (!worldOpen) return;
            worldOpen = false; ov.hidden = true; document.body.style.overflow = prevOverflow; sfx.close && sfx.close();
            var b = $("#fxWorldBtn"); if (b) b.focus();
        }
        window.fxOpenWorld = openWorld;
        $("#fxWorldBtn").addEventListener("click", openWorld);
        addEventListener("keydown", function (e) {
            if (worldOpen || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName || "") || !modal.hidden || !srch.hidden) return;
            if ((e.key === "m" || e.key === "M") && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openWorld(); }
        });
        // a World Map button beside each map's Walk button
        $$(".fx-play-btn").forEach(function (pb) {
            var wb = el("button", "fx-play-btn fx-world-btn", "⌖ WORLD MAP"); wb.type = "button"; wb.title = "Zoomable map of every path, genre and game (M)";
            wb.addEventListener("click", function (e) { e.stopPropagation(); openWorld(); });
            pb.parentNode.insertBefore(wb, pb.nextSibling);
        });
        // searchable too
        index.push({ l: "World Map", s: "MODE // PRESS M", world: true });
    })();

    /* ---------------------------------------------------------
       THE FINAL ARCHIVE (boss): unlocks after all 7 paths.
       Every right answer damages the Archive Guardian.
       Questions favour the entries you have actually read.
       --------------------------------------------------------- */
    (function () {
        var DEV = {
            zelda: "Nintendo EAD", uncharted2: "Naughty Dog", lifeisstrange: "Dontnod Entertainment", gta3: "DMA Design",
            skyrim: "Bethesda Game Studios", breathofthewild: "Nintendo EPD", minecraft: "Mojang Studios", gta5: "Rockstar North",
            terraria: "Re-Logic", residentevil: "Capcom", dontstarve: "Klei Entertainment", subnautica: "Unknown Worlds Entertainment"
        };
        Object.keys(FILES).forEach(function (k) { if (!DEV[k]) DEV[k] = FILES[k].dev; });
        var PIONEERS = [["OXO", "A. S. Douglas"], ["Tennis for Two", "William Higinbotham"], ["Spacewar!", "Steve Russell"], ["the Magnavox Odyssey prototypes", "Ralph Baer"], ["Atari (with Ted Dabney)", "Nolan Bushnell"]];
        var GUARD_HP = 10, LIVES = 3, TIME = 15;

        function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
        function pick(arr, n, not) { return shuffle(arr.filter(function (x) { return not.indexOf(x) < 0; })).slice(0, n); }
        function title(k) { return PAGES[k].t; }

        var Q = {
            year: function (k) {
                var y = PAGES[k].y, opts = [y];
                shuffle([-6, -4, -3, -2, -1, 1, 2, 3, 4, 5]).some(function (d) { var v = y + d; if (v <= 2024 && opts.indexOf(v) < 0) opts.push(v); return opts.length === 4; });
                return { q: "In which year was <b>" + title(k) + "</b> released?", opts: opts.map(String), a: String(y) };
            },
            dev: function (k) {
                var all = Object.keys(DEV).map(function (x) { return DEV[x]; }).filter(function (v, i, s) { return s.indexOf(v) === i; });
                return { q: "Which studio or creator made <b>" + title(k) + "</b>?", opts: [DEV[k]].concat(pick(all, 3, [DEV[k]])), a: DEV[k] };
            },
            path: function (k) {
                var right = PATHS[PAGES[k].game].name, names = Object.keys(PATHS).map(function (p) { return PATHS[p].name; });
                return { q: "On the map, which path is <b>" + title(k) + "</b> filed under?", opts: [right].concat(pick(names, 3, [right])), a: right };
            },
            first: function (k) {
                var group = [k], years = [PAGES[k].y];
                shuffle(Object.keys(PAGES)).forEach(function (x) { if (group.length < 4 && years.indexOf(PAGES[x].y) < 0) { group.push(x); years.push(PAGES[x].y); } });
                var oldest = group.reduce(function (m, x) { return PAGES[x].y < PAGES[m].y ? x : m; });
                return { q: "Which of these was released <b>first</b>?", opts: group.map(title), a: title(oldest) };
            },
            pioneer: function () {
                var p = PIONEERS[(Math.random() * PIONEERS.length) | 0], names = PIONEERS.map(function (x) { return x[1]; });
                return { q: "Which pioneer is linked to <b>" + p[0] + "</b>?", opts: [p[1]].concat(pick(names, 3, [p[1]])), a: p[1], pioneer: true };
            }
        };
        function buildQuestions() {
            var read = Object.keys(PAGES).filter(function (k) { return S.pages.indexOf(k) >= 0; });
            var rest = shuffle(Object.keys(PAGES).filter(function (k) { return read.indexOf(k) < 0; }));
            var pool = shuffle(read.slice()).concat(rest); // read entries first
            var types = ["year", "dev", "path", "first", "year", "dev", "path", "year", "dev", "first", "path", "year", "dev", "path"];
            var out = types.map(function (t, i) { var q = Q[t](pool[i % pool.length]); q.opts = shuffle(q.opts); return q; });
            out.splice(3, 0, (function () { var q = Q.pioneer(); q.opts = shuffle(q.opts); return q; })());
            return out;
        }

        function unlocked() { return S.paths.length >= 7; }
        window.fxBossState = function () { return { open: unlocked(), have: S.paths.length }; };

        function openBoss() {
            if (!unlocked()) {
                openModal("THE FINAL ARCHIVE // LOCKED",
                    '<div class="fx-modal-head"><div><span class="fx-label">NODE // 08 // LOCKED</span><h2>THE FINAL<br><span>ARCHIVE.</span></h2>' +
                    "<p>The Archive Guardian only appears once you have opened all seven paths. You have opened <b>" + S.paths.length + " of 7</b>.</p></div>" +
                    '<img class="px" src="assets/img/trophy.png" alt="" style="filter:grayscale(1);opacity:.4"></div>' +
                    '<div class="fx-modal-body"><p class="fx-sub">// PATHS</p><div class="fx-paths">' +
                    Object.keys(PATHS).map(function (p) { return '<span class="fx-pchip' + (S.paths.indexOf(p) >= 0 ? " on" : "") + '" data-fx-path="' + p + '" style="cursor:pointer"><img class="px" src="assets/img/' + p + '.png" alt="">' + PATHS[p].name + "</span>"; }).join("") +
                    "</div><p style=\"font-size:12px;margin-top:14px\">Click a grey path to open it.</p></div>");
                return;
            }
            var qs, qi, hp, lives, score, streak, timer, locked, t0;
            function intro() {
                openModal("THE FINAL ARCHIVE // NODE 08",
                    '<div class="fx-modal-head"><div><span class="fx-label">BOSS // THE ARCHIVE GUARDIAN</span><h2>THE FINAL<br><span>ARCHIVE.</span></h2>' +
                    "<p>Answer questions from across the archive. Each right answer deals one hit to the Guardian (" + GUARD_HP + " HP). Each wrong answer, or running out of time, costs you a heart. You have " + LIVES + ". Questions favour the entries you've read.</p></div>" +
                    '<img class="px" src="assets/img/trophy.png" alt=""></div>' +
                    '<div class="fx-modal-body"><div class="fx-stats"><div>BEST SCORE<b>' + (S.bossBest || 0) + "</b></div><div>VICTORIES<b>" + (S.bossWins || 0) + '</b></div><div>ENTRIES READ<b>' + S.pages.filter(function (p) { return PAGES[p]; }).length + "/" + TOTAL + '</b></div></div>' +
                    '<div class="fx-actions"><button type="button" class="fx-btn blue" id="fxBossGo">▶ BEGIN [ENTER]</button></div><p style="font-size:11px;color:#777;margin-top:12px">Keys 1 – 4 answer. ' + TIME + " seconds per question.</p></div>");
                $("#fxBossGo").addEventListener("click", start);
                $("#fxBossGo").focus();
            }
            function start() {
                qs = buildQuestions(); qi = 0; hp = GUARD_HP; lives = LIVES; score = 0; streak = 0;
                mBody.innerHTML =
                    '<div class="fx-boss">' +
                    '<div class="fx-boss-top"><div class="fx-guard-wrap"><div class="fx-guard" id="fxGuard"><i></i><i></i><b></b></div><span class="fx-tag">ARCHIVE GUARDIAN</span><div class="fx-ghp" id="fxGHp"></div></div>' +
                    '<div class="fx-boss-side"><span class="fx-tag">YOU</span><div class="fx-hp" id="fxLives"></div><div class="fx-stats"><div>SCORE<b id="fxBScore">0</b></div><div>STREAK<b id="fxStreak">0</b></div></div></div></div>' +
                    '<div class="fx-timer"><i id="fxTimer"></i></div>' +
                    '<p class="fx-qn" id="fxQn"></p><p class="fx-q" id="fxQ"></p><div class="fx-opts" id="fxOpts"></div></div>';
                mBody.querySelector("#fxOpts").addEventListener("click", function (e) { var b = e.target.closest("[data-o]"); if (b) answer(+b.dataset.o); });
                render(); ask();
            }
            function render() {
                $("#fxGHp").innerHTML = Array.from({ length: GUARD_HP }, function (_, i) { return '<i class="' + (i < hp ? "on" : "") + '"></i>'; }).join("");
                $("#fxLives").innerHTML = Array.from({ length: LIVES }, function (_, i) { return '<img class="px" src="assets/img/heart.png" alt="" style="opacity:' + (i < lives ? 1 : 0.15) + '">'; }).join("");
                $("#fxBScore").textContent = score; $("#fxStreak").textContent = streak ? "×" + streak : "0";
            }
            function ask() {
                if (qi >= qs.length) qs = qs.concat(buildQuestions()); // never run dry
                var q = qs[qi]; locked = false;
                $("#fxQn").textContent = "QUESTION " + pad(qi + 1) + " // GUARDIAN HP " + hp + "/" + GUARD_HP;
                $("#fxQ").innerHTML = q.q;
                $("#fxOpts").innerHTML = q.opts.map(function (o, i) { return '<button type="button" class="fx-opt" data-o="' + i + '"><span>' + (i + 1) + "</span>" + o + "</button>"; }).join("");
                var bar = $("#fxTimer"); bar.style.transition = "none"; bar.style.width = "100%"; void bar.offsetWidth;
                bar.style.transition = "width " + TIME + "s linear"; bar.style.width = "0%";
                t0 = performance.now();
                clearTimeout(timer); timer = setTimeout(function () { answer(-1); }, TIME * 1000);
            }
            function answer(i) {
                if (locked) return; locked = true; clearTimeout(timer);
                var q = qs[qi], btns = $$(".fx-opt", mBody), right = q.opts.indexOf(q.a);
                var bar = $("#fxTimer"); bar.style.transition = "none"; bar.style.width = getComputedStyle(bar).width;
                btns.forEach(function (b, n) { b.disabled = true; if (n === right) b.classList.add("right"); });
                if (i === right) {
                    hp--; streak++;
                    var secs = (performance.now() - t0) / 1000, gain = 100 + Math.round(Math.max(0, TIME - secs) * 10) + (streak - 1) * 25;
                    score += gain; sfx.bit();
                    var g = $("#fxGuard"); g.classList.remove("hit"); void g.offsetWidth; g.classList.add("hit");
                    var c = center(g); sparks(c[0], c[1], 22); xpPop(gain, c[0], c[1] - 40);
                } else {
                    lives--; streak = 0; sfx.bad();
                    if (i >= 0) btns[i].classList.add("wrong");
                    var card = $(".fx-boss", mBody); card.classList.remove("ouch"); void card.offsetWidth; card.classList.add("ouch");
                    if (i < 0) $("#fxQn").textContent = "TIME UP // THE GUARDIAN STRIKES";
                }
                render();
                setTimeout(function () {
                    if (hp <= 0) return finish(true);
                    if (lives <= 0) return finish(false);
                    qi++; ask();
                }, 1100);
            }
            function finish(won) {
                clearTimeout(timer);
                if (won) score += lives * 250;
                var best = S.bossBest || 0; if (score > best) { S.bossBest = score; }
                if (won) S.bossWins = (S.bossWins || 0) + 1;
                save();
                var rank = !won ? "—" : lives === 3 && score >= 2600 ? "S" : lives >= 2 && score >= 2000 ? "A" : score >= 1500 ? "B" : "C";
                mBody.innerHTML = '<div class="fx-modal-head"><div><span class="fx-label">' + (won ? "ARCHIVE CLEARED // RANK " + rank : "THE ARCHIVE HOLDS") + "</span><h2>" +
                    (won ? "GUARDIAN<br><span>DEFEATED.</span>" : "TRY<br><span>AGAIN.</span>") + "</h2><p>" +
                    (won ? "You proved your knowledge of the whole archive. " + (lives > 0 ? "Remaining hearts were worth +" + lives * 250 + "." : "")
                         : "The Guardian had " + hp + " HP left. Read more entries: questions favour the pages you've visited.") +
                    '</p></div><img class="px" src="assets/img/' + (won ? "trophy" : "heart") + '.png" alt=""></div>' +
                    '<div class="fx-modal-body"><div class="fx-stats"><div>SCORE<b>' + score + "</b></div><div>BEST<b>" + (S.bossBest || 0) + "</b></div><div>RANK<b>" + rank + "</b></div><div>VICTORIES<b>" + (S.bossWins || 0) + "</b></div></div>" +
                    '<div class="fx-actions"><button type="button" class="fx-btn blue" id="fxBossAgain">↻ CHALLENGE AGAIN</button></div></div>';
                $("#fxBossAgain").addEventListener("click", start);
                if (won) { unlock("boss"); sfx.win(); addXP(100); [0, 250, 500].forEach(function (d) { setTimeout(function () { sparks(innerWidth * (0.3 + Math.random() * 0.4), innerHeight * (0.3 + Math.random() * 0.3), 30); }, d); }); }
            }
            intro();
            stopMini = function () { clearTimeout(timer); };
            var onKey = keyGuard(function (e) {
                if (e.key === "Enter" && $("#fxBossGo")) { e.preventDefault(); start(); return; }
                var i = ["1", "2", "3", "4"].indexOf(e.key);
                if (i >= 0 && $("#fxOpts")) { e.preventDefault(); answer(i); }
            });
            addEventListener("keydown", onKey);
            var prevStop = stopMini;
            stopMini = function () { prevStop(); removeEventListener("keydown", onKey); };
        }
        window.fxOpenBoss = openBoss;

        window.fxUpdateBoss = function () {
            var n = $(".fx-final"); if (!n) return;
            var open = unlocked();
            n.classList.toggle("fx-locked", !open);
            $("#fxFinalDesc").textContent = open ? "Boss // Exam // All 26 entries" : "Locked // " + S.paths.length + "/7 paths opened";
            $("#fxFinalEnter").textContent = open ? "FACE THE GUARDIAN →" : "OPEN ALL 7 PATHS";
            var core = $(".fx-w-core small"); if (core) core.textContent = open ? "▶ FINAL ARCHIVE // CLICK" : "FINAL ARCHIVE // " + S.paths.length + "/7";
            $$(".fx-w-core").forEach(function (c) { c.classList.toggle("fx-open", open); });
        };
        window.fxUpdateBoss();
        index.push({ l: "The Final Archive (boss)", s: "NODE // 08", boss: true });
    })();

    /* ---------------------------------------------------------
       SUBTLE MOTION + HUD THAT GETS OUT OF THE WAY
       --------------------------------------------------------- */
    (function () {
        // the HUD tucks down while you scroll down and comes back when you scroll up, hover or tab to it
        var lastY = scrollY;
        addEventListener("scroll", function () {
            var y = scrollY, d = y - lastY; lastY = y;
            if (Math.abs(d) < 4) return;
            hud.classList.toggle("fx-tuck", d > 0 && y > 200);
        }, { passive: true });
        if (reduced) return;

        // a small signal now and then travels along each map connector
        $$(".map-line, .genre-line").forEach(function (l, i) {
            var sig = el("span", "fx-signal"); sig.style.animationDelay = (1.6 + i * 1.4 + Math.random() * 2).toFixed(2) + "s"; l.appendChild(sig);
        });

        // the big year in each game header counts up on arrival
        $$(".game-hero-year").forEach(function (y) {
            var orig = y.textContent, end = parseInt(orig, 10); if (!end) return;
            var start = end - 40, t0 = Date.now(), DUR = 1100;
            var iv = setInterval(function () {
                var k = Math.min(1, (Date.now() - t0) / DUR), e = 1 - Math.pow(1 - k, 3);
                y.textContent = Math.round(start + (end - start) * e);
                if (k >= 1) { clearInterval(iv); y.textContent = orig; }
            }, 30);
            setTimeout(function () { clearInterval(iv); y.textContent = orig; }, DUR + 100); // always lands on the real year
        });

        if (!("IntersectionObserver" in window)) return;
        // section labels decode as they scroll into view
        var lo = new IntersectionObserver(function (ents) {
            ents.forEach(function (en) { if (en.isIntersecting) { lo.unobserve(en.target); decode(en.target); } });
        }, { threshold: 0.6 });
        $$(".home-section-label > span:first-child, .wiki-section > h2, .genre-section > h2, .fx-game-top h2").forEach(function (h) { lo.observe(h); });
        // timeline rules draw themselves across
        var to = new IntersectionObserver(function (ents) {
            ents.forEach(function (en) { if (en.isIntersecting) { to.unobserve(en.target); en.target.classList.add("fx-drawn"); } });
        }, { threshold: 0.3 });
        $$(".timeline").forEach(function (t) { t.classList.add("fx-tl"); to.observe(t); });
    })();

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
