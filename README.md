# JCA Mock Exam

A multi-user mock-exam platform for the Supreme Court of India Junior Court Assistant (JCA) paper.

## Overview

- 684-question bank built from previous-year papers and topic sets.
- Full mocks use the 2026 pattern: 100 questions across 7 sections in 90 minutes.
- Marking: +1 correct, -0.25 wrong, 0 skipped, +1 for bonus questions.
- Practice drills, question bank browser, mistake notebook, history, and study notes.
- Credential login with two roles: `user` and `admin`.
- Admin dashboard tracks every user's attempts, scores, section accuracy, and activity.
- No public sign-up. Accounts are created only by the seed script.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | MongoDB (official driver) |
| Auth | Signed JWT in an HttpOnly cookie (`jose`) |
| Passwords | bcrypt (`bcryptjs`) |
| Validation | Zod |

## Getting started

Requirements: Node.js 22+ and a MongoDB connection string (Atlas or self-hosted).

```bash
npm install
cp .env.example .env
# fill MONGODB_URI, AUTH_SECRET, ADMIN_PASSWORD
npm run db:indexes
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Environment

| Key | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `MONGODB_DB` | yes | Database name (`jca-mock-exam`) |
| `AUTH_SECRET` | yes | Signs session cookies; use 32+ random bytes |
| `ADMIN_USERNAME` | yes | Seeded admin username |
| `ADMIN_PASSWORD` | yes | Seeded admin password |
| `SEED_USER_PASSWORDS` | yes | Comma-separated passwords for `user1`..`user5` |

Never commit `.env`. It is gitignored.

## Seeded accounts

| Username | Role |
| --- | --- |
| `admin` | admin |
| `user1` .. `user5` | user |

Passwords come from environment variables. Seeding is idempotent: existing users are never overwritten unless `SEED_FORCE_PASSWORD=true` is set.

## Project structure

```text
app/                  routes, layouts, pages
  api/                auth, attempts, admin, backup endpoints
  admin/              admin dashboard and per-user analytics
  attempt/[id]/       exam runner and result
  bank/ drill/ history/ learn/ mistakes/ new/ settings/
components/           shared UI
lib/
  auth/               session, password, guards
  db/                 MongoDB client, collections, indexes
  exam/               pattern, scoring, attempt service
  validation/         Zod schemas
scripts/              seed and index setup
tests/                Vitest tests
jca-mock-exam-vault/  Obsidian work log (gitignored)
```

## Core logic

### Exam pattern

100 questions in 90 minutes:

| Section | Questions |
| --- | ---: |
| English | 20 |
| Aptitude | 15 |
| GK | 15 |
| Constitution | 15 |
| SC Rules 2013 | 10 |
| Rules 1961 | 10 |
| Computer | 15 |

Question selection prefers unseen questions, then previously wrong ones, then a random draw. Each paper is assembled fresh.

### Attempt lifecycle

1. A test and an `in_progress` attempt are created together.
2. Answers autosave individually with selected option, review flag, and time spent.
3. Submitting (or the timer expiring) scores the attempt and stores a snapshot.
4. Results expose per-section totals, accuracy, and explanations.

### Access control

Every page and API checks the session server-side.

- Users can only read and write their own attempts, answers, history, and mistakes.
- Admins can read aggregate and per-user performance, but never passwords.
- There is no registration endpoint. Only seeded accounts exist.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest |
| `npm run db:indexes` | Create MongoDB indexes |
| `npm run db:seed` | Seed users and question bank |

## Status

Scaffold stage. MongoDB credentials are still required before the data layer, auth, and seeding can be verified.
