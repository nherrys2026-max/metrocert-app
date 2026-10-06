require('dotenv').config();
const express = require('express');
const path = require('path');
const { evaluerPoints, conformiteGlobale } = require('./lib/calcul');
const { texteCertificat } = require('./lib/texte');
const { controler } = require('./lib/dify');

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

const certificats = new Map();
let compteur = 0;

app.post('/api/certificats', (req, res) => {
  const b = req.body || {};
  const emt = Number(b.emt);
  const U = Number(b.incertitude);
  const points = Array.isArray(b.points)
    ? b.points.map((p) => ({ reference: Number(p.reference), lecture: Number(p.lecture) }))
    : [];
  const texte = (v) => String(v ?? '').trim();

  if (!texte(b.client) || !texte(b.instrument) || !texte(b.serie) || !texte(b.date) || !texte(b.etalon))
    return res.status(400).json({ erreur: 'Champs obligatoires manquants.' });
  if (!FAMILLES[b.famille]) return res.status(400).json({ erreur: 'Famille inconnue.' });
  if (!Number.isFinite(emt) || emt < 0 || !Number.isFinite(U) || U < 0)
    return res.status(400).json({ erreur: 'EMT ou incertitude invalide.' });
  if (!texte(b.unite)) return res.status(400).json({ erreur: 'Unité manquante.' });
  if (!points.length || points.some((p) => !Number.isFinite(p.reference) || !Number.isFinite(p.lecture)))
    return res.status(400).json({ erreur: 'Relevés invalides.' });

  compteur += 1;
  const numero = `MC-2026-${String(compteur).padStart(4, '0')}`;
  const lignes = evaluerPoints(points, emt);
  certificats.set(numero, {
    numero,
    emisLe: new Date().toISOString().slice(0, 10),
    laboratoire: LABO,
    client: texte(b.client),
    instrument: texte(b.instrument),
    serie: texte(b.serie),
    famille: b.famille,
    date: texte(b.date),
    etalon: texte(b.etalon),
    unite: texte(b.unite),
    emt,
    incertitude: U,
    k: 2,
    methode: FAMILLES[b.famille],
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

app.post('/api/controle', async (req, res) => {
  const c = certificats.get(String((req.body || {}).numero || ''));
  if (!c) return res.status(404).json({ code: 'introuvable', erreur: 'Certificat introuvable.' });
  const { statut, corps } = await controler(texteCertificat(c));
  res.status(statut).json(corps);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`MetroCert App : http://localhost:${port}`));
}
module.exports = app;
