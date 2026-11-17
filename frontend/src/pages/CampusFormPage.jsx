import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getCampusPost, saveCampusPost } from '../api/campus';
import CampusPostForm from '../components/campus/CampusPostForm';
import './CampusFormPage.css';

function CampusFormPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setPost(null);
      setLoading(false);
      setError('');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getCampusPost(id, controller.signal)
      .then(setPost)
      .catch((failure) => {
        if (failure.name !== 'AbortError') setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  if (authLoading)
    return (
      <p className="page-shell" role="status">
        Checking your session...
      </p>
    );
  if (!user)
    return (
      <Navigate
        to={'/login?next=' + encodeURIComponent(id ? '/campus/' + id + '/edit' : '/campus/new')}
        replace
      />
    );

  const cancelTo = id ? '/campus/' + id : '/campus';
  async function save(values) {
    const saved = await saveCampusPost(values, id);
    navigate('/campus/' + saved.id);
  }

  return (
    <div className="campus-form-page page-shell">
      <Link to={cancelTo}>← Back to experiences</Link>
      <h1>{id ? 'Edit your experience' : 'Share a Campus Life experience'}</h1>
      {loading ? (
        <p role="status">Loading experience...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : id && post?.authorId !== user.id ? (
        <p role="alert">Only the author can edit this post.</p>
      ) : (
        <CampusPostForm
          key={id || 'new'}
          initialPost={id ? post : null}
          onSave={save}
          cancelTo={cancelTo}
        />
      )}
    </div>
  );
}

CampusFormPage.propTypes = {};

export default CampusFormPage;
