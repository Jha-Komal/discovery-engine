export function buildReviewAnalysisPrompt(
  reviews: Array<{
    id: string;
    review: string;
    title: string;
    source: string;
    rating: number | null;
    date: string | null;
  }>
): string {
  const records = reviews.map((r) => ({
    record_id: r.id,
    source: r.source,
    date: r.date,
    rating: r.rating,
    title: r.title,
    review_text: r.review,
  }));

  return `You are a Senior Product Researcher and Growth Product Manager specializing in fashion e-commerce.

You are analyzing publicly available user conversations for a product discovery project for Myntra.

BUSINESS CONTEXT

Myntra wants to increase:

"The percentage of users who purchase at least one item from their wishlist within 30 days of adding it."

IMPORTANT CONSTRAINT

We do NOT yet know the underlying user problem.

Do not start from a predetermined hypothesis such as price, fit, size, reviews, discounts, or wishlist UX.

Your job is to extract evidence from user feedback that can later help discover the actual problems.

The eventual product solution CANNOT rely on monetary incentives.

INPUT

You will receive user-generated content from sources such as:

* Google Play Store
* Apple App Store
* Reddit
* Social media
* Fashion/shopping communities
* YouTube comments
* Product reviews
* Q&A
* Other public fashion-shopping conversations

Each record may contain some or all of:

* record_id
* source
* date
* rating
* title
* review/comment text
* thread/context
* likes/upvotes
* product/platform

TASK

Analyze EACH individual record independently.

Do NOT merely summarize the feedback.

Extract structured behavioral and decision-making signals that could help explain wishlist-to-purchase behavior.

CRITICAL RESEARCH RULES

1. Never invent facts, motivations, demographics or behaviors not supported by the text.

2. Distinguish between:

   * EXPLICIT: directly stated by the user
   * STRONG_INFERENCE: not directly stated but strongly supported by the context
   * WEAK_INFERENCE: plausible but uncertain

3. Never treat WEAK_INFERENCE as a research finding.

4. If something cannot be determined, return null / unknown.

5. Do not force wishlist relevance.

A review can be:

* DIRECT_WISHLIST: explicitly discusses wishlist/saved/favourites/shortlisted items
* ADJACENT_DECISION: discusses behavior that could plausibly affect purchase of a shortlisted fashion item
* GENERAL_ECOMMERCE: relevant to Myntra but not specifically useful for wishlist conversion
* IRRELEVANT

6. Keep the user's actual problem separate from a possible solution.

For example:
"Reviews don't show whether this shirt fits my body type" = problem/evidence.

"Add AI styling assistant" = solution and must NOT be generated at this stage.

7. One comment may contain multiple independent barriers, motivations or uncertainties. Extract them separately.

8. Do not use sentiment as a substitute for behavioral insight.

9. Do not infer age, gender, income, location, fashion sophistication, etc. unless directly supported by the text.

10. Preserve contradictory evidence. Do not try to make all users fit one narrative.

FOR EACH RECORD EXTRACT THE FOLLOWING

A. SOURCE INFORMATION

record_id
source
date
rating_if_available

B. RESEARCH RELEVANCE

relevance_class:
DIRECT_WISHLIST | ADJACENT_DECISION | GENERAL_ECOMMERCE | IRRELEVANT

relevance_reason:
One concise explanation.

evidence_strength:
EXPLICIT | STRONG_INFERENCE | WEAK_INFERENCE

C. USER JOURNEY STAGE

Identify all applicable stages:

* discovery/browsing
* product evaluation
* wishlist/save
* shortlist/comparison
* purchase consideration
* checkout
* delivery
* returns/exchange
* post-purchase
* unknown

D. USER JOB / WHY THE USER SAVES OR SHORTLISTS

Only populate when evidence exists.

Possible categories include, but are not limited to:

* genuine intention to buy later
* bookmarking for future reference
* comparing alternatives
* waiting for an occasion
* waiting to make a decision
* saving inspiration
* creating a collection
* remembering a product
* checking availability later
* resolving uncertainty later
* coordinating with other products/outfits
* sharing/seeking validation
* other
* unknown

Return:

wishlist_job_category
wishlist_job_description
supporting_evidence

Do not assume a wishlist job unless supported.

E. PURCHASE INTENT

purchase_intent:
HIGH | MEDIUM | LOW | UNKNOWN

intent_reason

intent_evidence_strength:
EXPLICIT | STRONG_INFERENCE | UNKNOWN

Signals may include statements such as:

* definitely planning to buy
* considering
* deciding between items
* saving casually
* inspiration only
* abandoned intent

Do not equate "added to wishlist" automatically with high purchase intent.

F. BARRIERS / FRICTIONS

Extract every barrier independently.

For each barrier return:

barrier_category
barrier_description
evidence
severity:
HIGH | MEDIUM | LOW | UNKNOWN
evidence_strength

Potential categories may include, but are not limited to:

* fit uncertainty
* size uncertainty
* sizing inconsistency
* appearance/look uncertainty
* quality uncertainty
* material/fabric uncertainty
* authenticity/trust
* insufficient product information
* insufficient/poor images
* review quality
* review credibility
* insufficient customer photos
* styling uncertainty
* occasion suitability
* social validation
* alternative comparison difficulty
* decision overload
* too many choices
* price/value uncertainty
* waiting for price change
* inventory/size availability
* delivery timing
* returns/exchange friction
* payment/checkout
* app experience
* search/discovery
* change of preference
* loss of interest
* procrastination
* timing/not urgent
* other

IMPORTANT:
Do not restrict yourself to this taxonomy. Create a new category if the evidence does not fit.

G. UNRESOLVED QUESTIONS / UNCERTAINTIES

What does the user still need to know before feeling comfortable making a decision?

For each:

uncertainty_category
uncertainty_description
evidence
evidence_strength

Examples could include fit, size, quality, styling, value, suitability, authenticity, comparison, delivery, etc.

Only use evidence present in the feedback.

H. PURCHASE POSTPONEMENT

Does the feedback indicate why the decision is being delayed?

postponement_present:
YES | NO | UNKNOWN

postponement_reason
postponement_trigger_or_condition

For example, a user may intend to purchase:

* after deciding between alternatives
* when needed for an occasion
* after checking reviews
* after confirming fit
* after discussing with someone
* later with no clear trigger

Do not assume price is the postponement reason unless stated.

I. DECISION CRITERIA

What criteria is the user using to decide whether to buy?

Extract all applicable criteria such as:

* fit
* size
* style/look
* quality
* material
* price/value
* reviews
* customer photos
* brand
* occasion
* versatility
* compatibility with existing wardrobe
* social validation
* delivery
* returns
* alternatives
* other

For each criterion provide evidence.

J. COMPARISON BEHAVIOR

comparison_present:
YES | NO | UNKNOWN

If YES:

what_is_being_compared
comparison_dimensions
comparison_difficulty
comparison_outcome_if_known

K. EXTERNAL INFORMATION-SEEKING

Does the user leave the shopping platform or use another source before making the decision?

external_search_present:
YES | NO | UNKNOWN

If supported, extract:

external_source:
Google | Reddit | Instagram | YouTube | influencer | friends/family | brand website | physical store | another marketplace | social media | other

information_sought
reason_platform_information_was_insufficient
evidence

L. SOCIAL VALIDATION

social_validation_present:
YES | NO | UNKNOWN

validation_source
what_validation_is_needed
evidence

M. WORKAROUNDS

What does the user currently do to resolve the problem?

Examples:

* Google search
* Reddit search
* watching YouTube reviews
* asking friends
* checking another marketplace
* visiting physical stores
* ordering multiple sizes
* buying and returning
* screenshotting products
* manually comparing tabs
* reading many reviews

Return only behaviors supported by evidence.

N. USER SEGMENT SIGNALS

Capture ONLY observable/explicit behavioral segment signals.

Examples:

* frequent shopper
* occasional shopper
* high wishlist user
* comparison-heavy shopper
* occasion-driven shopper
* trend/inspiration shopper
* brand-conscious shopper
* high uncertainty shopper
* repeat purchaser
* new user

For every segment signal include the evidence.

Do NOT infer demographic segments.

O. EMOTION / SENTIMENT

overall_sentiment:
POSITIVE | NEGATIVE | MIXED | NEUTRAL

emotions_detected:
e.g. frustration, confusion, anxiety, excitement, disappointment, trust, distrust, satisfaction

Sentiment is secondary. Behavioral signals are more important.

P. OUTCOME

If known:

decision_outcome:
PURCHASED | POSTPONED | ABANDONED | SWITCHED_PRODUCT | SWITCHED_PLATFORM | STILL_CONSIDERING | UNKNOWN

outcome_evidence

Q. BUSINESS-METRIC CONNECTION

Assess whether this evidence could plausibly affect:

"purchase of a wishlisted item within 30 days."

metric_relevance:
HIGH | MEDIUM | LOW | NONE

Explain WHY.

Do not claim causation.

R. EVIDENCE QUOTE

Include the shortest relevant excerpt necessary to preserve the user's original meaning.

S. RESEARCHER NOTE

Write ONE concise sentence describing the most important behavioral insight from this record.

This sentence must be evidence-based and not propose a solution.

RECORDS TO ANALYZE:
${JSON.stringify(records, null, 2)}

OUTPUT FORMAT

Return valid JSON only — a JSON ARRAY with exactly one object per input record above, in the same order, using each record's own record_id.

Use this structure per object:

{
"record_id": "",
"source": "",
"date": null,
"rating": null,

"relevance": {
"class": "",
"reason": "",
"evidence_strength": ""
},

"journey_stages": [],

"wishlist_behavior": {
"job_category": null,
"job_description": null,
"supporting_evidence": null
},

"purchase_intent": {
"level": "UNKNOWN",
"reason": null,
"evidence_strength": "UNKNOWN"
},

"barriers": [
{
"category": "",
"description": "",
"severity": "",
"evidence_strength": "",
"evidence": ""
}
],

"uncertainties": [
{
"category": "",
"description": "",
"evidence_strength": "",
"evidence": ""
}
],

"postponement": {
"present": "UNKNOWN",
"reason": null,
"trigger_or_condition": null
},

"decision_criteria": [
{
"criterion": "",
"evidence": ""
}
],

"comparison_behavior": {
"present": "UNKNOWN",
"items_compared": null,
"comparison_dimensions": [],
"difficulty": null,
"outcome": null
},

"external_information_seeking": {
"present": "UNKNOWN",
"sources": [],
"information_sought": [],
"platform_information_gap": null,
"evidence": null
},

"social_validation": {
"present": "UNKNOWN",
"source": null,
"validation_needed": null,
"evidence": null
},

"workarounds": [],

"segment_signals": [
{
"segment": "",
"evidence": ""
}
],

"sentiment": {
"overall": "",
"emotions": []
},

"decision_outcome": {
"status": "UNKNOWN",
"evidence": null
},

"metric_connection": {
"relevance": "",
"reason": ""
},

"evidence_quote": "",

"researcher_note": ""
}

Return one JSON object per record, all wrapped in a single top-level JSON array — not one object, not newline-separated objects.

Do not provide an overall summary yet.

Do not calculate opportunity areas yet.

Do not recommend features.

The purpose of this stage is evidence extraction, not conclusion generation.`;
}
