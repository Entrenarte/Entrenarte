-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('new_grade', 'new_message', 'new_submission')) not null,
  title text not null,
  body text,
  read boolean default false not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.notifications enable row level security;

-- Users can view their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications"
  on public.notifications for update
  using ( auth.uid() = user_id );

-- Authenticated users can insert notifications (needed for chat, grades)
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check ( auth.uid() is not null );

-- Enable realtime for notifications
alter publication supabase_realtime add table public.notifications;

-- Enable realtime for messages (for chat)
alter publication supabase_realtime add table public.messages;
