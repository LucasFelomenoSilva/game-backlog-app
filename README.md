# 🎮 Game Backlog App

## 📖 Sobre o Projeto

O **Game Backlog App** é uma aplicação web desenvolvida para auxiliar jogadores no gerenciamento de suas bibliotecas de jogos, permitindo organizar títulos, acompanhar o progresso, registrar conquistas, comparar estatísticas e manter um histórico completo da experiência do usuário.

O projeto foi desenvolvido utilizando tecnologias modernas do ecossistema JavaScript, com foco em uma arquitetura baseada em componentes reutilizáveis, interface responsiva e experiência do usuário intuitiva.

Além das funcionalidades tradicionais de gerenciamento de backlog, a aplicação incorpora recursos voltados à produtividade e interação social, tornando-se uma plataforma completa para organização de coleções de jogos.

---

# 🎯 Objetivos

O projeto foi desenvolvido com os seguintes objetivos:

* Aplicar conceitos modernos de desenvolvimento Front-end;
* Construir uma aplicação SPA (Single Page Application);
* Desenvolver componentes reutilizáveis;
* Implementar gerenciamento eficiente de estado;
* Criar uma interface intuitiva e responsiva;
* Explorar funcionalidades avançadas de organização de dados;
* Demonstrar boas práticas de arquitetura React.

---

# 🚀 Principais Funcionalidades

## 🎮 Gerenciamento de Jogos

* Cadastro de jogos
* Edição de informações
* Remoção de jogos
* Organização por categorias
* Status de progresso
* Avaliação pessoal
* Registro de horas jogadas
* Plataforma do jogo

---

## 🏆 Sistema de Conquistas

* Registro de achievements
* Acompanhamento de progresso
* Estatísticas de conclusão
* Percentual de conquistas desbloqueadas

---

## 📊 Dashboard

* Total de jogos
* Jogos concluídos
* Jogos em andamento
* Jogos pendentes
* Horas jogadas
* Estatísticas gerais

---

## 🔥 Activity Heatmap

Visualização gráfica da atividade do usuário ao longo do tempo, permitindo identificar frequência de utilização e evolução do backlog.

---

## 👥 Colaboração

O sistema possui recursos voltados para interação entre usuários, como:

* Compartilhamento
* Comparação entre bibliotecas
* Comparação de progresso
* Recursos colaborativos

---

## 💬 Chat

Comunicação entre usuários diretamente pela plataforma.

---

## 🎯 Focus Mode

Modo dedicado para auxiliar o usuário a focar em um único jogo, reduzindo distrações e incentivando a conclusão do backlog.

---

## 🏷️ Sistema de Tags

Permite criar categorias personalizadas para organizar os jogos.

Exemplos:

* RPG
* Indie
* Coop
* Multiplayer
* Retro
* Favoritos

---

## ☁️ Backup e Restauração

A aplicação permite realizar backup dos dados do usuário e restaurar posteriormente, garantindo maior segurança das informações.

---

## 📦 Drag and Drop

Organização intuitiva da biblioteca utilizando movimentação por arrastar e soltar (Drag and Drop).

---

## 🔍 Pesquisa

Localização rápida de jogos através de filtros e pesquisa.

---

## 📱 Interface Responsiva

A aplicação adapta sua interface para diferentes tamanhos de tela:

* Desktop
* Notebook
* Tablet
* Smartphone

---

# 🛠 Tecnologias Utilizadas

## Front-end

* React
* Vite
* JavaScript ES6+
* HTML5
* CSS3

## Bibliotecas

* React Hooks
* Context API
* Drag and Drop
* Local Storage
* Componentes reutilizáveis

---

# 📂 Estrutura do Projeto

```text
src/

├── assets/
│
├── components/
│   ├── ActivityHeatmap
│   ├── AddGameModal
│   ├── Achievement
│   ├── BackupRestore
│   ├── Chat
│   ├── Collaboration
│   ├── DragDrop
│   ├── FocusMode
│   ├── FriendCompare
│   ├── GameCard
│   ├── Navbar
│   ├── Sidebar
│   ├── Tags
│   └── ...
│
├── contexts/
│
├── hooks/
│
├── pages/
│
├── services/
│
├── utils/
│
└── App.jsx
```

Cada módulo foi desenvolvido seguindo o princípio da responsabilidade única, facilitando manutenção e escalabilidade.

---

# 🏗 Arquitetura

A aplicação segue uma arquitetura baseada em componentes React.

```text
Usuário

↓

Interface

↓

Componentes React

↓

Context API

↓

Serviços

↓

Persistência de Dados

↓

Local Storage
```

Essa organização permite reutilização de componentes, desacoplamento entre interface e lógica de negócio e melhor manutenção do código.

---

# ⚙️ Fluxo da Aplicação

```text
Usuário

↓

Login / Entrada

↓

Dashboard

↓

Biblioteca

↓

Adicionar Jogos

↓

Editar

↓

Atualizar Progresso

↓

Conquistas

↓

Heatmap

↓

Backup

↓

Compartilhar Dados
```

---

# 💻 Funcionalidades Técnicas

Durante o desenvolvimento foram utilizados diversos recursos modernos do React, incluindo:

* Componentização
* Hooks
* Context API
* Estado Global
* Estado Local
* Eventos
* Persistência Local
* Componentes Dinâmicos
* Renderização Condicional
* Reutilização de Código

---

# 📦 Instalação

Clone o projeto

```bash
git clone https://github.com/seuusuario/game-backlog-app.git
```

Entre na pasta

```bash
cd game-backlog-app
```

Instale as dependências

```bash
npm install
```

---

# ▶️ Executando

Modo desenvolvimento

```bash
npm run dev
```

Build

```bash
npm run build
```

Preview

```bash
npm run preview
```

---

# 📊 Recursos Desenvolvidos

* Sistema de gerenciamento de backlog
* Dashboard interativo
* Sistema de conquistas
* Heatmap de atividades
* Organização por categorias
* Filtros personalizados
* Busca dinâmica
* Comparação entre usuários
* Chat
* Backup dos dados
* Interface responsiva
* Componentes reutilizáveis

---

# 🧠 Conceitos Aplicados

* Single Page Application (SPA)
* Componentização
* Arquitetura React
* Gerenciamento de Estado
* Hooks
* Context API
* Persistência Local
* Responsividade
* UX/UI
* Modularização
* Reutilização de Componentes

---

# 📈 Possíveis Melhorias

O projeto foi estruturado de forma a permitir futuras expansões, como:

* Autenticação JWT
* Integração com Firebase
* Banco de dados PostgreSQL
* API própria
* Sincronização em nuvem
* Lista de amigos
* Rankings
* Gamificação
* Sistema de notificações
* Modo offline
* PWA
* Integração com Steam API
* Integração com RAWG API
* Estatísticas avançadas
* Inteligência Artificial para recomendações de jogos

---

# 🎓 Competências Demonstradas

Este projeto evidencia experiência com:

* React
* Vite
* JavaScript Moderno
* Desenvolvimento Front-end
* Componentização
* Gerenciamento de Estado
* Organização de Código
* Desenvolvimento Responsivo
* UX/UI
* Arquitetura SPA
* Persistência de Dados
* Engenharia de Software

---

# 📚 Aprendizados

Durante o desenvolvimento deste projeto foram aprofundados conhecimentos em arquitetura de aplicações Front-end, gerenciamento de estado, organização modular, reutilização de componentes, persistência de dados e construção de interfaces modernas utilizando React.

O projeto também proporcionou experiência prática na implementação de funcionalidades avançadas voltadas à experiência do usuário, como dashboards interativos, visualização de estatísticas, organização dinâmica de informações e colaboração entre usuários.

---

# 👨‍💻 Autor

**Lucas Felomeno Silva**

Projeto desenvolvido para fins acadêmicos e aperfeiçoamento profissional, demonstrando conhecimentos em desenvolvimento Front-end moderno, React, Vite, arquitetura baseada em componentes, gerenciamento de estado e construção de aplicações web escaláveis.
