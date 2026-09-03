const rateBuckets = new Map();

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function requireFirebaseUser(request) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) throw new HttpError(401, 'Faça login para usar o catálogo.');

  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) throw new HttpError(503, 'Autenticação do servidor não configurada.');

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  );

  if (!response.ok) throw new HttpError(401, 'Sua sessão expirou. Entre novamente.');

  const data = await response.json();
  const user = data.users?.[0];
  if (!user?.localId) throw new HttpError(401, 'Sessão inválida.');
  return { uid: user.localId };
}

export function enforceRateLimit(key, { limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new HttpError(429, 'Muitas solicitações. Tente novamente em instantes.');
  }

  bucket.count += 1;
}

export function errorResponse(error, fallback = 'Erro interno.') {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError ? error.message : fallback;
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
