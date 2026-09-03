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

function mapIGDBGenre(igdbGenre) {
  if (!igdbGenre) return 'Ação';
  const g = igdbGenre.toLowerCase();
  if (g.includes('role-playing') || g.includes('rpg')) return 'RPG';
  if (g.includes('shooter') || g.includes('fps')) return 'FPS';
  if (g.includes('platform')) return 'Plataforma';
  if (g.includes('strategy') || g.includes('tactical') || g.includes('turn-based')) return 'Estratégia';
  if (g.includes('puzzle') || g.includes('quiz')) return 'Puzzle';
  if (g.includes('simulator') || g.includes('racing')) return 'Simulação';
  if (g.includes('rogue')) return 'Roguelite';
  if (g.includes('adventure')) return 'Aventura';
  if (g.includes('action') || g.includes('fighting') || g.includes('hack')) return 'Ação';
  return 'Outro';
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
      const gameIds = games.map(g => g.id).filter(Boolean);

      const timeMap = new Map();
      if (gameIds.length > 0) {
        try {
          const ttbRes = await fetch('https://api.igdb.com/v4/game_time_to_beats', {
            method: 'POST',
            headers: {
              'Client-ID': clientId,
              Authorization: `Bearer ${token}`,
              'Content-Type': 'text/plain',
            },
            body: `fields game, normally, completely; where game = (${gameIds.join(',')}); limit 20;`,
          });
          if (ttbRes.ok) {
            const ttbList = await ttbRes.json();
            if (Array.isArray(ttbList)) {
              ttbList.forEach(item => {
                const sec = item.normally || item.completely || 0;
                if (sec > 0) {
                  timeMap.set(String(item.game), Math.round(sec / 3600));
                }
              });
            }
          }
        } catch {
          // fallback silencioso caso HowLongToBeat/IGDB falhe
        }
      }

      return json(games.map(game => {
        const rawGenre = game.genres?.[0]?.name || '';
        const mappedGenre = mapIGDBGenre(rawGenre);
        const hours = timeMap.get(String(game.id)) || 0;
        return {
          id: String(game.id),
          nome: game.name,
          timeToBeat: hours,
          imageUrl: game.cover?.url ? `https:${game.cover.url}`.replace('/t_thumb/', '/t_1080p/') : '',
          genre: mappedGenre,
          platform: game.platforms?.slice(0, 2).map(platform => platform.name).join(' | ') || 'Multi',
          summary: game.summary || '',
          releaseDate: game.first_release_date
            ? new Date(game.first_release_date * 1000).toLocaleDateString('pt-BR')
            : 'Data desconhecida',
        };
      }));
    } catch (error) {
      if (!(error instanceof HttpError) || error.status >= 500) {
        console.error('IGDB proxy error:', error);
      }
      return errorResponse(error, 'Erro ao buscar jogos.');
    }
  },
};
