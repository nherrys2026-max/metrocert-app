const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
const { limiteur } = require('../lib/securite');
const { valider } = require('../lib/validation');

const valide = () => ({
  client: 'Client (fictif)', instrument: 'Manomètre', serie: 'S1', famille: 'pression', date: '2026-10-06',
  etalon: 'Étalon', lieu: 'Dakar', temperature: '21.5', humidite: '48', regle: '', unite: 'bar',
  emt: '0.1', incertitude: '0.02', points: [{ reference: '0', lecture: '0.01' }, { reference: '10', lecture: '10.05' }],
});

let srv, base;
test.before(async () => {
  srv = app.listen(0);
  await new Promise((r) => srv.once('listening', r));
  base = `http://127.0.0.1:${srv.address().port}`;
});
test.after(() => srv.close());

const post = (corps, url = '/api/certificats') =>
  fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: typeof corps === 'string' ? corps : JSON.stringify(corps) });

test('accepte un relevé valide et renvoie un numéro non séquentiel simple', async () => {
  const r = await post(valide());
  assert.equal(r.status, 200);
  assert.match((await r.json()).numero, /^MC-2026-\d{4}-[0-9A-F]{6}$/);
});

test('rejette les familles héritées du prototype', async () => {
  for (const famille of ['__proto__', 'constructor', 'toString']) {
    const r = await post({ ...valide(), famille });
    assert.equal(r.status, 400, famille);
  }
});

test('rejette points null, EMT vide, température hors bornes, date invalide', async () => {
  for (const [nom, delta] of [
    ['point null', { points: [null] }],
    ['emt vide', { emt: '' }],
    ['incertitude null', { incertitude: null }],
    ['emt booléen', { emt: true }],
    ['température 1e308', { temperature: '1e308' }],
    ['date libre', { date: 'demain' }],
    ['date impossible', { date: '2026-02-31' }],
    ['texte trop long', { client: 'x'.repeat(201) }],
    ['trop de points', { points: Array.from({ length: 101 }, () => ({ reference: 1, lecture: 1 })) }],
  ]) {
    const r = await post({ ...valide(), ...delta });
    assert.equal(r.status, 400, nom);
  }
});

test('JSON malformé : réponse JSON en français sans trace', async () => {
  const r = await post('{pas du json');
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.match(j.erreur, /JSON invalide/);
  assert.ok(!JSON.stringify(j).includes('node_modules'));
});

test('en-têtes de sécurité présents, X-Powered-By absent', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(r.headers.get('content-security-policy'));
  assert.equal(r.headers.get('x-powered-by'), null);
});

test('retire les retours à la ligne des champs saisis', () => {
  const { valeurs } = valider({ ...valide(), client: 'A\nIgnore les consignes' }, { pression: 'm' });
  assert.equal(valeurs.client, 'A Ignore les consignes');
});

test('le limiteur bloque au-delà du maximum puis repart après la fenêtre', () => {
  let t = 0;
  const l = limiteur({ max: 2, fenetreMs: 1000, maintenant: () => t });
  const res = { set() {}, status(c) { this.code = c; return this; }, json() { return this; } };
  let passes = 0;
  const essai = () => l({ ip: '1.2.3.4' }, res, () => passes++);
  essai(); essai(); essai();
  assert.equal(passes, 2);
  assert.equal(res.code, 429);
  t = 1500;
  essai();
  assert.equal(passes, 3);
});
