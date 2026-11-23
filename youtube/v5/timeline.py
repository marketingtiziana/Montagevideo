"""Timeline de montage — « Comment t'expatrier pour enfin quitter la France ? »

Tous les temps « source » sont en secondes locales : t=0 <=> 1:00:10 de la vidéo brute
C028L001_260806BZ - REDUCIDO.mp4 (son : 260806-T001.WAV, décalé de +2,505 s).

Structure de sortie :
  [cold open]  -> [carton titre] -> [corps : segments de edl.py] -> [écran de fin]
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))

FPS = 25
COLD_OPEN = (555.36, 560.58)   # « quitter la France physiquement ne suffit pas à quitter la France fiscalement. »
TITLE_DUR = 3.2                # carton titre (musique seule)
END_DUR = 9.0                  # écran de fin (zones pour les éléments d'écran de fin YouTube)

# Passages à cadrer serré (plan rapproché) : phrases à fort impact
CLOSE = [(681.5, 684.9), (881.5, 884.7)]
# zooms d'emphase (« punch-in ») : temps source du mot accentué
PUNCH = [138.1, 286.2, 420.4, 557.9, 584.4, 744.2, 776.1, 881.6]

# ------------------------------------------------------------------------------------------
# Graphismes. kind :
#   FULL  : plein écran opaque (cache les coupes, la voix continue)
#   SPLIT : la vidéo se réduit à gauche, panneau d'information à droite
#   CARD  : carte dans la zone libre à gauche du plan large (impose le plan large)
#   LT    : synthé (lower third)
# 'at' = temps source des apparitions successives (synchronisées sur les mots)
# ------------------------------------------------------------------------------------------
G = [
 dict(id="title", kind="FULL", tpl="title", out_only=True,
      kicker="La méthode en 5 étapes", title="Comment t'expatrier pour enfin quitter la France"),

 dict(id="lt_name", kind="LT", tpl="lowerthird", src=(60.0, 66.2),
      name="Tiziana", role="Fondatrice du cabinet Fynovates"),

 dict(id="roadmap", kind="SPLIT", tpl="roadmap", src=(85.2, 111.0),
      title="La méthode complète", sub="5 étapes, dans l'ordre",
      steps=["Clarifier ton projet", "Choisir ta destination", "Valider sur le terrain",
             "Sortir de France proprement", "Reconstruire ton patrimoine"],
      at=[90.7, 92.9, 97.5, 108.1, 109.6], hot=3, hot_label="L'étape la plus négligée"),

 dict(id="ch1", kind="FULL", tpl="chapter", src=(122.25, 127.75), n=1, title="Clarifie ton profil avant de choisir un pays"),

 dict(id="phases", kind="SPLIT", tpl="twocol", src=(147.8, 191.6),
      title="Tes deux phases de vie patrimoniale",
      cols=[dict(h="Phase 1 · Croissance", at=150.4,
                 items=[("Tu construis, tu réinvestis tout", 152.8),
                        ("Tu cherches : faible coût de structure", 165.1),
                        ("et fiscalité douce sur l'exploitation", 168.5)]),
            dict(h="Phase 2 · Préservation", at=171.2,
                 items=[("Revente en vue, actifs à protéger", 179.0),
                        ("Priorité : la sécurité, plus la vitesse", 183.3),
                        ("Tu cherches : stabilité juridique, monétaire, institutionnelle", 187.5)])]),

 dict(id="suisse", kind="SPLIT", tpl="mapfly", src=(192.0, 228.2), kicker="Exemple parlant", title="La Suisse",
      cam=[(None, 12.0, 46.0, 1100), (193.1, 8.2, 46.8, 5200), (209.3, 8.2, 46.6, 6200)],
      pins=[("Suisse", 8.23, 46.82, 193.1, True)], hl=["756"],
      cards=[dict(h="Trentenaire en pleine croissance", v="Souvent un mauvais calcul", s="Coût de la vie élevé, bénéfice limité à ce stade", t=196.5, tone="warn"),
             dict(h="Entrepreneur qui prépare une revente", v="L'une des meilleures au monde", s="Plus-values sur titres : exonération possible, sous conditions*", t=213.6, tone="ok"),
             dict(h="Pour un Européen", v="Accessible sans aucun visa", t=220.7),
             dict(h="Même pays", v="Deux verdicts opposés selon ta phase", t=225.2)],
      verify="exonération des plus-values privées en Suisse : conditions ; « sans visa » = libre circulation UE/AELE, permis de séjour requis"),
 dict(id="q_peur", kind="CARD", tpl="quote", src=(233.2, 240.5),
      text="La peur de l'inconnu se traite avec de la méthode, pas avec du courage."),

 dict(id="ch2", kind="FULL", tpl="chapter", src=(246.8, 250.5), n=2, title="Choisis ta famille de destination"),

 dict(id="map1", kind="FULL", tpl="map", src=(257.4, 268.0), focus=None,
      families=[("Asie du Sud", ["Bali", "Bangkok"], 264.4), ("Hubs d'excellence", ["Dubaï", "Singapour"], None),
                ("Préservation", ["Suisse"], None)], intro_at=259.4),

 dict(id="phones", kind="FULL", tpl="phones", src=(273.1, 287.5), kicker="Sur Instagram, c'est le même mode de vie",
      vs_t=284.7, night_t=(286.4, 286.9), verdicts=("Taxation mondiale", "Régime territorial")),

 dict(id="bali_thai", kind="SPLIT", tpl="mapfly", src=(287.5, 334.4), kicker="Fiscalement, le jour et la nuit", title="Bali ou Thaïlande",
      cam=[(None, 106.0, 3.0, 1500), (288.4, 115.2, -8.4, 4200), (315.6, 100.5, 13.7, 3600), (328.9, 101.5, 10.5, 2600)],
      hl=["360", "764"], pins=[("Bali", 115.19, -8.41, 288.4, True), ("Bangkok", 100.50, 13.75, 315.6, True), ("Phuket", 98.39, 7.88, 333.8, False)],
      cards=[dict(h="Indonésie (Bali)", v="Taxation mondiale", s="Résident : imposable sur tous tes revenus, rapatriés ou non", t=290.6, tone="warn"),
             dict(h="Le risque", v="Un passif fiscal qui s'accumule", t=306.9, tone="warn"),
             dict(h="Thaïlande", v="Régime territorial", s="Revenus étrangers non rapatriés : non imposés", t=317.4, tone="ok"),
             dict(h="Budget (estimation)", v="≈ 3 000 €/mois à Bangkok", s="Phuket : nettement plus cher", t=328.9)],
      verify="Indonésie : imposition mondiale des résidents (exceptions possibles depuis 2022) ; Thaïlande : règles modifiées au 1er janvier 2024 ; budget = estimation de l'intervenante"),
 dict(id="map2", kind="FULL", tpl="map", src=(340.0, 345.0), focus=1,
      families=[("Asie du Sud", ["Bali", "Bangkok"], None), ("Hubs d'excellence", ["Dubaï", "Singapour"], 340.1),
                ("Préservation", ["Suisse"], None)]),

 dict(id="dubai_sg", kind="SPLIT", tpl="mapfly", src=(345.0, 381.6), kicker="Famille 2", title="Les hubs d'excellence",
      cam=[(None, 75.0, 16.0, 1300), (345.1, 55.27, 25.2, 4200), (356.6, 103.82, 1.35, 4200), (371.9, 80.0, 14.0, 1350)],
      hl=["784", "702"], pins=[("Dubaï", 55.27, 25.20, 345.1, True), ("Singapour", 103.82, 1.35, 356.6, True)],
      cards=[dict(h="Dubaï", v="0 % d'impôt sur le revenu · 9 % d'IS*", s="* au-delà d'un seuil de bénéfice", t=346.2),
             dict(h="Dubaï", v="Golden visa 10 ans", s="Investissement d'environ 500 000 €", t=350.9),
             dict(h="Singapour", v="Plus exigeante à l'entrée", s="Permis de travail porté par une société locale", t=357.9),
             dict(h="Singapour surclasse Dubaï", v="Sécurité · mixité · qualité de l'air", t=371.9, tone="ok")],
      windows=[dict(img="golden.png", crop=(110, 470, 1560, 820), url="u.ae", t_in=350.9, t_out=356.3, marks=[((150, 550, 560, 645), 351.4), ((150, 650, 1550, 790), 352.4)]),
               dict(img="mom.png", crop=(500, 120, 2380, 1250), url="mom.gov.sg", t_in=362.3, t_out=370.3, marks=[((680, 380, 2200, 680), 364.9)])],
      verify="IS 9 % aux EAU au-delà de 375 000 AED ; golden visa immobilier : 2 M AED (~500 k€) ; Singapour : Employment Pass / EntrePass"),
 dict(id="map3", kind="FULL", tpl="map", src=(381.6, 387.4), focus=2,
      families=[("Asie du Sud", ["Bali", "Bangkok"], None), ("Hubs d'excellence", ["Dubaï", "Singapour"], None),
                ("Préservation", ["Suisse"], 381.7)]),

 dict(id="q_coffre", kind="CARD", tpl="quote", src=(389.6, 393.2), text="Le coffre-fort, pas le tremplin."),
 dict(id="q_calc", kind="CARD", tpl="quote", src=(398.8, 402.3),
      text="Choisis avec ta calculatrice, pas avec ton fil d'actualité."),

 dict(id="ch3", kind="FULL", tpl="chapter", src=(402.5, 407.7), n=3, title="Valide sur le terrain avant de t'engager"),

 dict(id="r1035", kind="SPLIT", tpl="rule", src=(423.0, 462.6), title="La règle 10 · 3 · 5", tat=423.1,
      rows=[("10", "jours minimum sur place", "Pas un week-end prolongé en mode touriste", 425.7),
            ("3", "quartiers différents", "En changeant d'hôtel", 434.2),
            ("5", "visites immobilières réelles", "Pour confronter les prix d'Internet au marché", 448.0)]),

 dict(id="invis", kind="CARD", tpl="checklist", src=(465.8, 506.2), title="Les critères invisibles",
      items=[("Qualité de l'air", 469.9), ("Écoles", 492.5), ("Niveau des soins", 495.3), ("Infrastructures", 499.4)]),

 dict(id="valise", kind="CARD", tpl="stat", src=(507.2, 533.9), kicker="L'exercice de la valise", big="1 semaine",
      sub="avec une seule valise", at2=528.2, line2="Le détachement matériel : la moitié invisible d'une expatriation réussie"),

 dict(id="ch4", kind="FULL", tpl="chapter", src=(534.95, 538.0), n=4, title="Sors de France proprement"),

 dict(id="residence", kind="SPLIT", tpl="statement", src=(553.6, 561.2),
      kicker="Étape 4 · Sors de France proprement", title="Quitter la France physiquement",
      title2="ne suffit pas à la quitter fiscalement.", tat=555.5, t2at=557.2),

 dict(id="broll_domicile", kind="FULL", tpl="macbook", src=(561.2, 570.6), img="dom_full.png", crop=(420, 640, 2460, 1910),
      tab="Comment déterminer son domicile fiscal ? | Service Public",
      marks=[((639, 1060, 2238, 1170), 561.3), ((639, 1221, 2238, 1353), 566.1), ((639, 1557, 2238, 1689), 567.5), ((639, 1725, 2238, 1857), 568.8)],
      source="Source : service-public.gouv.fr · « Comment déterminer son domicile fiscal ? » (vérifié le 1er janvier 2026)",
      verify="capture d'écran d'un site officiel : usage éditorial à valider"),
 dict(id="residence2", kind="SPLIT", tpl="steps", src=(570.6, 580.8), title="Tu restes résident fiscal français si…",
      items=[("Ta famille reste en France", 570.7), ("Ton activité principale reste pilotée depuis la France", 573.2),
             ("L'essentiel de ton patrimoine y demeure", 577.4)], numbered=False, ref="Art. 4 B du CGI",
      verify="référence art. 4 B du CGI ajoutée au montage (non citée à l'oral)"),

 dict(id="globe", kind="FULL", tpl="globe", src=(580.8, 594.5), ring_t=581.7, l1_t=583.7, l2_t=588.3),
 dict(id="sortie", kind="SPLIT", tpl="steps", src=(594.5, 607.9), title="Une sortie de France propre",
      items=[("Transférer réellement ton centre de vie", 598.9), ("Documenter ta nouvelle résidence fiscale", 602.1),
             ("Gérer le sort de ta structure française", 605.2)]),
 dict(id="broll_depart", kind="FULL", tpl="macbook", src=(607.9, 618.8),
      pages=[dict(img="exitsp.png", crop=(1060, 640, 2780, 1500), url="service-public.gouv.fr", t=607.9, tab="Exit tax · Démarches et outils | Service Public",
                  marks=[((1104, 728, 2360, 800), 608.0), ((1160, 936, 2544, 1024), 609.6)],
                  source="Source : service-public.gouv.fr · formulaires « Exit tax » · art. 167 bis du CGI (seuils et conditions à vérifier)"),
             dict(img="depart_full.png", crop=(600, 2900, 2280, 3800), url="service-public.gouv.fr", t=613.2,
                  tab="Impôt sur le revenu d'un Français qui part vivre à l'étranger",
                  marks=[((840, 3079, 1745, 3151), 613.4), ((728, 3207, 2152, 3303), 615.9)],
                  source="Source : service-public.gouv.fr · « Départ et résidence à l'étranger »")],
      verify="exit tax : participations ≥ 50 % des bénéfices sociaux ou valeur > 800 000 €, résidence fiscale française 6 des 10 dernières années ; captures de sites officiels : usage éditorial à valider"),
 dict(id="sortie_b", kind="SPLIT", tpl="steps", src=(618.8, 626.4), title="Chaque élément a un timing",
      items=[("Dans le mauvais ordre : des frictions", 620.8), ("Dans le bon ordre : tout s'emboîte", 623.5)], numbered=False),
 dict(id="validloc", kind="CARD", tpl="chips", src=(627.2, 648.8), kicker="Le réflexe indispensable", title="La validation locale",
      chips=[("Dividendes", 640.9), ("Plus-values", 642.2), ("Revenus de source étrangère", 643.4)],
      foot=("… par un professionnel du pays d'accueil", 645.8)),

 dict(id="coin", kind="FULL", tpl="coin", src=(675.6, 684.9), a="Sortie de France", b="Entrée dans ton nouveau pays",
      l1=("Les deux faces de la même pièce.", 675.7), l2=("Rater l'une, c'est invalider l'autre.", 681.6)),

 dict(id="ch5", kind="FULL", tpl="chapter", src=(685.6, 691.0), n=5, title="Reconstruis ton patrimoine en mode international"),

 dict(id="horsue", kind="SPLIT", tpl="steps", src=(698.2, 728.3), title="En quittant l'Union européenne",
      items=[("Fin de certaines restrictions réglementaires sur les produits d'investissement", 700.5),
             ("Accès à des supports jusque-là fermés aux résidents européens", 707.5),
             ("Souvent avec des frais plus faibles", 715.9),
             ("Dividendes et plus-values : des stratégies parfois bien plus efficaces qu'en France", 718.4)],
      note="Selon le pays d'accueil et ta situation.", numbered=False,
      verify="formulation générale : vérifier selon le pays d'accueil"),

 dict(id="regledor", kind="SPLIT", tpl="yeartrack", src=(737.6, 769.9), title="Pas d'immobilier local la première année",
      t_arrive=743.7, t_no=744.2, t_y1=758.9, t_y23=761.5),
 dict(id="broll_amf", kind="FULL", tpl="macbook", src=(770.2, 788.3),
      pages=[dict(img="amf_full.png", crop=(560, 880, 2780, 2000), url="amf-france.org", t=770.2, tab="Listes noires et mises en garde | AMF",
                  marks=[((740, 977, 2570, 1110), 770.6), ((740, 1705, 2720, 1885), 776.0)],
                  source="Source : amf-france.org · « Listes noires et mises en garde »")],
      verify="capture du site de l'AMF : usage éditorial à valider"),

 dict(id="warn", kind="CARD", tpl="warn", src=(788.3, 793.2), kicker="Attention",
      title="Les placements « spécial expatriés »", sub="Un rendement mirobolant proposé dès ton arrivée",
      at2=788.5, line2="Ton cadre fiscal est un avantage. Il ne rend aucun placement magique."),
 dict(id="recap", kind="FULL", tpl="recap", src=(796.4, 825.2), title="Récapitulons la méthode",
      steps=["Clarifie ta phase patrimoniale", "Choisis ta famille de destination, calculatrice en main",
             "Valide sur le terrain : la règle 10 · 3 · 5", "Sors de France proprement",
             "Reconstruis ton patrimoine, sans précipitation"],
      at=[801.3, 803.8, 809.0, 813.2, 819.9], hot=3, hot_label="Le cœur du réacteur"),

 dict(id="q_constr", kind="CARD", tpl="quote", src=(834.5, 842.45),
      text="Ceux qui improvisent le paient pendant des années. Ceux qui structurent en récoltent les fruits pendant des décennies."),

 dict(id="cta", kind="CARD", tpl="cta", src=(850.5, 881.4), kicker="Réserve un appel avec mon équipe",
      title="Lien dans la description", items=[("Les destinations compatibles avec ton profil", 870.0),
             ("La structure adaptée", 873.3), ("La feuille de route de ta sortie de France", 874.4)]),


 # ---------------------------------------------------------------- V2 : mots-clés cinétiques (plans face caméra)
 dict(id="k_boucle", kind="CARD", tpl="lines", src=(66.2, 71.1), kicker="La même boucle",
      lines=[("Regarder des vidéos", 66.4), ("Comparer des pays", 67.8), ("Rêver un peu…", 68.9), ("… et ne rien faire", 70.0, "accent")]),
 dict(id="k_gouffre", kind="CARD", tpl="lines", src=(71.2, 79.5), kicker="Entre l'envie et le départ",
      lines=[("Un gouffre", 75.9, "accent")], size=96),
 dict(id="k_legal", kind="CARD", tpl="lines", src=(112.3, 120.6), kicker="On peut quitter la France",
      lines=[("Légalement", 114.1), ("Sereinement", 116.0), ("Intelligemment", 117.3), ("Pas n'importe comment", 118.2, "small accent")]),
 dict(id="k_quelpays", kind="CARD", tpl="lines", src=(134.3, 143.6), kicker="L'erreur classique",
      lines=[("« Quel pays ? »", 136.1, "strike", 138.1), ("C'est l'inverse.", 138.3, "accent"), ("Ta phase de vie d'abord", 140.0, "small")]),
 dict(id="k_piege", kind="CARD", tpl="lines", src=(268.0, 273.0), kicker="Attention", lines=[("Un piège énorme", 269.7, "warn")]),
 dict(id="k_insta", kind="CARD", tpl="lines", src=(393.6, 398.7), kicker="Retiens le principe",
      lines=[("Destinations Instagram", 394.0), ("≠ destinations patrimoniales", 395.7, "accent small")]),
 dict(id="k_serieux", kind="CARD", tpl="lines", src=(408.3, 422.9), kicker="La validation terrain",
      lines=[("Projets sérieux", 412.2), ("vs fantasmes", 413.1, "accent"), ("Jamais sur une théorie fiscale.", 418.3, "small")]),
 dict(id="k_importante", kind="CARD", tpl="lines", src=(539.0, 553.5), kicker="Étape 4",
      lines=[("La plus importante", 540.3), ("Expatriation de rêve", 548.5, "small"), ("→ cauchemar fiscal", 549.8, "warn")]),
 dict(id="k_regles", kind="CARD", tpl="lines", src=(649.5, 658.6), kicker="Y compris les miennes",
      lines=[("Règles générales", 650.3), ("≠ analyse de ton cas", 656.2, "accent small")]),
 dict(id="k_2traitements", kind="CARD", tpl="lines", src=(659.4, 675.0), kicker="Même pays",
      lines=[("2 entrepreneurs", 659.5), ("2 traitements fiscaux", 665.1, "accent"), ("Selon la nature de leurs revenus", 668.2, "small")]),
 dict(id="k_horizon", kind="CARD", tpl="lines", src=(692.8, 698.1), kicker="Une fois installé",
      lines=[("Un nouvel horizon", 695.7), ("patrimonial", 696.2, "accent")]),
 dict(id="k_comment", kind="CARD", tpl="lines", src=(728.8, 737.5), kicker="Dis-le-moi en commentaire",
      lines=[("Une vidéo dédiée ?", 731.8)]),
 dict(id="k_fuir", kind="CARD", tpl="lines", src=(825.3, 834.4), kicker="Quitter la France",
      lines=[("Pas une fuite", 826.4, "strike", 827.4), ("Une construction", 828.6, "accent")]),
 dict(id="k_envie", kind="CARD", tpl="lines", src=(847.9, 850.4), kicker="Si tu es prêt",
      lines=[("De l'envie", 849.0), ("au projet", 849.6, "accent")]),

 dict(id="endcard", kind="FULL", tpl="outro", out_only=True, line="La France, tu peux la quitter. Mais quitte-la bien."),
]

def load_edl():
    return [tuple(x) for x in json.load(open(os.path.join(HERE, 'build', 'edl.json')))]
