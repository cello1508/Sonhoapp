# Planejamento do MVP e Migração Web-to-App

Este documento detalha a estratégia para lançar o Mínimo Produto Viável (MVP) do **Laboratório dos Sonhos** e o roteiro para transformá-lo em um aplicativo nativo.

## 1. O MVP (Minimum Viable Product)

O foco do MVP é **Retenção e Hábito**. Precisamos provar que os usuários vão voltar todo dia para anotar os sonhos.

### Funcionalidades Essenciais (Core Loop)
1.  **Onboarding "Mágico":**
    *   Explicação rápida do que é Sonho Lúcido.
    *   Definição de uma meta (ex: "Ter meu primeiro sonho lúcido").
    *   Configuração do primeiro lembrete de Reality Check.
2.  **Diário de Sonhos Simplificado:**
    *   Botão grande "Registrar Sonho" ao abrir.
    *   Campos: Título, Descrição (voz-para-texto se possível), Data, Tags (ex: Pesadelo, Lúcido, Normal).
    *   Feedback imediato ao salvar (ex: ganho de XP).
3.  **Gamificação Básica:**
    *   **Streak (Ofensiva):** Contador de dias seguidos.
    *   **Nível de Sonhador:** Começa como "Sonâmbulo", vira "Explorador", etc.
4.  **Aba "Aprender" (Feed de Dicas):**
    *   Cards curtos com dicas diárias (ex: "Olhe para suas mãos agora").

### O que Fica de Fora do MVP (Backlog)
- Funcionalidades sociais (ver sonhos de outros, amigos).
- Loja de itens cosméticos complexa (apenas o básico visual).
- Gráficos avançados de análise de sono.
- Integração com Apple Watch/HealthKit (fase nativa).

---

## 2. Estranégia Técnica: De Webapp para App Store

Para garantir velocidade de desenvolvimento agora e facilidade de publicação depois, seguiremos esta rota:

### Estágio 1: Webapp Responsivo (Mobile First)
*   **Tecnologia:** React (Next.js ou Vite).
*   **Design:** Criar interfaces pensando **estritamente** em telas de celular (botões grandes, navegação por abas na parte inferior).
*   **PWA (Progressive Web App):** Configurar `manifest.json` para permitir que usuários instalem na tela inicial e tenham ícone de app.

### Estágio 2: Hybrid Shell (Preparação para App Store)
*   **Tecnologia:** **CapacitorJS** ou **React Native**.
*   **Abordagem Recomendada: React Native com Expo.**
    *   *Por que?* O Expo permite reutilizar muita lógica de JavaScript/React, mas entrega uma experiência 100% nativa, que é exigida pela Apple para aprovação (apps que são apenas "sites encapsulados" frequentemente são rejeitados).
*   **Ação Prática:**
    *   Ao escrever o código do Webapp, separar a lógica de negócio (Hooks, Contexts) da UI (HTML/CSS).
    *   Isso permitirá portar a lógica para React Native facilmente, trocando apenas `<div>` por `<View>` e `<img>` por `<Image>`.

### Estágio 3: Publicação
1.  Criar conta de desenvolvedor Apple/Google.
2.  Configurar ícones e splash screens.
3.  Implementar Login Social (Google/Apple) - Obrigatório para apps iOS que têm login.
4.  Submeter para review.

## 3. Estrutura de Banco de Dados Sugerida (Supabase/Firebase)

### Tabela: `users`
- `id`: UUID
- `username`: String
- `xp`: Integer
- `streak_count`: Integer
- `last_activity_date`: DateTime
- `currency` (Cristais/Onirocoins): Integer

### Tabela: `dreams`
- `id`: UUID
- `user_id`: FK
- `title`: String
- `content`: Text
- `clarity_level`: 1-5
- `is_lucid`: Boolean
- `created_at`: DateTime
- `tags`: Array<String>

### Tabela: `challenges` (Missões Diárias)
- `id`: UUID
- `description`: String
- `xp_reward`: Integer
- `completed`: Boolean
