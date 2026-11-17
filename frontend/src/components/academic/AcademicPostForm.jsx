import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { topics, programs } from '../../academicOptions';
import './AcademicPostForm.css';

function AcademicPostForm({ initialPost, onSave, cancelTo }) {
  const [values, setValues] = useState(
    initialPost || { title: '', topic: '', program: '', courseCode: '', body: '', tips: '' },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(values);
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  }
  return (
    <form className="academic-post-form" onSubmit={submit}>
      <p>
        Share your own experience. Required fields are marked *. Do not include private student
        information.
      </p>
      <fieldset disabled={busy}>
        <legend className="academic-post-form__legend">Experience details</legend>
        <label>
          Title *
          <input
            name="title"
            value={values.title}
            onChange={update}
            required
            minLength={5}
            maxLength={120}
            placeholder="A useful lesson from your studies"
          />
        </label>
        <div className="academic-post-form__row">
          <label>
            Topic *
            <select name="topic" value={values.topic} onChange={update} required>
              <option value="">Choose a topic</option>
              {topics.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Program *
            <select name="program" value={values.program} onChange={update} required>
              <option value="">Choose a program</option>
              {programs.map((program) => (
                <option key={program}>{program}</option>
              ))}
            </select>
          </label>
          <label>
            Course code
            <input
              name="courseCode"
              value={values.courseCode}
              onChange={update}
              maxLength={20}
              placeholder="e.g. CS 5610 (optional)"
            />
          </label>
        </div>
        <label>
          Experience *
          <textarea
            name="body"
            value={values.body}
            onChange={update}
            required
            minLength={20}
            maxLength={10000}
            rows={8}
            placeholder="What did you try, and what did you learn? (at least 20 characters)"
          />
        </label>
        <label>
          Practical tips *
          <textarea
            name="tips"
            value={values.tips}
            onChange={update}
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            placeholder="What should another student know?"
          />
        </label>
      </fieldset>
      {error && (
        <p className="academic-post-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="academic-post-form__actions">
        <button type="submit" disabled={busy}>
          {busy ? 'Saving...' : initialPost ? 'Save changes' : 'Publish experience'}
        </button>
        {!busy && <Link to={cancelTo}>Cancel</Link>}
      </div>
    </form>
  );
}
AcademicPostForm.propTypes = {
  initialPost: PropTypes.shape({
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    program: PropTypes.string.isRequired,
    courseCode: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    tips: PropTypes.string.isRequired,
  }),
  onSave: PropTypes.func.isRequired,
  cancelTo: PropTypes.string.isRequired,
};
export default AcademicPostForm;
