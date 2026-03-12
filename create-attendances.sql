-- Create the attendances table
create table public.attendances (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, date)
);

-- Turn on RLS
alter table public.attendances enable row level security;

-- Policies
create policy "Admins can view all attendances"
  on public.attendances for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can insert attendances"
  on public.attendances for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update attendances"
  on public.attendances for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Students can view their own attendances"
  on public.attendances for select
  using ( auth.uid() = student_id );
