# English App — Content Sources

## Release 1 — open-source starter pack

The first centralized learning pack is stored in the D1 migration
`migrations/0002_learning_content.sql`. The UI does not own a second copy of
the lesson data; it reads `/api/content/topics` from the Worker.

| Source | Use | License decision |
|---|---|---|
| [Openjam](https://github.com/amirj4m/openjam) | Vocabulary/level reference and topic taxonomy | MIT; accepted for the release |
| [Mozilla Common Voice sentence prompts](https://gist.github.com/8f2581641caca265945786fe99274966) | Three pronunciation prompts | CC0; accepted for the release |
| English App curated examples | Original bilingual examples and teaching hints | Original content for this project |

The release deliberately excludes the Google Web Trillion-derived list because
its repository warns against commercial use without an LDC license. Oxford
derived lesson content is also not copied; compatible structures may be used as
inspiration only.

## Data contract

- `content_sources` records source name, URL, license, retrieval date and notes.
- `content_topics` stores the learner-facing topic metadata.
- `content_phrases` stores English prompts, Vietnamese hints, pronunciation tips
  and grammar notes.
- The Worker is the only runtime read path. Pages receives the API base URL via
  the non-secret `VITE_API_BASE_URL` production setting.

## Release 2 — structured curriculum (2026-08-21)

`migrations/0003_curriculum_expansion.sql` adds four original English App learning
modules, sixteen ordered lessons, eighty new phrase prompts, and forty-eight
original vocabulary entries with IPA, Vietnamese meaning, and example sentences.
The twelve Release 1 phrases remain linked to the first lesson of their matching
module so the iSpeaker topic picker stays backward-compatible.

- The new module/lesson descriptions and example sentences are original project
  content; no proprietary Oxford or Google Web Trillion lesson text is copied.
- New phrase rows use the existing `english-app-curated` provenance source.
- Runtime surfaces are `GET /api/content/curriculum` and
  `GET /api/users/:id/progress`; the UI does not own a second content database.

`migrations/0004_curriculum_levels.sql` adds the extended CEFR bank: 5 levels,
15 units, 120 vocabulary entries and 90 original sentence examples. Its
runtime surface is `GET /api/content/levels`; vocabulary is stored in the
separate `content_level_vocabulary` table so the MVP lesson vocabulary and
progress contract remain stable.
