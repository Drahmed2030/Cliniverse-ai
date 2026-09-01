-- Cliniverse AI trusted Apple subscription lineage.
--
-- PRODUCTION HOLD: commit/review/test first. Do not apply to the production
-- project without an explicit migration-window GO.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Keep the existing subscription table backward-compatible while adding the
-- minimum provider-owned current-state fields needed for Apple IAP.
alter table public.subscriptions
  add column if not exists provider text,
  add column if not exists apple_original_transaction_id text,
  add column if not exists apple_latest_transaction_id text,
  add column if not exists apple_product_id text,
  add column if not exists apple_environment text,
  add column if not exists apple_latest_purchase_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- One App Store original transaction lineage can belong to one and only one
-- subscription row/user. Legacy rows remain unaffected because the column is NULL.
create unique index if not exists subscriptions_apple_original_transaction_uidx
  on public.subscriptions (apple_original_transaction_id)
  where apple_original_transaction_id is not null;

-- Every verified Apple transaction is retained as immutable evidence. Raw JWS
-- is intentionally not stored here; only its hash and normalized verified data.
create table if not exists public.apple_subscription_transactions (
  transaction_id text primary key,
  original_transaction_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  product_id text not null,
  environment text not null,
  purchase_at timestamptz not null,
  expires_at timestamptz,
  revoked_at timestamptz,
  lifecycle_state text not null,
  signed_payload_hash text not null,
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint apple_subscription_transactions_environment_check
    check (environment in ('Sandbox', 'Production')),
  constraint apple_subscription_transactions_state_check
    check (lifecycle_state in ('active', 'grace', 'billing_retry', 'expired', 'revoked')),
  constraint apple_subscription_transactions_payload_hash_check
    check (length(signed_payload_hash) >= 32)
);

create index if not exists apple_subscription_transactions_original_idx
  on public.apple_subscription_transactions (original_transaction_id, purchase_at desc);
create index if not exists apple_subscription_transactions_user_idx
  on public.apple_subscription_transactions (user_id, purchase_at desc);

alter table public.apple_subscription_transactions enable row level security;
revoke all privileges on table public.apple_subscription_transactions from PUBLIC, anon, authenticated;
-- Transaction evidence remains server-only for Apple v1. The client reads only
-- the derived entitlement/current subscription record.

create or replace function public.persist_verified_apple_subscription(
  p_user_id uuid,
  p_transaction_id text,
  p_original_transaction_id text,
  p_product_id text,
  p_environment text,
  p_purchase_at timestamptz,
  p_expires_at timestamptz,
  p_revoked_at timestamptz,
  p_lifecycle_state text,
  p_signed_payload_hash text,
  p_verified_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_existing_event public.apple_subscription_transactions%rowtype;
  v_subscription public.subscriptions%rowtype;
  v_plan text;
  v_is_stale boolean := false;
begin
  if p_user_id is null then
    raise exception 'apple_user_required';
  end if;
  if coalesce(length(trim(p_transaction_id)), 0) = 0
     or coalesce(length(trim(p_original_transaction_id)), 0) = 0 then
    raise exception 'apple_transaction_identity_required';
  end if;
  if p_product_id not in ('cliniverse.core.monthly', 'cliniverse.core.yearly') then
    raise exception 'apple_product_not_allowed';
  end if;
  if p_environment not in ('Sandbox', 'Production') then
    raise exception 'apple_environment_not_allowed';
  end if;
  if p_lifecycle_state not in ('active', 'grace', 'billing_retry', 'expired', 'revoked') then
    raise exception 'apple_lifecycle_state_not_allowed';
  end if;
  if p_purchase_at is null or p_verified_at is null then
    raise exception 'apple_verification_time_required';
  end if;
  if coalesce(length(p_signed_payload_hash), 0) < 32 then
    raise exception 'apple_payload_hash_required';
  end if;

  v_plan := case p_product_id
    when 'cliniverse.core.monthly' then 'pro_monthly'
    when 'cliniverse.core.yearly' then 'pro_yearly'
  end;

  -- Serialize all work for one original transaction lineage. This closes the
  -- concurrent first-write race before any ownership or idempotency decision.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_original_transaction_id, 0)
  );

  -- Exact transaction replay is idempotent. A reused transaction ID with
  -- different ownership or semantics fails closed.
  select * into v_existing_event
  from public.apple_subscription_transactions
  where transaction_id = p_transaction_id
  for update;

  if found then
    if v_existing_event.user_id <> p_user_id
       or v_existing_event.original_transaction_id <> p_original_transaction_id
       or v_existing_event.product_id <> p_product_id
       or v_existing_event.environment <> p_environment
       or v_existing_event.signed_payload_hash <> p_signed_payload_hash then
      raise exception 'apple_transaction_conflict';
    end if;

    select * into v_subscription
    from public.subscriptions
    where id = v_existing_event.subscription_id;

    return jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'stale', false,
      'subscriptionId', v_subscription.id,
      'status', v_subscription.status,
      'expiresAt', v_subscription.expires_at,
      'originalTransactionId', v_subscription.apple_original_transaction_id
    );
  end if;

  select * into v_subscription
  from public.subscriptions
  where apple_original_transaction_id = p_original_transaction_id
  for update;

  if found and v_subscription.user_id <> p_user_id then
    raise exception 'apple_original_transaction_owned_by_other_user';
  end if;

  if not found then
    insert into public.subscriptions (
      user_id,
      plan,
      status,
      started_at,
      expires_at,
      provider,
      apple_original_transaction_id,
      apple_latest_transaction_id,
      apple_product_id,
      apple_environment,
      apple_latest_purchase_at,
      verified_at,
      revoked_at,
      updated_at
    ) values (
      p_user_id,
      v_plan,
      p_lifecycle_state,
      p_purchase_at,
      p_expires_at,
      'apple',
      p_original_transaction_id,
      p_transaction_id,
      p_product_id,
      p_environment,
      p_purchase_at,
      p_verified_at,
      p_revoked_at,
      now()
    )
    returning * into v_subscription;
  else
    v_is_stale := v_subscription.apple_latest_purchase_at is not null
      and p_purchase_at < v_subscription.apple_latest_purchase_at;

    -- Store every verified transaction, but do not let an older purchase event
    -- roll current entitlement state backward.
    if not v_is_stale then
      update public.subscriptions
      set plan = v_plan,
          status = p_lifecycle_state,
          expires_at = p_expires_at,
          provider = 'apple',
          apple_latest_transaction_id = p_transaction_id,
          apple_product_id = p_product_id,
          apple_environment = p_environment,
          apple_latest_purchase_at = p_purchase_at,
          verified_at = p_verified_at,
          revoked_at = p_revoked_at,
          updated_at = now()
      where id = v_subscription.id
      returning * into v_subscription;
    end if;
  end if;

  insert into public.apple_subscription_transactions (
    transaction_id,
    original_transaction_id,
    user_id,
    subscription_id,
    product_id,
    environment,
    purchase_at,
    expires_at,
    revoked_at,
    lifecycle_state,
    signed_payload_hash,
    verified_at
  ) values (
    p_transaction_id,
    p_original_transaction_id,
    p_user_id,
    v_subscription.id,
    p_product_id,
    p_environment,
    p_purchase_at,
    p_expires_at,
    p_revoked_at,
    p_lifecycle_state,
    p_signed_payload_hash,
    p_verified_at
  );

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'stale', v_is_stale,
    'subscriptionId', v_subscription.id,
    'status', v_subscription.status,
    'expiresAt', v_subscription.expires_at,
    'originalTransactionId', v_subscription.apple_original_transaction_id
  );
exception
  when unique_violation then
    -- The advisory lock should serialize same-lineage writes, while uniqueness
    -- remains the final database guard against unexpected cross-lineage races.
    if exists (
      select 1 from public.subscriptions
      where apple_original_transaction_id = p_original_transaction_id
        and user_id <> p_user_id
    ) then
      raise exception 'apple_original_transaction_owned_by_other_user';
    end if;
    raise;
end
$function$;

revoke all on function public.persist_verified_apple_subscription(
  uuid, text, text, text, text, timestamptz, timestamptz, timestamptz, text, text, timestamptz
) from PUBLIC, anon, authenticated;
grant execute on function public.persist_verified_apple_subscription(
  uuid, text, text, text, text, timestamptz, timestamptz, timestamptz, text, text, timestamptz
) to service_role;

-- Extend the existing own-row SELECT authority with derived provider/current
-- state fields only. Apple transaction identifiers and the immutable ledger stay
-- server-only and remain unavailable to authenticated clients.
grant select (provider, apple_product_id, verified_at, revoked_at, updated_at)
  on table public.subscriptions to authenticated;

do $migration_assertions$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and indexname = 'subscriptions_apple_original_transaction_uidx'
  ) then
    raise exception 'Apple original transaction uniqueness guard missing';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'apple_subscription_transactions'
  ) then
    raise exception 'Apple transaction evidence table missing';
  end if;

  if has_table_privilege('anon', 'public.apple_subscription_transactions', 'SELECT')
     or has_table_privilege('authenticated', 'public.apple_subscription_transactions', 'SELECT') then
    raise exception 'Apple transaction evidence is client-readable';
  end if;

  if has_column_privilege('authenticated', 'public.subscriptions', 'apple_original_transaction_id', 'SELECT')
     or has_column_privilege('authenticated', 'public.subscriptions', 'apple_latest_transaction_id', 'SELECT') then
    raise exception 'Apple transaction identifiers are client-readable';
  end if;

  if not has_column_privilege('authenticated', 'public.subscriptions', 'provider', 'SELECT')
     or not has_column_privilege('authenticated', 'public.subscriptions', 'apple_product_id', 'SELECT') then
    raise exception 'Derived Apple entitlement fields are not client-readable';
  end if;

  if has_function_privilege(
      'anon',
      'public.persist_verified_apple_subscription(uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,text,text,timestamptz)',
      'EXECUTE'
    ) or has_function_privilege(
      'authenticated',
      'public.persist_verified_apple_subscription(uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,text,text,timestamptz)',
      'EXECUTE'
    ) then
    raise exception 'Apple persistence RPC is client-executable';
  end if;

  if not has_function_privilege(
      'service_role',
      'public.persist_verified_apple_subscription(uuid,text,text,text,text,timestamptz,timestamptz,timestamptz,text,text,timestamptz)',
      'EXECUTE'
    ) then
    raise exception 'Apple persistence RPC missing service_role execute';
  end if;
end
$migration_assertions$;

commit;
