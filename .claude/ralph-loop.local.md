---
active: true
iteration: 1
session_id: 981a5a04-106d-4edf-b0f2-6da56a2f0c63
max_iterations: 5
completion_promise: "TERMINE"
started_at: "2026-10-06T01:09:58Z"
---

Ajoute au formulaire et au certificat trois champs exigés par ISO/IEC 17025 §7.8 : lieu d'étalonnage, conditions ambiantes (température et humidité), règle de décision (texte par défaut : conformité déclarée sans prise en compte de l'incertitude, à préciser par le laboratoire). Préremplis-les dans l'exemple avec des données fictives. Ajoute un test qui vérifie que le certificat contient ces trois mentions. Après chaque modification, lance npm test. Quand tous les tests passent et que les trois champs apparaissent sur le certificat, fais un commit, pousse, puis écris TERMINE.
