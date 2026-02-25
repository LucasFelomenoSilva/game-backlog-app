import { toast } from 'react-hot-toast';

const AUTH_PROXY_URL = '/twitch-auth-proxy/oauth2/token';
const IGDB_PROXY_URL = '/igdb-proxy/v4/games';

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_TWITCH_CLIENT_SECRET;

let accessToken = '';

async function getAccessToken() {
    if (accessToken) return accessToken;

    try {
        const response = await fetch(AUTH_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
 * Converte a URL da imagem IGDB para o tamanho desejado.
 * Tamanhos disponíveis: thumb, cover_small, cover_big, 720p, 1080p
 * Usamos 1080p para máxima qualidade nas capas.
 */
function getHighQualityImageUrl(url) {
    if (!url) return '';
    // A URL vinda da API sempre começa com //images.igdb.com/igdb/image/upload/t_thumb/...
    // Precisamos trocar "t_thumb" pelo tamanho desejado
    return `https:${url}`.replace('/t_thumb/', '/t_1080p/');
}

export async function searchGameIGDB(gameName) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        toast.error("Credenciais IGDB não configuradas no .env");
        return [];
    }

    const token = await getAccessToken();
    if (!token) return [];

    const body = `
        fields name, cover.url, genres.name, involved_companies.company.name, summary, first_release_date;
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
            body,
        });

        if (!response.ok) throw new Error(`API Failed: ${response.statusText}`);

        const results = await response.json();

        return results.map(game => ({
            id: game.id.toString(),
            nome: game.name,
            timeToBeat: 0,
            // CORRIGIDO: usa 1080p ao invés de cover_big (264×374 → 1920×1080)
            imageUrl: getHighQualityImageUrl(game.cover?.url),
            genre: game.genres?.[0]?.name || 'Outro',
            platform: game.involved_companies?.[0]?.company?.name || 'PC',
            summary: game.summary || '',
            releaseDate: game.first_release_date
                ? new Date(game.first_release_date * 1000).toLocaleDateString()
                : 'Data desconhecida'
        }));

    } catch (error) {
        console.error("Erro ao buscar jogos no IGDB:", error);
        toast.error("Erro na busca de jogos.");
        return [];
    }
}