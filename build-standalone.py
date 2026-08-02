#!/usr/bin/env python3
"""
Bundle index.html + assets/ into a single self-contained dist/index.html.

Some hosts (GoDaddy's file manager, a WordPress HTML block, a CMS "custom
page") are much happier with one file than with a folder of assets. Run this
after editing the source, then upload dist/index.html on its own.

    python3 build-standalone.py
"""

import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")

# Replacements go through lambdas on purpose: a plain replacement string would
# have its backslash escapes expanded, turning every "\n" in the JS into a real
# newline and breaking the string literals.
html = re.sub(
    r'\s*<link rel="stylesheet" href="assets/css/style\.css" />',
    lambda _: f"\n<style>\n{css}\n</style>",
    html,
    count=1,
)

html = re.sub(
    r'\s*<script src="assets/js/main\.js"></script>',
    lambda _: f"\n<script>\n{js}\n</script>",
    html,
    count=1,
)

MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml"}


def inline_image(tag: str) -> str:
    """Embed a local <img> as a data URI, or drop the tag if the file is absent.

    A single-file build has no assets folder next to it, so a left-behind
    relative src would 404 wherever the file gets uploaded.
    """
    src = re.search(r'src="(assets/[^"]+)"', tag)
    if not src:
        return tag
    path = ROOT / src.group(1)
    if not path.exists():
        return ""
    mime = MIME.get(path.suffix.lower())
    if mime is None:
        raise SystemExit(f"don't know how to inline {path.name}")
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return tag.replace(src.group(1), f"data:{mime};base64,{data}")


html = re.sub(r"<img\b[^>]*>", lambda m: inline_image(m.group(0)), html)

leftovers = re.findall(r'(?:src|href)="assets/[^"]*"', html)
if leftovers:
    raise SystemExit(f"unbundled local references remain: {leftovers}")

DIST.mkdir(exist_ok=True)
out = DIST / "index.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out.relative_to(ROOT)} — {out.stat().st_size / 1024:.0f} KB, single file")
