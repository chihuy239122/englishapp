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
