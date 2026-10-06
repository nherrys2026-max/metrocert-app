# Mettre MetroCert App en ligne (Render, offre gratuite)

L'application garde les certificats en mémoire : il lui faut un serveur Node qui reste allumé.
Render le fournit gratuitement et redéploie à chaque `git push` sur `main`.

1. Ouvrir https://render.com, se connecter avec **GitHub** (compte `nherrys2026-max`).
2. **New → Blueprint**, choisir le dépôt `metrocert-app`. Render lit `render.yaml`.
3. Render demande la valeur de **DIFY_API_KEY** : coller la clé Dify (nouvelle clé), puis **Apply**.
4. Attendre le statut **Live** (2 à 4 min). L'adresse publique a la forme
   `https://metrocert-app-xxxx.onrender.com`.
5. Vérifier : `https://…onrender.com/sante` répond `{"ok":true}`, puis générer le certificat
   d'exemple et cliquer sur « Contrôler avec l'agent MetroCert ».

Limites de l'offre gratuite : le service s'endort après 15 min sans visite (premier chargement
d'environ 50 s ensuite) et les certificats générés sont effacés à chaque redémarrage. C'est
acceptable pour une démonstration ; une base de données serait nécessaire pour un usage réel.

Données fictives — prototype pédagogique GET 409.
