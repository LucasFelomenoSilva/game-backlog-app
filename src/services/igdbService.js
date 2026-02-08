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
    // Se já temos um token, reutiliza (você pode adicionar lógica de expiração aqui futuramente)
    if (accessToken) {
        return accessToken;
    }

    try {
        // CORREÇÃO AQUI: Enviar credenciais no Body em vez da URL
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
            const errorData = await response.json().catch(() => ({}));
            console.error("Erro Auth Twitch:", errorData);
            throw new Error(`Auth Failed: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Erro crítico na autenticação IGDB/Twitch:", error);
        toast.error("Erro de conexão com IGDB. Verifique suas chaves no .env");
        return null;
    }
}

/**
 * 2. Busca jogos usando o Access Token no IGDB.
 */
export async function searchGameIGDB(gameName) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        toast.error("Credenciais IGDB não configuradas no .env");
        return [];
    }

    const token = await getAccessToken();
    if (!token) {
        return [];
    }

    // O corpo da requisição é escrito na linguagem de consulta do IGDB (AQL)
    const body = `
        fields name, cover.url, genres.name, involved_companies.company.name;
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

        if (!response.ok) {
            throw new Error(`API Failed: ${response.statusText}`);
        }

        const results = await response.json();

        return results.map(game => ({
            id: game.id.toString(),
            nome: game.name,
            timeToBeat: 0, // Placeholder
            // Melhora a qualidade da imagem trocando 'thumb' por 'cover_big'
            imageUrl: game.cover?.url ? `https:${game.cover.url}`.replace('thumb', 'cover_big') : '',
            genre: game.genres?.[0]?.name || 'Outro',
            platform: game.involved_companies?.[0]?.company?.name || 'PC',
        }));

    } catch (error) {
        console.error("Erro ao buscar jogos no IGDB:", error);
        toast.error("Erro na busca de jogos.");
        return [];
    }
}