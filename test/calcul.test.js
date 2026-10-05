const test = require('node:test');
const assert = require('node:assert/strict');
const { erreur, conforme, evaluerPoints, conformiteGlobale } = require('../lib/calcul');

test('erreur = lecture − référence', () => {
  assert.equal(erreur(5.02, 5), 0.02);
  assert.equal(erreur(4.97, 5), -0.03);
  assert.equal(erreur(0, 0), 0);
});

test('erreur sans artefact flottant (0,3 − 0,1)', () => {
  assert.equal(erreur(0.3, 0.1), 0.2);
});

test('conformité : dans l’EMT, à la limite, hors EMT', () => {
  assert.equal(conforme(0.05, 0.1), true);
  assert.equal(conforme(-0.1, 0.1), true);
  assert.equal(conforme(0.1, 0.1), true);
  assert.equal(conforme(0.11, 0.1), false);
  assert.equal(conforme(-0.11, 0.1), false);
});

test('evaluerPoints calcule erreur et conformité par point', () => {
  const r = evaluerPoints(
    [{ reference: 2, lecture: 2.05 }, { reference: 4, lecture: 3.8 }],
    0.1
  );
  assert.equal(r[0].erreur, 0.05);
  assert.equal(r[0].conforme, true);
  assert.equal(r[1].erreur, -0.2);
  assert.equal(r[1].conforme, false);
});

test('conformité globale : tous les points, et jamais vide', () => {
  assert.equal(conformiteGlobale([{ conforme: true }, { conforme: true }]), true);
  assert.equal(conformiteGlobale([{ conforme: true }, { conforme: false }]), false);
  assert.equal(conformiteGlobale([]), false);
});
