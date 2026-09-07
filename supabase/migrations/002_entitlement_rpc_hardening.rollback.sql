-- Emergency rollback for 002_entitlement_rpc_hardening.sql
-- Restores the known pre-hardening execution grants only.
-- This rollback weakens the entitlement boundary and is not an acceptable steady state.

grant execute on function public.is_user_pro(uuid) to public;
grant execute on function public.is_user_pro(uuid) to anon;
grant execute on function public.is_user_pro(uuid) to authenticated;
grant execute on function public.is_user_pro(uuid) to service_role;
