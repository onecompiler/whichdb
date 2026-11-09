# Contributing to the WhichDB data

How database profiles in `databases/*.json` are researched, written and kept current. This is the
brief for human contributors and for AI research agents alike.

## The contract

- One file per database: `databases/<slug>.json`. The slug is lowercase kebab-case and the filename
  must match it.
- [`schema/profile.schema.json`](schema/profile.schema.json) defines every field and enum. It is
  generated from the site's schema, so don't edit it by hand; if a field or enum value is missing,
  open an issue.
- [`databases/postgresql.json`](databases/postgresql.json) is the reference example. Match its depth and tone.
- Run `npm install` once, then `npm run validate` (everything) or `npm run validate -- <slug> ...`.
  A change is done only when it validates with **0 errors**. Pull requests are checked the same way.
- `alternatives` must use slugs of existing profiles. A warning about a missing slug is fine for a
  database we haven't profiled yet.

## Research rules

1. **Verify on the web, today.** Training data and old blog posts are stale. For every database,
   check the official site, GitHub releases and news for: latest version and release date, license
   (licenses changed a lot in 2023–2026), current owner (acquisitions, renames), and whether it is
   still alive. Use at least 2 sources and list them in `sources` (official pages preferred).
2. **Status must be honest.** Archived repo, shut-down service, or end-of-life announcement →
   `deprecated`/`discontinued` with a one-line `statusNote` (what happened, when, and the
   recommended successor if any).
3. **Write original prose.** Never copy text from DB-Engines, Wikipedia or vendor marketing.
   Be specific and opinionated in a helpful, engineer-to-engineer voice. No hype words
   ("revolutionary", "blazing"). `tagline` ≤ 110 chars; `description` 2–5 sentences
   (120–1100 chars) explaining what it is, what it's best at, and where it fits today.
4. **Strengths / weaknesses / useCases / notIdealFor** power the site's recommendations and
   comparison pages. Make them concrete ("Sub-millisecond reads from RAM", not "Fast").
   Weaknesses must be real trade-offs.
5. **Features are booleans** meaning "supported natively or via an official, first-party
   extension/edition". If it needs a third-party add-on, set `false`. When genuinely unsure,
   prefer `false`.
6. **Scale tier**: `small` ≈ single-machine/≤100 GB comfortable; `medium` ≈ ≤10 TB;
   `large` ≈ ≤1 PB; `massive` = multi-PB production deployments are documented.
7. **productType**: `engine` (you run or buy it), `managed-service` (cloud-only service, e.g.
   Aurora, BigQuery, Neon), `extension` (pgvector, Citus, PostGIS, AGE), `library`
   (embeddable storage library: RocksDB, LMDB), `platform` (backend platform with a database at
   its core: Supabase, Firebase, Convex), `research` (a research prototype never sold as a product).
8. **notableUsers**: only companies with a public, verifiable reference (case study, engineering
   blog). Leave it empty rather than guess.
9. **Dates**: `lastVerified` = the date you did the research (YYYY-MM-DD).

## The `ids` block

These identifiers are used to collect popularity signals for the WhichDB Score. Wrong ids corrupt
the ranking, so verify them and omit any that don't exist.

| id                 | What                                   | How to verify                                                                 |
| ------------------ | -------------------------------------- | ----------------------------------------------------------------------------- |
| `github`           | main source repo `owner/repo`          | the repo page (not archived, not a mirror)                                    |
| `stackoverflowTag` | primary Stack Overflow tag             | the obvious tag (`postgresql`, `amazon-dynamodb`)                             |
| `wikipedia`        | English Wikipedia article title        | `https://en.wikipedia.org/wiki/<title>` resolves to the right article         |
| `dockerHub`        | official image `namespace/name`        | the image page on hub.docker.com                                              |
| `npm` / `pypi` / `crates` | official client package(s): a string, or a list of up to 6 candidates (the most-downloaded per ecosystem counts, so list the driver and its popular alternatives, not wrappers that depend on it) | the package page on npmjs.com / pypi.org / crates.io. Leave empty for wire-compatible systems without their own driver (CockroachDB speaks PostgreSQL) |
| `hackerNewsQuery`  | an unambiguous search phrase; `A\|B` matches either | e.g. `CockroachDB`, `Postgres\|PostgreSQL`; avoid common words (`Chroma` → `Chroma vector database`) |

## Logos

- `brand.simpleIcon` is a [Simple Icons](https://simpleicons.org) slug. Omit it if there is no match.
  `brand.color` is the product's primary brand color (hex).
- Without a Simple Icons match, a full-colour logo can go in `logos/<slug>.webp`: 160×160,
  the product's own square mark (not a wordmark, not the vendor's or host's logo, never a person's
  avatar), transparent marks padded to ~82% of the square. Record where it came from in
  `logos/sources.json`. Simple Icons wins when both exist.
- No logo is better than a wrong one; the site falls back to a monogram.
- Logos are trademarks of their owners and are not covered by this repository's license
  (see [NOTICE](NOTICE)).

## Adding a database

1. Make sure it isn't already here under another name: search `databases/` for the name and its
   `aliases`.
2. Be selective. A database is notable if it has real adoption (≥1k GitHub stars, a funded
   company, or an established enterprise product), or if it is a landmark historical or research
   system.
3. Pick a slug that isn't a site path (the schema lists the reserved ones) and write the profile
   following the rules above.

Not a database? Message brokers, BI dashboards and web frameworks don't belong here, even if they
store data internally.

## Long-tail and historical systems

The dataset aims to list every database, including small open-source projects, dead products and
landmark research systems. These need the same honesty as the big ones, adapted:

- **Identify the right system first.** Names collide (Atlas, Vector, Helium, Beam, Paper).
- **Research prototypes** (System R, H-Store, C-Store, Mariposa, SDD-1…) use
  `productType: "research"`, `status: "discontinued"` (or `active` if the project is still
  maintained, e.g. Hyrise), `maturity: "legacy"`, `vendorType: "academic"` (or the lab's
  company), and a `statusNote` such as "Research prototype (1974–1979); ideas live on in DB2 and
  SQL." Strengths and useCases describe what it pioneered and where it is still useful (study,
  teaching, reference implementation). `website` may be the paper, the project page or an
  archive.org snapshot.
- **Dead or acquired products**: `status: "discontinued"` with what happened and when, and the
  successor in `alternatives` when there is one. Abandoned GitHub projects (archived, or no
  commits for 3+ years) are `discontinued` (archived) or `maintenance` (no feature work).
- **Unknown facts stay empty.** Omit `latestVersion`, `notableUsers` and ids you cannot verify.
  For `initialRelease` use the best-documented year.
- Good sources: official site, repository, papers (ACM/VLDB/arXiv), Wikipedia, archived pages,
  dbdb.io. Write original prose; never copy descriptions.

## Pull requests

- Keep one database per pull request where you can, and say what changed and why.
- Link the sources that back the change (they belong in the profile's `sources` too).
- **Don't rename or delete a profile in a pull request.** The slug is the page's URL; open an issue
  instead so the old URL can be redirected.
- If you work for the vendor, say so. Vendor corrections are welcome, but they follow the same
  rules: verifiable facts, original prose, real trade-offs.

By contributing you agree that your contribution is licensed under CC BY 4.0, like the rest of
the data.
