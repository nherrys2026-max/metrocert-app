# MetroCert App

MetroCert App transforme des relevés de mesure en certificat d'étalonnage HTML imprimable, sans ressaisie.
Porté par Ivon NKOUNKOU (projet GET409-MetroCert).

## Persona

Mame Diarra Sow, responsable technique d'un laboratoire d'étalonnage à Dakar. Elle jongle avec un modèle
de certificat par famille d'instruments et par client ; elle veut livrer dans la journée et passer ses
audits d'accréditation sans écart.

## Certificat : éléments obligatoires (ISO/IEC 17025:2017 §7.8)

Titre · laboratoire (nom, adresse) · n° unique · client · instrument identifié · date · méthode ·
résultats avec unités · incertitude élargie (k = 2) · traçabilité métrologique · signature.

## Stack

- Node.js + Express côté serveur ; HTML/CSS/JS sans framework côté client.
- Design repris de `..\03-landing\v2` : couleurs (--paper, --panel, --ink, --steel, --ok, --signal, --line),
  polices Barlow / Barlow Condensed, règle graduée en en-tête.

## Règles

- Tout le texte visible est en français.
- Les données fictives sont toujours signalées comme telles.
- Jamais de clé ou secret dans le code : `.env` (ignoré par git), modèle dans `.env.example`.
- Chaque calcul est testé (`node:test`).
- Lisible à 360 px de large : pas de débordement horizontal, `min-width: 0` sur les enfants flex/grid.

## Commandes

- `npm start` : lance le serveur (http://localhost:3000)
- `npm test` : lance les tests
