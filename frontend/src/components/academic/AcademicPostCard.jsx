import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { topicLabel } from '../../academicOptions';
import './AcademicPostCard.css';

function AcademicPostCard({ post, returnQuery }) {
  const updated = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown';
  const detailUrl = '/academic/' + post.id + (returnQuery ? '?' + returnQuery : '');

  return (
    <article className="academic-post-card">
      <div className="academic-post-card__topline">
        <span className="academic-post-card__topic">{topicLabel(post.topic)}</span>
        {post.isSynthetic && <span className="academic-post-card__demo">Demo post</span>}
      </div>
      <h2>
        <Link to={detailUrl}>{post.title}</Link>
      </h2>
      <p className="academic-post-card__meta">
        {post.program} <span aria-hidden="true">·</span> {post.courseCode || 'General advice'}
      </p>
      <p className="academic-post-card__preview">{post.body}</p>
      <div className="academic-post-card__footer">
        <span>Updated {updated}</span>
        <Link to={detailUrl}>Read experience →</Link>
      </div>
    </article>
  );
}

AcademicPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    program: PropTypes.string.isRequired,
    courseCode: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    isSynthetic: PropTypes.bool,
  }).isRequired,
  returnQuery: PropTypes.string.isRequired,
};

export default AcademicPostCard;
