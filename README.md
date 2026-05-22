# LMNH
A community for AI builders
# Look Mom No Hands (LMNH)

### Product Specification — MVP

*“Room for all.”*

-----

## What It Is

A social showcase platform for people who build games, interactive sites, and web experiments using AI tools. You don’t need to know how to code. You just need to have made something.

LMNH is where you post the thing you built, share how you built it, watch what others made, follow builders you love, and earn your way into the spotlight — not by paying, but by showing up.

-----

## The Pitch (One Paragraph)

You vibe-coded something wild. Maybe it’s a game. Maybe it’s a weird interactive poem. Maybe it’s a calculator that also judges your life choices. You built it with Claude or Bolt or Replit or v0 and you want to show people. There’s nowhere good to do that right now. ProductHunt is for SaaS. itch.io is for games. Twitter is a shouting contest. LMNH is the place — a feed of drops, a community of builders, and a credit economy where participation earns you visibility. No ad spend. No algorithm you can’t see. Room for all.

-----

## Core Vocabulary

|Term            |Definition                                          |
|----------------|----------------------------------------------------|
|**Drop**        |A post. The thing you built + how you built it.     |
|**Builder**     |A user. Anyone who posts or participates.           |
|**Credits**     |Earned currency. Spent to promote your Drop.        |
|**Promoted**    |A Drop in the rotating featured slot. Costs credits.|
|**The Feed**    |Chronological stream of all Drops.                  |
|**The Rotation**|The promoted slot. Fixed number. Time-limited. Fair.|

-----

## Stack

|Layer     |Choice                              |Why                                     |
|----------|------------------------------------|----------------------------------------|
|Frontend  |Next.js (App Router)                |SEO, fast, deployable everywhere        |
|Backend/DB|Supabase                            |Auth + Postgres + Storage, one dashboard|
|Hosting   |Vercel                              |One-click deploy, generous free tier    |
|Video     |Embedded (YouTube/Vimeo link)       |No hosting costs, no encoding headaches |
|Auth      |Supabase Auth (email + GitHub OAuth)|GitHub login feels right for builders   |
|Styling   |Tailwind CSS                        |Fast, consistent                        |

-----

## Data Model

### `users`

```
id, username, display_name, avatar_url, bio, 
website_url, credits_balance, created_at
```

### `drops`

```
id, user_id, title, description, 
live_url,              -- link to the deployed thing
video_url,             -- optional YouTube/Vimeo embed
tools_used[],          -- ["Claude", "Bolt", "Replit", etc.]
tags[],
thumbnail_url,         -- auto-scraped or user-uploaded
like_count, comment_count, view_count,
promoted_until,        -- null if not currently promoted
created_at, updated_at
```

### `follows`

```
id, follower_id, following_id, created_at
```

### `likes`

```
id, user_id, drop_id, created_at
```

### `comments`

```
id, user_id, drop_id, body, created_at
```

### `credit_transactions`

```
id, user_id, amount, type, 
  -- type: EARN_FOLLOW | EARN_WATCH | EARN_COMMENT | EARN_LIKE | 
  --       EARN_LOGIN | SPEND_PROMOTE
reference_id,          -- drop_id or follow_id etc.
created_at
```

### `promotions`

```
id, drop_id, user_id, credits_spent,
starts_at, ends_at,
created_at
```

### `daily_action_log`

```
id, user_id, action_type, action_date, count
  -- used to enforce daily caps
```

-----

## Credit Economy

### Earning (all capped daily)

|Action                      |Credits|Daily Cap |Max/Day|
|----------------------------|-------|----------|-------|
|Follow a new builder        |10     |5 follows |50     |
|Watch a video to completion*|15     |10 videos |150    |
|Leave a comment             |20     |5 comments|100    |
|Like a Drop                 |5      |20 likes  |100    |
|Daily login                 |10     |1         |10     |
|**Daily max**               |       |          |**410**|

*Video completion tracked by honor system in MVP; front-end timer triggers credit grant at 80% of stated duration.

### Spending

|Action                  |Cost       |Limit                                       |
|------------------------|-----------|--------------------------------------------|
|Promote a Drop for 24hrs|500 credits|Once per Drop per 7 days                    |
|                        |           |Max 1 active promotion per builder at a time|

### The Rotation

- **Fixed slots:** 6 promoted Drops visible at any time in the feed header
- **Queue-based:** Paying credits enters you into a time-ordered queue
- **No bidding:** You cannot pay more to jump the queue
- **Transparency:** Each promoted Drop shows “Promoted” label — no hiding it
- **Overflow:** If queue is empty, slots show recent high-engagement Drops for free

This is the “room for all” mechanic in practice: you wait your turn like everyone else.

-----

## Features — MVP Scope

### Must Have (V1)

- [ ] Auth (email + GitHub)
- [ ] Create/edit/delete a Drop
- [ ] Live URL embed with thumbnail (Open Graph scrape)
- [ ] Optional video URL (YouTube/Vimeo embed)
- [ ] Tools used tags (preset list + custom)
- [ ] The Feed (chronological, paginated)
- [ ] Like a Drop
- [ ] Comment on a Drop
- [ ] Follow/unfollow a builder
- [ ] Builder profile page (their drops, follower count, bio)
- [ ] Credit earning (all actions above)
- [ ] Credit spending (promote a Drop)
- [ ] The Rotation (promoted slots in feed)
- [ ] Daily action log + cap enforcement
- [ ] Credit balance visible in nav

### Nice to Have (V2)

- [ ] Algorithmic “trending” tab (engagement velocity)
- [ ] Collections / lists (curate other people’s drops)
- [ ] “Built with” filter (browse all Claude drops, all Bolt drops, etc.)
- [ ] Notifications (someone liked/commented/followed)
- [ ] Embed widget (“Featured on LMNH” badge for your own site)
- [ ] Onboarding flow with manifesto screen
- [ ] Drop of the Week (editorial pick, no credits required)

### Explicitly Out of Scope (V1)

- Game/app hosting — LMNH links out, never hosts
- Real money of any kind
- Mobile app (web-first, mobile-responsive)
- DMs

-----

## Pages

|Route                |Description                                          |
|---------------------|-----------------------------------------------------|
|`/`                  |The Feed — all drops, promoted rotation at top       |
|`/drop/[id]`         |Single Drop page — embed, video, comments            |
|`/builder/[username]`|Profile — their drops, bio, follow button            |
|`/new`               |Create a Drop                                        |
|`/edit/[id]`         |Edit a Drop                                          |
|`/credits`           |Your credit balance, transaction history, promote CTA|
|`/about`             |Manifesto. “Room for all.”                           |
|`/login`             |Auth                                                 |

-----

## The Feed Layout

```
┌─────────────────────────────────────────┐
│  [ LMNH ]    [ + Drop ]    [ Credits: 340 ] │
├─────────────────────────────────────────┤
│  ★ PROMOTED ROTATION (6 slots, scrollable) │
│  [ Drop ] [ Drop ] [ Drop ] [ Drop ]...  │
├─────────────────────────────────────────┤
│  [ All ] [ Following ] [ Trending ]      │
├─────────────────────────────────────────┤
│  Drop card                               │
│  Drop card                               │
│  Drop card                               │
│  ...                                     │
└─────────────────────────────────────────┘
```

### Drop Card Contains:

- Thumbnail (scraped from live URL)
- Title
- Builder avatar + username
- Tools used (pill tags)
- Like count, comment count
- “▶ Watch process” if video attached
- Time since posted

-----

## Drop Detail Page

```
┌─────────────────────────────────────────┐
│  Title                    [♥ Like] [↗ Visit] │
│  by @username                            │
├─────────────────────────────────────────┤
│  [ LIVE PREVIEW — iframe or screenshot ] │
├─────────────────────────────────────────┤
│  Description                             │
│  Tools: [Claude] [Replit] [Bolt]         │
├─────────────────────────────────────────┤
│  [ Process Video embed ]  (if present)   │
├─────────────────────────────────────────┤
│  Comments                                │
│  [ text input ]                          │
└─────────────────────────────────────────┘
```

-----

## Tone & Brand

**Name:** Look Mom No Hands
**Short form:** LMNH
**Tagline:** *Built with AI. Shared with pride.*
**Manifesto line:** *Room for all.*

**Voice:** Irreverent, warm, anti-gatekeeping. Celebrates the weird and the amateur alongside the impressive. Never takes itself too seriously. The name IS the brand — it’s about the thrill of doing something you weren’t supposed to be able to do.

**Visual direction:** Chaotic-good. Bright. Loud. Hand-drawn energy mixed with digital precision. Think zine culture meets web2.0 nostalgia. NOT corporate. NOT another dark-mode SaaS dashboard.

-----

## MVP Build Order

1. Supabase project setup — schema, auth, RLS policies
1. Next.js scaffold — Vercel deploy, Tailwind, Supabase client
1. Auth flow (login/signup/logout)
1. Drop CRUD (create, read, edit, delete)
1. The Feed (all drops, paginated)
1. Like + Comment
1. Follow/unfollow + Following tab
1. Builder profile page
1. Credit earning (action hooks)
1. Daily cap enforcement
1. Credit spending + Promotion queue
1. The Rotation (promoted slots in feed)
1. About/manifesto page
1. Polish + mobile responsiveness

-----

## Open Questions (Decide Before Building)

1. **Username rules** — can builders change their username? (recommendation: no, or once ever)
1. **Drop moderation** — who removes spam/abuse in MVP? (recommendation: report button → manual review)
1. **Video completion tracking** — honor system (front-end timer) vs. no video credits in V1 to keep it simple
1. **Credit expiry** — do credits expire? (recommendation: no, keep it simple)
1. **New builder bonus** — should new signups get a starter credit balance so they can promote on day one? (recommendation: yes, 200 credits on signup)

-----

*LMNH Product Spec v0.1 — The Means of Production*
