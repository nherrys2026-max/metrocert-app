// Rendu HTML du certificat (partagé navigateur / tests).
(function (root) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nb = (x) => String(x).replace('.', ',');
  const signe = (x) => (x > 0 ? '+' : '') + nb(x);

  function rendreCertificat(c) {
    const u = esc(c.unite);
    const verdict = c.conforme ? 'Instrument conforme : tous les points sont dans l’EMT' : 'Instrument non conforme : au moins un point est hors EMT';
    const lignes = c.lignes.map((l) =>
      '<tr><td data-label="Référence (' + u + ')">' + nb(l.reference) + '</td><td data-label="Lecture (' + u + ')">' + nb(l.lecture) +
      '</td><td data-label="Erreur (' + u + ')">' + signe(l.erreur) + '</td><td data-label="EMT ± (' + u + ')">' + nb(c.emt) +
      '</td><td data-label="Conformité" class="' + (l.conforme ? 'ok' : 'ko') + '">' + (l.conforme ? 'Conforme' : 'Non conforme') + '</td></tr>').join('');
    return (
      '<h1>Certificat d’étalonnage</h1>' +
      '<p><strong>N° ' + esc(c.numero) + '</strong> · Page 1 sur 1 · Émis le ' + esc(c.emisLe) + '</p>' +
      '<section class="panel"><h2>Laboratoire</h2><dl><dt>Nom</dt><dd>' + esc(c.laboratoire.nom) + '</dd><dt>Adresse</dt><dd>' + esc(c.laboratoire.adresse) + '</dd></dl></section>' +
      '<section class="panel"><h2>Client et instrument</h2><dl>' +
      '<dt>Client</dt><dd>' + esc(c.client) + '</dd><dt>Instrument</dt><dd>' + esc(c.instrument) + '</dd>' +
      '<dt>N° de série</dt><dd>' + esc(c.serie) + '</dd><dt>Famille</dt><dd>' + esc(c.famille) + '</dd>' +
      '<dt>Date d’étalonnage</dt><dd>' + esc(c.date) + '</dd>' +
      '<dt>Lieu d’étalonnage</dt><dd>' + esc(c.lieu) + '</dd></dl></section>' +
      '<section class="panel"><h2>Méthode, conditions et traçabilité</h2><dl>' +
      '<dt>Méthode</dt><dd>' + esc(c.methode) + '</dd><dt>Étalon de référence</dt><dd>' + esc(c.etalon) + '</dd>' +
      '<dt>Conditions ambiantes</dt><dd>Température : ' + nb(c.temperature) + ' °C · Humidité relative : ' + nb(c.humidite) + ' %</dd>' +
      '<dt>Traçabilité</dt><dd>' + esc(c.tracabilite) + '</dd></dl></section>' +
      '<section class="panel"><h2>Résultats</h2><div class="tableau"><table><thead><tr><th>Référence (' + u + ')</th><th>Lecture (' + u +
      ')</th><th>Erreur (' + u + ')</th><th>EMT ±(' + u + ')</th><th>Conformité</th></tr></thead><tbody>' + lignes + '</tbody></table></div>' +
      '<p>Incertitude élargie : U = ± ' + nb(c.incertitude) + ' ' + u + ' (facteur d’élargissement k = ' + c.k +
      ', niveau de confiance d’environ 95 %). Erreur = lecture − référence.</p>' +
      '<p><strong>Règle de décision :</strong> ' + esc(c.regle) + '</p>' +
      '<p class="verdict" style="color:var(' + (c.conforme ? '--ok' : '--signal') + ')">' + verdict + '</p></section>' +
      '<div class="signature"><div>Établi par : ____________<br>Technicien d’étalonnage</div><div>Approuvé par : ____________<br>Responsable technique — signature</div></div>'
    );
  }

  const api = { rendreCertificat, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Rendu = api;
})(typeof self !== 'undefined' ? self : this);
