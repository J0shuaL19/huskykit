import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { topics, programs } from '../../academicOptions';
import './AcademicFilters.css';

function AcademicFilters({ values, onApply, onClear }) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    setDraft(values);
  }, [values.keyword, values.topic, values.program, values.courseCode]);

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onApply(draft);
  }

  return (
    <form
      className="academic-filters"
      onSubmit={submit}
      aria-label="Filter Academic Experiences posts"
    >
      <div className="academic-filters__grid">
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
            {topics.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Program
          <select
            name="program"
            value={draft.program}
            onChange={(event) => update('program', event.target.value)}
          >
            <option value="">All programs</option>
            {programs.map((program) => (
              <option key={program}>{program}</option>
            ))}
          </select>
        </label>
        <label>
          Course code
          <input
            type="search"
            placeholder="e.g. CS 5610"
            maxLength={20}
            name="courseCode"
            value={draft.courseCode}
            onChange={(event) => update('courseCode', event.target.value)}
          />
        </label>
      </div>
      <div className="academic-filters__actions">
        <button type="submit">Apply filters</button>
        <button type="button" className="academic-filters__clear" onClick={onClear}>
          Clear
        </button>
      </div>
    </form>
  );
}

AcademicFilters.propTypes = {
  values: PropTypes.shape({
    keyword: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    program: PropTypes.string.isRequired,
    courseCode: PropTypes.string.isRequired,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default AcademicFilters;
