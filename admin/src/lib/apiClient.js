const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("synfolix_admin_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

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

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
