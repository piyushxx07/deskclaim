-- ClaimDesk: Run this once in the Supabase SQL Editor
-- Project > SQL Editor > New query > paste > Run

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('employee','director','accounts')),
  department text,
  created_at timestamptz not null default now()
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_number text unique not null,
  voucher_date date not null default current_date,
  expense_date date not null,
  department text not null,
  expense_title text not null,
  expense_category text,
  expense_description text,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'draft' check (status in ('draft','submitted','approved','rejected')),
  employee_signature_url text,
  director_signature_url text,
  approval_date timestamptz,
  rejection_reason text,
  created_by uuid not null references public.users(id) on delete restrict,
  approved_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vouchers_status on public.vouchers(status);
create index if not exists idx_vouchers_created_by on public.vouchers(created_by);
create index if not exists idx_vouchers_expense_date on public.vouchers(expense_date);

-- password is "password123" for all three seed accounts
insert into public.users (email, password_hash, name, role, department) values
  ('employee@claimdesk.com', '$2a$10$7QJ3uYvQb4M0p1rZ8d2xQ.0GkC0z1nQwK6x0n1Vw9r6Qw0e8h8n6S', 'Riya Sharma', 'employee', 'Sales'),
  ('director@claimdesk.com', '$2a$10$7QJ3uYvQb4M0p1rZ8d2xQ.0GkC0z1nQwK6x0n1Vw9r6Qw0e8h8n6S', 'Anil Verma',  'director', 'Management'),
  ('accounts@claimdesk.com', '$2a$10$7QJ3uYvQb4M0p1rZ8d2xQ.0GkC0z1nQwK6x0n1Vw9r6Qw0e8h8n6S', 'Meera Iyer',   'accounts', 'Finance')
on conflict (email) do nothing;