-- Create grades table
create table public.grades (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  conceptual_grade text check (conceptual_grade in ('A', 'E', 'I', 'O', 'U')) not null,
  numeric_grade integer check (numeric_grade >= 1 and numeric_grade <= 10) not null,
  comment text,
  graded_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (submission_id)
);

-- Turn on RLS
alter table public.grades enable row level security;

-- Admins can do everything
create policy "Admins can view all grades"
  on public.grades for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can insert grades"
  on public.grades for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update grades"
  on public.grades for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Students can view their own grades (via submission -> student_id)
create policy "Students can view their own grades"
  on public.grades for select
  using (
    exists (
      select 1 from public.submissions
      where submissions.id = grades.submission_id
        and submissions.student_id = auth.uid()
    )
  );
