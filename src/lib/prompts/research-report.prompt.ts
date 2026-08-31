import type { AggregationStats, ReviewWithAnalysis } from '../types';
import { pruneStatsForPrompt } from '../prompt-stats';

/** Compact per-record shape matching the prompt's INPUT field list. */
function toInputRecord(r: ReviewWithAnalysis) {
  const a = r.analysis!;
  return {
    record_id: r.id,
    source: r.source,
    relevance_class: a.relevance.class,
    evidence_strength: a.relevance.evidenceStrength,
    journey_stage: a.journeyStages,
    wishlist_job: a.wishlistBehavior.jobCategory,
    purchase_intent: a.purchaseIntent.level,
    barriers: a.barriers.map((b) => ({ category: b.category, severity: b.severity, evidence: b.evidence })),
    uncertainties: a.uncertainties.map((u) => ({ category: u.category, evidence: u.evidence })),
    postponement: a.postponement.present === 'YES' ? { reason: a.postponement.reason } : null,
    comparison_behavior: a.comparisonBehavior.present === 'YES' ? a.comparisonBehavior.itemsCompared : null,
    external_information_seeking: a.externalInformationSeeking.present === 'YES' ? a.externalInformationSeeking.sources : null,
    social_validation: a.socialValidation.present === 'YES' ? a.socialValidation.source : null,
    workarounds: a.workarounds,
    segment_signals: a.segmentSignals.map((s) => s.segment),
    sentiment: a.sentiment.overall,
    decision_outcome: a.decisionOutcome.status,
    metric_relevance: a.metricConnection.relevance,
    evidence_quote: a.evidenceQuote,
  };
}

export function buildResearchReportPrompt(stats: AggregationStats, records: ReviewWithAnalysis[]): string {
  const dataset = {
    aggregated_statistics: pruneStatsForPrompt(stats),
    sample_records: records.map(toInputRecord),
    sample_record_count: records.length,
    note: 'aggregated_statistics.relevanceClassDistribution, sourceDistribution, totalCount, analyzedCount, averageRating are complete and exact over the FULL analyzed corpus — use these for quantification. Every other breakdown map (barriers, uncertainties, job categories, etc.) is capped to its top 20 entries by frequency — treat these as "the dominant patterns," not an exhaustive list; do not claim a category doesn\'t exist just because it is absent from a capped list. sample_records is a representative subset for qualitative grounding, evidence quotes, and pattern-finding — not the full corpus.',
    critical_relevance_class_rule:
      "Every '<x>ByRelevanceClass' field (e.g. barrierCategoryByRelevanceClass, purchaseIntentByRelevanceClass, wishlistJobCategoryByRelevanceClass) gives the EXACT DIRECT_WISHLIST / ADJACENT_DECISION / GENERAL_ECOMMERCE / IRRELEVANT split for that specific count. Look up the split there before labeling any finding's 'Evidence:' or 'direct vs adjacent evidence' field — do not assume a count is DIRECT_WISHLIST just because the topic (e.g. purchase intent, wishlist job) sounds wishlist-related. A flat field like purchaseIntentDistribution.HIGH or barrierCategoryFrequency['delivery timing'] is a corpus-wide total across ALL relevance classes, NOT a DIRECT_WISHLIST-specific count — most of it is typically GENERAL_ECOMMERCE. HARD CONSTRAINT: the DIRECT_WISHLIST portion of any finding can never exceed relevanceClassDistribution.DIRECT_WISHLIST (the total number of DIRECT_WISHLIST records in the whole corpus) — if you cite a DIRECT_WISHLIST count larger than that total anywhere in the report, that is a contradiction and the report is wrong.",
  };

  return `ROLE

You are a Senior Product Manager and User Researcher on Myntra's Growth team.

BUSINESS METRIC

Increase:

"% of users who purchase at least one item from their wishlist within 30 days of adding it."

CONSTRAINT

The eventual solution cannot use monetary incentives.

INPUT

You will receive structured records extracted from public fashion-shopping conversations.

Each record may contain:

* source
* relevance_class
* evidence_strength
* journey_stage
* wishlist_job
* purchase_intent
* barriers
* uncertainties
* postponement
* comparison_behavior
* external_information_seeking
* social_validation
* workarounds
* segment_signals
* sentiment
* decision_outcome
* metric_relevance
* evidence_quote

DATASET:
${JSON.stringify(dataset, null, 2)}

GOAL

Use the dataset to:

1. understand wishlist behavior
2. identify barriers to purchase
3. identify behavioral segments
4. identify recurring decision patterns
5. rank opportunity hypotheses
6. identify what must be validated in 5–6 user interviews

DO NOT propose features, solutions, MVPs, or AI use cases.

==================================================
RESEARCH RULES
==============

Follow these rules strictly.

1. Evidence hierarchy

DIRECT_WISHLIST
= strongest evidence about wishlist behavior

ADJACENT_DECISION
= useful for hypotheses about purchase decisions

GENERAL_ECOMMERCE
= use only when clearly connected to the target metric

IRRELEVANT
= exclude

Never present adjacent evidence as direct wishlist evidence.

2. Evidence vs inference

For every major conclusion distinguish:

KNOWN
= directly supported by evidence

INFERRED
= reasonable interpretation

UNKNOWN
= current dataset cannot establish it

Do not invent missing information.

3. Purchase intent

Never assume wishlist addition means intent to purchase.

Use:

HIGH
= clear intent to buy, but something blocks/delays it

MEDIUM
= seriously considering

LOW
= likes item but no concrete buying plan

BOOKMARK
= inspiration/reference/storage

UNKNOWN
= insufficient evidence

4. Quantification

When reporting prevalence always show:

count / denominator / %

Example:

38 / 142 relevant records = 26.8%

Never generalize this to "26.8% of Myntra users."

5. Frequency is not importance

Do not prioritize a problem only because it appears often.

Public feedback can contain:

* source bias
* complaint bias
* duplicate themes
* vocal minorities
* unequal source volumes

6. Sentiment

Sentiment is descriptive only.

DO NOT use sentiment to prioritize opportunities.

7. Segmentation

Use behavioral segments.

Do not invent age, gender, income, occupation, geography, or other demographics.

8. Contradictions

Preserve evidence that challenges leading hypotheses.

9. Insufficient evidence

When evidence is weak, write:

"Insufficient evidence in the current dataset."

==================================================
STEP 1 — DATA QUALITY
=====================

Report:

* total records
* records by source
* records by relevance class
* records by evidence strength
* records by journey stage
* records by purchase intent
* records by known decision outcome

Specifically calculate:

DIRECT_WISHLIST: count / total / %
ADJACENT_DECISION: count / total / %
GENERAL_ECOMMERCE: count / total / %
IRRELEVANT: count / total / %

Identify:

* overrepresented sources
* missing/weak fields
* duplicate themes if visible
* important evidence gaps
* areas relying heavily on inference

Then classify the corpus:

A. STRONG ENOUGH FOR DIRECTIONAL FINDINGS
B. HYPOTHESIS-GENERATING ONLY
C. INSUFFICIENT

Explain in 2–4 sentences.

==================================================
STEP 2 — ANSWER THE 10 DISCOVERY QUESTIONS
==========================================

Q1. Why do users add products to their wishlist?

Discover wishlist jobs from the evidence.

For each job report:

* job
* description
* count / denominator / %
* direct vs adjacent evidence
* typical purchase intent
* behavioral segments
* evidence example
* confidence: HIGH / MEDIUM / LOW

Explicitly distinguish:

HIGH INTENT
MEDIUM INTENT
LOW INTENT
BOOKMARK/INSPIRATION
UNKNOWN

---

Q2. What prevents wishlisted products from being purchased?

Identify barrier categories from the evidence.

For each report:

* barrier
* description
* count / denominator / %
* direct vs adjacent evidence
* affected purchase intent
* severity: HIGH / MEDIUM / LOW
* current workaround
* outcome: DELAY / ABANDON / SWITCH / UNKNOWN
* connection to 30-day conversion
* confidence

Most importantly, separate:

A. user wants to purchase but is blocked

from

B. user never had meaningful purchase intent

---

Q3. What uncertainties remain after users identify a product they like?

For each major uncertainty show:

LIKES PRODUCT
→ UNRESOLVED QUESTION
→ USER ACTION / WORKAROUND
→ STAYS IN APP OR LEAVES
→ DECISION DELAY / OUTCOME

Also report:

* count
* affected segment
* purchase intent
* confidence

---

Q4. What causes users to postpone purchase?

Group postponement reasons.

For each report:

* reason
* purchase intent
* trigger needed to resume purchase
* workaround
* known outcome
* count
* confidence

Highlight HIGH-INTENT postponed users separately.

---

Q5. How do users compare shortlisted products?

Identify recurring comparison patterns.

Report:

* what is compared
* comparison dimensions
* missing information
* effort/friction
* in-app vs external comparison
* workaround
* outcome

Look for repeated chains:

MULTIPLE OPTIONS
→ NEED TO DIFFERENTIATE
→ INFORMATION GAP
→ WORKAROUND
→ DECISION OR DELAY

---

Q6. What information do users seek outside Myntra before purchasing?

For each recurring external behavior report:

* source used
* information sought
* uncertainty being resolved
* why marketplace information was insufficient
* journey stage
* whether return to marketplace is known
* outcome if known
* evidence count
* confidence

Do not infer external search without evidence.

---

Q7. What role do fit, size, styling, price, reviews, occasion, and social validation play?

Analyze each separately.

Classify its primary role as one or more of:

* TRIGGER
* DECISION_CRITERION
* UNCERTAINTY
* BARRIER
* COMPARISON_VARIABLE
* POSTPONEMENT_REASON
* EXTERNAL_SEARCH_TRIGGER
* ABANDONMENT_REASON
* WEAK_SIGNAL

For each report:

* count / denominator / %
* direct vs adjacent evidence
* affected purchase intent
* severity
* workaround
* metric relevance
* confidence

Do not assume these seven are the biggest problems.

Surface stronger factors found in the data.

Price may be analyzed as a problem even though monetary incentives cannot be used later.

---

Q8. When is wishlist usage genuine purchase intent vs bookmarking?

Create these groups:

HIGH INTENT
MEDIUM INTENT
LOW INTENT
BOOKMARK / INSPIRATION
UNKNOWN

For each report:

* why item is saved
* observed behavior
* main barriers
* decision trigger
* workaround
* outcome if known
* count / relevant denominator / %
* implication for 30-day conversion
* confidence

State whether the evidence supports treating wishlist users as one homogeneous funnel stage or multiple behavioral groups.

---

Q9. How do behaviors differ across user segments?

Derive behavioral segments from evidence.

For each report:

SEGMENT
→ defining behavior
→ wishlist job
→ purchase intent
→ primary barrier
→ primary uncertainty
→ workaround
→ external behavior
→ likely reason for non-conversion
→ metric relevance
→ evidence count
→ confidence

Do not create fictional personas.

---

Q10. What unmet needs emerge?

An unmet need is a USER OUTCOME, not a feature.

For each report:

* user situation
* desired progress
* obstacle
* workaround
* purchase intent
* count / denominator / %
* affected segments
* connection to wishlist conversion
* known
* inferred
* confidence

==================================================
STEP 3 — RECURRING BEHAVIORAL CHAINS
====================================

Find repeated decision sequences.

Example structure only:

DISCOVER
→ LIKE
→ SAVE
→ UNCERTAINTY
→ WORKAROUND
→ DELAY / PURCHASE / ABANDON / SWITCH

Derive the actual chains from the data.

For each chain report:

* chain
* supporting records
* direct records
* adjacent records
* affected segments
* purchase intent
* main friction
* workaround
* outcome
* 30-day metric relevance
* confidence

Give recurring behavioral chains more weight than isolated complaints.

==================================================
STEP 4 — SEGMENT × PROBLEM MATRIX
=================================

Rows:
behavioral segments

Columns:
major barriers / unmet needs

For each relevant intersection rate:

EVIDENCE_VOLUME
PURCHASE_INTENT
BARRIER_SEVERITY
WORKAROUND_FRICTION
30_DAY_METRIC_PROXIMITY
EVIDENCE_CONFIDENCE

Use only:

HIGH
MEDIUM
LOW
INSUFFICIENT

==================================================
STEP 5 — PRIORITIZE OPPORTUNITIES
=================================

An opportunity is a user outcome, NOT a feature.

Use this format:

"Help [segment] achieve [desired outcome] after saving/considering a product because [problem] currently causes [observable friction/delay]."

Evaluate every opportunity on:

1. PURCHASE INTENT
   How likely are affected users to genuinely purchase?

2. BARRIER SEVERITY
   How strongly does the issue block or delay purchase?

3. EVIDENCE FREQUENCY
   count / denominator / %

4. WORKAROUND FRICTION
   How much effort is required today?

5. 30-DAY METRIC PROXIMITY
   How directly does the problem affect the purchase decision within the target window?

6. ADDRESSABILITY
   Can Myntra plausibly influence this problem?

7. EVIDENCE CONFIDENCE
   How direct, repeated, and cross-source is the evidence?

Priority logic:

PURCHASE INTENT
× BARRIER SEVERITY
× EVIDENCE FREQUENCY
× WORKAROUND FRICTION
× 30-DAY METRIC PROXIMITY
× EVIDENCE CONFIDENCE

Then use ADDRESSABILITY as a practical filter.

Do not calculate a fake mathematical score.

Assign:

P1 = HIGH POTENTIAL
P2 = MEDIUM POTENTIAL
P3 = LOWER / UNCERTAIN POTENTIAL

Do not use sentiment.

==================================================
STEP 6 — TOP 3–5 OPPORTUNITY HYPOTHESES
=======================================

For each return:

OPPORTUNITY:

TARGET SEGMENT:

USER JOB:

PURCHASE INTENT:

OBSERVED BEHAVIOR:

ROOT FRICTION / UNCERTAINTY:

CURRENT WORKAROUND:

EVIDENCE:

* direct wishlist records
* adjacent records
* supporting records
* denominator
* sources

BARRIER SEVERITY:

WORKAROUND FRICTION:

30-DAY METRIC PROXIMITY:

WHY IT COULD AFFECT WISHLIST → PURCHASE:

KNOWN:

INFERRED:

UNKNOWN:

EVIDENCE CONFIDENCE:

PRIORITY:
P1 / P2 / P3

PRIMARY RESEARCH QUESTION:
What must interviews validate before this can be considered a validated root problem?

==================================================
STEP 7 — CHALLENGE THE LEADING HYPOTHESES
=========================================

For each major opportunity, actively search for contradictory evidence.

Report:

* contradiction
* hypothesis challenged
* whether it suggests another segment
* impact on confidence

Do not hide contradictions.

==================================================
STEP 8 — RESEARCH STATUS
========================

Create three sections:

WHAT THE DATA SUPPORTS

WHAT THE DATA SUGGESTS

WHAT THE DATA CANNOT ANSWER

Do not mix them.

==================================================
STEP 9 — PRIMARY RESEARCH GAPS
==============================

Identify what secondary research cannot establish reliably, including:

* why the item was originally saved
* intent at save time
* how intent changed
* exact blocker
* alternatives considered
* missing information
* external research
* workaround
* what would resolve uncertainty
* whether resolving it would increase purchase likelihood
* eventual outcome
* whether purchase occurred within 30 days

Convert the most important gaps into questions for 5–6 user interviews.

==================================================
STEP 10 — WHAT SHOULD WE VALIDATE NEXT?
=======================================

Recommend 1–3 behavioral segments/problems for primary research.

For each provide:

* segment
* hypothesized problem
* why it may affect the target metric
* supporting evidence
* missing evidence
* what must be validated in interviews

Do not choose a solution.

==================================================
FINAL OUTPUT
============

Return sections in this order:

1. Executive summary
2. Dataset quality and limitations
3. Answers to Q1–Q10
4. Recurring behavioral chains
5. Behavioral segments
6. Segment × problem matrix
7. Ranked opportunity hypotheses
8. Contradictory evidence
9. Known vs inferred vs unknown
10. Primary research gaps
11. Recommended segments/problems to validate

FINAL CHECK BEFORE ANSWERING

Confirm internally that:

* no feature has been proposed
* direct and adjacent evidence are separated
* wishlist is not assumed to equal purchase intent
* all percentages include denominators
* sentiment was not used for prioritization
* behavioral segments are evidence-based
* contradictory evidence is included
* hypotheses are not presented as validated problems

Required reasoning path:

BUSINESS METRIC
→ EVIDENCE
→ BEHAVIOR
→ SEGMENT
→ ROOT-PROBLEM HYPOTHESIS
→ OPPORTUNITY
→ PRIMARY RESEARCH

Do not proceed to solution design.`;
}
