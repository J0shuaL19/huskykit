async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Could not load Campus Life posts.');
  }
  return data;
}

export async function getCampusPosts(query, signal) {
  const suffix = query ? '?' + query : '';
  const response = await fetch('/api/campus-posts' + suffix, { signal });
  return readJson(response);
}

export async function getCampusPost(id, signal) {
  const response = await fetch('/api/campus-posts/' + encodeURIComponent(id), { signal });
  return readJson(response);
}
