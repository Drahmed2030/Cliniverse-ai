alter table public.ward_practice_checkpoints drop constraint ward_practice_checkpoints_content_version_check;
alter table public.ward_practice_checkpoints add constraint ward_practice_checkpoints_content_version_check check (content_version in ('w1-handover-1.0.0','w1-pending-1.0.0','w1-recipient-1.0.0'));
