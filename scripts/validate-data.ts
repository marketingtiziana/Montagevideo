/**
 * Vérifications de cohérence du contenu (`pnpm validate`) :
 * identifiants uniques, liens valides, aucun tiret cadratin, pas de nœud orphelin.
 */
import { mindmap } from '../data/mindmap';

const errors: string[] = [];
const ids = new Set<string>();

for (const node of mindmap.nodes) {
  if (ids.has(node.id)) errors.push(`Identifiant en double : ${node.id}`);
  ids.add(node.id);
  if (!mindmap.clusters.some((c) => c.id === node.cluster)) errors.push(`Cluster inconnu pour ${node.id} : ${node.cluster}`);
  const texts = [node.title, node.details, 'body' in node ? node.body : '', 'caption' in node ? node.caption ?? '' : ''];
  if ('who' in node) texts.push(node.who, node.does, node.role);
  for (const t of texts) {
    if (t.includes('—')) errors.push(`Tiret cadratin dans ${node.id}`);
  }
}

if (!ids.has(mindmap.rootId)) errors.push(`Nœud racine introuvable : ${mindmap.rootId}`);

const linked = new Set<string>([mindmap.rootId]);
const edgeIds = new Set<string>();
for (const edge of mindmap.edges) {
  if (edgeIds.has(edge.id)) errors.push(`Lien en double : ${edge.id}`);
  edgeIds.add(edge.id);
  if (!ids.has(edge.source)) errors.push(`Lien ${edge.id} : source inconnue ${edge.source}`);
  if (!ids.has(edge.target)) errors.push(`Lien ${edge.id} : cible inconnue ${edge.target}`);
  if (edge.label?.includes('—')) errors.push(`Tiret cadratin dans le lien ${edge.id}`);
  linked.add(edge.source);
  linked.add(edge.target);
}
for (const id of ids) {
  if (!linked.has(id)) errors.push(`Nœud orphelin (aucun lien) : ${id}`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${mindmap.nodes.length} nœuds, ${mindmap.edges.length} liens, ${mindmap.clusters.length} clusters : contenu cohérent.`);
