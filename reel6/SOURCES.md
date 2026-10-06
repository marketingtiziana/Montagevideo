# Sources — Reel 6 « Impôts & OnlyFans »

| Élément | Source | Licence |
|---|---|---|
| Vidéo et voix | Rush fourni (Google Drive `1HFzQV75ggEj2c6WNLfu72icZNcuVlijQ`) | fourni par la cliente |
| Capture impots.gouv.fr (blocs 1 et 12) | https://www.impots.gouv.fr/ (page d'accueil publique), capturée le 6 octobre 2026 par `tools/capture.py` (Playwright, 1440×900 @2x, bandeau cookies refusé) → `assets/screens/impots.png` | capture d'écran d'un site public, utilisée à titre d'illustration |
| Capture urssaf.fr, desktop (bloc 16) | https://www.urssaf.fr/ , même méthode → `assets/screens/urssaf.png` | idem |
| Capture urssaf.fr, mobile (bloc 19, iPhone) | https://www.urssaf.fr/ en viewport iPhone 393×852 @3x → `assets/screens/urssaf_iphone.png` | idem |
| Logo OnlyFans (blocs 2 et 7) | Simple Icons, `onlyfans` (monochrome, sans la couleur de marque) | CC0 1.0 (le logo reste une marque de son propriétaire : simple mention nominative, pas de partenariat suggéré) |
| Drapeaux UK et FR (bloc 7) | Wikimedia Commons, `Flag_of_the_United_Kingdom.svg` et `Flag_of_France.svg` | domaine public |
| B-roll (bloc 23, 1,8 s) | Pexels 12691932, Anna Shvets, « A young woman sitting on a balcony using a laptop computer », https://www.pexels.com/video/a-young-woman-sitting-on-a-balcony-using-a-laptop-computer-12691932/ (1080×1920, 59,94 fps, réencodé sans audio en `assets/broll/broll_balcon.mp4`) | Licence Pexels (usage commercial gratuit, sans attribution obligatoire) |
| Notification générique (bloc 19) | `mockups/notification/index.html`, rendue en .mov alpha (`tools/render_mockup.py`, Playwright) | création originale |
| Icônes | Lucide, catalogue intégré à Higgsedit : arrow-down, calendar, coins, eye-off, landmark, lock, scan-search, shield-alert, trending-up, wallet | ISC |
| Typographies | Montserrat 800 (sous-titres, titres) et Inter 400 / 600 / 700 (UI des fenêtres, maquette), Google Fonts via `higgsedit fonts add` | SIL Open Font License 1.1 |
| Sound design | pop, click, whoosh, tick, impact synthétisés en Python (`audio/sfx.py` : sinus, bruit filtré, enveloppes) | création originale |
| Cartes, jauges, checklists, compteurs, flux | dessinés en natif dans `edit.jsx` (formes Higgsedit) | — |

## Ce qui n'est PAS dans le reel

- Aucune image ni vidéo générée par IA, et aucune génération ni retouche sur la personne.
- Aucune capture d'onlyfans.com : le site renvoie une page anti-bot Cloudflare (403). Seul le logo apparaît, aucune interface OnlyFans n'a été inventée.
- Aucun faux relevé, faux montant, faux avis ou fausse notification officielle. La notification « Cotisations à régler » n'a ni montant, ni logo, ni nom d'organisme.
- Chiffres affichés : uniquement ceux qu'elle prononce (5 000, 10 000, 20 000 par mois ; « quasiment la moitié » → « ≈ 50 % » ; « un an » → « +1 an » ; 100 %).
- Pas de musique (non fournie).
