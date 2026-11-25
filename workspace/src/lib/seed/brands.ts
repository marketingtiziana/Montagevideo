import type { Brand, Pillar } from '../types'
import { section } from './helpers'

export const brands: Brand[] = [
  {
    id: 'FN',
    name: 'Fynovates',
    descriptor: 'Cabinet professionnel — conseil fiscal & structuration internationale',
    positioning:
      'Cabinet professionnel spécialisé dans l’accompagnement des entrepreneurs et entreprises qui développent une activité à l’international.',
    sections: [
      section('Domaines d’expertise', [
        'Fiscalité nationale et internationale',
        'TVA',
        'Comptabilité',
        'Structuration juridique',
        'Banque et encaissements',
        'Résidence fiscale',
        'Expatriation',
        'Organisation financière',
        'Patrimoine et immobilier',
      ]),
      section('Valeurs', ['Expertise', 'Pédagogie', 'Rigueur', 'Méthode', 'Équipe', 'Analyse', 'Accompagnement']),
      section('Direction artistique', [
        'Corporate',
        'Minimaliste',
        'Institutionnelle',
        'Premium',
        'Sophistiquée',
        'Structurée',
      ]),
      section(
        'Interdictions visuelles',
        [
          'Aucun monogramme F',
          'Aucune icône F',
          'Aucun symbole inventé',
          'Aucun globe lumineux',
          'Aucune carte du monde décorative',
          'Aucun circuit électronique',
          'Aucun graphique boursier générique',
          'Aucune esthétique startup technologique',
        ],
        'rules',
      ),
      section(
        'Signature observée sur les maquettes',
        [
          ['Wordmark « FYNOVATES » espacé, sans symbole — IMG-010', 'RÉFÉRENCE VISUELLE'],
          ['Baseline « Conseil fiscal & structuration internationale »', 'RÉFÉRENCE VISUELLE'],
          ['Palette bleu nuit profond / blanc / gris clair / beige, accents typographiques surlignés', 'RÉFÉRENCE VISUELLE'],
          ['Photographies désaturées teintées bleu nuit (architecture, mains, documents, bureaux)', 'RÉFÉRENCE VISUELLE'],
        ],
      ),
    ],
  },
  {
    id: 'TZ',
    name: 'Tiziana / Madame Caci',
    descriptor: 'Personal branding d’une dirigeante — Modern Executive',
    positioning: 'Modern Executive. Fondatrice & directrice de Fynovates.',
    sections: [
      section('Dimensions', [
        'Dirigeante stratège',
        'Experte de terrain',
        'Fondatrice',
        'Entrepreneure',
        'Vision et convictions',
      ]),
      section('Ton', ['Direct', 'Professionnel', 'Analytique', 'Pédagogique', 'Affirmé']),
      section('Expressions signatures', [
        '« Avant de choisir une structure, il faut comprendre la situation. »',
        '« Une structure doit servir un projet, pas l’inverse. »',
        '« Je préfère comprendre le problème avant de chercher la solution. »',
        '« Ce qui est adapté à un entrepreneur ne l’est pas nécessairement à un autre. »',
      ]),
      section(
        'Direction artistique observée (planche IMG-002)',
        [
          ['Portraits en lumière naturelle chaude, tenue denim / blanc cassé', 'RÉFÉRENCE VISUELLE'],
          ['Alternance portraits / architecture / environnements de travail', 'RÉFÉRENCE VISUELLE'],
          ['Typographie sérif éditoriale pour la planche (hors feed)', 'RÉFÉRENCE VISUELLE'],
        ],
      ),
    ],
  },
]

export const pillars: Pillar[] = [
  {
    id: 'A',
    title: 'TVA, fiscalité internationale et vente en ligne',
    summary: 'Règles de TVA, seuils européens, qualification des services, structuration avant de facturer.',
  },
  {
    id: 'B',
    title: 'Banque, encaissements et capacité d’emprunt',
    summary: 'Comptes bancaires vs comptes de paiement, ouverture de compte, blocages, dossier de financement.',
  },
  {
    id: 'C',
    title: 'Patrimoine, immobilier et argent personnel',
    summary: 'Séparer la société et le dirigeant, trésorerie, rémunération, achat immobilier, holding.',
  },
  {
    id: 'D',
    title: 'Résidence fiscale, expatriation et conformité',
    summary: 'Critères de résidence, préparer un départ, comparer les pays, sortir de France proprement.',
  },
  {
    id: 'E',
    title: 'Coulisses et méthodologie Fynovates',
    summary: 'Analyse d’un dossier, double relecture, préparation des rendez-vous, équipe, pédagogie.',
  },
  {
    id: 'F',
    title: 'Écosystème et prescripteurs',
    summary: 'Prescripteurs, experts, bouche-à-oreille. Aucun partenariat ne doit être inventé.',
  },
]
