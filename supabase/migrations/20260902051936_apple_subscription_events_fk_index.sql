-- Cliniverse AI — Apple subscription event foreign-key index.
create index if not exists apple_subscription_events_subscription_idx
  on public.apple_subscription_events (subscription_id);
