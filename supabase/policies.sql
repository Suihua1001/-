-- Run in Supabase SQL Editor after creating the portfolio-media bucket.
alter table public.profiles enable row level security;
alter table public.works enable row level security;

 drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);
drop policy if exists "authenticated update profiles" on public.profiles;
create policy "authenticated update profiles" on public.profiles for update to authenticated using (true) with check (true);

drop policy if exists "public read published works" on public.works;
create policy "public read published works" on public.works for select using (published = true or auth.role() = 'authenticated');
drop policy if exists "authenticated insert works" on public.works;
create policy "authenticated insert works" on public.works for insert to authenticated with check (true);
drop policy if exists "authenticated update works" on public.works;
create policy "authenticated update works" on public.works for update to authenticated using (true) with check (true);
drop policy if exists "authenticated delete works" on public.works;
create policy "authenticated delete works" on public.works for delete to authenticated using (true);

 drop policy if exists "public read portfolio media" on storage.objects;
create policy "public read portfolio media" on storage.objects for select using (bucket_id = 'portfolio-media');
drop policy if exists "authenticated upload portfolio media" on storage.objects;
create policy "authenticated upload portfolio media" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media');
drop policy if exists "authenticated update portfolio media" on storage.objects;
create policy "authenticated update portfolio media" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media') with check (bucket_id = 'portfolio-media');
drop policy if exists "authenticated delete portfolio media" on storage.objects;
create policy "authenticated delete portfolio media" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media');
