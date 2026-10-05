// Calculs métrologiques (partagés serveur / navigateur). Pas de dépendance.
(function (root) {
  const arrondir = (x, n = 6) => Number(Number(x).toFixed(n));

  // erreur = lecture − référence
  function erreur(lecture, reference) {
    return arrondir(lecture - reference);
  }

  // Conforme si |erreur| ≤ EMT (la limite est incluse)
  function conforme(err, emt) {
    return Math.abs(err) <= emt + 1e-9;
  }

  function evaluerPoints(points, emt) {
    return points.map((p) => {
      const err = erreur(p.lecture, p.reference);
      return { ...p, erreur: err, conforme: conforme(err, emt) };
    });
  }

  function conformiteGlobale(lignes) {
    return lignes.length > 0 && lignes.every((l) => l.conforme);
  }

  const api = { erreur, conforme, evaluerPoints, conformiteGlobale };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Calcul = api;
})(typeof self !== 'undefined' ? self : this);
