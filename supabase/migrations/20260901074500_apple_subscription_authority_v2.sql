-- Cliniverse AI — Apple subscription authority v2.
--
-- PRODUCTION HOLD: commit only. Do not apply to production without an explicit
-- migration-window GO, backup, staging/development execution, and companion tests.
-- Additive by design: legacy subscription rows remain readable.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.subscriptions
  add column if not exists provider text,
  add column if not exists apple_original_transaction_id text,
  add column if not exists apple_transaction_id text,
  add column if not exists apple_product_id text,
  add column if not exists apple_environment text,
  add column if not exists apple_last_purchase_at timestamptz,
  add column if not exists apple_last_event_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- The original transaction is the stable Apple subscription-lineage identity.
create unique index if not exists subscriptions_apple_original_transaction_uidx
  on public.subscriptions (apple_original_transaction_id)
  where provider = 'apple' and apple_original_transaction_id is not null;

create index if not exists subscriptions_user_updated_idx
  on public.subscriptions (user_id, updated_at desc);

-- Immutable, non-clinical processing evidence. A transaction may legitimately
-- appear in multiple lifecycle notifications, so provider_event_id (not the
-- transaction id) is the idempotency identity. Raw JWS is never persisted.
create table if not exists public.apple_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id uuid not null,
  provider_event_id text not null unique,
  transaction_id text not null,
  original_transaction_id text not null,
  product_id text not null,
  environment text not null,
  lifecycle_status text not null,
  event_at timestamptz not null,
  purchase_at timestamptz not null,
  expires_at timestamptz,
  revoked_at timestamptz,
  verified_at timestamptz not null,
  signed_payload_hash text not null,
  disposition text not null,
  created_at timestamptz not null default now(),
  constraint apple_subscription_events_environment_check
    check (environment in ('Sandbox', 'Production')),
  constraint apple_subscription_events_status_check
    check (lifecycle_status in ('active', 'grace', 'billing_retry', 'expired', 'revoked', 'refunded')),
  constraint apple_subscription_events_disposition_check
    check (disposition in ('applied', 'stale_ignored'))
);

create index if not exists apple_subscription_events_transaction_idx
  on public.apple_subscription_events (transaction_id, event_at desc);
create index if not exists apple_subscription_events_lineage_idx
  on public.apple_subscription_events (original_transaction_id, event_at desc);

alter table public.apple_subscription_events enable row level security;
revoke all privileges on table public.apple_subscription_events from PUBLIC, anon, authenticated;
grant select, insert on table public.apple_subscription_events to service_role;

-- Clients can read only the minimum derived authority required by the UI.
-- Apple transaction IDs and evidence hashes remain server-only.
revoke all privileges on table public.subscriptions from anon, authenticated;
grant select (user_id, plan, status, expires_at, created_at, provider, apple_product_id, verified_at, revoked_at, updated_at)
  on table public.subscriptions to authenticated;

create or replace function public.persist_verified_apple_subscription(
  p_user_id uuid,
  p_provider_event_id text,
  p_transaction_id text,
  p_original_transaction_id text,
  p_product_id text,
  p_environment text,
  p_lifecycle_status text,
  p_event_at timestamptz,
  p_purchase_at timestamptz,
  p_expires_at timestamptz,
  p_revoked_at timestamptz,
  p_verified_at timestamptz,
  p_signed_payload_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_subscription public.subscriptions%rowtype;
  v_existing_event public.apple_subscription_events%rowtype;
  v_plan text;
begin
  if p_user_id is null then raise exception 'apple_user_required'; end if;
  if coalesce(length(p_provider_event_id), 0) = 0 then raise exception 'apple_provider_event_id_required'; end if;
  if coalesce(length(p_transaction_id), 0) = 0 then raise exception 'apple_transaction_id_required'; end if;
  if coalesce(length(p_original_transaction_id), 0) = 0 then raise exception 'apple_original_transaction_id_required'; end if;
  if p_product_id not in ('cliniverse.core.monthly', 'cliniverse.core.yearly') then raise exception 'apple_product_not_allowed'; end if;
  if p_environment not in ('Sandbox', 'Production') then raise exception 'apple_environment_invalid'; end if;
  if p_lifecycle_status not in ('active', 'grace', 'billing_retry', 'expired', 'revoked', 'refunded') then raise exception 'apple_lifecycle_status_invalid'; end if;
  if p_event_at is null or p_verified_at is null or p_purchase_at is null then raise exception 'apple_timestamps_required'; end if;
  if coalesce(length(p_signed_payload_hash), 0) < 32 then raise exception 'apple_payload_hash_invalid'; end if;
  if p_lifecycle_status in ('active', 'grace') and (p_expires_at is null or p_expires_at <= p_verified_at) then
    raise exception 'apple_entitlement_window_invalid';
  end if;

  -- Serialize both event identity and subscription lineage. This turns exact
  -- concurrent delivery into a deterministic replay rather than a unique-key race.
  perform pg_advisory_xact_lock(hashtextextended(p_provider_event_id, 1));
  perform pg_advisory_xact_lock(hashtextextended(p_original_transaction_id, 2));

  select * into v_existing_event
  from public.apple_subscription_events
  where provider_event_id = p_provider_event_id;

  if found then
    if v_existing_event.user_id <> p_user_id
       or v_existing_event.original_transaction_id <> p_original_transaction_id
       or v_existing_event.transaction_id <> p_transaction_id
       or v_existing_event.product_id <> p_product_id then
      raise exception 'apple_event_replay_conflict';
    end if;
    return jsonb_build_object(
      'ok', true,
      'duplicate', true,
      'stale', v_existing_event.disposition = 'stale_ignored',
      'subscriptionId', v_existing_event.subscription_id,
      'status', v_existing_event.lifecycle_status
    );
  end if;

  select * into v_subscription
  from public.subscriptions
  where provider = 'apple'
    and apple_original_transaction_id = p_original_transaction_id
  for update;

  v_plan := case p_product_id
    when 'cliniverse.core.monthly' then 'pro_monthly'
    when 'cliniverse.core.yearly' then 'pro_yearly'
  end;

  if found then
    -- Original-transaction ownership is sticky. It cannot silently move between
    -- Cliniverse accounts, even if a valid signed transaction is replayed.
    if v_subscription.user_id <> p_user_id then
      raise exception 'apple_subscription_owned_by_another_user';
    end if;

    -- Older provider events are retained for audit but may never roll current
    -- entitlement/lifecycle state backwards.
    if v_subscription.apple_last_event_at is not null
       and p_event_at < v_subscription.apple_last_event_at then
      insert into public.apple_subscription_events (
        subscription_id, user_id, provider_event_id, transaction_id,
        original_transaction_id, product_id, environment, lifecycle_status,
        event_at, purchase_at, expires_at, revoked_at, verified_at,
        signed_payload_hash, disposition
      ) values (
        v_subscription.id, p_user_id, p_provider_event_id, p_transaction_id,
        p_original_transaction_id, p_product_id, p_environment, p_lifecycle_status,
        p_event_at, p_purchase_at, p_expires_at, p_revoked_at, p_verified_at,
        p_signed_payload_hash, 'stale_ignored'
      );
      return jsonb_build_object(
        'ok', true, 'duplicate', false, 'stale', true,
        'subscriptionId', v_subscription.id, 'status', v_subscription.status
      );
    end if;

    update public.subscriptions
    set plan = v_plan,
        status = p_lifecycle_status,
        provider = 'apple',
        apple_transaction_id = p_transaction_id,
        apple_product_id = p_product_id,
        apple_environment = p_environment,
        apple_last_purchase_at = greatest(coalesce(apple_last_purchase_at, p_purchase_at), p_purchase_at),
        apple_last_event_at = p_event_at,
        verified_at = p_verified_at,
        revoked_at = p_revoked_at,
        started_at = coalesce(started_at, p_purchase_at),
        expires_at = p_expires_at,
        updated_at = now()
    where id = v_subscription.id
    returning * into v_subscription;
  else
    insert into public.subscriptions (
      user_id, plan, status, amount, currency, started_at, expires_at,
      provider, apple_original_transaction_id, apple_transaction_id,
      apple_product_id, apple_environment, apple_last_purchase_at,
      apple_last_event_at, verified_at, revoked_at, updated_at
    ) values (
      p_user_id, v_plan, p_lifecycle_status, null, null, p_purchase_at, p_expires_at,
      'apple', p_original_transaction_id, p_transaction_id,
      p_product_id, p_environment, p_purchase_at,
      p_event_at, p_verified_at, p_revoked_at, now()
    ) returning * into v_subscription;
  end if;

  insert into public.apple_subscription_events (
    subscription_id, user_id, provider_event_id, transaction_id,
    original_transaction_id, product_id, environment, lifecycle_status,
    event_at, purchase_at, expires_at, revoked_at, verified_at,
    signed_payload_hash, disposition
  ) values (
    v_subscription.id, p_user_id, p_provider_event_id, p_transaction_id,
    p_original_transaction_id, p_product_id, p_environment, p_lifecycle_status,
    p_event_at, p_purchase_at, p_expires_at, p_revoked_at, p_verified_at,
    p_signed_payload_hash, 'applied'
  );

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'stale', false,
    'subscriptionId', v_subscription.id,
    'status', v_subscription.status,
    'expiresAt', v_subscription.expires_at
  );
end
$function$;

revoke execute on function public.persist_verified_apple_subscription(
  uuid,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,timestamptz,timestamptz,text
) from PUBLIC, anon, authenticated;
grant execute on function public.persist_verified_apple_subscription(
  uuid,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,timestamptz,timestamptz,text
) to service_role;

do $assertions$
begin
  if has_table_privilege('authenticated', 'public.subscriptions', 'INSERT')
     or has_table_privilege('authenticated', 'public.subscriptions', 'UPDATE')
     or has_table_privilege('authenticated', 'public.apple_subscription_events', 'SELECT') then
    raise exception 'apple subscription authority leaked to authenticated clients';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.persist_verified_apple_subscription(uuid,text,text,text,text,text,text,timestamp with time zone,timestamp with time zone,timestamp with time zone,timestamp with time zone,timestamp with time zone,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated client can execute Apple persistence RPC';
  end if;
end
$assertions$;

commit;
