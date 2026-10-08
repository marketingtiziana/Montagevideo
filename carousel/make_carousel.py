#!/usr/bin/env python3
"""Fabrique un carrousel complet (écrans Threads + slides blanches) à partir d'un fichier JSON.

Format du JSON :
{
  "slug": "mon-sujet",                       # dossier de sortie : carousel/decks/<slug>/
  "cta": "COMMENTE « AUDIT »",               # bouton noir de la dernière slide
  "timeline": {                              # optionnel : frise texte sous certaines slides
    "labels": ["ÉTAPE 1", "ÉTAPE 2", "ÉTAPE 3"],
    "slides": {"3": 0, "4": 1, "5": 2}       # n° de slide (1-based) -> index de l'étape active
  },
  "posts": [                                 # un post Threads par slide : liste de paragraphes
    ["Premier paragraphe.", "Deuxième paragraphe.\\nLigne suivante du même paragraphe."],
    ...
  ]
}

Usage :  python3 carousel/make_carousel.py contenu.json
Sortie : carousel/decks/<slug>/screens/N.jpg (le texte façon Threads, pastille n/N incluse)
         carousel/decks/<slug>/slide_NN.png, planche.jpg, preview.html
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_carousel_white import build_deck  # noqa: E402
from threads_text import render_post  # noqa: E402

ROOT = Path(__file__).resolve().parent


def main(cfg_path: Path) -> None:
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    posts: list[list[str]] = cfg["posts"]
    total = len(posts)
    out = ROOT / "decks" / cfg["slug"]
    screens = out / "screens"

    for n, paragraphs in enumerate(posts, start=1):
        render_post(paragraphs, f"{n}/{total}", screens / f"{n}.jpg")
        print("screen", n)

    tl = cfg.get("timeline") or {}
    slide_steps = {int(k): v for k, v in tl.get("slides", {}).items()}
    steps = [slide_steps.get(n) for n in range(1, total + 1)]
    build_deck(
        screens,
        out,
        steps,
        timeline_labels=tl.get("labels", []),
        cta=cfg.get("cta", "COMMENTE"),
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: make_carousel.py contenu.json")
    main(Path(sys.argv[1]))
