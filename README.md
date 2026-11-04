# JCA Mock Exam

A private, multi-user mock-exam platform for the Supreme Court of India **Junior Court Assistant (JCA)** paper. It runs on Next.js with MongoDB, supports credential login for five candidates plus an administrator, and gives the administrator a performance dashboard across every account.

**Live:** <https://jca-mock-exam.onrender.com>

> The Render free instance sleeps after inactivity, so the first request after a quiet period can take up to a minute.

## What it does

- **Full mocks** use the 2026 pattern: 100 questions across 7 sections in 90 minutes.
- **Marking:** +1 correct, −0.25 wrong, 0 skipped, +1 for bonus questions. Pass mark 50, target 78.
- **Fresh papers:** each attempt is assembled from the bank, preferring unseen questions, then previously wrong ones, then the rest.
- **Drills:** 5–30 questions from one section or all sections, with the same marking.
- **Question bank:** searchable and filterable by section and topic, with answers and explanations.
- **Mistake notebook:** every wrong answer, newest first, with the correct option and explanation.
- **History and results:** per-section breakdown, net marks, and full question review.
- **Private data:** candidates only ever read and write their own attempts. No public registration.
- **Admin dashboard:** candidate list, per-candidate attempts, section accuracy, pass rate, recent submissions, and the most-missed questions. Admins cannot see or reset passwords.
- **Backup / restore / reset:** each candidate can export and restore their own attempt data.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Database | MongoDB (official driver) |
| Auth | Signed JWT in an HttpOnly cookie (`jose`) |
| Passwords | bcrypt (`bcryptjs`) |
| Validation | Zod |
| Tests | Vitest |

## Seeded accounts

Seeding is idempotent. Existing accounts are left alone unless `SEED_FORCE_PASSWORD=true` is set.

| Username | Role | Initial password |
| --- | --- | --- |
| `admin` | admin | `admin` |
| `user1` | user | `test1` |
| `user2` | user | `test2` |
| `user3` | user | `test3` |
| `user4` | user | `test4` |
| `user5` | user | `test5` |

These are weak passwords chosen deliberately by the owner for a small private deployment. Change them from **Settings** if the URL is shared more widely. There is no self-service registration and no administrator password-reset feature.

## Local setup

Requirements: Node.js 22+ and a MongoDB connection string (Atlas or self-hosted).

```bash
npm install
cp .env.example .env
# fill MONGODB_URI and AUTH_SECRET, keep or change the seeded passwords
npm run db:seed     # creates indexes, accounts, and the question bank
npm run dev
```

Open <http://localhost:3000>.

### Environment

| Key | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `MONGODB_DB` | yes | Database name (`jca-mock-exam`) |
| `AUTH_SECRET` | yes | Signs session cookies; at least 32 characters |
| `ADMIN_USERNAME` | yes | Seeded admin username |
| `ADMIN_PASSWORD` | yes | Seeded admin password |
| `SEED_USER_PASSWORDS` | yes | Comma-separated passwords for `user1`..`user5` |
| `COOKIE_SECURE` | no | `true` on HTTPS, `false` only for local HTTP testing |
Never commit `.env`. It is gitignored.

## Project structure

```text
app/
  (app)/                authenticated shell: dashboard, new, drill, bank,
                        mistakes, history, learn, settings, admin
  attempt/[id]/         distraction-free exam runner
  result/[id]/          score, section breakdown, full question review
  login/                credential login
  api/                  auth, attempts, admin, backup, health
components/             nav, forms, attempt runner, shared UI
lib/
  admin/                aggregate and per-user analytics
  auth/                 password hashing, JWT sessions, guards, rate limiting
  db/                   Mongo client, collections, indexes, types
  exam/                 pattern, scoring, selection, attempt service, queries
  validation/           Zod schemas
  backup.ts             export, restore, reset
content/                question bank (9 papers, 665 questions)
scripts/                seed and index setup
tests/                  Vitest unit tests
render.yaml             Render Blueprint
```

## Core logic

### Exam pattern

| Section | Questions |
| --- | ---: |
| English | 20 |
| Aptitude | 15 |
| GK | 15 |
| Constitution | 15 |
| SC Rules 2013 | 10 |
| Rules 1961 | 10 |
| Computer | 15 |
| **Total** | **100** |

### Attempt lifecycle

1. A test and an `in_progress` attempt are created together.
2. Answers autosave individually with selected option, review flag, and time spent.
3. Submitting — or the timer expiring — scores the attempt and stores a snapshot.
4. Results expose per-section totals and explanations.

### Access control

Every page and API checks the session server-side.

- Users can only read and write their own attempts, answers, history, and mistakes.
- Admins can read aggregate and per-user performance, but never passwords.
- There is no registration endpoint. Only seeded accounts exist.
- Login is rate-limited per IP + username: 5 failures in 15 minutes blocks further attempts.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run db:indexes` | Create MongoDB indexes |
| `npm run db:seed` | Seed accounts and question bank (local `.env`) |
| `npm run start:render` | Seed idempotently, then start (used by Render) |

## Tests

Unit tests cover the exam pattern, marking and section totals, question selection, session tokens, password hashing, and backup validation. See [TESTS.md](./TESTS.md) for the full checklist and the integration checks performed against the live database.

```bash
npm test
```

## Deploy on Render

**Deployed:** <https://jca-mock-exam.onrender.com> (Blueprint from `render.yaml`).

A Render Blueprint is included in [`render.yaml`](./render.yaml).

1. Create a **New Blueprint Instance** on Render and connect this GitHub repository.
2. Set the secret environment variables when prompted:
   - `MONGODB_URI` — the Atlas connection string
   - `ADMIN_PASSWORD` — `admin` for this deployment
   - `SEED_USER_PASSWORDS` — `test1,test2,test3,test4,test5`
3. Render generates `AUTH_SECRET`, builds with `npm ci && npm run build`, then runs `npm run start:render`.
4. The start command seeds indexes, the six accounts, and the question bank idempotently before `next start`.
5. Atlas must allow Render's outbound IPs. For a small private deployment, an Atlas IP access-list entry of `0.0.0.0/0` is the simplest option.

The health check is `GET /api/health`. Sessions use `Secure` cookies when `COOKIE_SECURE=true`.
