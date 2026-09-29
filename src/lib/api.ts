const API_BASE = '/api';

export class ApiError extends Error {
  code?: string;
  constructor(message: string, public status: number, code?: string) {
    super(message);
    this.code = code;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; count?: number; unreadCount?: number }> {
  const token = localStorage.getItem('fixmate_token');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      json.message || `Request failed with status ${res.status}`,
      res.status,
      json.code
    );
  }

  return json;
}
