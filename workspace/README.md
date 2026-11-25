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
