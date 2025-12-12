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

    const url = `${AUTH_PROXY_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;

    try {
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Auth Failed: ${response.statusText}`);
        }
        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Erro na autenticação IGDB/Twitch:", error);
        toast.error("Erro de autenticação IGDB. Verifique Client ID e Secret.");
        return null;
    }
}

/**
 * 2. Busca jogos usando o Access Token no IGDB.
 */
export async function searchGameIGDB(gameName) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        toast.error("Credenciais IGDB não configuradas no .env.local.");
        return [];
    }

    const token = await getAccessToken();
    if (!token) {
        return [];
    }

    const url = IGDB_PROXY_URL;

    // O corpo da requisição é escrito na linguagem de consulta do IGDB (AQL)
    const body = `
        fields name, cover.url, genres.name, involved_companies.company.name;
        search "${gameName}";
        where cover != null;
        limit 10;
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error(`API Failed: ${response.statusText}`);
        }

        const results = await response.json();

        return results.map(game => ({
            id: game.id.toString(),
            nome: game.name,
            // IGDB não fornece tempo médio. Usamos um placeholder.
            timeToBeat: 0,
            // URL da imagem é construída a partir da URL miniatura (thumb) para uma versão maior (cover_big)
            imageUrl: game.cover?.url ? `https:${game.cover.url}`.replace('thumb', 'cover_big') : '',
            // Pega o primeiro gênero
            genre: game.genres?.[0]?.name || 'Ação (API)',
            // Usa o nome da primeira empresa envolvida como "Plataforma" (placeholder)
            platform: game.involved_companies?.[0]?.company?.name || 'Múltiplas (API)',
        }));

    } catch (error) {
        console.error("Erro ao buscar jogos no IGDB:", error);
        toast.error("Erro ao buscar jogos na IGDB. Tente novamente.");
        return [];
    }
}