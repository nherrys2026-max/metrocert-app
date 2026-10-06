const test = require('node:test');
const assert = require('node:assert/strict');
const { controler } = require('../lib/dify');
const { texteCertificat } = require('../lib/texte');

const rep = (status, json) => async () => ({ ok: status < 400, status, json: async () => json });

test('clé absente : 503 explicite, aucun appel réseau', async () => {
  let appele = false;
  const r = await controler('x', { cle: '', fetchFn: async () => { appele = true; } });
  assert.equal(r.statut, 503);
  assert.equal(r.corps.code, 'cle_absente');
  assert.equal(appele, false);
});

test('envoie la clé en Bearer et le corps attendu', async () => {
  let vu;
  await controler('texte', { cle: 'k-test', fetchFn: async (u, o) => { vu = { u, o }; return rep(200, { data: { outputs: { rapport_controle: 'ok' } } })(); } });
  assert.equal(vu.u, 'https://api.dify.ai/v1/workflows/run');
  assert.equal(vu.o.headers.Authorization, 'Bearer k-test');
  assert.deepEqual(JSON.parse(vu.o.body), { inputs: { question: 'texte' }, response_mode: 'blocking', user: 'metrocert-app' });
});

test('rapport_controle, sinon message_erreur', async () => {
  const a = await controler('x', { cle: 'k', fetchFn: rep(200, { data: { outputs: { rapport_controle: 'R' } } }) });
  assert.deepEqual(a.corps, { rapport: 'R' });
  const b = await controler('x', { cle: 'k', fetchFn: rep(200, { data: { outputs: { message_erreur: 'M' } } }) });
  assert.deepEqual(b.corps, { message: 'M' });
});

test('401, échec du workflow, sortie vide', async () => {
  assert.match((await controler('x', { cle: 'k', fetchFn: rep(401, {}) })).corps.erreur, /401/);
  assert.equal((await controler('x', { cle: 'k', fetchFn: rep(200, { data: { status: 'failed', error: 'boom' } }) })).corps.erreur, 'boom');
  assert.equal((await controler('x', { cle: 'k', fetchFn: rep(200, { data: { outputs: {} } }) })).corps.code, 'sortie_vide');
});

test('délai dépassé : 504 ; réseau : 502', async () => {
  const lent = (u, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(o.signal.reason)));
  assert.equal((await controler('x', { cle: 'k', delaiMs: 20, fetchFn: lent })).statut, 504);
  assert.equal((await controler('x', { cle: 'k', fetchFn: async () => { throw new Error('down'); } })).corps.code, 'reseau');
});

test('texteCertificat contient les relevés et respecte 5 000 caractères', () => {
  const c = {
    numero: 'MC-2026-0001', emisLe: '2026-10-06', laboratoire: { nom: 'L', adresse: 'A' }, client: 'C', instrument: 'I', serie: 'S',
    famille: 'pression', date: '2026-10-05', methode: 'M', etalon: 'E', tracabilite: 'T', unite: 'bar', emt: 0.1, incertitude: 0.02, k: 2,
    lignes: [{ reference: 10, lecture: 10.13, erreur: 0.13, conforme: false }], conforme: false,
  };
  const t = texteCertificat(c);
  assert.match(t, /référence 10 bar ; lecture 10,13 bar ; erreur 0,13 bar ; non conforme/);
  assert.ok(texteCertificat({ ...c, client: 'x'.repeat(9000) }).length <= 5000);
});
