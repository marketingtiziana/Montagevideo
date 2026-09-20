/**
 * CONTENU DES 16 SLIDES - Carousel "Moyen-Orient"
 *
 * Textes valides, colles tels quels, sans aucune reformulation.
 *
 * MARQUAGE TYPOGRAPHIQUE
 *   **texte**  -> Inter Black 900, encre   (chiffres cles)
 *   *texte*    -> Inter 600, encre         (noms propres et termes techniques)
 *   texte nu   -> Inter 400, gris secondaire
 *
 * GABARITS
 *   'A'   couverture                      (slide 1)
 *   'B'   texte seul sur fond plein       (majorite)
 *   'C'   bandeau illustration + texte    (slides 2, 3, 5, 9, 15)
 *   'CTA' fond indigo plein               (slide 16)
 *
 * BLOCS `body`
 *   { p: "paragraphe" }
 *   { ul: [...] }              -> puces carrees indigo 8x8
 *   { ol: [...] }              -> liste numerotee, numeros indigo
 *   { schema: { type: ... } }  -> schema de donnees, voir schemas.js
 *
 * `sources` affiche une ligne discrete en bas de slide. Les URL des sources
 * ne sont pas imprimees : elles ne sont pas cliquables sur une image.
 */

const PROVISOIRE = false;

module.exports = {
  PROVISOIRE,
  slides: [
    {
      "n": 1,
      "tpl": "A",
      "img": "img-01-cover.jpg",
      "title": "Pourquoi le Moyen-Orient va avoir un impact sur ton business en ligne.",
      "subtitle": "Même si tu vends du 100% digital."
    },
    {
      "n": 2,
      "tpl": "C",
      "img": "img-02-detroit.jpg",
      "title": "Ce qui se passe, en 30 secondes",
      "body": [
        {
          "p": "Le détroit d'*Ormuz* est largement bloqué depuis le **28 février 2026**, après le déclenchement de la guerre aérienne américano-israélienne contre l'Iran. Avant le conflit, environ **25%** du pétrole transporté par voie maritime dans le monde y passait."
        },
        {
          "p": "L'*Agence internationale de l'énergie* parle de la plus importante rupture d'approvisionnement de toute l'histoire du marché pétrolier mondial."
        },
        {
          "p": "Et le **11 septembre**, l'Arabie saoudite a fermé son oléoduc Est-Ouest après des attaques de drones. C'était précisément la route de contournement du détroit."
        },
        {
          "p": "Tu ne vends pas de pétrole. Tu vas quand même le payer."
        }
      ],
      "sources": [
        "Wikipedia",
        "euronews"
      ]
    },
    {
      "n": 3,
      "tpl": "C",
      "img": "img-03-pompe.jpg",
      "title": "Canal 1 : le prix de l'énergie arrive jusqu'à ton client",
      "body": [
        {
          "p": "Le *Brent* a dépassé **108 dollars** le baril. À la pompe en France, le *SP95* était à **2,12€** le litre début septembre."
        },
        {
          "p": "Ce que ça déclenche, dans l'ordre :"
        },
        {
          "schema": {
            "type": "flow",
            "items": [
              "carburant",
              "transport",
              "alimentation",
              "factures",
              "budget disponible de ta cliente"
            ]
          }
        },
        {
          "p": "Un ménage qui paie **80€** de plus par mois en carburant et en courses ne coupe pas son loyer."
        },
        {
          "p": "Il coupe ton programme à **997€**."
        }
      ],
      "sources": [
        "euronews",
        "franceinfo"
      ]
    },
    {
      "n": 4,
      "tpl": "B",
      "title": "Canal 2 : tes coûts d'acquisition vont monter",
      "body": [
        {
          "p": "Attention, ce n'est pas le *CPM* qui explose. C'est le taux de conversion qui baisse."
        },
        {
          "p": "Le mécanisme :"
        },
        {
          "schema": {
            "type": "flow",
            "items": [
              "Même budget pub",
              "mêmes impressions",
              "moins de clics qui achètent",
              "coût par client plus élevé"
            ]
          }
        },
        {
          "p": "Tu ne verras pas \"crise géopolitique\" dans ton *Gestionnaire de publicités*. Tu verras juste un *CPA* qui grimpe sans raison apparente, et tu croiras que c'est ta créa."
        },
        {
          "p": "Ce n'est pas ta créa."
        }
      ]
    },
    {
      "n": 5,
      "tpl": "C",
      "img": "img-05-fret.jpg",
      "title": "Canal 3 : si tu vends du physique, c'est direct",
      "body": [
        {
          "p": "Les taux de fret Asie-Europe du Nord tournent autour de **4 300 $** par conteneur, Asie-Méditerranée autour de **4 200 $**. Ils ont baissé récemment, mais restent respectivement plus de **20%** et **50%** au-dessus des niveaux d'avant la haute saison."
        },
        {
          "p": "Le retour vers la *mer Rouge* et *Suez* n'est normalisé qu'à hauteur de **27%**. Le contournement par le *cap de Bonne-Espérance* ajoute **10 à 14 jours** de transit sur l'Asie-Europe."
        },
        {
          "p": "Traduction pour un e-commerce : ta marge unitaire baisse, et ton délai de livraison client s'allonge de deux semaines."
        }
      ],
      "sources": [
        "freightos",
        "globalmaritimehub",
        "suaidglobal"
      ]
    },
    {
      "n": 6,
      "tpl": "B",
      "title": "Canal 4 : le calendrier de ton Q4 est décalé",
      "body": [
        {
          "p": "Si tu lances une offre physique pour les fêtes, la règle a changé."
        },
        {
          "p": "Ce qui fonctionnait : commander en octobre, vendre en décembre."
        },
        {
          "p": "Ce qui fonctionne maintenant :"
        },
        {
          "ul": [
            "commander **6 à 8 semaines** plus tôt",
            "provisionner une hausse de coût de transport dans ton prix de vente, pas dans ta marge",
            "annoncer des délais longs avant la commande, pas après"
          ]
        },
        {
          "p": "Un délai annoncé est une contrainte. Un délai subi est un remboursement."
        }
      ]
    },
    {
      "n": 7,
      "tpl": "B",
      "title": "Canal 5 : les offres qui tiennent, et celles qui tombent",
      "body": [
        {
          "p": "En contraction de pouvoir d'achat, ce n'est pas un effondrement uniforme. C'est un tri."
        },
        {
          "schema": {
            "type": "columns",
            "items": [
              {
                "title": "Ce qui résiste",
                "items": [
                  "ce qui fait gagner ou récupérer de l'argent, de façon chiffrable",
                  "ce qui règle une obligation (légale, fiscale, administrative)",
                  "ce qui coûte moins cher que l'alternative"
                ]
              },
              {
                "title": "Ce qui souffre",
                "items": [
                  "le développement personnel non mesurable",
                  "les programmes longs et chers sans résultat daté",
                  "le \"confort\" et l'aspirationnel"
                ]
              }
            ]
          }
        },
        {
          "p": "Même produit, même prix. Ce qui change, c'est comment tu le formules."
        }
      ]
    },
    {
      "n": 8,
      "tpl": "B",
      "title": "Ce que tu changes dans ta promesse cette semaine",
      "body": [
        {
          "schema": {
            "type": "versus",
            "items": [
              {
                "kind": "no",
                "text": "\"Reprends confiance en toi et développe ton activité\""
              },
              {
                "kind": "yes",
                "text": "\"Signe **3 clients en 60 jours**, ou je continue gratuitement\""
              }
            ]
          }
        },
        {
          "p": "En période tendue, on n'achète plus une transformation. On achète un retour sur investissement daté."
        },
        {
          "p": "Trois éléments à ajouter dans ta page de vente :"
        },
        {
          "ul": [
            "un chiffre",
            "une échéance",
            "une garantie ou une contrepartie"
          ]
        }
      ]
    },
    {
      "n": 9,
      "tpl": "C",
      "img": "img-09-dubai.jpg",
      "title": "Le sujet dont personne ne parle : Dubaï",
      "body": [
        {
          "p": "Une bonne partie des entrepreneurs francophones du digital sont structurés aux Émirats, ou envisagent de s'y installer."
        },
        {
          "p": "Deux choses arrivent en même temps :"
        },
        {
          "ol": [
            "Une zone en conflit, avec un risque opérationnel et bancaire réel",
            "Un régime fiscal qui se durcit sérieusement en **2026**"
          ]
        },
        {
          "p": "Et le deuxième point est bien plus concret que le premier."
        }
      ]
    },
    {
      "n": 10,
      "tpl": "B",
      "title": "Dubaï : le 0% n'existe plus tout seul",
      "body": [
        {
          "p": "Le taux est de **9%** sur les bénéfices au-dessus de **375 000 AED**, et une licence en *free zone* ne donne pas le **0%** à elle seule : il faut des activités qualifiantes, de la substance réelle, et respecter le test *de minimis*."
        },
        {
          "p": "Le seuil *de minimis* : les revenus non qualifiants ne doivent pas dépasser **5%** du chiffre d'affaires total ou **5 millions AED**, le plus faible des deux. Et les états financiers audités sont désormais obligatoires."
        },
        {
          "p": "Et si tu perds le statut, tu ne le perds pas un an. Tu passes à **9%** pour l'année en cours et les quatre suivantes."
        },
        {
          "p": "Une seule facture mal classée peut coûter cinq ans de régime."
        }
      ],
      "sources": [
        "ancova-associates",
        "youngandright",
        "solandworld"
      ]
    },
    {
      "n": 11,
      "tpl": "B",
      "title": "L'échéance que presque personne n'a vue",
      "body": [
        {
          "p": "Le *Small Business Relief*, qui permet aux entreprises sous **3 millions AED** de chiffre d'affaires d'être traitées comme n'ayant aucun revenu imposable, ne s'applique que jusqu'aux exercices se terminant au **31 décembre 2026**."
        },
        {
          "p": "Les exercices qui se terminent après cette date ne peuvent plus l'utiliser. Et ce régime n'est pas cumulable avec le statut *QFZP* : il faut choisir l'un ou l'autre."
        },
        {
          "p": "Ça, c'est dans trois mois."
        },
        {
          "p": "Si ta structure repose dessus, la question n'est pas \"est-ce que je pars\". C'est \"qu'est-ce que je fais avant le 31 décembre\"."
        }
      ],
      "sources": [
        "corporatetaxuae",
        "solandworld"
      ]
    },
    {
      "n": 12,
      "tpl": "B",
      "title": "La vraie leçon : la géographie n'est plus un plan",
      "body": [
        {
          "p": "Pendant dix ans, le discours était simple : tu poses ta société dans un pays à **0%**, tu gardes tout."
        },
        {
          "p": "Ce que **2026** démontre :"
        },
        {
          "ul": [
            "un pays à **0%** peut devenir un pays à **9%** avec conditions",
            "une zone stable peut devenir une zone de conflit",
            "un régime favorable peut avoir une date d'expiration"
          ]
        },
        {
          "p": "Ce qui protège un business en ligne, ce n'est pas le pays choisi. C'est la capacité à changer de structure sans tout casser."
        }
      ]
    },
    {
      "n": 13,
      "tpl": "B",
      "title": "Le test de résilience en 5 questions",
      "body": [
        {
          "p": "Réponds honnêtement :"
        },
        {
          "ol": [
            "Si tes coûts d'acquisition montent de **30%** le mois prochain, tu tiens combien de mois ?",
            "Quelle part de ton chiffre est récurrente ?",
            "Tes clients sont-ils dans une seule zone monétaire ?",
            "Ton offre fait-elle gagner de l'argent, ou en coûte-t-elle ?",
            "Ta structure dépend-elle d'un régime avec une date de fin ?"
          ]
        },
        {
          "p": "Une seule réponse inconfortable, c'est un chantier. Trois, c'est une priorité."
        }
      ]
    },
    {
      "n": 14,
      "tpl": "B",
      "title": "Les 4 actions concrètes",
      "body": [
        {
          "ol": [
            "Reformule ta promesse en résultat chiffré et daté. Aujourd'hui.",
            "Monte ta part de récurrent. Objectif **30%** du chiffre d'affaires.",
            "Vérifie ta date de fin de régime si tu es structurée hors de France. Mets-la dans ton agenda.",
            "Constitue **3 mois** de charges fixes en trésorerie. Pas 3 mois de train de vie. **3 mois de charges**."
          ]
        },
        {
          "p": "Aucune de ces quatre actions ne dépend de ce que fera l'Iran le mois prochain."
        }
      ]
    },
    {
      "n": 15,
      "tpl": "C",
      "img": "img-15-final.jpg",
      "title": "À retenir",
      "body": [
        {
          "p": "Tu ne contrôles pas le prix du baril."
        },
        {
          "p": "Tu contrôles ta promesse, ta part de récurrent, ta trésorerie et ta structure."
        },
        {
          "p": "Les business qui sortent grandis d'une période comme celle-ci ne sont pas ceux qui l'avaient prévue."
        },
        {
          "p": "Ce sont ceux qui étaient déjà construits pour encaisser."
        }
      ]
    },
    {
      "n": 16,
      "tpl": "CTA",
      "title": "Abonne-toi pour la suite."
    }
  ]
};
