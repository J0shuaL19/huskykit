import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getAcademicPosts } from '../api/academic';
import AcademicFilters from '../components/academic/AcademicFilters';
import AcademicPostCard from '../components/academic/AcademicPostCard';
import './AcademicListPage.css';

// Jharshini - keeping the filters and page number in the URL with useSearchParams is
// a good move. Allows the search to be shared/bookmarked/refreshed without losing it
// I also like that your page haneles loading, error, and other states separately 
// and role="alert" for screen readers
function AcademicListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const values = {
    keyword: searchParams.get('keyword') || '',
    topic: searchParams.get('topic') || '',
    program: searchParams.get('program') || '',
    courseCode: searchParams.get('courseCode') || '',
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getAcademicPosts(query, controller.signal)
      .then((data) => setResult(data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  function applyFilters(filters) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) next.set(key, value.trim());
    }
    setSearchParams(next);
  }

  function changePage(page) {
    const next = new URLSearchParams(searchParams);
    if (page === 1) next.delete('page');
    else next.set('page', String(page));
    setSearchParams(next);
  }

  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  // Jharshini - one suggestion, instead of replacing the list with "Loading posts" on filter/page change
  // it would be better to have the old results stay visible but perhaps faded until loading is complete
  // so the page doesn't flash during loading
  return (
    <div className="academic-list page-shell">
      <div className="academic-list__intro">
        <p className="academic-list__eyebrow">Explore experiences</p>
        <h1>Academic Experiences</h1>
        <p>
          Find student perspectives on study tips, course planning, group projects, and academic
          resources.
        </p>
        <Link
          className="academic-list__create"
          to={user ? '/academic/new' : '/login?next=/academic/new'}
        >
          Share an experience →
        </Link>
      </div>
      <AcademicFilters values={values} onApply={applyFilters} onClear={() => setSearchParams({})} />

      <section className="academic-list__results" aria-labelledby="results-heading">
        <div className="academic-list__results-heading">
          <h2 id="results-heading">Experiences</h2>
          {!loading && !error && result && (
            <p aria-live="polite">
              {result.total} {result.total === 1 ? 'post' : 'posts'} found
            </p>
          )}
        </div>
        {loading && (
          <p className="academic-list__message" role="status">
            Loading posts...
          </p>
        )}
        {!loading && error && (
          <p className="academic-list__message academic-list__message--error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && result?.posts.length === 0 && (
          <p className="academic-list__message">
            No posts match these filters. Try a broader search.
          </p>
        )}
        {!loading && !error && result?.posts.length > 0 && (
          <>
            <div className="academic-list__cards">
              {result.posts.map((post) => (
                <AcademicPostCard key={post.id} post={post} returnQuery={query} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav className="academic-list__pagination" aria-label="Results pages">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => changePage(result.page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {result.page} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={result.page >= pageCount}
                  onClick={() => changePage(result.page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

AcademicListPage.propTypes = {};

export default AcademicListPage;
