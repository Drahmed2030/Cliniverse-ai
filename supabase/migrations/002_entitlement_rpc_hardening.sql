-- Cliniverse entitlement RPC hardening
-- Prepared for review only. Do not apply to production until the release runtime gate is approved.
--
-- Verified live finding (2026-08-26):
-- public.is_user_pro(uid uuid) is SECURITY DEFINER, accepts an arbitrary uid,
-- and is executable by PUBLIC/anon/authenticated. The active release path no
-- longer uses this RPC; entitlement authority is the authenticated user's
-- subscription record.

revoke execute on function public.is_user_pro(uuid) from public;
revoke execute on function public.is_user_pro(uuid) from anon;
revoke execute on function public.is_user_pro(uuid) from authenticated;

-- Retain service-side compatibility only while legacy code is being retired.
grant execute on function public.is_user_pro(uuid) to service_role;
