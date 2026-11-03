# Test checklist

Status is updated after every `npm test` run.

## Unit

- [ ] Exam pattern builds 100 questions across 7 sections
- [ ] Section quotas are respected when the bank has enough questions
- [ ] Correct answer scores +1
- [ ] Wrong answer scores -0.25
- [ ] Skipped answer scores 0
- [ ] Bonus question scores +1 for everyone
- [ ] Score summary totals match per-section totals
- [ ] Session token round-trips a user payload
- [ ] Expired or tampered session token is rejected

## Integration (requires MongoDB)

- [ ] Seed is idempotent
- [ ] Login succeeds with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Login is rate-limited after repeated failures
- [ ] User cannot read another user's attempt
- [ ] Admin can read all users' performance
- [ ] Non-admin cannot access admin endpoints

## End-to-end

- [ ] User logs in and starts a full mock
- [ ] Answers autosave and survive a reload
- [ ] Paper auto-submits at zero
- [ ] Result page shows score and explanations
- [ ] Admin sees the user's new attempt
