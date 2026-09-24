# CT Escolinha de Vôlei

Plataforma web para gestão de uma escolinha de vôlei — dois perfis de acesso:
**Administrador/Professor** (controle total) e **Aluno/Atleta** (área individual
somente leitura).

Este repositório está na **Fase 4** do plano de implementação. Concluído até aqui:
- **Fase 1:** monorepo + Supabase Auth (JWT/role) + CRUD de Alunos.
- **Fase 2:** Turmas, Treinos, Frequência (ficha de chamada + histórico/%) e
  Financeiro (mensalidades por aluno).
- **Fase 3:** Pontuação (histórico com motivo), Ranking mensal calculado por
  turma e Relatório individual mensal (21 subitens em 4 categorias:
  técnico/físico/tático/mental).
- **Fase 4:** Dashboard completo do admin (alunos novos/saíram, pagamentos por
  status, frequência média do mês, ranking atual, próximos treinos), área do
  aluno reorganizada em menu (Início, Ranking, Evolução, Calendário,
  Relatórios, Perfil), comparação de posição no ranking ("faltam X pontos
  para o Yº"), calendário mensal de presença e histórico mensal
  (ranking/pontos/frequência/relatório por mês, últimos 6 meses).

## Stack

- **Backend:** Node.js + Express + TypeScript + `@supabase/supabase-js`
  (service role key) para acesso ao banco e operações de Auth.
- **Banco/Auth:** Supabase (PostgreSQL gerenciado + Supabase Auth).
- **Frontend:** React + TypeScript (Vite), React Router, TanStack Query,
  `supabase-js` (chave anônima, só para login/sessão), Tailwind CSS.

## Como a autenticação funciona

- O **frontend fala diretamente com o Supabase Auth** (`supabase.auth.signInWithPassword`)
  usando a chave anônima — não existe mais `/auth/login` no backend. O
  `supabase-js` já guarda a sessão e renova o token automaticamente.
- O **papel do usuário** (`admin` | `aluno`) fica em `app_metadata`, que só o
  backend (com a `service_role` key) consegue escrever. O usuário não
  consegue alterar isso pelo SDK client-side — diferente de `user_metadata`.
- Toda chamada ao backend Express carrega o token do Supabase no header
  `Authorization: Bearer`. O middleware `authenticate` valida esse token
  contra o Supabase e o middleware `authorize(role)` bloqueia rotas
  administrativas para quem não é admin — **no servidor**, não só escondendo
  botões na tela.

## Pré-requisitos

- Node.js 18+ (testado com Node 22)
- Uma conta e um projeto no [Supabase](https://supabase.com) (plano free serve)

## Passo a passo — Supabase (uma vez só)

1. Crie um projeto em supabase.com.
2. Vá em **SQL Editor** → New query, cole o conteúdo de
   `backend/supabase/schema.sql` e rode. Isso cria todas as tabelas, enums,
   habilita RLS (só o `service_role`, usado pelo backend, acessa os dados) e
   cria o bucket de Storage `fotos-alunos` (público) usado nas fotos de
   perfil.
3. Vá em **Project Settings → API** e anote:
   - `Project URL`
   - `anon public` key
   - `service_role` key (secreta — nunca vai para o frontend nem para o Git)

## Passo a passo — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `backend/.env` com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do passo
anterior.

Crie o usuário administrador de exemplo:

```bash
npm run seed:admin
```

Isso cria:
- **email:** `admin@ctescolinha.com`
- **senha:** `admin123`

> Troque essa senha antes de usar em produção.

Suba o servidor:

```bash
npm run dev
```

O backend sobe em `http://localhost:3333`. Teste com:

```bash
curl http://localhost:3333/health
```

## Passo a passo — Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edite `frontend/.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
(a chave **anon public**, não a service_role).

```bash
npm run dev
```

O frontend sobe em `http://localhost:5173`. Acesse essa URL, faça login com o
admin de exemplo e você cairá no painel administrativo, de onde pode
cadastrar novos alunos.

## O que já funciona (Fases 1 a 4)

- Login (admin e aluno) via Supabase Auth, com sessão e refresh automáticos
  no frontend.
- Middleware `authenticate` (valida o token do Supabase) + `authorize(role)`
  no backend — todas as rotas administrativas são bloqueadas no servidor
  para quem não é admin.
- CRUD completo de Alunos pelo admin: criar (cria também o usuário no
  Supabase Auth com role `aluno` em `app_metadata`), listar (com filtro por
  status), editar, ativar/desativar, remover, ver perfil individual. Foto de
  perfil: upload/troca/remoção (JPEG/PNG/WEBP até 5MB) via Supabase Storage
  (bucket `fotos-alunos`), exibida na listagem, no perfil e na home do aluno.
- CRUD de Turmas e Treinos (admin).
- Frequência: ficha de chamada por treino (marcar presente/falta/falta
  justificada em lote), histórico e percentual por aluno — visível para o
  admin (no perfil do aluno) e para o próprio aluno (na sua home). Toda
  presença gera **+5 pontos automáticos** (motivo "Presença no treino"),
  vinculados àquela frequência específica; se o status for trocado depois
  (deixar de ser presente), o ponto automático é removido — sem duplicar ao
  salvar a mesma chamada de novo.
- Financeiro: lançar mensalidades por aluno, marcar como paga/pendente/atrasada,
  histórico por aluno, contador de pendentes no dashboard do admin.
- Pontuação: lançamento manual de pontos por motivo (admin) + os pontos
  automáticos de presença acima, histórico e total por aluno — visível para
  o admin (no perfil do aluno) e para o próprio aluno.
- Ranking mensal: calculado sob demanda (soma de pontuações no mês de
  referência), filtrável por turma no admin; o aluno vê o ranking da própria
  turma, com sua posição destacada.
- Relatório individual mensal: nota (0-10) por subitem das 4 categorias —
  Técnico (controle de bola, levantamento, ataque, saque, recepção, defesa,
  virada de bola), Físico (resistência, velocidade, agilidade,
  condicionamento, intensidade), Tático (posicionamento, tomada de decisão,
  leitura de jogo, estratégia) e Mental/Comportamental (comprometimento,
  concentração, disciplina, confiança, trabalho em equipe) — mais pontos
  fortes, pontos a melhorar e objetivo do próximo mês (admin lança, aluno
  visualiza a média por categoria com opção de ver o detalhe por item).
  Tela `/admin/relatorios` lista todos os alunos ativos com status do mês
  (✅ lançado / ⏳ pendente) e link direto pro perfil de cada um.
- Área do aluno (`/aluno/*`) protegida por role, com menu próprio: Início
  (resumo + próximo treino), Ranking (com comparação "faltam X pontos para
  o Yº"), Evolução (histórico de pontuação + histórico mensal dos últimos 6
  meses), Calendário (presença por treino no mês), Relatórios e Perfil —
  tudo somente leitura.
- Dashboard do admin (`/admin`): alunos ativos/novos/que saíram no mês,
  pagamentos por status (pago/pendente/atrasado), frequência média do mês,
  relatórios lançados no mês (X de Y alunos), top 5 do ranking atual e
  próximos treinos agendados.

## Estrutura de pastas

```
backend/
  supabase/schema.sql    # SQL completo do domínio — rodar no SQL Editor do Supabase
  scripts/seed-admin.ts  # cria o usuário admin de exemplo
  src/
    routes/            # aluno, turma, treino, mensalidade, pontuacao, relatorio, ranking routes.ts
    controllers/        # validação (zod) + orquestração da resposta HTTP
    services/            # regras de negócio + acesso ao Supabase
      aluno.service.ts
      turma.service.ts
      treino.service.ts
      frequencia.service.ts   # ficha de chamada, histórico e % de presença
      mensalidade.service.ts
      pontuacao.service.ts    # lançamento de pontos e histórico por aluno
      relatorio.service.ts    # relatório mensal (21 subitens em 4 categorias)
      ranking.service.ts      # ranking calculado sob demanda por mês/turma
      dashboard.service.ts    # resumo agregado para o painel do admin
      historico.service.ts    # histórico mensal (ranking/pontos/frequência/relatório) do aluno
    middlewares/
      auth.middleware.ts              # authenticate (valida token Supabase) / authorize(role)
      errorHandler.ts
    lib/
      supabase.ts                     # cliente com service_role key
      env.ts
    server.ts

frontend/
  src/
    pages/admin/    # Dashboard, Alunos*, Turmas*, Treinos*, Chamada, Ranking
    pages/aluno/     # Home, Ranking, Evolucao, Calendario, Relatorios, Perfil (somente leitura)
    pages/auth/       # Login
    context/AuthContext.tsx   # usa supabase-js diretamente (login/logout/sessão)
    components/            # Layout (navegação admin/aluno), ProtectedRoute, StatusBadge,
                            # RelatorioNotas (form + resumo por categoria do relatório),
                            # FotoAlunoUpload (upload/troca/remoção de foto de perfil)
    utils/relatorio.ts     # categorias/subitens do relatório e cálculo de média
    utils/nome.ts           # iniciais do nome, usado no avatar quando não há foto
    hooks/                  # useAlunos, useTurmas, useTreinos, useFrequencia,
                            # useMensalidades, usePontuacoes, useRelatorios, useRanking,
                            # useDashboard
    services/
      supabaseClient.ts     # cliente com chave anônima (só Auth)
      api.ts                # axios → backend Express, injeta o token da sessão
      aluno.service.ts, turma.service.ts, treino.service.ts,
      frequencia.service.ts, mensalidade.service.ts,
      pontuacao.service.ts, relatorio.service.ts, ranking.service.ts,
      dashboard.service.ts
```

## Próximas fases (não implementadas ainda)

- **Fase 5:** Polimento de responsividade, estados de loading/erro, validações
  finas, gráficos de evolução, notificações.

O `supabase/schema.sql` já modela as tabelas `pontuacoes` e `relatorios` para
a Fase 3 não exigir migrations retroativas — mas as rotas/controllers dessas
entidades ainda não existem.
