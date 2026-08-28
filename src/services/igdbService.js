export async function searchGameIGDB(gameName, { signal } = {}) {
    try {
        const response = await fetch('/api/igdb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: gameName }),
            signal,
        });
        const rawBody = await response.text();
        let data = null;
        try { data = rawBody ? JSON.parse(rawBody) : null; }
        catch { data = null; }

        if (!response.ok) {
            throw new Error(data?.error || `Falha na busca (${response.status}).`);
        }
        if (!Array.isArray(data)) throw new Error('O catálogo retornou uma resposta inválida.');
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        console.error("Erro ao buscar jogos no IGDB:", error);
        throw error;
    }
}
