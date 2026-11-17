import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './CampusPostForm.css';

function CampusPostForm({ initialPost, onSave, cancelTo }) {
  const [values, setValues] = useState({
    title: initialPost?.title || '',
    topic: initialPost?.topic || '',
    neighborhood: initialPost?.neighborhood || '',
    budgetLevel: initialPost?.budgetLevel || '',
    location: initialPost?.location || '',
    body: initialPost?.body || '',
    tips: initialPost?.tips || '',
  });
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
    <form className="campus-post-form" onSubmit={submit}>
      <p>
        Share your own experience. Required fields are marked *. Do not include private student
        information.
      </p>
      <fieldset disabled={busy}>
        <legend className="campus-post-form__legend">Experience details</legend>
        <label>
          Title *
          <input
            name="title"
            value={values.title}
            onChange={update}
            required
            minLength={5}
            maxLength={120}
            placeholder="A clear title for your experience"
          />
        </label>
        <div className="campus-post-form__row">
          <label>
            Topic *
            <select name="topic" value={values.topic} onChange={update} required>
              <option value="">Choose a topic</option>
              <option value="housing">Housing</option>
              <option value="commuting">Commuting</option>
              <option value="food">Food</option>
              <option value="activities">Activities</option>
            </select>
          </label>
          <label>
            Neighborhood *
            <input
              name="neighborhood"
              value={values.neighborhood}
              onChange={update}
              required
              minLength={2}
              maxLength={80}
              placeholder="e.g. Fenway"
            />
          </label>
          <label>
            Budget level *
            <select name="budgetLevel" value={values.budgetLevel} onChange={update} required>
              <option value="">Choose a budget</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label>
          Location *
          <input
            name="location"
            value={values.location}
            onChange={update}
            required
            minLength={2}
            maxLength={120}
            placeholder="Where did this happen?"
          />
        </label>
        <label>
          Your experience *
          <textarea
            name="body"
            value={values.body}
            onChange={update}
            required
            minLength={20}
            maxLength={10000}
            rows={8}
            placeholder="What happened, and what did you learn? (at least 20 characters)"
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
        <p className="campus-post-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="campus-post-form__actions">
        <button type="submit" disabled={busy}>
          {busy ? 'Saving...' : initialPost ? 'Save changes' : 'Publish experience'}
        </button>
        {!busy && <Link to={cancelTo}>Cancel</Link>}
      </div>
    </form>
  );
}

CampusPostForm.propTypes = {
  initialPost: PropTypes.shape({
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    neighborhood: PropTypes.string.isRequired,
    budgetLevel: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    tips: PropTypes.string.isRequired,
  }),
  onSave: PropTypes.func.isRequired,
  cancelTo: PropTypes.string.isRequired,
};

export default CampusPostForm;
