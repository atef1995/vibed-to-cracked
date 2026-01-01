## 📄 **Project Requirements: “Vibed to Cracked”**

---

## 🌱 **Vision & Audience**

Build a modern, creator‑driven, mobile‑friendly learning platform focused on JavaScript at launch, later HTML & CSS.
Target: “vibe coders” → beginners / hobbyists who value both _technical learning_ & _mood‑driven_, creator‑branded content.
Core idea: combine quizzes, coding practice, and short video explanations.

---

## 🧩 **Core Features**

| Feature                 | Description                                                                                                      | Why                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 🧑‍🎓 User accounts        | Sign up / login to track progress, enable subscriptions                                                          | Unlocks personalized features & monetization |
| 💳 Stripe subscriptions | Free tier with limited quizzes; paid tier unlocks extra quizzes, advanced content, or mood modes                 | Sustainable business                         |
| 📚 Tutorials            | MDX‑based, curated, SEO‑optimized                                                                                | Discover via search                          |
| 🧠 Quizzes              | Multiple choice, auto‑graded; difficulty adapts to mood                                                          | Reinforce learning                           |
| ✏ Code editor           | Embedded (CodeMirror), JS runner in backend sandbox                                                              | Hands‑on practice                            |
| 🎥 Video explanations   | Embedded YouTube per quiz                                                                                        | Personal brand + deeper teaching             |
| 🌙 Mood system          | Users choose mood: “Chill / Rush / Grind” → changes: visuals (colors, themes), music, quiz frequency, difficulty | Unique twist                                 |
| 📱 Mobile app           | Via Capacitor, same React codebase                                                                               | Learn on the go                              |
| 📝 Progress tracking    | Track completed tutorials/quizzes, streaks                                                                       | Motivation                                   |
| 🧭 SEO                  | Static MDX content, sitemap, metadata                                                                            | Organic growth                               |

---

## 🗺 **User Flow**

1. Visit landing page → read what “Vibed to Cracked” is about.
2. Sign up → create free account.
3. Choose mood (e.g., Chill / Rush / Grind).
4. Start first tutorial (text + code examples).
5. Do quiz → see instant result + video explanation (YouTube embed).
6. Write & run code in embedded editor → result displayed.
7. Track progress on dashboard.
8. Upgrade to paid plan to unlock harder quizzes, mood customization, or advanced tutorials.

---

## 🏗 **Technical Stack**

| Layer              | Choice                                        | Reason                                    |
| ------------------ | --------------------------------------------- | ----------------------------------------- |
| Framework          | Next.js                                       | SEO, React ecosystem, SSR & static export |
| UI                 | Tailwind CSS                                  | Speed & consistency                       |
| Content            | MDX                                           | Tutorials mix markdown + React            |
| Quizzes & progress | PostgreSQL (via Prisma ORM)                   | Flexible, relational data                 |
| Auth               | NextAuth.js                                   | Easy social/email login                   |
| Subscriptions      | Stripe + webhook                              | Reliable, scalable                        |
| Code editor        | CodeMirror                                    | Customizable, mobile‑friendly             |
| Code runner        | Node.js backend microservice with vm2 sandbox | Safe JS execution                         |
| Mobile             | Capacitor                                     | Same codebase → mobile                    |
| Hosting            | Cheap VPS (Contabo)                           | Low cost vs. SaaS                         |
| CDN                | e.g., Cloudflare                              | Faster static content delivery            |

---

## 🧰 **Architecture Overview**

- Next.js app → serves tutorials, quiz frontend, user dashboard.
- Node.js backend → handles code execution requests, calls DB.
- PostgreSQL → stores users, progress, quiz data, subscriptions.
- Stripe → handles payments, webhook updates DB on payment status.
- YouTube → hosts explanation videos, embed into quiz pages.
- Capacitor → wraps web app into native iOS/Android app.

---

## 💳 **Subscription Model**

| Plan                 | Free               | Paid                           |
| -------------------- | ------------------ | ------------------------------ |
| Tutorials            |                  |                              |
| Number of quizzes    | Limited            | Unlimited / extra quizzes      |
| Mood system          | Default moods only | Advanced moods & customization |
| Advanced tutorials   | ❌                 |                              |
| Community / comments | ❌                 |  (future)                    |

- Stripe manages recurring billing.
- Webhook updates user’s “plan” in DB.

---

## 🎨 **Mood system**

A user setting affecting:

- Visuals: theme color, background, maybe lo‑fi music embed.
- Difficulty: “Chill” → easier quizzes, less strict; “Grind” → harder quizzes, timed.
- Quiz frequency: “Rush” → more quizzes in same tutorial.
- Can store choice in user profile, fallback to cookie for guests.

---

## ⚙ **MVP Scope**

 Landing page
 Sign up / login (NextAuth)
 Stripe free/paid plans
 Dashboard → show tutorials & progress
 5–10 JS tutorials in MDX
 Quizzes (linked to each tutorial)
 YouTube video embeds per quiz
 Code editor (JS only)
 Code runner backend (vm2)
 Mood toggle (visuals + quiz difficulty)
 Mobile app via Capacitor
 SEO basics: sitemap, meta, OpenGraph

---

## 📦 **Folder structure (suggested)**

```
/pages
  /tutorials/[slug].tsx
  /quiz/[id].tsx
  /dashboard.tsx
/components
  /Quiz
  /CodeEditor
  /MoodSelector
  /VideoExplanation
/lib
  stripe.ts
  auth.ts
/prisma
  schema.prisma
/content
  /tutorials
    tutorial1.mdx
/public
  /videos /images
```

---

## 🧪 **Safety for code runner**

- Use **vm2** to isolate JS execution.
- Time & memory limits.
- Rate limiting per user.

---

##  **Future roadmap**

- Add HTML/CSS quizzes.
- User‑generated quizzes.
- Gamification: XP, badges.
- Community comments.
- Daily coding challenges.
- Advanced analytics.

---
