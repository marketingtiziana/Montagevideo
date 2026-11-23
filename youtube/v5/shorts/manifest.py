"""Manifeste des Shorts : extraits du rush (temps source, t=0 <=> 1:00:10 de la vidéo brute) + storyboard du panneau animé.

Chaque scène du panneau bas : dict(type=..., t0=<début source>, t1=<fin source>, ...) ; les 'at' sont des temps source
synchronisés sur les mots prononcés (transcription mot à mot). Rien n'est inventé : textes = paroles de l'intervenante.
"""

SHORTS = [
 dict(id="short_01", topic="Résidence fiscale", src=(553.62, 594.50),
      hook="Quitter la France physiquement ne suffit pas à quitter la France fiscalement.",
      idea="La résidence fiscale française dépend de critères (foyer, activité, intérêts économiques), pas de l'endroit où l'on vit.",
      scenes=[
        dict(type="neq", t0=553.6, t1=561.2, kicker="Comprends une chose",
             a=("Physiquement", 556.2, "ok"), b=("Fiscalement", 559.4, "warn"), neq_at=557.8, title="Quitter la France"),
        dict(type="criteria", t0=561.2, t1=570.6, title="Résidence fiscale française", title_at=561.4,
             sub="repose sur plusieurs critères", sub_at=563.4,
             items=[("house", "Ton foyer", 566.1), ("briefcase", "Ton activité", 567.5), ("chart", "Le centre de tes intérêts économiques", 568.8)],
             source="Critères officiels · service-public.gouv.fr"),
        dict(type="anchors", t0=570.6, t1=580.8, title="Tu restes résident français si…",
             items=[("family", "Ta famille reste en France", 571.6), ("briefcase", "Ton activité principale est pilotée depuis la France", 573.4),
                    ("vault", "L'essentiel de ton patrimoine y demeure", 577.7)]),
        dict(type="globe", t0=580.8, t1=588.2, ring_at=581.8, count_at=582.6, km=10000,
             line="… et rester imposable comme résident français", line_at=583.9),
        dict(type="years", t0=588.2, t1=594.5, title="À la clé", title_at=588.3, stamp="Redressement", stamp_at=590.9,
             sub="quand l'administration s'en aperçoit", sub_at=591.7),
      ]),
 dict(id="short_02", topic="Bali ou Thaïlande", src=(273.10, 325.45),
      hook="La confusion entre Bali et la Thaïlande.",
      idea="Même mode de vie sur Instagram, fiscalité opposée : taxation mondiale (Indonésie) vs régime territorial (Thaïlande).", scenes=[]),
 dict(id="short_03", topic="La règle 10-3-5", src=(416.75, 462.55),
      hook="Une expatriation ne se décide jamais sur une théorie fiscale. Jamais !",
      idea="Valider sur le terrain : 10 jours minimum, 3 quartiers, 5 visites immobilières réelles.", scenes=[]),
 dict(id="short_04", topic="Tes deux phases patrimoniales", src=(134.30, 191.55),
      hook="La plupart des gens commencent par la question « quel pays ? ». C'est l'inverse.",
      idea="Le bon pays dépend de ta phase : croissance (coût de structure faible) ou préservation (stabilité).", scenes=[]),
 dict(id="short_05", topic="Les deux erreurs du nouvel expatrié", src=(735.70, 793.10),
      hook="La règle d'or : n'achète pas d'immobilier local en arrivant, jamais la première année.",
      idea="Loue, observe, apprends ; et méfie-toi des placements « spécial expatriés ».", scenes=[]),
 dict(id="short_06", topic="Dubaï ou Singapour", src=(345.05, 381.05),
      hook="Dubaï, tu connais : 0 impôt sur le revenu, 9 % sur les sociétés…",
      idea="Les deux hubs d'excellence : conditions d'entrée et ce qui fait la différence.", scenes=[]),
 dict(id="short_07", topic="La Suisse : deux verdicts", src=(193.80, 228.10),
      hook="Pour un trentenaire en pleine croissance, c'est souvent un mauvais calcul.",
      idea="Même pays, deux verdicts opposés selon ta phase de vie patrimoniale.", scenes=[]),
]
