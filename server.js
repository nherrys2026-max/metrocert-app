require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { evaluerPoints, conformiteGlobale } = require('./lib/calcul');
const { texteCertificat } = require('./lib/texte');
const { controler } = require('./lib/dify');
const { valider } = require('./lib/validation');
const { entetes, limiteur, erreurs } = require('./lib/securite');

const app = express();
app.disable('x-powered-by');
app.use(entetes);
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/lib/rendu.js', (req, res) => res.sendFile(path.join(__dirname, 'lib', 'rendu.js')));

const REGLE_DEFAUT =
  'Conformité déclarée sans prise en compte de l’incertitude de mesure (règle d’acceptation simple, à préciser par le laboratoire).';

const FAMILLES = {
  pression: 'Comparaison directe à un étalon de pression (méthode EN 837, procédure interne PE-PR-01)',
  temperature: 'Comparaison en bain thermostaté à un thermomètre étalon (procédure interne PE-TH-01)',
  masse: 'Comparaison directe à des masses étalons (EURAMET cg-18, procédure interne PE-MA-01)',
};
const TRACABILITE =
  'Étalons raccordés au Système international d’unités (SI) par une chaîne ininterrompue d’étalonnages (données fictives).';
const LABO = {
  nom: 'Laboratoire MetroCert Démo (fictif)',
  adresse: 'Zone industrielle de Mbao, Dakar, Sénégal (adresse fictive)',
};

const MAX_CERTIFICATS = 500;
const certificats = new Map();
let compteur = 0;

app.post('/api/certificats', (req, res) => {
  const { erreur, valeurs: v } = valider(req.body, FAMILLES);
  if (erreur) return res.status(400).json({ erreur });
  const { points, emt } = v;

  compteur += 1;
  // Suffixe aléatoire : numéro unique même après redémarrage, et non énumérable.
  const numero = `MC-2026-${String(compteur).padStart(4, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const lignes = evaluerPoints(points, emt);
  if (certificats.size >= MAX_CERTIFICATS) certificats.delete(certificats.keys().next().value);
  certificats.set(numero, {
    numero,
    emisLe: new Date().toISOString().slice(0, 10),
    laboratoire: LABO,
    client: v.client,
    instrument: v.instrument,
    serie: v.serie,
    famille: v.famille,
    date: v.date,
    etalon: v.etalon,
    lieu: v.lieu,
    temperature: v.temperature,
    humidite: v.humidite,
    regle: v.regle || REGLE_DEFAUT,
    unite: v.unite,
    emt,
    incertitude: v.incertitude,
    k: 2,
    methode: FAMILLES[v.famille],
    tracabilite: TRACABILITE,
    lignes,
    conforme: conformiteGlobale(lignes),
    fictif: true,
  });
  res.json({ numero });
});

app.get('/api/certificats/:numero', (req, res) => {
  const c = certificats.get(req.params.numero);
  if (!c) return res.status(404).json({ erreur: 'Certificat introuvable.' });
  res.json(c);
});

app.post('/api/controle', limiteur({ max: 5, fenetreMs: 60000 }), async (req, res) => {
  const c = certificats.get(String((req.body || {}).numero || ''));
  if (!c) return res.status(404).json({ code: 'introuvable', erreur: 'Certificat introuvable.' });
  try {
    const { statut, corps } = await controler(texteCertificat(c));
    res.status(statut).json(corps);
  } catch {
    res.status(500).json({ code: 'erreur_interne', erreur: 'Contrôle indisponible.' });
  }
});

app.use(erreurs);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`MetroCert App : http://localhost:${port}`));
}
module.exports = app;
