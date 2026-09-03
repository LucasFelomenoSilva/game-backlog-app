import { enforceRateLimit, errorResponse, HttpError, requireFirebaseUser } from './_auth.js';

let cachedToken = null;
let tokenExpiresAt = 0;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function getAccessToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' });
  if (!response.ok) throw new Error('Não foi possível autenticar no catálogo de jogos.');

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + Math.max((data.expires_in - 300) * 1000, 60_000);
  return cachedToken;
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

    try {
      let rateKey = 'igdb:anon';
      try {
        const user = await requireFirebaseUser(request);
        rateKey = `igdb:${user.uid}`;
      } catch {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
        rateKey = `igdb:ip:${ip}`;
      }
      enforceRateLimit(rateKey, { limit: 60, windowMs: 60_000 });

      const clientId = process.env.TWITCH_CLIENT_ID;
      const clientSecret = process.env.TWITCH_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new HttpError(503, 'Catálogo de jogos não configurado.');
      }

      const { query } = await request.json();
      const cleanQuery = String(query || '').trim().slice(0, 100);
      if (cleanQuery.length < 2) throw new HttpError(400, 'Digite ao menos 2 caracteres.');

      const safeQuery = cleanQuery.replace(/["\\]/g, ' ');
      const token = await getAccessToken(clientId, clientSecret);
      const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: `fields name, cover.url, genres.name, platforms.name, summary, first_release_date; search "${safeQuery}"; where cover != null & version_parent = null; limit 10;`,
      });

      if (!igdbResponse.ok) throw new Error('O catálogo de jogos não respondeu.');
      const games = await igdbResponse.json();
      return json(games.map(game => ({
        id: String(game.id),
        nome: game.name,
        timeToBeat: 0,
        imageUrl: game.cover?.url ? `https:${game.cover.url}`.replace('/t_thumb/', '/t_1080p/') : '',
        genre: game.genres?.[0]?.name || 'Outro',
        platform: game.platforms?.slice(0, 2).map(platform => platform.name).join(' | ') || 'Multi',
        summary: game.summary || '',
        releaseDate: game.first_release_date
          ? new Date(game.first_release_date * 1000).toLocaleDateString('pt-BR')
          : 'Data desconhecida',
      })));
    } catch (error) {
      if (!(error instanceof HttpError) || error.status >= 500) {
        console.error('IGDB proxy error:', error);
      }
      return errorResponse(error, 'Erro ao buscar jogos.');
    }
  },
};
