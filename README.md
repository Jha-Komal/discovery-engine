# Myntra Discovery Engine

An AI-powered discovery engine that analyzes real Myntra user reviews and discussions (Play Store, App Store, Reddit, consumer complaint sites) to answer a specific Growth PM research question:

> Why do users add fashion products to their wishlist, and what stops them from purchasing within 30 days — **without using monetary incentives** as the solution?

It goes beyond sentiment analysis: every review is run through an LLM extraction pass tailored to wishlist psychology, the results are aggregated into real statistics, and those statistics feed three further AI passes — **Insights** (direct answers to 10 discovery questions), **Opportunity Areas** (quantified, ranked, comparable problem areas), and **Recommendations** (non-monetary product actions, tiered by effort/impact).

---

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — single app, no separate backend. API routes under `src/app/api/*` do everything the old Express controllers did.
- **JSON files as the "database"** — `generated/*.json`, read/written via `src/lib/store.ts`. No Prisma, no SQLite, by design (kept simple).
- **OpenAI `gpt-4o-mini`** via the `openai` SDK — batched analysis with retry-on-parse-failure and Zod validation, same pattern as the reference Blinkit project.
- **TailwindCSS v4 + Recharts + lucide-react**, themed with Myntra's brand pink (`#ff3f6c`).
- **TanStack Query** for all client-side data fetching.

---

## Project structure

```
ai-analyzer-myntra/
├── data/                    # raw review CSVs (copied from myntra-review-collector/output)
├── refined-data/            # cleaned CSVs — output of scripts/clean-reviews.mjs (gitignored, regenerable)
├── generated/                # JSON "database" — pipeline output (gitignored, regenerable)
│   ├── reviews.json
│   ├── analysis.json
│   ├── aggregation.json
│   ├── insights.json
│   ├── opportunities.json
│   ├── recommendations.json
│   └── status.json
├── scripts/
│   └── clean-reviews.mjs    # data/ -> refined-data/ cleaning pass
└── src/
    ├── app/
    │   ├── page.tsx                  # Dashboard (pipeline controls + KPIs + charts)
    │   ├── reviews/page.tsx          # Review explorer (filter, table, detail drawer)
    │   ├── insights/page.tsx         # 10 discovery-question Q&A cards
    │   ├── opportunities/page.tsx    # Quantified, ranked opportunity areas
    │   ├── recommendations/page.tsx  # Quick-win / medium / high / long-term actions
    │   └── api/                      # load-reviews, analyze, status, dashboard, insights,
    │                                 # opportunities, recommendations, reviews, reviews/[id]
    ├── components/            # ui/, shared/, charts/, layout/
    ├── hooks/                  # React Query hooks, one per resource
    └── lib/
        ├── types.ts, store.ts, csv-loader.ts, pipeline.ts, aggregation.ts
        ├── ai-service.ts, openai-provider.ts, validators.ts, constants.ts
        └── prompts/           # review-analysis, insight-generation,
                                 # opportunity-generation, recommendation prompts
```

---

## Setup

```bash
npm install
cp .env.example .env      # add your OPENAI_API_KEY
npm run clean              # data/*.csv -> refined-data/*.csv
npm run dev                 # http://localhost:3000
```

Then in the browser: **Dashboard → Load Reviews → Run Analysis**. Analysis runs in the background (subject to OpenAI rate limits); the Dashboard polls `/api/status` every 2s and shows a live progress stepper.

`npm run clean` is idempotent — re-run any time `data/` changes. `Load Reviews` and `Run Analysis` are resumable: re-running `Run Analysis` only analyzes reviews not already present in `generated/analysis.json`, so an interrupted run picks up where it left off.

---

## Data cleaning (`scripts/clean-reviews.mjs`)

For every CSV in `data/`, in order:
1. Strip HTML tags, collapse whitespace.
2. Drop empty / stars-only / punctuation-only reviews.
3. **Drop reviews under 10 characters** (after cleaning).
4. **Drop Hindi-language reviews** — detected via Devanagari Unicode range (U+0900–U+097F); a review needs 3+ Devanagari characters to be flagged, so a review that's 95% English with one stray Hindi word is still dropped (by design — "remove Hindi reviews" is read as an exclusion, not a majority-language classifier).
5. Deduplicate by `(source, lowercased text)`.

Prints a per-file and overall summary of what was removed and why. Output goes to `refined-data/`, same filenames.

On the actual Myntra dataset (3,520 raw reviews across 4 sources): 841 removed for length, 6 for Hindi, 132 duplicates, 4 empty — **2,537 kept**.

---

## Per-review AI extraction

Every review is analyzed (batches of 10) into the standard fields (`sentiment`, `emotion`, `themes`, `painPoints`, `featureRequests`, `summary`, `confidence`) **plus** fields built specifically for this research question:

| Field | What it captures |
|---|---|
| `wishlistMotivation` | Why the item was likely wishlisted (price-wait, uncertain-fit, gift-idea, comparison-shopping...) |
| `purchaseBarrier` | What's blocking conversion (price, fit/size uncertainty, size unavailable, waiting for discount, needs external validation, decision paralysis, trust/authenticity, return friction...) |
| `uncertaintyType` | Residual doubt after shortlisting (fit/size, quality, authenticity, color accuracy, value) |
| `comparisonBehavior` | How the user compares shortlisted products (cross-app, within-wishlist, seeks external reviews...) |
| `externalInfoSought` | Where they look outside the app (YouTube reviews, influencer opinion, friend/WhatsApp, Google) |
| `decisionFactors` | Which of {fit, size, styling, price, reviews, occasion, social_validation, brand_trust, return_policy} are discussed |
| `wishlistIntent` | `genuine_intent` \| `bookmark_only` \| `price_tracking` \| `unclear` |
| `segmentHint` | Freeform tag if the review reveals a user segment (budget-conscious, occasion-shopper, trend-follower...) |

Most reviews are general app feedback, not literally about wishlists — the prompt is instructed to return `null`/empty on these fields rather than force an answer, so the aggregated distributions reflect only genuine signal.

---

## The pipeline (`src/lib/pipeline.ts`)

```
load refined CSVs → reviews.json
  → analyze unanalyzed reviews in batches of 10 → analysis.json
  → compute real percentages/counts across all extraction fields → aggregation.json
  → AI answers the 10 discovery questions, grounded in the stats → insights.json
  → AI identifies & ranks quantified opportunity areas from the stats + insights → opportunities.json
  → AI generates non-monetary recommendations from the opportunity areas → recommendations.json
```

Each AI call retries once on JSON-parse failure and is Zod-validated before being saved. `generated/status.json` tracks pipeline stage/progress for the UI's live progress stepper.

### The 10 discovery questions (`src/lib/constants.ts`)

1. Why do users add fashion products to their wishlist?
2. What prevents wishlisted products from eventually being purchased?
3. What uncertainties remain after users have identified a product they like?
4. What causes users to postpone a purchase?
5. How do users compare multiple shortlisted products?
6. What information do users seek outside Myntra/AJIO before purchasing?
7. What role do fit, size, styling, price, reviews, occasion and social validation play?
8. When do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism?
9. How do these behaviors differ across user segments?
10. What unmet needs emerge consistently across user conversations?

### Opportunity Areas — beyond insights

This is the layer that goes past "summarize + sentiment": aggregated statistics (real percentages, not AI guesses) are turned into named, ranked opportunity areas — each with a `quantifiedMetric` (e.g. *"38% of purchase-barrier mentions cite fit/size uncertainty — the largest single category"*), an `affectedShare` estimate, and a `comparisonNote` explicitly sizing it against the other opportunities. Sorted by `affectedShare` descending.

### No monetary incentives

The opportunity-generation and recommendation prompts both carry a hard constraint: no discounts, cashback, coupons, or price cuts anywhere in the output. Every lever must be product/UX/information/trust-based instead.

---

## API routes

| Route | Purpose |
|---|---|
| `GET /api/load-reviews` | Load `refined-data/*.csv` into `generated/reviews.json` |
| `POST /api/analyze` | Kick off the full pipeline (backgrounded, returns immediately) |
| `GET /api/status` | Current pipeline stage/progress |
| `GET /api/dashboard` | Aggregation stats + counts |
| `GET /api/insights` | The 10 answered discovery questions |
| `GET /api/opportunities` | Ranked, quantified opportunity areas |
| `GET /api/recommendations` | Non-monetary recommendations by priority tier |
| `GET /api/reviews` | Paginated, filterable review list (source, sentiment, wishlistIntent, theme, keyword) |
| `GET /api/reviews/:id` | Single review + full analysis |

---

## Known limitations

- **No visual QA performed by the build agent** — the dev server, build, lint, and every API route were verified against real data, but no browser screenshot was taken to confirm the Myntra theming/layout renders correctly. Worth a manual look before treating the UI as final.
- **Full pipeline run not yet executed end-to-end** — requires a real `OPENAI_API_KEY`, which wasn't available in the build environment. `Load Reviews` was verified against the real 2,537-review dataset; `Run Analysis` (the OpenAI-calling steps) is implemented and Zod-validated but not yet run against live data.
- Analyzing all 2,537 reviews is ~254 batched OpenAI calls — expect the full pipeline to take a while and to cost a small amount of `gpt-4o-mini` usage.
