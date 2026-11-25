# Fynovates × Tiziana — Guide stratégique & créatif

Site de référence, en lecture seule, pour produire les contenus de **Fynovates** (cabinet) et de **Tiziana / Madame Caci** (personal branding). Il ne fait pas de suivi : pas de statuts de production, pas de données, pas d'édition.

## Lancer

```bash
cd workspace
npm install
npm run dev        # http://localhost:5173
npm run build      # site statique dans dist/ (déployé par Vercel via vercel.json à la racine)
```

## Contenu

| Rubrique | Pages |
|---|---|
| Accueil | Vue d'ensemble, carte stratégique (mind map à 15 territoires) |
| Stratégie | Fynovates, Tiziana, problématiques prospects (piliers A–F), parcours de conversion |
| Plateformes | YouTube / Instagram / TikTok / LinkedIn Fynovates, Instagram / LinkedIn Tiziana : rôle, règles, idées, références |
| Direction artistique | Chartes (codes couleur, typographies, codes graphiques, à faire / interdit, exemples), templates, galerie visuelle |
| Idées de contenus | Long formats YouTube (dispositifs iPad + facecam, télévision + facecam, débunkage, motion + voix off, expert + motion), idées par plateforme, déclinaisons |

## Où modifier le contenu

Tout le contenu est dans `src/lib/seed/` :

- `brands.ts`, `channels.ts` : stratégie des marques et des plateformes
- `da.ts` : chartes (couleurs, typographies, règles)
- `longform.ts` : dispositifs de tournage et idées de long formats
- `contents.ts` : idées de posts (FN-xxx, TZ-xxx, DB-xxx)
- `problems.ts` : problématiques prospects
- `images.ts` : références visuelles (`public/library/IMG-xxx.jpg`)
- `strategy.ts` : parcours de conversion, règles, déclinaisons

Chaque élément porte sa source et un statut (validé, proposition, à valider par un expert). Les manques sont affichés « À RENSEIGNER ».

## Notes

- Les codes couleur Fynovates ont été relevés sur les maquettes fournies. Les tonalités Tiziana sont indicatives (relevées sur des photographies).
- Le nom exact de la police Fynovates n'est pas dans les ressources : À CONFIRMER.
- Aucune image n'est présentée comme une photo réelle de Tiziana. Les captures de comptes tiers sont des inspirations uniquement.
- Le document stratégique n'était pas dans les ressources : le contenu vient du brief, des planches et maquettes, et de l'audit des appels clients (anonymisé).

## Brand Strategy (playbooks éditables)

Section **Brand Strategy** du menu : trois espaces indépendants, plus les guidelines des assets.

| Espace | Source |
|---|---|
| FYNOVATES — Corporate Brand Playbook | `brand/FYNOVATES_CORPORATE_BRAND_PLAYBOOK.md` |
| TIZIANA — Personal Brand Playbook | `brand/TIZIANA_PERSONAL_BRAND_PLAYBOOK.md` |
| Brand Alignment | `brand/FYNOVATES_TIZIANA_BRAND_ALIGNMENT.md` |
| Guidelines des assets | `brand/BRAND_ASSETS_GUIDELINES.md` |
| Registre d'approbation | `brand/BRAND_APPROVAL_REGISTER.md` (état initial) + vue dans l'app |

Fonctions :
- Lire, modifier une section (Markdown, sauvegarde automatique) et changer son statut de contenu (CONFIRMÉ, RECOMMANDATION, HYPOTHÈSE, À VALIDER).
- Ajouter des notes et des références : fichiers importés, images de la galerie, liens. Une référence peut être marquée « asset approuvé ».
- Répondre aux champs « À VALIDER » et les marquer résolus.
- Passer une section en revue ou l'approuver. Une section modifiée après approbation repasse automatiquement en revue.
- Comparer les versions d'une section et restaurer une version précédente.
- Exporter en Markdown (avec ou sans notes) et en PDF (impression du navigateur). Exporter le registre.
- Rechercher dans les trois documents, depuis la page Brand Strategy ou la recherche globale (⌘K).

Persistance : IndexedDB, dans `src/lib/brand/store.ts`. Les fichiers Markdown sont la version 1.0. Une section non modifiée dans l'app suit le fichier ; une section modifiée garde la version de l'app.

Rôles : lecteur, éditeur, valideur. Le rôle est choisi localement dans le navigateur. **Ce n'est pas un système d'authentification** : pour des permissions réelles, il faut un backend avec comptes.

### Contexte de marque (IA)

`src/lib/brand/context.ts` choisit le contexte selon le type de contenu :
- **corporate** : publications, scripts, présentations, documents, communications commerciales et visuels FYNOVATES ;
- **personnel** : posts, vidéos, discours, interviews, leadership et photographie de Tiziana ;
- **alignement** : toujours ajouté.

Il compile ensuite un pack Markdown, à partir de l'état actuel des playbooks, avec les règles d'attribution. L'app ne contient pas d'outil de génération IA : ce pack est le point de branchement. On peut le copier ou le télécharger depuis **Brand Strategy → Contexte de marque**, et chaque fiche d'idée ou de long format y renvoie avec le bon contexte.

## Mindmap Studio (présentations iPad)

Deux cartes mentales de présentation pour les vidéos iPad + facecam : `#/mindmaps`.

- **Données** : JSON structuré, source de vérité — `output/mindmaps/01-quitter-la-france/mindmap.json` et `output/mindmaps/02-residence-fiscale/mindmap.json` (branches, nœuds, notes de script, notes privées, registre des affirmations avec juridiction / date / source / référence / lien / statut).
- **Présentation** `#/mindmaps/:id/present` : scène fixe 2048 × 1536 (4:3) mise à l’échelle sans déformation. Modes Vue d’ensemble, Focus, Présentateur ; toucher une branche / un nœud / le centre ; pincer pour zoomer, glisser pour se déplacer ; précédent / suivant ; plein écran ; « Masquer » cache les contrôles (coin supérieur droit pour les rappeler) ; animations désactivables.
- **Éditeur** `#/mindmaps/:id/edit` : titres, branches et nœuds (ajout, suppression, réordonnancement), notes, sources, statuts, aperçu en direct, versions et restauration. Stockage local (IndexedDB). Seul le rôle « valideur » peut passer une affirmation en `VALIDATED`.
- **Exports** : depuis le studio (PDF via impression, PNG, SVG, JSON, notes, sources) ou en ligne de commande :

  ```bash
  npm run build && npx vite preview --port 4173 &
  npm run export:mindmaps
  ```

  Génère `overview.png`, `mindmap.pdf`, `mindmap.svg`, `speaker_notes.md`, `sources.md` dans chaque dossier. Les notes privées du présentateur ne figurent dans aucun export (elles restent seulement dans le JSON source).
- **Logo** : `public/brand/fynovates-wordmark-white.png`, extrait tel quel de la bannière IMG-010 (pas de redessin). À remplacer par les fichiers officiels vectoriels dès qu’ils sont fournis.
- **Règle fiscale** : aucun taux, seuil, délai ni montant. Les affirmations restent `PENDING VALIDATION` ou `RESEARCH REQUIRED` tant qu’un professionnel ne les a pas vérifiées ; les liens officiels sont « À RENSEIGNER ».
