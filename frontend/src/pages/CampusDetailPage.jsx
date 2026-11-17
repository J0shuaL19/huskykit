import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { deleteCampusPost, getCampusPost } from '../api/campus';
import { useAuth } from '../auth/AuthContext';
import './CampusDetailPage.css';

function CampusDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backUrl = '/campus' + (searchParams.toString() ? '?' + searchParams.toString() : '');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getCampusPost(id, controller.signal)
      .then((data) => setPost(data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const updated = post?.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'Unknown';

  async function removePost() {
    setDeleting(true);
    setActionError('');
    try {
      await deleteCampusPost(id);
      navigate('/campus');
    } catch (failure) {
      setActionError(failure.message);
      setDeleting(false);
    }
  }

  return (
    <div className="campus-detail page-shell">
      <Link className="campus-detail__back" to={backUrl}>
        ← Back to Campus Life
      </Link>
      {loading && (
        <p className="campus-detail__message" role="status">
          Loading post...
        </p>
      )}
      {!loading && error && (
        <p className="campus-detail__message campus-detail__message--error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && post && (
        <article className="campus-detail__article">
          <div className="campus-detail__tags">
            <span>{post.topic}</span>
            {post.isSynthetic && <span className="campus-detail__demo">Synthetic demo post</span>}
          </div>
          <h1>{post.title}</h1>
          <p className="campus-detail__summary">
            {post.neighborhood} <span aria-hidden="true">·</span> {post.budgetLevel} budget
          </p>
          <dl className="campus-detail__facts">
            <div>
              <dt>Location</dt>
              <dd>{post.location}</dd>
            </div>
            <div>
              <dt>Author</dt>
              <dd>{post.author}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{updated}</dd>
            </div>
          </dl>
          <section>
            <h2>Experience</h2>
            <p>{post.body}</p>
          </section>
          <section>
            <h2>Tips</h2>
            <p>{post.tips}</p>
          </section>
          {user && user.id === post.authorId && (
            <div className="campus-detail__actions">
              <Link to={'/campus/' + id + '/edit'}>Edit experience</Link>
              {!confirmDelete ? (
                <button type="button" onClick={() => setConfirmDelete(true)}>
                  Delete experience
                </button>
              ) : (
                <div role="group" aria-label="Confirm deletion">
                  <p>Delete this experience permanently?</p>
                  <button type="button" disabled={deleting} onClick={removePost}>
                    {deleting ? 'Deleting...' : 'Yes, delete'}
                  </button>{' '}
                  <button type="button" disabled={deleting} onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              )}
              {actionError && <p role="alert">{actionError}</p>}
            </div>
          )}
        </article>
      )}
    </div>
  );
}

CampusDetailPage.propTypes = {};

export default CampusDetailPage;
