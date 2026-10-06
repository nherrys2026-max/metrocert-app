// Appel du workflow Dify. La clé vient de process.env, côté serveur uniquement.
const URL_DIFY = 'https://api.dify.ai/v1/workflows/run';

// Retourne { statut, corps } prêt à renvoyer au navigateur.
async function controler(texte, { cle = process.env.DIFY_API_KEY, delaiMs = 30000, fetchFn = fetch } = {}) {
  if (!cle) {
    return { statut: 503, corps: { code: 'cle_absente', erreur: 'Clé DIFY_API_KEY absente : renseignez-la dans le fichier .env du serveur.' } };
  }
  // Minuteur explicite : AbortSignal.timeout() ne retient pas la boucle d'événements,
  // ce qui laissait la promesse en suspens (tests annulés).
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(new DOMException('Délai dépassé', 'TimeoutError')), delaiMs);
  try {
    const rep = await fetchFn(URL_DIFY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: { question: texte }, response_mode: 'blocking', user: 'metrocert-app' }),
      signal: ctrl.signal,
    });
    const json = await rep.json().catch(() => ({}));
    if (!rep.ok) {
      const msg = rep.status === 401 ? 'Clé API refusée par Dify (401) : vérifiez DIFY_API_KEY.' : `Dify a répondu ${rep.status}${json.message ? ' : ' + json.message : ''}.`;
      return { statut: 502, corps: { code: 'dify_http', erreur: msg } };
    }
    const d = json.data || {};
    if (d.status === 'failed') return { statut: 502, corps: { code: 'dify_echec', erreur: d.error || 'Le workflow Dify a échoué.' } };
    const o = d.outputs || {};
    if (o.rapport_controle) return { statut: 200, corps: { rapport: o.rapport_controle } };
    if (o.message_erreur) return { statut: 200, corps: { message: o.message_erreur } };
    return { statut: 502, corps: { code: 'sortie_vide', erreur: 'Réponse Dify sans rapport_controle ni message_erreur.' } };
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError')
      return { statut: 504, corps: { code: 'delai', erreur: 'La réponse prend trop de temps (plus de 30 s) — réessayez.' } };
    return { statut: 502, corps: { code: 'reseau', erreur: 'Service temporairement indisponible.' } };
  } finally {
    clearTimeout(minuteur);
  }
}

module.exports = { controler, URL_DIFY };
