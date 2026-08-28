function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: 'Recomendador não configurado.' }, 503);

    try {
      const { prompt } = await request.json();
      const description = String(prompt || '').trim().slice(0, 500);
      if (description.length < 3) return json({ error: 'Conte um pouco mais sobre o que quer jogar.' }, 400);

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const instruction = `Você é especialista em videogames. Recomende exatamente 3 jogos conhecidos que combinem com esta descrição: "${description}". Retorne somente os nomes, separados por vírgula, sem numeração ou introdução.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || 'A IA não respondeu.');
      const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
      const names = [...new Set(text.split(/[\n,]/).map(name => name.replace(/^\s*\d+[.)-]?\s*/, '').trim()).filter(Boolean))].slice(0, 3);
      if (!names.length) throw new Error('Não foi possível interpretar as recomendações.');
      return json({ names });
    } catch (error) {
      console.error('Recommendation proxy error:', error);
      return json({ error: error.message || 'Erro ao gerar recomendações.' }, 502);
    }
  },
};
