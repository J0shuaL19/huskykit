const TOPICS = ['housing', 'commuting', 'food', 'activities'];
const BUDGET_LEVELS = ['low', 'medium', 'high'];

function validateCampusPost(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { error: 'A post object is required.' };
  const fields = {};
  for (const [field, min, max] of [
    ['title', 5, 120],
    ['topic', 1, 40],
    ['neighborhood', 2, 80],
    ['budgetLevel', 1, 20],
    ['location', 2, 120],
    ['body', 20, 10000],
    ['tips', 5, 2000],
  ]) {
    const value = body[field];
    if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
      return { error: field + ' must contain ' + min + '–' + max + ' characters.' };
    }
    fields[field] = value.trim();
  }
  if (!TOPICS.includes(fields.topic)) return { error: 'Choose a valid campus topic.' };
  if (!BUDGET_LEVELS.includes(fields.budgetLevel)) return { error: 'Choose a valid budget level.' };
  return { fields };
}

module.exports = { TOPICS, BUDGET_LEVELS, validateCampusPost };
