const test = require('node:test');
const assert = require('node:assert/strict');
const { rendreCertificat } = require('../lib/rendu');
const { texteCertificat } = require('../lib/texte');

const cert = {
  numero: 'MC-2026-0001', emisLe: '2026-10-06', laboratoire: { nom: 'Labo (fictif)', adresse: 'Dakar (fictif)' },
  client: 'Client', instrument: 'Manomètre', serie: 'S1', famille: 'pression', date: '2026-10-05',
  lieu: 'Laboratoire MetroCert Démo, Mbao', temperature: 21.5, humidite: 48,
  regle: 'Conformité déclarée sans prise en compte de l’incertitude de mesure (à préciser par le laboratoire).',
  methode: 'M', etalon: 'E', tracabilite: 'T', unite: 'bar', emt: 0.1, incertitude: 0.02, k: 2,
  lignes: [{ reference: 5, lecture: 5.04, erreur: 0.04, conforme: true }], conforme: true,
};

test('le certificat contient lieu, conditions ambiantes et règle de décision', () => {
  const h = rendreCertificat(cert);
  assert.match(h, /Lieu d’étalonnage<\/dt><dd>Laboratoire MetroCert Démo, Mbao/);
  assert.match(h, /Conditions ambiantes<\/dt><dd>Température : 21,5 °C · Humidité relative : 48 %/);
  assert.match(h, /Règle de décision :<\/strong> Conformité déclarée sans prise en compte de l’incertitude/);
});

test('les valeurs saisies sont échappées dans le certificat', () => {
  const h = rendreCertificat({ ...cert, lieu: '<script>x</script>' });
  assert.ok(!h.includes('<script>x'));
});

test('le texte envoyé à l’agent contient aussi les trois mentions', () => {
  const t = texteCertificat(cert);
  assert.match(t, /Lieu d'étalonnage : Laboratoire MetroCert Démo/);
  assert.match(t, /température 21,5 °C ; humidité relative 48 %/);
  assert.match(t, /Règle de décision : Conformité déclarée/);
});
