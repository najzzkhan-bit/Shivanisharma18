-- ==============================================================================
-- Shivani Sharma's Parlour - Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================

-- 1. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  phone text not null,
  email text,
  service text not null,
  booking_date text not null,
  booking_time text not null,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')) not null
);

-- 2. ENQUIRIES TABLE
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  contact text not null,
  service text not null,
  message text not null,
  status text default 'new' check (status in ('new', 'responded', 'archived')) not null
);

-- 3. CLIENT REVIEWS TABLE
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  service text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  location text default 'Pune',
  approved boolean default true not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.bookings enable row level security;
alter table public.enquiries enable row level security;
alter table public.reviews enable row level security;

-- 1. Bookings Policies:
-- Allow anyone (anonymous website visitors) to submit a new booking
create policy "Allow anonymous booking submissions"
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

-- Allow viewing and updating bookings (for admin dashboard via anon key or authenticated)
create policy "Allow reading bookings"
  on public.bookings
  for select
  to anon, authenticated
  using (true);

create policy "Allow updating bookings status"
  on public.bookings
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 2. Enquiries Policies:
create policy "Allow anonymous enquiry submissions"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow reading enquiries"
  on public.enquiries
  for select
  to anon, authenticated
  using (true);

create policy "Allow updating enquiries"
  on public.enquiries
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 3. Reviews Policies:
create policy "Allow public viewing of approved reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (approved = true);

create policy "Allow anonymous review submissions"
  on public.reviews
  for insert
  to anon, authenticated
  with check (true);

-- ==============================================================================
-- OPTIONAL SAMPLE INITIAL DATA
-- ==============================================================================
insert into public.reviews (name, service, rating, comment, location, approved)
values 
  ('Pooja Deshmukh', 'Maharashtrian Tadka Look & Drape', 5, 'Shivani did my wedding nauvari drape and traditional bridal makeup. The drape was so comfortable throughout the 6-hour ritual and the makeup did not budge!', 'Kondhwa, Pune', true),
  ('Sneha Kulkarni', 'Wedding Glow Facial & Hair Spa', 5, 'The wedding glow package before my sister engagement was pure magic. My skin looked so naturally illuminated without feeling cakey.', 'Undri, Pune', true)
on conflict do nothing;
