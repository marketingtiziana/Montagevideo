# Fynovates — Marketing & Creative Intelligence Workspace

Espace de travail visuel qui centralise la stratégie marketing, éditoriale, commerciale et artistique de **Fynovates** (cabinet) et de **Tiziana / Madame Caci** (personal branding).

## Lancer

```bash
cd workspace
npm install
npm run dev        # http://localhost:5173
npm run build      # build statique dans dist/ (hébergeable partout, routage par hash)
```

## Ce que contient l'application

| Zone | Vues |
|---|---|
| Overview | Strategic Overview — prise en main en 6 étapes, points d'attention |
| Strategy | Master Mind Map (15 territoires, canvas React Flow), Brand Architecture, Editorial Pillars, Prospect Insights |
| Channels | YouTube / Instagram / TikTok / LinkedIn Fynovates, Instagram / LinkedIn Tiziana |
| Creative Studio | Art Direction, Creative Library (import), Visual References, Infographics (modèle A), Carousels (B), Storyboards (C) |
| Operations | Content Database (TanStack Table), Production Board (Kanban), Story Sequences (D), Repurposing Matrix, Conversion Journeys |

Fiches détaillées en panneau latéral, adressables par URL : `?c=FN-001`, `?p=PB-A01`, `?i=IMG-001` (option `&t=creative`).
Raccourcis : `⌘K` ou `/` pour la recherche globale, `C` pour créer.

## Modèle de données

Source unique (`src/lib/types.ts`), relations stockées une seule fois et inverses calculées :

- `Content` (FN-xxx, TZ-xxx, DB-xxx) → `problemIds`, `imageIds`, `relatedIds` (symétrique, synchronisé)
- `Problem` (PB-A01…PB-F03) → pilier A–F, `imageIds`
- `ImageAsset` (IMG-xxx) → marque, plateforme, type, statut, avertissements
- `Channel`, `Brand` → sections stratégiques éditables (items avec statut)
- `MatrixRow` → cellules par plateforme (angle, format, contenu relié)
- `Journey` → étapes et liens du flowchart

Statuts de fidélité : VALIDÉ · STRATÉGIE PROPOSÉE · IDÉE À VALIDER · VALIDATION EXPERT REQUISE · RÉFÉRENCE VISUELLE · PHOTO RÉELLE TIZIANA. Chaque élément porte aussi sa **source** (brief, planche IMG-001, audit, proposition…).

## Persistance

Local-first : IndexedDB via Dexie (`src/lib/db.ts`). Tout est enregistré automatiquement (contenus, images importées en blob, positions et dépliage de la mind map) et survit au rechargement. Les données d'origine sont semées au premier lancement (`src/lib/seed/`).
« Données & sauvegarde » (en bas de la barre latérale) : export / import JSON complet (images incluses) et réinitialisation.

**Évolution** : pour un usage multi-utilisateur, remplacer `db.ts` par un adaptateur Supabase/Postgres aux mêmes formes de tables (une table par entité, tableaux d'IDs en colonnes `text[]` ou tables de jointure) et stocker les images dans un bucket. Les vues lisent via `src/lib/hooks.ts` et écrivent via `src/lib/actions.ts` : ce sont les deux seuls points à adapter.

## Ressources intégrées

- 35 images du Drive (`public/library/IMG-001.jpg` … `IMG-035.jpg`, le doublon `IMG_6087 2.jpg` est importé une fois).
- Les captures de comptes tiers (IMG-020 à IMG-035) sont dans « Visuels à classer » : destination non inventée.
- Aucune image n'est classée « Photo réelle Tiziana » : la grille Feed (modèle E) reste vide tant que les photos ne sont pas importées et validées.
- Le document stratégique n'était pas dans les ressources : le contenu provient du brief, des planches et maquettes, et de l'audit des appels (anonymisé). Les manques sont signalés « À RENSEIGNER ».
