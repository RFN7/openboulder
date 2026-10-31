-- Responsável legal, check-in, entrega de camiseta e comprovante enviado depois.
-- Só adiciona colunas e uma função: não altera nenhum dado existente.
-- Aplicar ANTES de publicar o index.html que envia os campos responsavel_*.

alter table public.eleva_inscricoes
  add column if not exists responsavel_nome text,
  add column if not exists responsavel_cpf text,
  add column if not exists responsavel_telefone text,
  add column if not exists responsavel_aceite boolean not null default false,
  add column if not exists checkin_em timestamptz,
  add column if not exists camiseta_entregue_em timestamptz;

-- o site só pode preencher os campos do formulário (check-in e entrega ficam só com a organização)
revoke insert on public.eleva_inscricoes from anon;
grant insert (id, created_at, tipo, nome, telefone, email, cpf, nascimento, categoria, naipe, vinculo, com_camiseta, modelo, tamanho, lote, valor, pagamento, comprovante, obs, termo_aceito, status,
              responsavel_nome, responsavel_cpf, responsavel_telefone, responsavel_aceite)
  on public.eleva_inscricoes to anon;

-- anexar comprovante depois: exige o código do pedido + e-mail; nunca devolve dados nem troca um comprovante já enviado
-- p_caminho nulo = só confere. Retorna 'ok', 'ja_enviado' ou 'nao_encontrado'.
create or replace function public.eleva_anexar_comprovante(p_codigo text, p_email text, p_caminho text default null)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare alvo public.eleva_inscricoes%rowtype;
begin
  if p_codigo !~* '^[0-9a-f]{8}$' or coalesce(p_email,'') = '' then return 'nao_encontrado'; end if;
  select * into alvo from public.eleva_inscricoes
   where left(id::text, 8) = lower(p_codigo) and lower(email) = lower(trim(p_email)) and status <> 'cancelado'
   limit 1 for update;
  if not found then return 'nao_encontrado'; end if;
  if alvo.comprovante is not null then return 'ja_enviado'; end if;
  if p_caminho is null then return 'ok'; end if;
  if p_caminho !~ '^anexo/[0-9a-f-]{36}\.[a-z0-9]{1,5}$'
     or not exists (select 1 from storage.objects where bucket_id = 'comprovantes' and name = p_caminho) then
    return 'nao_encontrado';
  end if;
  update public.eleva_inscricoes set comprovante = p_caminho where id = alvo.id;
  return 'ok';
end $$;
revoke all on function public.eleva_anexar_comprovante(text, text, text) from public;
grant execute on function public.eleva_anexar_comprovante(text, text, text) to anon, authenticated;
