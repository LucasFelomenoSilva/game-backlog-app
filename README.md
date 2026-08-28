# XpLog

Aplicação para organizar backlog de jogos, registrar conclusões e avaliações, acompanhar estatísticas e compartilhar a jornada com amigos.

## Recursos

- quadro com drag and drop entre “Jogando”, “Na fila” e “Instalados”;
- catálogo, busca global e cadastro com dados do IGDB;
- avaliações, platinas, histórico, conquistas e resumo anual;
- modo foco com registro local de sessões;
- perfis, amizades, comparações, chat e listas colaborativas;
- recomendador de jogos e sugestão inteligente baseada no histórico;
- temas, backup e restauração.

## Desenvolvimento

Requisitos: Node.js 20+ e um projeto Firebase com autenticação Google e Firestore.

1. Copie `.env.example` para `.env.local` e preencha os valores.
2. Instale as dependências com `npm install`.
3. Rode `npm run dev` para trabalhar apenas na interface.
4. Para testar também as funções `/api`, use `npx vercel dev`.

As chaves `TWITCH_CLIENT_SECRET` e `GEMINI_API_KEY` são exclusivas do servidor e não podem receber o prefixo `VITE_`.

## Verificações

- `npm run lint` valida o código.
- `npm run build` gera a versão de produção.
- `npm audit` verifica vulnerabilidades conhecidas nas dependências.
