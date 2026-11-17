const TOPICS = ['study-tips', 'course-planning', 'group-projects', 'academic-resources'];
const PROGRAMS = ['Computer Science', 'Information Systems', 'Data Science', 'Other'];

function validateAcademicPost(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { error: 'A post object is required.' };
  const fields = {};
  for (const [field, min, max] of [
    ['title', 5, 120],
    ['topic', 1, 40],
    ['program', 1, 80],
    ['courseCode', 0, 20],
    ['body', 20, 10000],
    ['tips', 5, 2000],
  ]) {
    const value = body[field] ?? (field === 'courseCode' ? '' : null);
    if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
      return { error: `${field} must contain ${min}–${max} characters.` };
    }
    fields[field] = value.trim();
  }
  if (!TOPICS.includes(fields.topic)) return { error: 'Choose a valid academic topic.' };
  if (!PROGRAMS.includes(fields.program)) return { error: 'Choose a valid program.' };
  fields.courseCode = fields.courseCode.toUpperCase();
  return { fields };
}

function publicAcademicPost(post) {
  const { _id, seedKey: _seedKey, ...fields } = post;
  return { id: _id.toString(), ...fields };
}

module.exports = { TOPICS, PROGRAMS, validateAcademicPost, publicAcademicPost };
