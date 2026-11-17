import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCampusPosts } from '../api/campus';
import CampusFilters from '../components/campus/CampusFilters';
import CampusPostCard from '../components/campus/CampusPostCard';
import './CampusListPage.css';

function CampusListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const values = {
    keyword: searchParams.get('keyword') || '',
    topic: searchParams.get('topic') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    budgetLevel: searchParams.get('budgetLevel') || '',
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getCampusPosts(query, controller.signal)
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

  return (
    <div className="campus-list page-shell">
      <div className="campus-list__intro">
        <p className="campus-list__eyebrow">Explore experiences</p>
        <h1>Campus Life</h1>
        <p>Find student perspectives on housing, commuting, food, and local activities.</p>
      </div>
      <CampusFilters values={values} onApply={applyFilters} onClear={() => setSearchParams({})} />

      <section className="campus-list__results" aria-labelledby="results-heading">
        <div className="campus-list__results-heading">
          <h2 id="results-heading">Experiences</h2>
          {!loading && !error && result && (
            <p aria-live="polite">
              {result.total} {result.total === 1 ? 'post' : 'posts'} found
            </p>
          )}
        </div>
        {loading && (
          <p className="campus-list__message" role="status">
            Loading posts...
          </p>
        )}
        {!loading && error && (
          <p className="campus-list__message campus-list__message--error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && result?.posts.length === 0 && (
          <p className="campus-list__message">
            No posts match these filters. Try a broader search.
          </p>
        )}
        {!loading && !error && result?.posts.length > 0 && (
          <>
            <div className="campus-list__cards">
              {result.posts.map((post) => (
                <CampusPostCard key={post.id} post={post} returnQuery={query} />
              ))}
            </div>
            {pageCount > 1 && (
              <nav className="campus-list__pagination" aria-label="Results pages">
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

CampusListPage.propTypes = {};

export default CampusListPage;
