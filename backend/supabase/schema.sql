-- Schema completo do domínio (CT / Escolinha de Vôlei) para rodar no Supabase.
-- Cole este arquivo inteiro em: Supabase Dashboard → SQL Editor → New query → Run.
--
-- Fases 1 e 2 usam: usuarios, alunos, turmas, treinos, frequencias, mensalidades.
-- As tabelas de pontuacoes e relatorios já são criadas aqui para a Fase 3 não
-- exigir migrations retroativas.
--
-- "usuarios" espelha "auth.users" (gerenciada pelo Supabase Auth): cada linha em
-- auth.users criada via supabaseAdmin.auth.admin.createUser deve ter uma linha
-- correspondente aqui com nome/email/role. O id é o mesmo (FK para auth.users).

create extension if not exists pgcrypto;

do $$ begin
  create type role as enum ('admin', 'aluno');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_aluno as enum ('ativo', 'inativo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_frequencia as enum ('presente', 'falta', 'falta_justificada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_mensalidade as enum ('pago', 'pendente', 'atrasado');
exception when duplicate_object then null; end $$;

create table if not exists usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  role role not null,
  criado_em timestamptz not null default now()
);

create table if not exists turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  horarios text not null,
  criado_em timestamptz not null default now()
);

create table if not exists alunos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references usuarios (id) on delete cascade,
  data_nascimento date not null,
  telefone text,
  data_entrada timestamptz not null default now(),
  turma_id uuid references turmas (id),
  status status_aluno not null default 'ativo',
  foto_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists treinos (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas (id) on delete cascade,
  data date not null,
  hora_inicio text not null,
  hora_fim text not null,
  local text not null,
  tipo text not null,
  observacao text,
  criado_em timestamptz not null default now()
);

create table if not exists frequencias (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos (id) on delete cascade,
  treino_id uuid not null references treinos (id) on delete cascade,
  status status_frequencia not null,
  criado_em timestamptz not null default now(),
  unique (aluno_id, treino_id)
);

create table if not exists mensalidades (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos (id) on delete cascade,
  mes_referencia text not null,
  valor numeric(10, 2) not null,
  vencimento date not null,
  data_pagamento date,
  status status_mensalidade not null default 'pendente',
  criado_em timestamptz not null default now(),
  unique (aluno_id, mes_referencia)
);

create table if not exists pontuacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos (id) on delete cascade,
  pontos int not null,
  motivo text not null,
  data timestamptz not null default now()
);

create table if not exists relatorios (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references alunos (id) on delete cascade,
  mes_referencia text not null,
  nota_tecnico int not null,
  nota_fisico int not null,
  nota_tatico int not null,
  nota_mental int not null,
  pontos_fortes text not null,
  pontos_melhorar text not null,
  objetivo_proximo_mes text not null,
  criado_em timestamptz not null default now(),
  unique (aluno_id, mes_referencia)
);

create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_alunos_atualizado_em on alunos;
create trigger trg_alunos_atualizado_em
before update on alunos
for each row execute function set_atualizado_em();

-- RLS habilitado e SEM policies: só o service_role (usado exclusivamente pelo
-- backend Express) consegue acessar essas tabelas. O service_role sempre
-- ignora RLS — isso é só uma camada extra de defesa caso a anon key vaze,
-- já que a autorização "de verdade" (admin vs aluno) é feita no middleware
-- do Express, não em policies do Postgres.
alter table usuarios enable row level security;
alter table turmas enable row level security;
alter table alunos enable row level security;
alter table treinos enable row level security;
alter table frequencias enable row level security;
alter table mensalidades enable row level security;
alter table pontuacoes enable row level security;
alter table relatorios enable row level security;
