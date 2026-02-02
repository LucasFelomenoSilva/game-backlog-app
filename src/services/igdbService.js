import { toast } from 'react-hot-toast';

// URLs de Proxy (configurados no vite.config.js)
const AUTH_PROXY_URL = '/twitch-auth-proxy/oauth2/token';
const IGDB_PROXY_URL = '/igdb-proxy/v4/games';

// Variáveis de ambiente
const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_TWITCH_CLIENT_SECRET;

let accessToken = '';

/**
 * 1. Obtém o Access Token do Twitch/IGDB.
 */
async function getAccessToken() {
    if (accessToken) {
        return accessToken;
    }

    try {
        const response = await fetch(AUTH_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error(`Auth Failed: ${response.status}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Erro Auth Twitch:", error);
        return null;
    }
}

/**
 * 2. Busca jogos usando o Access Token no IGDB.
 */
export async function searchGameIGDB(gameName) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        toast.error("Credenciais IGDB não configuradas.");
        return [];
    }

    const token = await getAccessToken();
    if (!token) return [];

    // ADICIONEI: summary, total_rating
    const body = `
        fields name, cover.url, genres.name, involved_companies.company.name, summary, total_rating;
        search "${gameName}";
        where cover != null;
        limit 10;
    `;

    try {
        const response = await fetch(IGDB_PROXY_URL, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain',
            },
            body: body,
        });

        if (!response.ok) throw new Error("Erro na API IGDB");

        const results = await response.json();

        return results.map(game => ({
            id: game.id.toString(),
            nome: game.name,
            timeToBeat: 0,
            imageUrl: game.cover?.url ? `https:${game.cover.url}`.replace('thumb', 'cover_big') : '',
            genre: game.genres?.[0]?.name || 'Outro',
            platform: game.involved_companies?.[0]?.company?.name || 'PC',
            // Novos campos para o detalhe:
            summary: game.summary || "Sem descrição disponível.",
            rating: game.total_rating ? Math.round(game.total_rating) : null
        }));

    } catch (error) {
        console.error("Erro IGDB:", error);
        return [];
    }
}