# FinTrack — Personal Finance Tracker

Dark-themed, responsive React + Vite finance tracker backed by Supabase.

---

## Step 1 — Set up Supabase (free)

1. Go to https://supabase.com → create a free account + new project
2. In **SQL Editor**, run this:

```sql
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  category text not null,
  sub text,
  amount numeric(10,2) not null,
  note text,
  created_at timestamptz default now()
);

alter table expenses enable row level security;

create policy "own expenses select" on expenses
  for select using (auth.uid() = user_id);

create policy "own expenses insert" on expenses
  for insert with check (auth.uid() = user_id);

create policy "own expenses update" on expenses
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own expenses delete" on expenses
  for delete using (auth.uid() = user_id);
```

3. Go to **Project Settings → API**, copy your **Project URL** and **anon public** key

---

## Step 2 — Configure env

```bash
cp .env.example .env
# paste your Supabase URL and anon key
```

---

## Step 3 — Run locally

```bash
npm install
npm run dev
```

Sign up with your email, confirm it via the email link, log in.

---

## Step 4 — Deploy to Vercel

1. Push to GitHub
2. vercel.com/new → import repo
3. Add env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy

**Netlify:** `npm run build` → drag `dist/` to app.netlify.com/drop → add env vars in Site Settings.
