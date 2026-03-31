-- Habilitar a extensão padrão para gerar IDs UUID unicamente, se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Criar tabela de Prompts de Usuários
CREATE TABLE prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  prompt text not null,
  config jsonb not null,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criar tabela de Perfis de Usuário
CREATE TABLE users (
  id uuid references auth.users primary key,
  email text,
  last_login timestamp with time zone
);

-- 3. Habilitar RLS (Row Level Security) - Importante para segurança
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas de acesso para os Prompts
CREATE POLICY "Usuários podem ver seus próprios prompts" ON prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios prompts" ON prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem excluir seus próprios prompts" ON prompts FOR DELETE USING (auth.uid() = user_id);

-- 5. Criar Políticas de acesso para Perfis de Usuários
CREATE POLICY "Acesso ao próprio perfil na tab users" ON users FOR ALL USING (auth.uid() = id);
