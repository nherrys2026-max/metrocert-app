// Met le certificat en texte pour l'agent de contrôle (entrée « question », 5 000 caractères max).
const MAX = 5000;
const nb = (x) => String(x).replace('.', ',');

function texteCertificat(c) {
  const u = c.unite;
  const lignes = c.lignes.map(
    (l) =>
      `- référence ${nb(l.reference)} ${u} ; lecture ${nb(l.lecture)} ${u} ; erreur ${nb(l.erreur)} ${u} ; ` +
      (l.conforme ? 'conforme' : 'non conforme')
  );
  const t = [
    `Titre : Certificat d'étalonnage`,
    `N° unique : ${c.numero} — Page 1 sur 1 — émis le ${c.emisLe}`,
    `Laboratoire : ${c.laboratoire.nom}, ${c.laboratoire.adresse}`,
    `Client : ${c.client}`,
    `Instrument : ${c.instrument}, n° de série ${c.serie}, famille ${c.famille}`,
    `Date d'étalonnage : ${c.date}`,
    `Méthode : ${c.methode}`,
    `Étalon de référence : ${c.etalon}`,
    `Traçabilité : ${c.tracabilite}`,
    `EMT : ± ${nb(c.emt)} ${u}`,
    `Incertitude élargie : U = ± ${nb(c.incertitude)} ${u} (k = ${c.k})`,
    'Relevés :',
    ...lignes,
    `Conclusion : ${c.conforme ? 'conforme' : 'non conforme'}`,
    'Signatures : zones « Établi par » (technicien d\'étalonnage) et « Approuvé par » (responsable technique) à signer',
  ].join('\n');
  return t.length > MAX ? t.slice(0, MAX) : t;
}

module.exports = { texteCertificat, MAX };
