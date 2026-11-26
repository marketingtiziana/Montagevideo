# Profil LinkedIn — Tiziana Caci : décisions de design

## Ressources utilisées

| Ressource | Source | Usage |
|---|---|---|
| Logo officiel FYNOVATES (SVG vectoriel, version blanche) | Drive, dossier « LOGOS » → SVG → `FYNOVATES-3.svg` | Bannière (non modifié, non redessiné) |
| Logo navy (`FYNOVATES-2.svg`, `#100B3B`) | même dossier | Conservé dans `source/` |
| Photographies de Tiziana | Drive, dossier « 📸PHOTOS Tiziana » (shooting studio fond gris) | Photo de profil |
| Palette | Charte Fynovates du guide (`workspace/brand/BRAND_ASSETS_GUIDELINES.md`) : bleu nuit `#0D082E`, quasi-noir `#0F0A13`, blanc | Bannières |
| Baseline | Bannière YouTube IMG-010 et bio Instagram : « Conseil fiscal & structuration internationale » | Bannière |

Aucune image générée, aucun visage fabriqué, aucun élément graphique inventé (pas de globe, de carte, de monogramme F ni de symbole).

## Photo de profil

Trois candidates, toutes issues du même shooting studio (fond gris neutre), recadrées tête et épaules en 800 × 800 :

| Fichier | Original (Drive) | Lecture |
|---|---|---|
| `portrait-candidate-01.jpg` | `af73083c-…jpg` | Blazer satin vert, mains jointes sous le menton : chaleureux mais plus « pose » |
| `portrait-candidate-02.jpg` | `d1bbdb30-…jpg` | Veste bleu marine à liseré blanc, regard direct, sans main au visage |
| `portrait-candidate-03.jpg` | `6aad10cf-…jpg` | Même veste, main au menton : réflexion, moins direct |

**Retenue : candidate 02** (`portrait-final.jpg`).
- Regard direct, expression assurée, autorité naturelle sans rigidité.
- La veste bleu marine fait écho au bleu nuit Fynovates.
- Pas de main au visage, donc la lecture reste nette en petit format circulaire.

Traitement : recadrage uniquement. Aucune retouche du visage, aucun filtre, luminosité et arrière-plan d'origine conservés.

> À CONFIRMER : que Tiziana valide cette photo et que le droit d'usage du shooting couvre LinkedIn.

## Bannière

Format : 1584 × 396 px (ratio 4:1, format recommandé par LinkedIn pour un profil personnel) ; version @2x (3168 × 792) également fournie.

- **Version A — Institutionnelle premium.** Aplat bleu nuit, filet de cadre très discret, logo officiel blanc, filet court, baseline en capitales espacées.
- **Version B — Architecture et structuration.** Trame de colonnes bleu nuit / quasi-noir et filets fins, cartouche bleu nuit portant le logo et la baseline.

**Retenue : version A** (`banner-final.png`), pour trois raisons :
1. Elle est la plus institutionnelle et la plus lisible à petite taille (mobile).
2. Elle prolonge la bannière YouTube « Pure wordmark » (IMG-010), seule proposition déjà conforme au brief.
3. Elle laisse la photo porter la personne : la bannière ne fait qu'installer l'univers Fynovates.

### Zones de sécurité

La photo de profil recouvre le coin inférieur gauche de la bannière, sur ordinateur comme sur mobile. Tous les éléments importants sont placés dans la moitié droite (x ≥ 600 px sur 1584), centrés verticalement. La partie gauche reste un aplat. Voir `previews/linkedin-profile-preview.png`.

### Typographie

Le logo est le fichier officiel. La baseline est composée en Inter (sans-sérif du guide), en capitales espacées.

> À CONFIRMER : la police officielle de la baseline, si elle existe (l'original de IMG-010 utilise une grotesque proche).

### Texte de la bannière

La mission proposait « Conseil fiscal, comptable et structuration internationale ». Les sources disponibles ne confirment pas l'activité comptable : la bannière reprend donc la baseline déjà utilisée par la marque, **« Conseil fiscal & structuration internationale »**.

> À CONFIRMER : si l'activité comptable est bien proposée, la bannière peut être régénérée avec la formulation complète (`source/banners.html`).

## Contrôle qualité

| Critère | Résultat |
|---|---|
| Positionnement | Titre « Fondatrice & Directrice de Fynovates » en tête |
| Compréhension | Titre + bannière : dirigeante d'un cabinet de conseil fiscal et de structuration internationale |
| Cohérence | Titre, Infos, photo et bannière racontent la même histoire |
| Personnalité | Les Infos sont à la première personne, centrées sur sa vision ; la bannière est la seule partie institutionnelle |
| Identité | Logo officiel, palette officielle |
| Photographie | Vraie photo de Tiziana, shooting studio, non retouchée |
| Bannière | Lisible sur ordinateur et mobile, rien sous la photo |
| Crédibilité | Aucune compétence, expérience, date ou réalisation ajoutée |

Note : l'aperçu est une simulation de mise en page (positions approximatives de la photo). Le rendu réel est à vérifier dans LinkedIn avant enregistrement.
