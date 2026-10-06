// Durcissement HTTP : en-têtes de sécurité et limitation de débit (sans dépendance).
function entetes(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    // Scripts et styles inline présents dans les pages ; polices Google uniquement en externe.
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  });
  next();
}

function limiteur({ max, fenetreMs, maintenant = Date.now }) {
  const compteurs = new Map();
  return (req, res, next) => {
    const t = maintenant();
    const cle = req.ip || 'inconnu';
    let e = compteurs.get(cle);
    if (!e || t >= e.fin) {
      e = { n: 0, fin: t + fenetreMs };
      compteurs.set(cle, e);
    }
    if (compteurs.size > 10000) for (const [k, v] of compteurs) if (t >= v.fin) compteurs.delete(k);
    e.n += 1;
    if (e.n > max) {
      res.set('Retry-After', String(Math.ceil((e.fin - t) / 1000)));
      return res.status(429).json({ code: 'trop_de_requetes', erreur: 'Trop de demandes : réessayez dans un instant.' });
    }
    next();
  };
}

// Gestionnaire d'erreurs : JSON en français, sans trace ni détail interne.
function erreurs(err, req, res, next) {
  if (res.headersSent) return next(err);
  const statut = err.status >= 400 && err.status < 500 ? err.status : 500;
  const erreur = statut === 413 ? 'Requête trop volumineuse.' : statut === 400 ? 'Requête illisible (JSON invalide).' : 'Erreur interne du serveur.';
  res.status(statut).json({ erreur });
}

module.exports = { entetes, limiteur, erreurs };
