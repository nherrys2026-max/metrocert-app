// Validation stricte de l'entrée de POST /api/certificats.
const MAX_POINTS = 100;
const MAX_TEXTE = 200;
const MAX_REGLE = 500;
const TEMP_MIN = -100;
const TEMP_MAX = 100;
const BORNE = 1e12;

// Nombre fini à partir d'un nombre ou d'une chaîne non vide ; sinon NaN (jamais 0 par défaut).
function nombre(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}
const borne = (n) => Number.isFinite(n) && Math.abs(n) <= BORNE;
const texte = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');
const sansRetour = (s) => s.replace(/[\r\n\t]+/g, ' ');

function valider(b, familles) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { erreur: 'Corps de requête invalide.' };
  const t = {};
  for (const k of ['client', 'instrument', 'serie', 'date', 'etalon', 'lieu', 'unite']) t[k] = sansRetour(texte(b[k]));
  t.regle = sansRetour(texte(b.regle));

  if (!t.client || !t.instrument || !t.serie || !t.date || !t.etalon)
    return { erreur: 'Champs obligatoires manquants.' };
  if (!t.lieu) return { erreur: 'Lieu d’étalonnage manquant.' };
  if (!t.unite) return { erreur: 'Unité manquante.' };
  if ([t.client, t.instrument, t.serie, t.etalon, t.lieu, t.unite].some((s) => s.length > MAX_TEXTE) || t.regle.length > MAX_REGLE)
    return { erreur: `Texte trop long (${MAX_TEXTE} caractères max, ${MAX_REGLE} pour la règle de décision).` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) || Number.isNaN(Date.parse(t.date)) || new Date(t.date).toISOString().slice(0, 10) !== t.date)
    return { erreur: 'Date invalide (format AAAA-MM-JJ).' };
  if (typeof b.famille !== 'string' || !Object.hasOwn(familles, b.famille)) return { erreur: 'Famille inconnue.' };

  const emt = nombre(b.emt);
  const incertitude = nombre(b.incertitude);
  if (!borne(emt) || emt < 0 || !borne(incertitude) || incertitude < 0)
    return { erreur: 'EMT ou incertitude invalide.' };
  const temperature = nombre(b.temperature);
  const humidite = nombre(b.humidite);
  if (!Number.isFinite(temperature) || temperature < TEMP_MIN || temperature > TEMP_MAX || !Number.isFinite(humidite) || humidite < 0 || humidite > 100)
    return { erreur: `Conditions ambiantes invalides (température entre ${TEMP_MIN} et ${TEMP_MAX} °C, humidité entre 0 et 100 %).` };

  if (!Array.isArray(b.points) || !b.points.length) return { erreur: 'Relevés invalides.' };
  if (b.points.length > MAX_POINTS) return { erreur: `Trop de points de relevé (${MAX_POINTS} max).` };
  const points = b.points.map((p) =>
    p && typeof p === 'object' ? { reference: nombre(p.reference), lecture: nombre(p.lecture) } : { reference: NaN, lecture: NaN }
  );
  if (points.some((p) => !borne(p.reference) || !borne(p.lecture))) return { erreur: 'Relevés invalides.' };

  return { valeurs: { ...t, famille: b.famille, emt, incertitude, temperature, humidite, points } };
}

module.exports = { valider, nombre, sansRetour, MAX_POINTS, MAX_TEXTE, MAX_REGLE };
