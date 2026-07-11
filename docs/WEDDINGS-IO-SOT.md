# Weddings.io — SOT
## Source of Truth · Paste This First in Every Session

**File:** WEDDINGS-IO-SOT.md
**Network:** IAM Network · 16 domains
**Organisation:** Weddings.io Technologies · Est. May 13, 2015
**Domain:** weddings.io
**Tagline:** The best wedding platform in the world. Built together. One territory at a time.

---

## SOT Convention — How This Works

Every domain in the IAM network has its own SOT file.
Naming convention: `{DOMAIN}-SOT.md` e.g. EYESPYR-SOT.md, TALC-TV-SOT.md

There is also a master IAM-NETWORK-SOT.md covering:
- What is shared across all domains (EyeSpyR, databank, Talc, PPP policy, Stripe)
- The IAM network structure and domain list
- The red flag databank (network-wide)
- Shared brand principles

Paste the relevant SOT at the top of every new session.
Paste the IAM-NETWORK-SOT.md when working across multiple domains.
These documents ARE the memory. Never rely on conversation history alone.

---

## How to Use This SOT

This is the WEDDINGS-IO-SOT — the single source of truth for
all Weddings.io platform decisions. Updated after every session.

**Workflow:**
1. Paste this SOT at the top of every new session
2. Decision made → added to this SOT immediately
3. This SOT feeds the IAM Bot system context
4. All pages and flows updated to match this SOT
5. Session log updated at the bottom with date and decisions

**Related SOTs:**
- IAM-NETWORK-SOT.md — shared network policies
- EYESPYR-SOT.md — EyeSpyR platform (eyespyr.com)
- TALC-TV-SOT.md — Talc distribution platform (talc.tv)
- LSFENCING-SOT.md — LSF Fencing (lsfencingandmetalwork.com)

Never rely on conversation history.
This document IS the memory.

---

## Brand & Design Standards

**Accent colour:** #c9a96e (gold) — the only accent. No exceptions.
**Backgrounds:** #0d0d0b, #141410, #1a1a15, #222219 — dark flat surfaces only
**No gradients. No shadows. No neon. No glow effects.**
**Headings:** Cormorant Garamond · serif · 600 weight
**Body:** Inter · sans · 300/400/500 weight
**Never introduce any other font family**
**Founding date:** Est. May 13, 2015 — always present in footer
**Currency:** Always USD. Never show prices in any other currency.
**Voice:** Never say "sign up" — always "apply". Never "directory listing fee" — always "territory". Never imply territories fill automatically or quickly. We are slow and deliberate by design.

---

## The Three Layers — Platform Structure

### Layer 1 — Open Directory (Free)
- Any wedding business can apply
- Must pass EyeSpyR business credential verification
- EyeSpyR rating displayed on every listing
- Access to job bidding system
- Multiple vendors per category — no exclusivity
- No Talc credits
- This is the talent aggregator. It fills itself over time.
- We watch it. We learn from it. We cherry pick the best.

### Layer 2 — Exclusive Territory ($10 per 100K population per month)
- One slot per culture × category × city
- Selected by Weddings.io — NEVER first come, first served
- Slow rollout — reputable businesses only, hand-picked
- Territory = Culture × Category × City
  (Hindu planner Surrey ≠ Sikh planner Surrey — separate slots)
- Gets: exclusive SEO territory page, IAM Bot lead routing,
  all city SEO leads, Talc credits (see below), EyeSpyR badge,
  16-domain network pushback

### Layer 3 — Partnership (relationship tier)
- For megacity districts, rising stars, future spokespeople
- Deal structured around the relationship
- Elevated Talc credits replace discounted pricing
- Ground floor stake in a global platform
- For businesses with genuine cultural authority and social presence
- We always deal well with excellent people doing great things

---

## Pricing Formula — Final. Do Not Change.

```
$10 USD per 100,000 population
Rounded down to nearest $10
Minimum $10
All prices USD
```

```javascript
function territoryPrice(population) {
  const raw = Math.floor(population / 100000) * 10;
  return Math.max(10, raw);
}
```

### City Examples
| City | Population | USD/mo |
|------|-----------|--------|
| Small towns | under 100K | $10 |
| Langley BC | 180K | $10 |
| Burnaby BC | 245K | $20 |
| Surrey BC | 570K | $50 |
| Vancouver BC | 675K | $60 |
| Calgary AB | 1.4M | $140 |
| Toronto ON | 2.9M | $290 |
| Dubai UAE | 3.5M | $350 |
| London UK | 9M | $900 |
| Mumbai India | 20M | District pricing — talk to us |

**Megacities (over 2M):** Priced by district/borough, not full city.
Route to /partners. Never show a flat price for megacities.

---

## Talc Credits — How Distribution Works

**The formula: 1 Talc credit per $10 spent per month.**
Your territory price IS your monthly posting budget. Same number.

```
$10 territory  = 1 credit  = 1 post/month
$50 territory  = 5 credits = 5 posts/month
$290 territory = 29 credits = 29 posts/month
```

**1 credit = 1 post pushed to all 6 platforms simultaneously:**
Google Business · Instagram · Facebook · LinkedIn · TikTok · SEO Blog

**Credits reset monthly. No rollover. Use them or lose them.**
This is intentional — it forces active content, which means fresh
territory pages, which means better rankings, which means more leads.
Unused credits cost the territory holder nothing extra, but they
represent compounding authority that wasn't built.

**Partnership credit tiers (negotiated, not standard):**
| Tier | Credits/mo | Posts/mo |
|------|-----------|---------|
| Major partner | 120 | 20 posts |
| Power partner | 300 | 50 posts |

---

## Territory Health — Four Requirements

A territory holder must maintain ALL FOUR at all times:

### 1. Payment
Monthly, auto-renews. Lapse in payment = territory flagged immediately.

### 2. Content Minimum — 1 post per month
Minimum 1 Talc post per month through the platform.
This is the floor, not the ceiling. It's also the point.

**Content inactivity escalation ladder:**
| Milestone | Action |
|-----------|--------|
| Miss 1 month | Friendly automated nudge |
| Miss 2 months | Yellow flag — personal note from the team |
| Miss 3 months | Formal escalation — 60-day clock starts |
| Month 4–5 | Grace period — territory still held, clock running |
| Month 6 | Territory returns to Weddings.io pool |

### 4. Backlink — active dofollow link from vendor website to territory page

Contract-essential. This is the mechanism that makes the two-direction
authority engine work. Vendor domain authority flows into the territory
page. Territory page + 16-domain IAM network flows back to vendor.
Without the link the loop is broken.

**Three options — any one satisfies the requirement:**
- EyeSpyR badge embed (easiest — one script tag, live score, dofollow)
- Footer text link "Verified Territory · Weddings.io" (sitewide, max crawl)
- Dedicated page or section (strongest — full page link equity)

**Verification:** Monthly automated crawl of vendor domain.
Absence detected = escalation notice sent same day.
Link restored = escalation paused, territory remains active.

**Badge spec:**
- Dofollow link only — nofollow defeats the purpose
- Live score — pulls current EyeSpyR rating dynamically
- Links to territory page specifically, not weddings.io homepage
- Works in WordPress, Squarespace, Wix, Webflow, custom sites
- Single script tag embed from territory dashboard

### 3. EyeSpyR Reputation — 4.5 stars minimum
Must maintain 4.5+ EyeSpyR rating over a rolling 30-day window.
Not a snapshot. A sustained standard.

**Reputation escalation:**
| Situation | Action |
|-----------|--------|
| Drop below 4.5 (rolling 30 days) | Internal flag + outreach |
| Still below 4.5 after 30 days | Territory returns to pool |
| Verified 1-star with documented evidence | Instant escalation — no ladder |

---

## Zero Tolerance — Instant Removal

These bypass all escalation ladders. No warnings. No grace periods.

**Fraud:**
Verified through transaction records, receipts, B2C or B2B documentation.
Instant removal. Territory returned to pool immediately.

**Verified 1-star incident with evidence:**
A single verified complaint with documented evidence triggers immediate
review. If substantiated, removal follows. We act on receipts, not
rumour — this also protects good vendors from bad-faith competitor reviews.

**Conduct bringing the platform into disrepute:**
Any behaviour, verified, that reflects badly on Weddings.io, its couples,
or its vendor community. Weddings.io makes this determination.

**EyeSpyR Blacklist:**
Vendors removed for fraud are blacklisted from EyeSpyR permanently.
Cannot reapply under any business name. The verification system
exists to prevent exactly this.

---

## When a Territory Is Returned to the Pool

Weddings.io hand-picks the next holder from the open directory.
We do not open it to first-come-first-served applications.
The directory is the pipeline. The best candidates are already visible.

The aspiration is that territories are sticky by value, not by contract.
If the territory page is ranking, routing leads, and compounding authority,
nobody in their right mind lets it go. The $10–$290/month becomes the
best marketing spend they've ever made.

---

## Infrastructure Cost Reality

| Item | Monthly cost |
|------|-------------|
| Netlify Pro (hosting) | $20 |
| Domain renewals (amortised, ~18 domains) | ~$65 |
| Talc posting API (Ayrshare or equiv.) | $50–100 |
| **Total floor** | **~$135–185/mo** |

Hosting costs scale slowly — static HTML pages are tiny.
The real scaling cost is the Talc push mechanism as territory
holders grow and credits get used. Revenue scales faster than costs.

**Break-even:** 3–4 territory holders in mid-size cities covers
the entire infrastructure cost. Every territory after that is margin.

---

## Routing Reference

| Link text | Route |
|-----------|-------|
| Apply for a territory | /join?type=territory |
| Join the open directory | /join?type=directory |
| Talk about a territory | /partners |
| Megacity "Talk to us" | /partners |
| Dashboard | /dashboard |
| EyeSpyR status | /eyespyr/status |
| Pricing | /pricing |
| Territory commitment | /territory-commitment |
| EyeSpyR | /eyespyr |
| How Talc works | /how-it-works |

---

## Things That Must Never Change

- Never show prices in any currency except USD
- Never call this a "directory listing fee" — it is a territory
- Never imply territories are first come first served
- Never suggest the directory costs money to join
- Never add a "Free tier" to the exclusive territory
- Never use any colour except #c9a96e as accent
- Never use gradients, shadows, or glow effects
- Never call this just a directory — it is a territory platform
  with an open directory aggregator underneath it
- Never remove "Est. May 13, 2015" from brand references
- Never touch the IAM Bot chat widget configuration
- Never describe aiweddings.io as affiliated in any way
- Never say "sign up" — always "apply"
- Never suggest territories fill automatically or quickly
- Never show a flat price for megacities — route to /partners
- Never let the Talc credit model be described as separate from
  the territory price — they are the same number

---

## EyeSpyR — How It Works

EyeSpyR is the platform's business verification and reputation system.
It does two distinct jobs: entry gating and ongoing live reputation.
It is not a static award. It is not paid for. It moves with behaviour.

---

### Job 1 — Entry Gate (Onboarding Score)

Every business that applies to Weddings.io goes through EyeSpyR
verification before being admitted to the directory.

**What EyeSpyR checks at onboarding:**
- Public complaints and consumer reports
- Court records and legal actions
- Bad press and documented incidents
- Obvious red flags across public data sources

**What EyeSpyR does NOT require at onboarding:**
- Verified business licensing
- Insurance documentation
- Physical address confirmation

These are not required to join the open directory. They ARE reflected
in the EyeSpyR floater score — a business without verified credentials
will have a lower floater than one with full documentation. Couples
can see the difference. The market decides the value.

**Starting score logic:**
- Clean record found = starts at 4.5
- Something bad found = starts below 4.5
- Serious verified issue found = application rejected

A business that starts below 4.5 cannot guest post and cannot hold
a territory until their score recovers through verified positive
behaviour on the platform.

---

### Job 2 — The EyeSpyR Floater (Live Ongoing Reputation)

The EyeSpyR floater badge appears on:
- Every directory listing
- Every territory page
- Every guest post
- Every IAM Bot vendor card

It is always live. Always current. It moves in real time as reviews,
verified transactions, and platform behaviour accumulate.

This is fundamentally different from BBB:
- BBB is static and paid for
- EyeSpyR is live, behaviour-driven, and free to earn
- Couples see actual current reputation, not a purchased badge
- Vendors cannot buy their way to a good score

---

### The 4.5 Threshold — Platform-Wide Rule

**4.5 stars is the access line for everything above a basic listing.**

| EyeSpyR Score | Directory listing | Guest posting | Territory eligible |
|---------------|------------------|---------------|-------------------|
| Below 4.5 | Yes | No | No |
| 4.5+ (clean) | Yes | Yes | Yes (if selected) |
| Verified fraud | Blacklisted | Blacklisted | Blacklisted |

This applies everywhere consistently:
- Guest posting requires 4.5+. No exceptions.
- Territory holding requires sustained 4.5+ over rolling 30 days.
- Drop below 4.5 as a territory holder = 30-day recovery window.
- Drop below 4.5 as a guest poster = posting privileges suspended
  immediately until score recovers.

---

### EyeSpyR Score Drivers (What Moves the Number)

**Moves score up:**
- Verified positive client reviews (B2C)
- Verified positive vendor/supplier reviews (B2B)
- Uploading verified business credentials (licence, insurance)
- Consistent Talc posting activity (engagement signal)
- Longevity on platform without incidents

**Moves score down:**
- Negative client reviews
- Verified complaints with documentation
- Inactivity (slow decay signal, not a cliff)
- Unresolved disputes

**Instant score action (bypasses gradual movement):**
- Single verified 1-star with documented evidence = instant flag
- Verified fraud = instant blacklist, score irrelevant
- Conduct bringing platform into disrepute = instant removal

---

### EyeSpyR Blacklist

Vendors removed for fraud are permanently blacklisted.
- Cannot reapply under the same business name
- Cannot reapply under a different business name
- EyeSpyR flag is permanent across the IAM network
- All 16 domains in the network share blacklist data

---

## IAM Bot Context (Distilled Policy for Bot System Prompt)

Paste this block into the IAM Bot system prompt:

```
You are the Weddings.io IAM Bot. Here are the platform rules you
must know to answer vendor questions accurately:

PRICING: $10 USD per 100,000 city population per month. Minimum $10.
Always USD. Megacities (2M+) are district-priced — route to /partners.

TALC CREDITS: 1 credit per $10 spent. 1 credit = 1 post to 6 platforms
(Google Business, Instagram, Facebook, LinkedIn, TikTok, SEO Blog).
Credits reset monthly. No rollover.

DIRECTORY: Free. Must pass EyeSpyR verification. No exclusivity.
No Talc credits. Multiple vendors per category.

TERRITORY: Exclusive. One per culture × category × city. Selected by
Weddings.io — never first come first served. Requires: (1) monthly
payment, (2) minimum 1 Talc post per month, (3) 4.5+ EyeSpyR rating
over rolling 30 days.

CONTENT INACTIVITY: Miss 1 month = nudge. Miss 3 months = 60-day clock.
Miss 6 months = territory returned to pool.

EYESPYR ENTRY: Every business starts at 4.5 if nothing bad is found
during onboarding check (public complaints, court records, bad press).
No verified licensing required to join, but unverified credentials
lower the floater score — visible to couples in real time.

EYESPYR FLOATER: Live badge on every listing, territory page, and
guest post. Always current. Not static. Not paid for. Moves with
behaviour. Couples see actual reputation, not a purchased badge.

ACCESS MATRIX:
- Below 4.5 = directory listing only. No guest posting. No territory.
- 4.5+ = directory + guest posting + territory eligible (if selected)
- Verified fraud = blacklisted across all 16 IAM network domains

GUEST POSTING: Requires 4.5+ EyeSpyR score. Drop below 4.5 =
posting privileges suspended immediately until score recovers.

REPUTATION: Drop below 4.5 stars = 30 days to recover or lose territory.
Verified 1-star with evidence = instant escalation.

FRAUD / ZERO TOLERANCE: Fraud, verified misconduct, or conduct bringing
the platform into disrepute = instant removal. No ladder. No appeal.
Blacklisted from EyeSpyR permanently.

RETURNED TERRITORIES: Go back to Weddings.io pool. We hand-pick the
next holder from the directory. Not first come first served.

Always say "apply" not "sign up". Always say "territory" not "listing".
Never quote prices in anything other than USD.
```

---

## The $10 Brand Spine — Core Principle

$10 is the entire pricing language of the platform.
Nothing is free. Everything has a $10 entry point.
The number scales by time commitment, not arbitrary tiers.

```
$10 / year   →  open directory listing (verified, EyeSpyR gated)
$10 / month  →  territory minimum (exclusive, SEO, Talc bundled)
$10 / post   →  public Talc (anyone, anywhere, 6 platforms flat)
```

This is the "$10 SEO" brand — memorable, accessible, and true.
Like Fiverr's $5 origin, the $10 is the hook, the promise,
the positioning. PPP and territory scaling don't change the brand.
The entry point is always $10 something.

**The $10 is now a complete pricing language.**
Every entry point costs $10. The number scales by commitment.
This is deliberate and must never be changed.

---

## Directory Fee — $10 Per Year

The open directory is NOT free. It costs $10 USD per year.

**Why $10/year and not free:**
- Filters noise and bots from day one
- Every vendor signals commitment with a card
- Revenue from the directory, not just territories
- Couples know every vendor paid through a verification gate
- No free listings means no low-quality padding

**When the $10 is charged:**
ONLY after successful EyeSpyR onboarding verification.
If EyeSpyR check fails — no payment is taken. Ever.
The $10 is the reward for passing, not the price of trying.

**Renewal:**
Annual. Auto-renews via Stripe unless cancelled.
Lapse in payment = listing suspended immediately.
Reinstate by paying the annual fee — no reapplication needed
unless EyeSpyR score has dropped below 4.5.

**Revenue at scale:**
| Directory vendors | Annual revenue |
|------------------|---------------|
| 500 | $5,000 |
| 5,000 | $50,000 |
| 50,000 | $500,000 |

Directory fee revenue covers infrastructure before
a single territory is sold. The directory is a revenue
stream, not just a talent pool.

---

## EyeSpyR Onboarding Gate — Full Flow

```
Vendor applies
      ↓
EyeSpyR check runs automatically
(public complaints, court records, bad press,
business registration cross-reference,
IAM network red flag database check)
      ↓
PASS (4.5+ clean record)    FAIL (below 4.5 or red flag)
      ↓                           ↓
$10/year charged            NO payment taken
Listed in directory         "Not the right fit"
EyeSpyR floater activated   Flagged in databank
Full platform access        Shared across IAM network
at 4.5+ threshold           12-month reapplication window
```

**The pass threshold:**
Clean public record = starts at 4.5 → payment taken → listed
Something bad found = starts below 4.5 → no payment → flagged
Serious verified issue = application rejected → flagged → blacklisted

**The rejection is always warm. Never punitive.**

Rejection language (exact wording — do not change):
> "Based on our initial review, we don't think Weddings.io
> is the right fit at this time. No payment has been taken.
> You're welcome to reapply in 12 months."

No "you failed." No "you're rejected." No door slammed.
Internally the flag is set. Externally the tone is kind.

---

## The Red Flag Databank

Every failed EyeSpyR application is recorded in the databank.
This is not a blacklist — it is a watched list.
The blacklist is reserved for verified fraud.
The databank is for everyone who didn't pass the gate.

**What goes into the databank:**
- Business name
- Business registration number
- Owner/director names
- Phone number
- Email address
- Website domain
- Application date
- Reason for flag (internal only — never shared with applicant)
- Severity score (1–5, internal only)

**What the databank does:**

| Scenario | What happens |
|----------|-------------|
| Reapply under same name | Direct match — instant flag |
| Reapply under different name | Business registration cross-reference |
| Apply to other IAM platforms | Network-wide flag sharing |
| Same address, phone, or registration as flagged entity | Pattern detection flag |
| 12 months passed, clean reapplication | Flag reviewed, may be cleared |

**The databank is shared across all 16 IAM network domains.**
A failed Weddings.io application is visible to
roofers.io, cleaners.io, eyespyr.com, and every other
IAM platform. The verification system is network-wide.

**Databank vs Blacklist — important distinction:**
- Databank = didn't pass the gate. Watched. Can reapply.
- Blacklist = verified fraud or serious misconduct. Permanent.
  Cannot reapply under any name. Ever.

---

## Talc Pricing — Public vs Territory

**Public Talc (non-members, anyone, anywhere):**
$10 USD per post. Flat. Always. No PPP adjustment.
No country discount. No tiers. Global and simple.
1 post = pushed to all 6 platforms simultaneously.

**Territory Talc (bundled with territory):**
1 Talc credit per $10 of territory price per month.
PPP-adjusted territory price determines credit allowance.
Credits are territory-locked — can only push to that
territory's SEO page, platforms, and geographic area.
Credits reset monthly. No rollover.

**Anti-gaming — four locks:**
1. Stripe card country ties PPP rate to billing country
2. Territory must match business operating city
3. Credits are geographically and categorically locked
4. EyeSpyR verifies business location on onboarding

A New York vendor cannot buy a Lahore territory at
PPP-adjusted rates. Their Stripe card country is US.
They pay US rates. The territory system is clean.

---

## Session Log — Decisions Made

### Session: July 11, 2026
- Talc credit model confirmed: 1 credit per $10 spent (not flat 30 credits)
- Territory price and posting budget are the same number
- Content minimum confirmed: 1 post per month (not 2)
- Credits reset monthly, no rollover — intentional
- Content inactivity escalation ladder confirmed (6-month process)
- EyeSpyR minimum confirmed: 4.5 stars over rolling 30 days
- Reputation escalation: 30-day recovery window (compressed from 60)
- Zero tolerance policy confirmed: fraud, verified 1-star, disrepute = instant
- EyeSpyR blacklist confirmed for fraud cases
- Returned territories go to Weddings.io cherry-pick, not open pool
- Infrastructure cost baseline established: ~$135–185/mo
- README workflow established as single source of truth

---

### Session continuation 3: July 11, 2026
- $10 brand spine confirmed as core principle — never change
- $10/year directory fee confirmed — nothing is free
- $10/year only charged AFTER successful EyeSpyR pass — never before
- Failed EyeSpyR = no payment taken, warm rejection, 12-month reapplication
- Red flag databank confirmed — separate from blacklist
- Databank shared across all 16 IAM network domains
- Rejection language locked: "not the right fit at this time"
- Public Talc confirmed at flat $10 USD — no PPP, no country adjustment
- Territory Talc follows territory PPP — credits territory-locked
- Anti-gaming four locks confirmed: Stripe card country, territory = operating city, credits locked, EyeSpyR location verification
- PPP calculator built with real World Bank price level ratios (2020 ICP data)
- Country dropdown with ISO codes — 50+ countries grouped by region
- Databank distinction confirmed: databank = watched/can reapply, blacklist = permanent

### Session continuation 2: July 11, 2026
- Backlink requirement confirmed — active dofollow link from vendor website to territory page is contract-essential
- Three backlink options: EyeSpyR badge (easiest), footer link (sitewide), dedicated page (strongest)
- Backlink verified monthly by automated crawl — absence triggers escalation same day
- Badge must be dofollow, live score, links to territory page
- PPP pricing confirmed for emerging markets — World Bank conversion factors
- Established markets (Canada, UK, Australia, EU, UAE, Singapore) stay flat USD
- Canada confirmed at flat USD — purchasing power parity near 1:1 with US
- PPP pricing also applies to planner app tools and upgrades — near-zero marginal cost, pure upside
- Nano Banno carved out — separate micro-pricing model, not part of PPP framework
- Stripe confirmed as sole billing processor — no PayPal
- Stripe local currency display — vendors see local currency, Weddings.io receives USD
- Stripe card country detection ties PPP rate to billing country, not self-reported location
- VPN arbitrage closed by card country enforcement
- PPP rates reviewed annually against World Bank data
- New pages built: weddings-io-territory-commitment.html, eyespyr.html
- Pages added to routing table below

### Session continuation: July 11, 2026
- EyeSpyR dual-job model confirmed: entry gate + live floating badge
- Onboarding score: clean record = starts at 4.5, bad record = below 4.5
- Verified licensing NOT required to join — but reflected in floater score
- 4.5 confirmed as platform-wide access threshold (not just territory)
- Guest posting requires 4.5+ — below 4.5 = posting suspended immediately
- Guest post gate applies to ALL vendors, not just territory holders
- EyeSpyR floater is live, behaviour-driven, not static, not paid
- Blacklist is shared across all 16 IAM network domains
- Access matrix confirmed: below 4.5 = listing only, 4.5+ = full access,
  fraud = blacklisted

---

*This document is updated after every working session.
Last updated: July 11, 2026*
*Weddings.io Technologies · Est. May 13, 2015*
