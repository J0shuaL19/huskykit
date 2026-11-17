import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './CampusPostCard.css';

function CampusPostCard({ post, returnQuery }) {
  const updated = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown';
  const detailUrl = '/campus/' + post.id + (returnQuery ? '?' + returnQuery : '');

  return (
    <article className="campus-post-card">
      <div className="campus-post-card__topline">
        <span className="campus-post-card__topic">{post.topic}</span>
        {post.isSynthetic && <span className="campus-post-card__demo">Demo post</span>}
      </div>
      <h2>
        <Link to={detailUrl}>{post.title}</Link>
      </h2>
      <p className="campus-post-card__meta">
        {post.neighborhood} <span aria-hidden="true">·</span> {post.budgetLevel} budget
      </p>
      <p className="campus-post-card__preview">{post.body}</p>
      <div className="campus-post-card__footer">
        <span>Updated {updated}</span>
        <Link to={detailUrl}>Read experience →</Link>
      </div>
    </article>
  );
}

CampusPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    topic: PropTypes.string.isRequired,
    neighborhood: PropTypes.string.isRequired,
    budgetLevel: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    isSynthetic: PropTypes.bool,
  }).isRequired,
  returnQuery: PropTypes.string.isRequired,
};

export default CampusPostCard;
