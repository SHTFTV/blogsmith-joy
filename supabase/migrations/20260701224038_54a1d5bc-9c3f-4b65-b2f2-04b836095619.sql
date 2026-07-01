
create table if not exists public.wedding_events (
  id uuid primary key default gen_random_uuid(),
  event_code text not null unique,
  couple_name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.wedding_events to anon;
grant select, insert, update, delete on public.wedding_events to authenticated;
grant all on public.wedding_events to service_role;

create table if not exists public.guest_uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.wedding_events(id) on delete cascade,
  uploader_name text,
  photo_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

grant select on public.guest_uploads to anon;
grant select, update on public.guest_uploads to authenticated;
grant all on public.guest_uploads to service_role;

create index if not exists guest_uploads_event_status_idx
  on public.guest_uploads (event_id, status);

alter publication supabase_realtime add table public.guest_uploads;

alter table public.wedding_events enable row level security;
alter table public.guest_uploads enable row level security;

create policy "wedding_events_public_read_active"
  on public.wedding_events for select
  using (active = true);

create policy "wedding_events_owner_all"
  on public.wedding_events for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "guest_uploads_public_read_approved"
  on public.guest_uploads for select
  using (status = 'approved');

create policy "guest_uploads_owner_read_all"
  on public.guest_uploads for select
  using (
    exists (
      select 1 from public.wedding_events e
      where e.id = event_id and e.owner_id = auth.uid()
    )
  );

create policy "guest_uploads_owner_update"
  on public.guest_uploads for update
  using (
    exists (
      select 1 from public.wedding_events e
      where e.id = event_id and e.owner_id = auth.uid()
    )
  );

alter table public.guest_uploads
  add column if not exists media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  add column if not exists storage_path text;

create policy "guest_photos_owner_can_delete"
  on storage.objects for delete
  using (
    bucket_id = 'guest-photos'
    and exists (
      select 1 from public.wedding_events e
      where e.id::text = (storage.foldername(name))[1]
        and e.owner_id = auth.uid()
    )
  );

create policy "guest_photos_owner_can_list"
  on storage.objects for select
  using (
    bucket_id = 'guest-photos'
    and exists (
      select 1 from public.wedding_events e
      where e.id::text = (storage.foldername(name))[1]
        and e.owner_id = auth.uid()
    )
  );

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_owner_all"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.wedding_events
  add column if not exists trusted_code text unique
    default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));

update public.wedding_events
set trusted_code = upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))
where trusted_code is null;

alter table public.guest_uploads
  add column if not exists uploader_ip_hash text,
  add column if not exists auto_approved boolean not null default false;

create index if not exists guest_uploads_rate_limit_idx
  on public.guest_uploads (event_id, uploader_ip_hash, submitted_at);

revoke select (trusted_code) on public.wedding_events from anon;

create or replace function public.get_event_by_trusted_code(code text)
returns table (id uuid, couple_name text, active boolean)
language sql
security definer
set search_path = public
as $$
  select e.id, e.couple_name, e.active
  from public.wedding_events e
  where e.trusted_code = upper(code) and e.active = true;
$$;

grant execute on function public.get_event_by_trusted_code(text) to anon, authenticated;

alter table public.guest_uploads
  drop constraint if exists guest_uploads_status_check;

alter table public.guest_uploads
  add constraint guest_uploads_status_check
  check (status in ('pending_screening', 'pending', 'approved', 'rejected'));

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
      select 1 from public.wedding_events
      where id = p_event_id and trusted_code = upper(p_trusted_code)
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

create policy "guest_photos_scoped_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'guest-photos'
    and exists (
      select 1 from public.wedding_events e
      where e.id::text = (storage.foldername(name))[1]
        and e.active = true
    )
  );
