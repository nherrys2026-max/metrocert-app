# MetroCert App

Des relevés de mesure au certificat d'étalonnage ISO/IEC 17025:2017 imprimable, sans ressaisie,
avec contrôle de complétude par l'agent Dify MetroCert. Projet GET 409 (Ivon NKOUNKOU),
construit pendant l'atelier Claude Code (épisodes E07 à E14).

- **En ligne** : https://metrocert-app.onrender.com (Render, offre gratuite ; voir [DEPLOIEMENT.md](DEPLOIEMENT.md))
- **Lancer en local** : `npm install`, copier `.env.example` en `.env`, renseigner `DIFY_API_KEY`, puis `npm start` → http://localhost:3000
- **Tests** : `npm test` (21 tests : calculs, rendu, routes, appel Dify simulé)

## Ce que fait l'application

1. Saisie du client, de l'instrument, de l'étalon, du lieu, des conditions ambiantes, de l'EMT et de la règle de décision.
2. Tableau des relevés : erreur = lecture − référence, conformité par point selon l'EMT.
3. Certificat imprimable n° MC-2026-XXXX (éléments du §7.8 : laboratoire, client, instrument, méthode, résultats avec unités, U avec k = 2, traçabilité, conditions ambiantes, règle de décision, signatures).
4. Bouton « Contrôler avec l'agent MetroCert » : la route serveur `POST /api/controle` appelle le workflow Dify ; la clé reste côté serveur.

> Aide à la relecture — ne remplace pas la signature du responsable technique.

## Sécurité

`.env` ignoré par git et interdit en lecture à Claude Code (`.claude/settings.json`), en-têtes de sécurité,
validation des entrées, limiteur sur `/api/controle`, sous-agent `relecteur-securite` (`.claude/agents/`).

*Prototype pédagogique GET 409 — données fictives.*
