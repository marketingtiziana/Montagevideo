import os, sys; sys.path.insert(0, os.path.dirname(__file__)); from edl import quantize, SEGMENTS, CUTS
q=quantize(); total=q[-1]["dst_out"]
def tc(s): m=int(s//60); return f"{m:02d}:{s-60*m:05.2f}"
L=[]
L.append("# Rapport de dérushage — reel « LLC américaine : 25 000 $ de pénalité » (version v3 « créateur viral »)\n")
L.append("Source : `reel 15 M.mp4` (1920x1080, 59,94 fps, 120,6 s). Transcription Whisper large-v3 (fr, mot à mot), silences détectés à -35 dB.\n")
L.append(f"**Durée utile après dérushage : {total:.1f} s** (sous les 90 s : pas de coupe narrative nécessaire). Rush brut 120,6 s → 37 s retirés.\n")
L.append("Règles appliquées : coupes sur fins de mots + 2 images (0,07 s) de marge, respirations entre phrases resserrées à ~0,25 s, prise conservée = la dernière.\n")
L.append("## Segments CONSERVÉS (ordre final)\n")
L.append("| # | Source in → out | Durée | Position finale | Contenu |\n|---|---|---|---|---|")
for s in q:
    L.append(f"| {s['label']} | {tc(s['src_in'])} → {tc(s['src_out'])} | {s['src_out']-s['src_in']:.2f} s | {tc(s['dst_in'])} → {tc(s['dst_out'])} | {s['note']} |")
L.append("\n## Plages COUPÉES\n")
L.append("| Source in → out | Durée | Raison |\n|---|---|---|")
for (i,o,r) in CUTS:
    L.append(f"| {tc(i)} → {tc(o)} | {o-i:.2f} s | {r} |")
L.append("""
## Points à valider

1. **Hook** : la phrase d'accroche est dite deux fois (0,0–5,8 s puis 6,6–12,7 s). J'ai gardé la **prise 2** (dernière, plus de niveau). Si tu préfères la prise 1, c'est un simple changement dans `work/scripts/edl.py` (segment A → 0,00–5,85).
2. **« Erreur, erreur »** (57,4–59,5 s) : le mot est dit deux fois d'affilée sans pause. Je l'ai gardé **tel quel** (doublé volontaire, très efficace en reel avec l'effet derrière). Si c'était une reprise, je ne garde que la seconde (58,7–59,5 s).
3. **Fin (105–115 s)** : trois tentatives. Montage retenu : « … déclencher cette pénalité » → « qui est concerné » (prise 2, 107,3–108,6 s) → « Et ce qui doit être vérifié pour ta LLC » (reprise finale, 112,3–114,9 s). Le raccord « concerné / Et ce qui » est un jump cut masqué par un changement d'échelle. Alternative plus simple si ça te gêne : supprimer « qui est concerné ».
4. **« Et c'est précisément là … »** (35,3 s) : le « Et » isolé (0,1 s, suivi d'une pause de 0,7 s) est traité comme un souffle et coupé ; la phrase démarre sur « c'est précisément ».
5. **Texte** : Whisper entend « alors que tu *payes* zéro de chiffre d'affaires » (confiance 0,99) : sous-titré fidèlement, dis-moi si tu veux « tu fais ». À la fin, Whisper entend « *commande* simplement LLC » : j'ai sous-titré « commente simplement LLC » (sens du CTA), à confirmer.
6. **Vérification des coupes** : chaque point de coupe a été contrôlé contre les silences détectés à -38 dB (aucun ne tombe dans un mot ; le seul hors silence est l'entrée du hook, placée dans l'inspiration avant « Tu »).

## Effets motion design v3 (timeline finale)

**B-rolls** : Higgsfield a refusé toute génération (compte en plan gratuit, 0 crédit : « Requires basic plan or higher »). J'ai utilisé à la place des clips **libres de droits (Pexels, via vidIQ)**, sans texte, désaturés à 35 % avec voile sombre, plus une animation « carte du monde » générée en canvas (aucune marque). Fichiers dans `assets/brolls/`. Crédits à mentionner en description : Laura Tancredi (tour de bureaux), Peggy Anke (billets), Karolina Grabowska / kaboompics (signature), Rozi Bizaoui (aile d'avion). Si tu ouvres un plan Higgsfield, les prompts sont prêts dans `work/scripts/plan_fx_v3.py` (même slots).

| Temps | Type | Contenu |
|---|---|---|
| 00,8 → 02,8 s | DERRIÈRE b-roll | tour de bureaux vue en contre-plongée (« LLC américaine ») |
| 03,0 → 06,2 s | DERRIÈRE montant | « 25 000 $ » monospace jaune géant qui traverse |
| 08,8 → 10,2 s | DERRIÈRE b-roll | billets de 50 € (« millions de dollars ») |
| 13,1 → 15,7 s | DERRIÈRE b-roll | main qui signe un document (« obligations déclaratives ») |
| 25,2 → 28,2 s | DERRIÈRE b-roll | carte du monde animée, arcs lumineux (« entrepreneurs francophones ») |
| 38,9 → 41,0 s | DERRIÈRE mot géant | « ERREUR » outline corail |
| 58,1 → 60,6 s | DERRIÈRE b-roll | aile d'avion au-dessus des nuages (« résidence fiscale ») |
| 82,7 → 84,7 s | DERRIÈRE mot géant | « LLC » outline bleu (fin) |

Devant elle : 26 éléments (pills multicolores, cards titre/montant, 3 listes animées, 1 anneau pulsant autour du montant, 1 flèche), soit une apparition toutes les 2 à 4,5 s (contrôle automatique : aucun trou > 4,5 s). Sous-titres 1-2 mots, mots forts seuls en 118 px, couleur par sens (argent jaune/vert, dangers/négations corail, lieux violet, reste bleu). 3 shakes (« surprendre », « pénalité », « vérifie »), 2 whips + 2 flashs (avant « Erreur », avant « Le problème » / « J'ai justement préparé »).

Plan des échelles (punch-in/out à chaque cut) : A 1,00→1,05 · B 1,15→1,18 · C 1,02→1,06 · D1 1,15 · D2 1,00→1,04 · E 1,14→1,18 · F1 1,00→1,04 · F2 1,15→1,17 · G1 1,18 · G2 1,00→1,05 · H1 1,15→1,17 · H2 1,00→1,04 · I 1,12→1,15 · J 1,18 · K 1,02→1,05 · L 1,00→1,04.

## Transcription corrigée (texte des sous-titres)

> Tu savais qu'une LLC américaine peut te coûter 25 000 dollars alors que tu payes zéro de chiffre d'affaires ? Et non, je ne te parle pas d'une LLC qui génère des millions de dollars. Même si ta LLC n'a réalisé aucune vente, certaines obligations déclaratives américaines peuvent quand même s'appliquer, selon la structure, les propriétaires et la situation de l'entreprise. C'est précisément là que beaucoup d'entrepreneurs francophones se font surprendre. Ils créent leur LLC, ouvrent leur compte bancaire, commencent leur activité, puis pensent que, comme ils n'ont pas encore fait de chiffre, ils n'ont rien à déclarer. Erreur, erreur. Certaines déclarations doivent être déposées même lorsqu'il n'y a pas de revenu. Et une pénalité peut s'appliquer en cas de défaut de déclaration. Le problème, c'est que savoir si tu es concerné dépend de plusieurs éléments : le type de LLC, tes associés, leur résidence fiscale et la manière dont la société est structurée. Donc avant de laisser ta LLC dormir pendant que tout va bien, vérifie tes obligations. J'ai justement préparé une vidéo qui t'explique quelles obligations peuvent déclencher cette pénalité, qui est concerné et ce qui doit être vérifié pour ta LLC. Si tu veux recevoir la vidéo directement en DM, commente simplement LLC sous cette vidéo.
""")
open("/home/user/Montagevideo/output/derush-report.md","w").write("\n".join(L))
print("report ok")
