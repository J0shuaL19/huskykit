export async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    signal,
    ...(method !== 'GET'
      ? {
          headers: { 'Content-Type': 'application/json', 'X-HuskyKit': '1' },
          body: JSON.stringify(body ?? {}),
        }
      : {}),
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data;
}
