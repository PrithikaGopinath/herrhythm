# 💜 HerRhythm

> Your PCOD companion — track, learn, and thrive.

HerRhythm is an AI-powered lifestyle management web app specifically 
designed for teenage girls living with PCOD (Polycystic Ovarian Disease).

Built by a teenager with PCOD, for teenagers with PCOD.

---

## 🌸 What is PCOD?

Polycystic Ovarian Disease affects 1 in 10 women globally. It is one 
of the most underdiagnosed and misunderstood conditions in teenage 
girls. Lifestyle changes — sleep, food, exercise, stress management — 
can significantly reduce symptoms, but nobody tells you exactly what 
to do or how to track it.

**HerRhythm does.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 Daily Log | Track sleep, food, exercise, stress, mood and symptoms every day |
| ✨ AI Insights | Personalised PCOD tips based on YOUR real logged data |
| 💬 Rhya Chatbot | AI companion who knows your data and answers PCOD questions |
| 🩺 Doctor Prep | Personalised appointment guide — questions, symptoms, things to track |
| 🌸 Cycle Tracker | PCOD-aware period tracker that normalises irregular cycles |
| 👭 Community | Safe space for girls with PCOD to share and support each other |
| 📖 Learn | Teen-friendly PCOD education — no jargon, no fear |
| 🔔 Notifications | Smart reminders to log, check insights and update cycle data |
| 🌙 Dark Mode | Full dark and light mode support |

---

## 🔨 Built With

- **React** — Frontend
- **Supabase** — Database, authentication, real-time data
- **Groq AI (LLaMA 3)** — Rhya chatbot and Doctor Prep AI
- **CSS Animations** — Cinematic flower splash screen
- **Vercel** — Deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- A Supabase account
- A Groq API key from console.groq.com

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/PrithikaGopinath/herrhythm.git
cd herrhythm
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a `.env` file in the root folder**

REACT_APP_GROQ_KEY=your_groq_api_key_here
CI=false

**4. Set up Supabase**

Create a file `src/supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your_supabase_url'
const supabaseKey = 'your_supabase_anon_key'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**5. Create Supabase tables**

Run this SQL in your Supabase SQL editor:
```sql
-- Daily logs
create table daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  log_date date not null,
  mood text,
  sleep_hours numeric,
  exercise text,
  stress_level text,
  water_glasses integer,
  food_quality text,
  symptoms text[],
  notes text,
  created_at timestamp with time zone default now()
);

-- Cycle logs
create table cycle_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  period_days date[],
  created_at timestamp with time zone default now()
);

-- Community posts
create table community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  username text,
  content text,
  topic text,
  hearts integer default 0,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now()
);

-- Post hearts
create table post_hearts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  post_id uuid references community_posts not null,
  unique(user_id, post_id)
);

-- Enable RLS on all tables
alter table daily_logs enable row level security;
alter table cycle_logs enable row level security;
alter table community_posts enable row level security;
alter table post_hearts enable row level security;

-- RLS Policies
create policy "Users can manage their own logs"
  on daily_logs for all using (auth.uid() = user_id);

create policy "Users can manage their own cycle logs"
  on cycle_logs for all using (auth.uid() = user_id);

create policy "Anyone can read community posts"
  on community_posts for select using (true);

create policy "Users can create posts"
  on community_posts for insert with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on community_posts for delete using (auth.uid() = user_id);

create policy "Users can update posts"
  on community_posts for update using (true);

create policy "Anyone can read hearts"
  on post_hearts for select using (true);

create policy "Users can manage their own hearts"
  on post_hearts for all using (auth.uid() = user_id);
```

**6. Start the app**
```bash
npm start
```

Open **http://localhost:3000** 🌸

---

## 🌍 Live Demo

🔗 [herrhythm.vercel.app](https://herrhythm.vercel.app)

---

## 💜 Why I Built This

> "I built HerRhythm because I have PCOD myself. When I was 
> diagnosed as a teenager, I couldn't find a single app that 
> spoke to me. Everything was designed for adult women — not 
> for a teenager trying to understand her own body. 
> HerRhythm is what I wished existed."
> — Prithika, founder

---

## 📜 License

MIT License — feel free to use and build on this project.

---

## 🏆 Built for

Girls in STEM: AI for Social Good Hackathon 2026

---

*Made with 💜 by Prithika Gopinath*
