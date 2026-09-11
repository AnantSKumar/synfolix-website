const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch (e) {
      // ignore non-JSON error bodies
    }
    const error = new Error(body.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.details = body.details;
    throw error;
  }

  return res.json();
}
