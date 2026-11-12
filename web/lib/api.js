'use client';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

let csrfCache = null;

export function setCsrf(token) {
  csrfCache = token || null;
}

export function apiBase() {
  return BASE;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (method !== 'GET') {
    if (!csrfCache) {
      const sessionRes = await fetch(`${BASE}/api/auth/session`, { credentials: 'include' });
      const sessionData = await sessionRes.json().catch(() => ({}));
      csrfCache = sessionData.csrf || null;
    }
    if (csrfCache) headers['X-CSRF-Token'] = csrfCache;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Erro inesperado. Tente novamente.');
    error.status = res.status;
    if (res.status === 401) csrfCache = null;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
