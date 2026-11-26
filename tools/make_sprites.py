"""Generate the site's original pixel-art PNGs with no dependencies.

Run:  python3 tools/make_sprites.py
Writes PNG files into assets/img/.
"""
import os, struct, zlib, random

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
os.makedirs(OUT, exist_ok=True)


def hexrgba(h):
    h = h.lstrip("#")
    if len(h) == 6:
        h += "ff"
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4, 6))


def write_png(path, rows, scale=1):
    """rows: list of lists of RGBA tuples."""
    h = len(rows) * scale
    w = len(rows[0]) * scale
    raw = bytearray()
    for r in rows:
        line = bytearray()
        for px in r:
            line += bytes(px) * scale
        for _ in range(scale):
            raw += b"\x00" + line
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def sprite(name, art, palette, scale=8):
    T = (0, 0, 0, 0)
    rows = [[hexrgba(palette[c]) if c in palette else T for c in line] for line in art]
    write_png(os.path.join(OUT, name + ".png"), rows, scale)


# ---------- 16x16 path icons (o = outline, a/b/c = tones) ----------
ICONS = {
    "explore": (  # compass
        ["................",
         ".....oooooo.....",
         "...oobbbbbboo...",
         "..obbbbaabbbbo..",
         ".obbbbbaabbbbbo.",
         ".obbbbaaaabbbbo.",
         "obbbbbaaaabbbbbo",
         "obbbbbbccbbbbbbo",
         "obbbbbbccbbbbbbo",
         "obbbbbccccbbbbbo",
         ".obbbbccccbbbbo.",
         ".obbbbbccbbbbbo.",
         "..obbbbccbbbbo..",
         "...oobbbbbboo...",
         ".....oooooo.....",
         "................"],
        {"o": "#0b1020", "a": "#ff4d6d", "b": "#3ee6c1", "c": "#e8fff8"}),
    "solve": (  # puzzle piece
        ["................",
         "......ooo.......",
         ".....oaaao......",
         ".oooooaaaooooo..",
         ".oaaaaaaaaaaao..",
         ".oaabbbbbbbbaoo.",
         ".oaabbbbbbbbaaao",
         "ooaabbbbbbbbaaao",
         "oaaabbbbbbbbaaao",
         "oaaabbbbbbbbaoo.",
         "ooaabbbbbbbbao..",
         ".oaabbbbbbbbao..",
         ".oaaaaaaaaaaao..",
         ".oooooooooooooo.",
         "................",
         "................"],
        {"o": "#0b1020", "a": "#8b7bff", "b": "#c7beff"}),
    "jump": (  # spring boot / arrow up
        ["................",
         ".......oo.......",
         "......oaao......",
         ".....oaaaao.....",
         "....oaaaaaao....",
         "...oaaaaaaaao...",
         "...oooaaaaooo...",
         ".....oaaaao.....",
         ".....oaaaao.....",
         "....obbbbbbo....",
         "....oocccooo....",
         "....obbbbbbo....",
         "....oocccooo....",
         "....obbbbbbo....",
         "....oooooooo....",
         "................"],
        {"o": "#0b1020", "a": "#ffd23f", "b": "#ffffff", "c": "#a0a8c0"}),
    "build": (  # pickaxe
        ["................",
         "...ooooooooo....",
         "..oaaaaaaaaaoo..",
         ".oaaoooooooaaao.",
         ".oao.....oobaao.",
         "..o.....obbo.oo.",
         "........obbo....",
         ".......obbo.....",
         "......obbo......",
         ".....obbo.......",
         "....obbo........",
         "...obbo.........",
         "..obbo..........",
         ".obbo...........",
         ".ooo............",
         "................"],
        {"o": "#0b1020", "a": "#ff9f43", "b": "#b07a4a"}),
    "fight": (  # sword
        ["................",
         ".............oo.",
         "............oao.",
         "...........oaao.",
         "..........oaao..",
         ".........oaao...",
         "........oaao....",
         ".......oaao.....",
         "..oo..oaao......",
         "..obooaao.......",
         "...obbao........",
         "...oobbo........",
         "..occoobo.......",
         ".occo..oo.......",
         ".ooo............",
         "................"],
        {"o": "#0b1020", "a": "#e8ecff", "b": "#ff4d6d", "c": "#7a3b2e"}),
    "run": (  # lightning bolt
        ["................",
         ".......ooooo....",
         "......oaaaao....",
         "......oaaao.....",
         ".....oaaaao.....",
         ".....oaaao......",
         "....oaaaaoooo...",
         "....oaaaaaaao...",
         "...oooooaaao....",
         "......oaaao.....",
         ".....oaaao......",
         ".....oaao.......",
         "....oaao........",
         "....oao.........",
         "....oo..........",
         "................"],
        {"o": "#0b1020", "a": "#4dabff"}),
    "survive": (  # campfire
        ["................",
         ".......o........",
         "......oao.......",
         "......oaao......",
         ".....oabao......",
         "....oabbbao.....",
         "....oabcbao.....",
         "...oabbcbbao....",
         "...oabcccbao....",
         "....oabccbao....",
         "..oooooooooooo..",
         "..oddddoodddddo.",
         "...ooddddddoo...",
         "..oddddoodddddo.",
         "..oooooooooooo..",
         "................"],
        {"o": "#0b1020", "a": "#ff4d6d", "b": "#ff9f43", "c": "#ffd23f", "d": "#8a5a3b"}),
    # extras
    "trophy": (
        ["................",
         "..oooooooooooo..",
         ".oaaaaaaaaaaaao.",
         "oaoabbaaaaaaoao.",
         "oaoabaaaaaaaoao.",
         "oaoaaaaaaaaaoao.",
         ".oaoaaaaaaaaoao.",
         "..ooaaaaaaaaoo..",
         "....oaaaaaao....",
         ".....oaaaao.....",
         "......oaao......",
         "......oaao......",
         ".....oaaaao.....",
         "....occccccco...",
         "....oooooooooo..",
         "................"],
        {"o": "#0b1020", "a": "#ffd23f", "b": "#fff6c8", "c": "#8b7bff"}),
    "coin": (
        ["................",
         ".....oooooo.....",
         "....oaaaaaao....",
         "...oaabbbbaao...",
         "...oabaaaabao...",
         "..oaabaccabaao..",
         "..oaabaccabaao..",
         "..oaabaccabaao..",
         "..oaabaccabaao..",
         "..oaabaccabaao..",
         "...oabaaaabao...",
         "...oaabbbbaao...",
         "....oaaaaaao....",
         ".....oooooo.....",
         "................",
         "................"],
        {"o": "#0b1020", "a": "#ffd23f", "b": "#ffb703", "c": "#fff6c8"}),
    "heart": (
        ["................",
         "................",
         "..oooo....oooo..",
         ".oaaaao..oaaaao.",
         "oabbaaaooaaaaaao",
         "oabaaaaaaaaaaaao",
         "oaaaaaaaaaaaaaao",
         "oaaaaaaaaaaaaaao",
         ".oaaaaaaaaaaaao.",
         "..oaaaaaaaaaao..",
         "...oaaaaaaaao...",
         "....oaaaaaao....",
         ".....oaaaao.....",
         "......oaao......",
         ".......oo.......",
         "................"],
        {"o": "#0b1020", "a": "#ff4d6d", "b": "#ffd1da"}),
    "controller": (
        ["................",
         "................",
         "................",
         "...oooooooooo...",
         "..oaaaaaaaaaao..",
         ".oaabaaaaaacaao.",
         ".oabbbaaaacadao.",
         ".oaabaaaaaacaao.",
         ".oaaaaaaaaaaaao.",
         ".oaaaoooooaaaao.",
         "..oaao....oaao..",
         "...oo......oo...",
         "................",
         "................",
         "................",
         "................"],
        {"o": "#0b1020", "a": "#3ee6c1", "b": "#0b1020", "c": "#ff4d6d", "d": "#ffd23f"}),
}

INK = {"o": "#222222", "a": "#0084ff", "b": "#9cdcfe", "c": "#ffffff", "d": "#777777"}
for name, (art, pal) in ICONS.items():
    sprite(name, art, {k: INK.get(k, v) for k, v in pal.items()}, scale=8)


print("sprites written to", os.path.abspath(OUT))
