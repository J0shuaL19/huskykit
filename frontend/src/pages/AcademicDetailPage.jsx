import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { deleteAcademicPost, getAcademicPost } from '../api/academic';
import { useAuth } from '../auth/AuthContext';
import { topicLabel } from '../academicOptions';
import './AcademicDetailPage.css';

function AcademicDetailPage() {
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
  const backUrl = '/academic' + (searchParams.toString() ? '?' + searchParams.toString() : '');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getAcademicPost(id, controller.signal)
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
      await deleteAcademicPost(id);
      navigate('/academic');
    } catch (failure) {
      setActionError(failure.message);
      setDeleting(false);
    }
  }

  return (
    <div className="academic-detail page-shell">
      <Link className="academic-detail__back" to={backUrl}>
        ← Back to Academic Experiences
      </Link>
      {loading && (
        <p className="academic-detail__message" role="status">
          Loading post...
        </p>
      )}
      {!loading && error && (
        <p className="academic-detail__message academic-detail__message--error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && post && (
        <article className="academic-detail__article">
          <div className="academic-detail__tags">
            <span>{topicLabel(post.topic)}</span>
            {post.isSynthetic && <span className="academic-detail__demo">Synthetic demo post</span>}
          </div>
          <h1>{post.title}</h1>
          <p className="academic-detail__summary">
            {post.program} <span aria-hidden="true">·</span> {post.courseCode || 'General advice'}
          </p>
          <dl className="academic-detail__facts">
            <div>
              <dt>Course code</dt>
              <dd>{post.courseCode || 'Not course-specific'}</dd>
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
            <div className="academic-detail__actions">
              <Link to={'/academic/' + id + '/edit'}>Edit experience</Link>
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

AcademicDetailPage.propTypes = {};

export default AcademicDetailPage;
