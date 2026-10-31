# EDL : plages SOURCE conservées (secondes), dans l'ordre final.
# Chaque entrée : (in, out, label, note). Les coupes internes (resserrage des pauses) sont des entrées séparées.
FPS = 30
SEGMENTS = [
    (6.55,  16.72, "A",  "Hook (prise 2) + « Et non, je ne te parle pas d'une LLC qui génère des millions »"),
    (19.03, 31.74, "B",  "« Même si ta LLC n'a réalisé aucune vente … situation de l'entreprise »"),
    (35.92, 42.05, "C",  "« C'est précisément là que beaucoup d'entrepreneurs francophones se font surprendre »"),
    (44.70, 46.50, "D1", "« Ils créent leur LLC »"),
    (46.72, 54.85, "D2", "« Ouvrent leur compte bancaire … ils n'ont rien à déclarer »"),
    (57.35, 59.45, "E",  "« Erreur, erreur »"),
    (62.10, 66.88, "F1", "« Certaines déclarations doivent être déposées même lorsqu'il n'y a pas de revenu »"),
    (67.64, 72.55, "F2", "« Et une pénalité peut s'appliquer en cas de défaut de déclaration »"),
    (75.08, 76.14, "G1", "« Le problème »"),
    (76.71, 87.15, "G2", "« c'est que savoir si tu es concerné … dont la société est structurée »"),
    (89.28, 92.28, "H1", "« Donc avant de laisser ta LLC dormir pendant »"),
    (93.09, 96.25, "H2", "« que tout va bien, vérifie tes obligations »"),
    (98.05, 105.06,"I",  "« J'ai justement préparé une vidéo … déclencher cette pénalité »"),
    (107.28,108.80,"J",  "« qui est concerné » (prise 2)"),
    (112.47,115.20,"K",  "« Et ce qui doit être vérifié pour ta LLC » (reprise finale)"),
    (115.42,120.56,"L",  "« Si tu veux recevoir la vidéo directement en DM, commente simplement LLC sous cette vidéo »"),
]
CUTS = [
    (0.00, 6.55,   "Prise 1 du hook (phrase répétée à l'identique) : on garde la prise 2, plus énergique"),
    (16.72, 19.03, "Blanc 2,3 s"),
    (31.74, 35.92, "Blanc 3,6 s + souffle/« Et » isolé (0,1 s) à 35,3 s : on reprend sur « c'est précisément »"),
    (42.05, 44.70, "Blanc 2,7 s"),
    (46.50, 46.72, "Pause 0,4 s resserrée à ~0,2 s"),
    (54.85, 57.35, "Blanc 2,6 s"),
    (59.45, 62.10, "Blanc 2,8 s"),
    (66.88, 67.64, "Pause 1,0 s resserrée à ~0,25 s"),
    (72.55, 75.08, "Blanc 2,6 s"),
    (76.14, 76.71, "Pause 0,8 s resserrée à ~0,25 s (« Le problème … c'est que »)"),
    (87.15, 89.28, "Blanc 2,2 s"),
    (92.28, 93.09, "Hésitation 1,0 s dans la phrase (« dormir pendant … que tout va bien ») resserrée"),
    (96.25, 98.05, "Blanc 2,0 s"),
    (105.06,107.28,"Blanc 0,8 s + « Qui est concernée » (prise 1 abandonnée)"),
    (108.80,112.47,"« et ce que doit vérifier … ta LLC » (prise 2 de la fin, refaite ensuite) + blanc 1,1 s"),
    (115.20,115.42,"Pause 0,5 s resserrée à ~0,25 s"),
    (120.56,120.64,"Fin du fichier"),
]
def quantize():
    """Durées quantifiées sur la grille 30 fps ; retourne liste de dicts avec positions finales."""
    out=[]; t=0.0
    for (i,o,l,n) in SEGMENTS:
        nf = int(round((o-i)*FPS)); d = nf/FPS
        out.append({"src_in":i,"src_out":i+d,"label":l,"note":n,"dst_in":t,"dst_out":t+d,"frames":nf})
        t += d
    return out
if __name__=="__main__":
    import json
    q=quantize(); print(json.dumps(q,ensure_ascii=False,indent=1)); print("TOTAL", q[-1]["dst_out"])
