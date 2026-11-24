# Bannières YouTube FYNOVATES (2560 × 1440)

Quatre directions, entièrement en français, chacune avec et sans signature :

| # | Concept | Signature |
|---|---|---|
| 01 | Média économique international | Comprendre les enjeux du business international. |
| 02 | Intelligence économique internationale | Décrypter. Analyser. Comprendre. |
| 03 | Magazine des affaires internationales | Les clés de l'entrepreneuriat international. |
| 04 | Expertise et pédagogie | Le monde des affaires internationales expliqué. |

- `output/` : PNG finaux prêts à importer sur YouTube (< 6 Mo).
- `previews/` : aperçus TV, desktop (2560 × 423), mobile (zone de sécurité 1546 × 423) et contrôle de zone de sécurité.
- `comparison.html` : page de comparaison.
- `brand/` : wordmark original détouré (masque alpha). Le monogramme est redessiné à l'identique à partir des cotes mesurées sur le logo fourni.

## Régénérer
```bash
cd banners && npm i --no-save world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1
node geo.mjs     # -> geo.json (carte et globe)
node build.mjs geo.json
```
