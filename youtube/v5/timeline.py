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
END_DUR = 8.0                  # écran de fin (zones pour les éléments d'écran de fin YouTube)

# Passages à cadrer serré (plan rapproché) : phrases à fort impact
CLOSE = [(138.0, 139.3), (416.7, 421.2), (681.5, 684.9), (825.3, 834.4), (881.5, 884.7)]

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
      name="Tiziana", role="Expatriation & fiscalité internationale", verify="intitulé du synthé à valider"),

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

 dict(id="suisse", kind="SPLIT", tpl="verdict", src=(192.0, 228.2),
      title="Exemple : la Suisse", foot_at=225.2, foot="Même pays, deux verdicts opposés selon ta phase.",
      left=dict(h="Trentenaire en pleine croissance", at=193.9, verdict="Souvent un mauvais calcul", vat=196.5,
                items=[("Coût de la vie élevé", 202.9), ("Bénéfice limité à ce stade", 206.6)], tone="warn"),
      right=dict(h="Entrepreneur qui prépare une revente", at=209.3, verdict="L'une des meilleures au monde", vat=213.6,
                 items=[("Plus-values sur titres : exonération possible, sous conditions*", 216.0),
                        ("Accessible à un Européen sans visa", 220.7)], tone="ok"),
      note="* Selon la situation (gains en capital privés). À vérifier au cas par cas.",
      verify="exonération des plus-values privées en Suisse : conditions ; « sans visa » = libre circulation UE/AELE, permis de séjour requis"),

 dict(id="q_peur", kind="CARD", tpl="quote", src=(233.2, 240.5),
      text="La peur de l'inconnu se traite avec de la méthode, pas avec du courage."),

 dict(id="ch2", kind="FULL", tpl="chapter", src=(246.8, 250.5), n=2, title="Choisis ta famille de destination"),

 dict(id="map1", kind="FULL", tpl="map", src=(257.4, 268.0), focus=None,
      families=[("Asie du Sud", ["Bali", "Bangkok"], 264.4), ("Hubs d'excellence", ["Dubaï", "Singapour"], None),
                ("Préservation", ["Suisse"], None)], intro_at=259.4),

 dict(id="bali_thai", kind="SPLIT", tpl="compare", src=(273.1, 334.4),
      title="Bali ou Thaïlande : même mode de vie, fiscalité opposée", tat=284.6,
      left=dict(h="Indonésie (Bali)", at=288.4, rows=[("Taxation mondiale", 290.6),
                ("Résident fiscal : imposable sur tous tes revenus, rapatriés ou non", 294.8),
                ("Risque : un passif fiscal qui s'accumule", 306.9)], tone="warn"),
      right=dict(h="Thaïlande", at=315.6, rows=[("Régime territorial, basé sur le rapatriement", 317.4),
                 ("Revenus étrangers non rapatriés : non imposés", 321.3)], tone="ok"),
      foot=[("Budget : ≈ 3 000 €/mois pour bien vivre à Bangkok", 328.9), ("Phuket : nettement plus cher", 334.6)],
      verify="Indonésie : imposition mondiale des résidents (exceptions possibles depuis 2022) ; Thaïlande : règles sur les revenus étrangers rapatriés modifiées au 1er janvier 2024 ; budget = estimation de l'intervenante"),

 dict(id="map2", kind="FULL", tpl="map", src=(340.0, 345.0), focus=1,
      families=[("Asie du Sud", ["Bali", "Bangkok"], None), ("Hubs d'excellence", ["Dubaï", "Singapour"], 340.1),
                ("Préservation", ["Suisse"], None)]),

 dict(id="dubai_sg", kind="SPLIT", tpl="compare", src=(345.0, 381.6),
      title="Les hubs d'excellence", tat=345.0,
      left=dict(h="Dubaï", at=345.1, rows=[("0 % d'impôt sur le revenu", 346.2), ("9 % d'impôt sur les sociétés*", 348.4),
                ("Golden visa 10 ans : investissement d'environ 500 000 €", 350.9)], tone="gold"),
      right=dict(h="Singapour", at=356.6, rows=[("Plus exigeante à l'entrée", 357.9),
                 ("Permis de travail porté par une société locale", 364.7)], tone="gold"),
      foot=[("Singapour surclasse Dubaï sur : sécurité · mixité culturelle · qualité de l'air", 371.9)],
      note="* Au-delà d'un seuil de bénéfice. Montants indicatifs, à vérifier.",
      verify="IS 9 % aux EAU au-delà de 375 000 AED de bénéfice ; golden visa immobilier : seuil 2 M AED (~500 k€) ; Singapour : Employment Pass / EntrePass"),

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

 dict(id="broll_domicile", kind="FULL", tpl="broll", src=(561.2, 570.6), shot="domicile",
      marks=[("intro", 561.3), ("foyer", 566.1), ("travail", 567.5), ("centre", 568.8)],
      source="Source : service-public.gouv.fr · « Comment déterminer son domicile fiscal ? » (vérifié le 1er janvier 2026)",
      verify="capture d'écran d'un site officiel : usage éditorial à valider"),

 dict(id="residence2", kind="SPLIT", tpl="steps", src=(570.6, 594.5), title="Tu restes résident fiscal français si…",
      items=[("Ta famille reste en France", 570.7), ("Ton activité principale reste pilotée depuis la France", 573.2),
             ("L'essentiel de ton patrimoine y demeure", 577.4)], numbered=False,
      punch=("Tu peux vivre à 10 000 km et rester imposable comme résident français", 580.9),
      foot=("À la clé : des années de redressement", 588.3), ref="Art. 4 B du CGI",
      verify="référence art. 4 B du CGI ajoutée au montage (non citée à l'oral)"),

 dict(id="sortie", kind="SPLIT", tpl="steps", src=(594.5, 626.4), title="Une sortie de France propre",
      items=[("Transférer réellement ton centre de vie", 598.9), ("Documenter ta nouvelle résidence fiscale", 602.1),
             ("Gérer le sort de ta structure française", 605.2),
             ("Anticiper l'exit tax si tu détiens des participations importantes*", 608.0),
             ("Faire les bonnes déclarations, la bonne année", 613.4)],
      foot=("Chaque élément a un timing.", 618.9),
      note="* Exit tax : article 167 bis du CGI. Seuils et conditions à vérifier.",
      verify="exit tax : participations ≥ 50 % des bénéfices sociaux ou valeur > 800 000 €, résidence fiscale française 6 des 10 dernières années"),

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

 dict(id="regledor", kind="SPLIT", tpl="steps", src=(737.6, 769.9), title="La règle d'or du nouvel expatrié",
      items=[("Pas d'immobilier local en arrivant, jamais la première année", 743.7),
             ("Loue, observe, apprends", 758.9), ("La pierre locale : l'année 2 ou 3", 761.5)], numbered=False),

 dict(id="warn", kind="CARD", tpl="warn", src=(770.2, 793.2), kicker="Attention",
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

 dict(id="endcard", kind="FULL", tpl="endcard", out_only=True, line="La France, tu peux la quitter. Mais quitte-la bien."),
]

def load_edl():
    return [tuple(x) for x in json.load(open(os.path.join(HERE, 'build', 'edl.json')))]
