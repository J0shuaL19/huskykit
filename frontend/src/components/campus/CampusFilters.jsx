import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './CampusFilters.css';

function CampusFilters({ values, onApply, onClear }) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    setDraft(values);
  }, [values.keyword, values.topic, values.neighborhood, values.budgetLevel]);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onApply(draft);
  }

  return (
    <form className="campus-filters" onSubmit={submit} aria-label="Filter Campus Life posts">
      <div className="campus-filters__grid">
        <label>
          Keyword
          <input
            type="search"
            name="keyword"
            placeholder="Search experiences"
            maxLength="100"
            value={draft.keyword}
            onChange={(event) => update('keyword', event.target.value)}
          />
        </label>
        <label>
          Topic
          <select
            name="topic"
            value={draft.topic}
            onChange={(event) => update('topic', event.target.value)}
          >
            <option value="">All topics</option>
            <option value="housing">Housing</option>
            <option value="commuting">Commuting</option>
            <option value="food">Food</option>
            <option value="activities">Activities</option>
          </select>
        </label>
        <label>
          Neighborhood
          <input
            type="text"
            name="neighborhood"
            placeholder="e.g. Fenway"
            value={draft.neighborhood}
            onChange={(event) => update('neighborhood', event.target.value)}
          />
        </label>
        <label>
          Budget
          <select
            name="budgetLevel"
            value={draft.budgetLevel}
            onChange={(event) => update('budgetLevel', event.target.value)}
          >
            <option value="">Any budget</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      <div className="campus-filters__actions">
        <button type="submit">Apply filters</button>
        <button type="button" className="campus-filters__clear" onClick={onClear}>
          Clear
        </button>
      </div>
    </form>
  );
}

CampusFilters.propTypes = {
  values: PropTypes.shape({
    keyword: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    neighborhood: PropTypes.string.isRequired,
    budgetLevel: PropTypes.string.isRequired,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default CampusFilters;
