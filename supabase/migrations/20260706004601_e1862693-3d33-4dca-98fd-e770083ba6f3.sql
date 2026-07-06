
create table if not exists public.wedding_event_secrets (
  event_id uuid primary key references public.wedding_events(id) on delete cascade,
  trusted_code text not null unique,
  created_at timestamptz not null default now()
);

grant all on public.wedding_event_secrets to service_role;

alter table public.wedding_event_secrets enable row level security;

insert into public.wedding_event_secrets (event_id, trusted_code)
select id, trusted_code
from public.wedding_events
where trusted_code is not null
on conflict (event_id) do nothing;

alter table public.wedding_events drop column if exists trusted_code;

create or replace function public.get_event_by_trusted_code(code text)
returns table (id uuid, couple_name text, active boolean)
language sql
security definer
set search_path = public
as $$
  select e.id, e.couple_name, e.active
  from public.wedding_events e
  join public.wedding_event_secrets s on s.event_id = e.id
  where s.trusted_code = upper(code) and e.active = true;
$$;

grant execute on function public.get_event_by_trusted_code(text) to anon, authenticated;

create or replace function public.submit_guest_upload(
  p_event_id uuid,
  p_photo_url text,
  p_media_type text,
  p_storage_path text,
  p_uploader_name text,
  p_uploader_ip_hash text,
  p_trusted_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified_trusted boolean := false;
  v_limit_max int;
  v_limit_window interval;
  v_recent_count int;
  v_new_id uuid;
begin
  if not exists (
    select 1 from public.wedding_events
    where id = p_event_id and active = true
  ) then
    raise exception 'Event not found or inactive';
  end if;

  if p_trusted_code is not null then
    v_verified_trusted := exists (
      select 1
      from public.wedding_event_secrets
      where event_id = p_event_id
        and trusted_code = upper(p_trusted_code)
    );
  end if;

  v_limit_max := case when v_verified_trusted then 300 else 20 end;
  v_limit_window := interval '10 minutes';

  select count(*) into v_recent_count
  from public.guest_uploads
  where event_id = p_event_id
    and uploader_ip_hash = p_uploader_ip_hash
    and submitted_at >= now() - v_limit_window;

  if v_recent_count >= v_limit_max then
    raise exception 'Too many uploads from this device in a short time. Please wait a few minutes and try again.';
  end if;

  insert into public.guest_uploads (
    event_id, photo_url, media_type, storage_path, uploader_name,
    uploader_ip_hash, status, auto_approved
  ) values (
    p_event_id, p_photo_url, p_media_type, p_storage_path, p_uploader_name,
    p_uploader_ip_hash,
    'pending_screening',
    v_verified_trusted
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

revoke execute on function public.submit_guest_upload(uuid, text, text, text, text, text, text) from public;
grant execute on function public.submit_guest_upload(uuid, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.get_my_event_trusted_code(p_event_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select s.trusted_code
  from public.wedding_event_secrets s
  join public.wedding_events e on e.id = s.event_id
  where s.event_id = p_event_id and e.owner_id = auth.uid();
$$;

grant execute on function public.get_my_event_trusted_code(uuid) to authenticated;

create or replace function public.wedding_events_after_insert_mint_secret()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wedding_event_secrets (event_id, trusted_code)
  values (new.id, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)))
  on conflict (event_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_wedding_events_mint_secret on public.wedding_events;
create trigger trg_wedding_events_mint_secret
  after insert on public.wedding_events
  for each row execute function public.wedding_events_after_insert_mint_secret();
