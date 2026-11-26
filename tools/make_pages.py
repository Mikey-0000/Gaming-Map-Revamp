# -*- coding: utf-8 -*-
"""Generate the 14 new game pages from tools/entries.py.

The markup mirrors minecraft.html (same classes, same sections) so the
pages use the site's original style.css. Each page adds a small scoped
<style> block for its accent colour, the way Minecraft is green.

Run:  python3 tools/make_pages.py
"""
import os, html
from entries import ENTRIES

ROOT = os.path.join(os.path.dirname(__file__), "..")
PATH_NAMES = {"solve": "SOLVE", "jump": "JUMP", "build": "BUILD", "fight": "FIGHT", "run": "RUN"}
e = html.escape
NAMES = {"tetris": "Tetris", "myst": "Myst", "portal": "Portal", "smb": "Super Mario Bros.", "sonic": "Sonic the Hedgehog",
         "celeste": "Celeste", "simcity": "SimCity", "rct": "RollerCoaster Tycoon", "sf2": "Street Fighter II", "doom": "Doom",
         "darksouls": "Dark Souls", "pacman": "Pac-Man", "granturismo": "Gran Turismo", "templerun": "Temple Run"}


def page(ent, prev_ent, next_ent):
    c = ent["color"]
    nav_left = '<a href="%s.html">← PREVIOUS ENTRY: %s</a>' % (prev_ent["key"], e(NAMES[prev_ent["key"]])) if prev_ent else '<a href="index.html">← MAIN MAP</a>'
    nav_right = '<a href="%s.html">NEXT ENTRY: %s →</a>' % (next_ent["key"], e(NAMES[next_ent["key"]])) if next_ent else '<a href="index.html">BACK TO MAIN MAP →</a>'
    data = "\n".join('''                <div class="data-box">
                    <p>%s</p>
                    <h3>%s</h3>
                </div>''' % (e(k), e(v)) for k, v in ent["data"])
    stats = "\n".join('''                <div class="stat">
                    <div class="stat-heading">
                        <span>%s</span>
                        <span>%s</span>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: %d%%;"></div>
                    </div>
                </div>''' % (e(a), e(b), w) for a, b, w in ent["stats"])
    timeline = "\n".join('''                <div class="timeline-event">
                    <div class="timeline-year">
                        %s
                    </div>
                    <div class="timeline-dot"></div>
                    <h3>%s</h3>
                    <p>
                        %s
                    </p>
                </div>''' % (e(y), e(h), e(t)) for y, h, t in ent["timeline"])
    boxes = "\n".join('''                <div class="gameplay-box">
                    <p class="gameplay-number">%02d</p>
                    <h3>%s</h3>
                    <p>
                        %s
                    </p>
                </div>''' % (i + 1, e(h), e(t)) for i, (h, t) in enumerate(ent["boxes"]))
    def paras(ps, ind=12):
        pad = " " * ind
        return "\n".join("%s<p>\n%s    %s\n%s</p>" % (pad, pad, e(p), pad) for p in ps)
    return '''<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title_t} | Historical Gaming Map</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="enhance.css">
    <style>
        /* page accent: same structure as minecraft.html, different colour */
        .entry-{key} {{ --game-accent: {c}; }}
        .entry-{key} .game-hero {{ background-color: {c}; }}
        .entry-{key} .stat-fill,
        .entry-{key} .timeline-dot {{ background-color: {c}; border-color: #222222; }}
        .entry-{key} .wiki-section h2 span,
        .entry-{key} .gameplay-number,
        .entry-{key} .stat-heading span:last-child,
        .entry-{key} .archive-label {{ color: {c}; }}
        .entry-{key} .significance-number {{ color: {c}; }}
    </style>
</head>

<body>

    <div class="game-wiki-page entry-{key}">

        <!-- Back Button -->
        <a href="index.html" class="back-link">
            ← Back to Main Map
        </a>


        <!-- =========================
             GAME HERO
        ========================== -->

        <div class="game-hero">

            <div class="game-hero-top">
                <p>GAME // {tags} // {year}</p>
                <p>ARCHIVE ENTRY // {entry}</p>
            </div>

            <div class="game-hero-main">

                <div>
                    <h1>{title}</h1>
                    <p class="game-tagline">
                        {tagline}
                    </p>
                </div>

                <div class="game-hero-year">
                    {year}
                </div>

            </div>

        </div>


        <!-- =========================
             GAME DATA
        ========================== -->

        <section class="wiki-section">

            <h2>
                <span>//</span> GAME DATA
            </h2>

            <div class="game-data-grid">
{data}
            </div>

        </section>


        <!-- =========================
             OVERVIEW
        ========================== -->

        <div class="overview-layout">

            <section class="wiki-section overview-section">

                <h2>
                    <span>//</span> OVERVIEW
                </h2>

{overview}

            </section>


            <!-- Why It Matters Panel -->

            <aside class="importance-panel">

                <h2>WHY IT MATTERS</h2>

{stats}

            </aside>

        </div>


        <!-- =========================
             HISTORY
        ========================== -->

        <section class="wiki-section">

            <h2>
                <span>//</span> HISTORY
            </h2>

{history}

            <!-- Timeline -->

            <div class="timeline">

{timeline}

            </div>

        </section>


        <!-- =========================
             GAMEPLAY
        ========================== -->

        <section class="wiki-section">

            <h2>
                <span>//</span> GAMEPLAY
            </h2>

            <p>
                {gameplay}
            </p>

            <div class="gameplay-grid">

{boxes}

            </div>

        </section>


        <!-- =========================
             HISTORICAL SIGNIFICANCE
        ========================== -->

        <section class="wiki-section significance-section">

            <div class="significance-number">{entry}</div>

            <div class="significance-content">

                <p class="archive-label">
                    ARCHIVE NOTE // HISTORICAL IMPACT
                </p>

                <h2>
                    // HISTORICAL SIGNIFICANCE
                </h2>

{significance}

            </div>

        </section>


        <!-- =========================
             PAGE NAVIGATION
        ========================== -->

        <div class="game-page-navigation">

            {nav_left}

            {nav_right}

        </div>

    </div>

    <script src="enhance.js"></script>
</body>

</html>
'''.format(key=ent["key"], c=c, title=e(ent["title"]), title_t=e(NAMES[ent["key"]]), tags=e(ent["tags"]), year=ent["year"],
           entry=ent["entry"], tagline=e(ent["tagline"]), data=data, overview=paras(ent["overview"], 16),
           stats=stats, history=paras(ent["history"]), timeline=timeline, gameplay=e(ent["gameplay"]), boxes=boxes,
           significance=paras(ent["significance"], 16),
           nav_left=nav_left, nav_right=nav_right)


groups = {}
for ent in ENTRIES:
    groups.setdefault(ent["path"], []).append(ent)
for pid, ents in groups.items():
    for i, ent in enumerate(ents):
        prev_ent = ents[i - 1] if i > 0 else None
        next_ent = ents[i + 1] if i + 1 < len(ents) else None
        with open(os.path.join(ROOT, ent["key"] + ".html"), "w", encoding="utf-8", newline="\r\n") as f:
            f.write(page(ent, prev_ent, next_ent))
        print("wrote", ent["key"] + ".html")
