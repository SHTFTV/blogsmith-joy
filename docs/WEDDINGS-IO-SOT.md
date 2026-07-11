# Weddings.io — SOT · V4
## Source of Truth · Current Version · Paste First in Every Session

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

## Verified Reviews — Transactional Weight System

This is the core differentiator from Google, Facebook, and every
other directory. Weddings.io can trace reviews to real transactions.
Google cannot. That gap is the moat.

**Review weight by source:**
| Source | Weight | Why |
|--------|--------|-----|
| Verified Weddings.io transaction | 1.0× | Booking, payment, and date all confirmed in platform |
| Verified external transaction (receipt uploaded) | 0.7× | Evidence provided, manually verified |
| Unverified platform review | 0.3× | Account exists but no transaction linked |
| External review imported (Google, Facebook) | 0.2× | No transaction verification possible |
| Anonymous or unverifiable | 0× | Not counted toward EyeSpyR score |

The EyeSpyR floater displays the weighted score only.
Couples see the number. The weighting is invisible to them.
But the number means something real — unlike Google's.

**Core message:**
"Every review on Weddings.io is traceable.
Every dispute has a process.
We do what Google won't."

This is a positioning statement, not a feature list.
It goes directly at the biggest frustration every vendor
has with every other platform. Use it in messaging,
in the apply flow, in the territory commitment page,
and in the EyeSpyR explanation.

---

## Arbitration — The Reputation Moat

No other wedding platform offers this.
No directory offers this.
BBB's process is opaque and vendor-funded — poisoned.
Google offers a form and silence.
Weddings.io offers a documented, fair, human process.

**Who gets arbitration:**
- Territory holders — full arbitration pathway
- Directory vendors — standard dispute pathway only
- Territory holders have invested in the platform
  and earned the right to a fair fight

**The arbitration process:**
1. Vendor disputes a review — submits evidence
   (invoice, contract, communications, timeline)
2. Couple notified — given opportunity to respond
   with their own evidence
3. Human reviewer reviews both sides against rubric
4. Decision made and documented — outcome is final

**Possible outcomes:**
| Outcome | What happens |
|---------|-------------|
| Review upheld | Stays. Vendor response pinned below. |
| Review weight reduced | Evidence inconclusive — partial credit only |
| Review removed | Demonstrably false or malicious — removed |
| Both removed | Clear retaliation war — neither party served |

**Fee structure:**
$25 per arbitration case — prevents abuse
Losing party forfeits the fee
Winning party gets it refunded
Keeps the process honest and intentional

**The published rubric:**
The arbitration rubric is public. Everyone knows the
rules before they play. That transparency IS a trust signal.
Vendors trust a platform that gives them a fair fight.
Couples trust a platform where reviews survive scrutiny.

**Why this is a moat:**
- Requires process, people, and reputation to replicate
- No competitor can copy it quickly
- Every arbitration outcome becomes a public trust signal
- The record compounds over time — more cases, more credibility
- Vendors who win stay loyal. Couples who see it trust the platform.

**Implementation path:**
Start with territory holders only.
Build the rubric publicly before launch.
Charge $25 per case from day one — no free arbitration.
Document every outcome (anonymised) in a public record.
Scale the human review process as territory count grows.

---

## Platform Architecture — Two Systems

Weddings.io runs two distinct systems on the same network.
They serve different users and must never be confused.

---

### System 1 — Weddings.io (Planner-Focused)

**Primary user:** Wedding planners — professionals managing
multiple client weddings across cultural categories.

**Product:** Planner tools — client management, scheduling,
PDF export, analytics, Talc credits, white-label portal.

**Pricing:** $29 / $59 / $99 per month (PPP-adjusted in
emerging markets). See Planner Pricing section below.

**Cultural tabs:** Planners filter by the wedding cultures
they specialise in — South Asian, Chinese & East Asian,
Persian, Hispanic Heritage, Jewish, Nordic, Southeast Asian etc.
This is the territory logic made visible in the UI.

**The planner is the hub.** Couples find the planner through
the territory page. The planner manages the wedding through
the platform. The planner refers out to the vendor network.

---

### System 2 — The Marketplace Network (Vendor-Focused)

**Primary users:** Photographers, caterers, decorators,
videographers, florists — any wedding service vendor
who is NOT a wedding planner.

**Their product:** NOT the planner tools.
- $10/year directory listing (EyeSpyR verified)
- Territory if selected ($10/100K/month)
- Public Talc at $10/post
- Job bidding through the marketplace

**Their domains:** Each vendor category has its own
IAM network domain:
- caterers.tv — catering
- videographers.io — videography
- florists TBD
- decorators TBD

**The planner tool is irrelevant to marketplace vendors.**
Never show them planner pricing. Never suggest they need it.

---

### The Power Partner Connection

The territory holder (planner) is the hub.
The marketplace network is the spoke system.
The IAM Bot routes referrals from planner to vendor.

```
Couple finds planner via territory page
         ↓
Planner manages wedding in platform tools
         ↓
Planner refers vendors to couple via IAM Bot
Caterer    → caterers.tv (EyeSpyR verified)
Photographer → videographers.io (EyeSpyR verified)
Decorator  → relevant marketplace domain
         ↓
All vendors verified · All reviews traceable
All referrals tracked through IAM network
```

Power partner sites (caterers.tv, videographers.io etc.)
feed qualified, verified vendors into the weddings.io
ecosystem. The territory page is the centre.
The network is the engine.

---

## Planner App Pricing — Locked

**Who this is for:** Wedding planners only.
Not photographers. Not caterers. Not decorators.
The planner manages the wedding. Vendors are referred in.

**Tiers:**
| Tier | Price | Active clients | Key features |
|------|-------|---------------|-------------|
| Starter | $29/mo | Up to 5 | All couple tools, cloud sync, client portal (Weddings.io branded), PDF export, 1 team user, basic analytics, 5GB storage/client |
| Pro | $59/mo | Up to 15 | Everything in Starter + white-label portal, 3 team users, revenue and analytics dashboard, priority support, 10GB storage/client |
| Studio | $99/mo | Unlimited | Everything in Pro + unlimited team users, full custom branding, API access, dedicated account manager, unlimited storage, featured verified planner listing |

**Talc credits in planner tiers:**
Following the 1-per-$10 principle:
- Starter $29 → 2 Talc credits/month (rounded down to nearest whole)
- Pro $59 → 5 Talc credits/month
- Studio $99 → 9 Talc credits/month

Current UI shows 2 and 5 for Pro and Studio — these need
updating to 5 and 9 to match the formula. Starter stays at 2.

**14-day trial:**
A trial is not free — it is time-limited access that
auto-converts to paid via Stripe card on file.
Card required at trial start. Auto-converts on day 15.
Cancel any time before day 15 — no charge. This is
consistent with "nothing is free" — the commitment
is made at signup, the payment follows automatically.

**PPP adjustment:**
Applies to all planner tiers in emerging markets.
Same World Bank price level ratios as territory pricing.
Card country detection via Stripe enforces the rate.

**Planner EyeSpyR:**
Planners must also pass EyeSpyR to access the platform.
Same 4.5 threshold. Same onboarding gate.
Failed EyeSpyR — no charge, warm rejection, databank flag.
Planner tools require verified professional status.

---

## Territory Page Structure — Final Decision

**One planner per city. Full stop.**

Not per culture. Not per category.
One exclusive wedding planner territory per city.
The best one. Selected by Weddings.io. Hand-picked.

**URL structure:**
```
/planners/surrey
/planners/vancouver
/planners/toronto
/planners/london
/planners/dubai
```

~187 cities × 1 planner = ~187 pages.
Not 1,700. Clean, manageable, authoritative.

**Cultural specialisation lives inside the profile —
not in the URL structure.**

A planner who specialises in Hindu weddings says so
on their territory page, posts Hindu wedding content
through Talc, and the SEO builds naturally around
those keywords. The territory is the city. The culture
is the content.

**The cultural filter tabs** (South Asian, Chinese,
Persian, Hispanic, Jewish, Nordic, Southeast Asian)
filter which planner is surfaced — not which page
loads. If a planner holds the cultural niche in that
city, the tab highlights them. If not, it shows
"territory available."

**Everything else goes to the marketplace:**
Photographers · caterers · decorators · florists ·
DJ/entertainment · videographers — all marketplace.
The wedding planner orchestrates all of them.
That's why the planner gets the exclusive territory page.
That's the role that earns it.

---

## Guest Post Spotlights — Content Engine

Territory pages have three content layers:

**Layer 1 — Territory holder content**
The planner's own Talc posts. Their expertise.
Their voice. Builds page authority monthly.
Required minimum: 1 post per month.

**Layer 2 — Guest post spotlights**
Verified vendors posting relevant content.
Caterer posts a Sangeet menu guide.
Photographer posts a Haldi shoot breakdown.
Florist posts a mandap decoration lookbook.
Surfaced on the territory page as spotlights.
Vendor gets exposure. Page gets fresh content.
Couple gets a curated vendor ecosystem.
Requires 4.5+ EyeSpyR to post — same gate as always.

**Layer 3 — Tribe feed**
Cultural content aggregated across the network.
South Asian wedding content from Surrey, Vancouver,
Burnaby, Langley — all feeding into a tribe view.
Direct targeted distribution to the right audience.

**Guest posts as a Talc distribution channel:**
When a vendor buys a $10 public Talc post they choose
6 platforms. Tribe targeting is a seventh option:
"Distribute to the [South Asian] wedding tribe on
Weddings.io" — directly into the cultural feed of
the most relevant audience for their service.
Worth more than a generic social push.

---

## IAM Bot — Talent Monitoring (Internal Function)

This is not a product. Not a brand. Not a badge.
Not a page. Not something vendors know exists.

It is an internal IAM Bot function that watches the
directory quietly and flags rising talent to the
Weddings.io team for manual review and decision.

**What the IAM Bot monitors:**
- EyeSpyR score trending above 4.7 consistently
- Guest post engagement above network average
- Verified review velocity increasing month on month
- Talc content performing above baseline in tribe feed
- Cross-city reach developing organically
- Response rate and client conversion signals

**When thresholds are met:**
- Internal flag raised to Weddings.io team
- Tagged as "rising talent — review for elevation"
- Team reviews manually — cherry pick decision made
- If selected: elevated Talc credits, spotlight
  placement, territory fast-track consideration,
  partnership conversation opened

**Elevation tiers (internal — not communicated
as tiers to vendors):**

| Signal level | What the team considers |
|-------------|------------------------|
| Rising | Strong guest posts, 4.7+ EyeSpyR, growing engagement → extra Talc credits, tribe spotlight |
| Featured | Territory holder, exceptional content, cross-city reach → co-branded content, network amplification |
| Partner | Cultural authority, genuine community voice, social presence → ground floor stake, spokesperson consideration |

**Nothing is automatic. Bot flags. Humans decide.**

The vendor never knows the system exists until
the team reaches out. That's intentional.
An invitation that arrives unexpectedly means
infinitely more than a badge you applied for.

**The cultural tribe value:**
South Asian weddings aren't just a market segment.
They're a community — elders, aunties, WhatsApp
groups, temple networks, community centres.
The right elevated partner in that community is
a trusted voice whose recommendation travels
through every one of those channels.
One genuine elevated partner in Surrey South Asian
community is worth more than a thousand Google ads.

---

## Launch Strategy — Slow, Controlled, Deliberate

This is the platform launch model. Do not rush it.
Do not open payment gateways until the SOT says so.
The slow launch IS the moat being built.

---

### Current State — Site is Complete

Messaging: complete and consistent
Pricing: clear for every country via PPP calculator
City planner pages: already built
SOT: locked at V4
Payment gateways: all coming soon
Trust infrastructure: documented and ready

The site looks complete and intentional.
Every gateway has a coming soon button.
Every hover reveals partnerships@industryarmymarketing.com
No dead links. No 404s. No "under construction."

---

### The Five Phases

**Phase 1 — Now · Site live, gateways closed**
Site live with all pricing visible and clear
Coming soon at every payment gateway
partnerships@ email on every hover
Watch who reaches out and from where
Every email is pre-launch research
Geography, culture, demand — all visible before launch

**Phase 2 — Select group · Controlled Talc**
Hand-pick 3–5 trusted vendors personally
Controlled guest posting through Talc
Content starts building search presence
City pages start getting indexed with real content
No payment gateways open
No commitment, no risk, pure signal and buzz
This creates content without harming trust or infrastructure

**Phase 3 — First territory conversations**
Someone emails who is clearly the right fit
Surrey Hindu planner. Vancouver South Asian.
You pick up the phone. Territory conversation.
First $10/month. First real content cycle starts.
EyeSpyR gate enforced from day one.

**Phase 4 — Open carefully**
One territory at a time
Directory opens when first territory is solid
$10/year directory fee activates
Talc credits activate for territory holders
Every new vendor through EyeSpyR gate
Databank watching from day one

**Phase 5 — Let it compound**
Content builds rankings
Rankings build enquiries
Enquiries build territory demand
Territory demand creates the rush
The platform grows because of its vendors

---

### Why This Is Right

No platform has ever been hurt by launching too slowly
with the right people. Every platform that launched too
fast with the wrong people spent years cleaning up the mess.

The Talc pushes from the select group will start indexing
content. Google will see the city pages. Schema will work.
By the time the first payment gateway opens the platform
already has SEO presence, real content, and a small group
of verified vendors who believe in it.

That is not a soft launch. That is a perfect launch.

---

## Gateway Rules — Universal

**What stays live and clickable:**
- Links to existing built pages (/pricing, /territory-commitment)
- Links to external sites (eyespyr.com, talc.tv, industryarmymarketing.com)
- Navigation between built pages
- PPP calculator
- The partnerships email on hover everywhere

**What gets the coming soon button:**
- Any payment gateway — directory fee, territory, planner tools
- Apply / join flows
- Guest post submission
- Planner tool access
- IAM Bot chat
- Dashboard
- Arbitration portal
- Tribe feed
- Territory claim
- EyeSpyR verification flow
- Spotlight application

**No mention of trials. Ever.**
The platform launches when the right people have joined.
Coming soon buttons are the waiting list.
The email is the door.

---

## Coming Soon Button — Universal Spec

Every unbuilt gateway across the entire platform
uses this exact button. No exceptions.

**The button:**
```css
background: transparent
color: rgba(201,169,110,.5)
border: 1px solid rgba(201,169,110,.25)
border-radius: 6px
padding: 13px 28px
font-size: 14px
font-weight: 400
cursor: default
```

**On hover:**
```css
border-color: rgba(201,169,110,.5)
color: rgba(201,169,110,.7)
```

**Tooltip on hover (always):**
```
partnerships@industryarmymarketing.com
```

Tooltip style:
```css
background: #1a1a15
border: 1px solid rgba(201,169,110,.3)
border-radius: 5px
padding: 7px 14px
font-size: 12px
color: #c9a96e
position: absolute
bottom: calc(100% + 8px)
```

**The embed pattern:**
```html
<div class="cs-btn" role="button" aria-disabled="true">
  <div class="cs-tooltip">
    partnerships@industryarmymarketing.com
  </div>
  Coming soon
</div>
```

**Applies to every gateway on:**
- weddings.io
- eyespyr.com (when built)
- talc.tv (when built)
- Every IAM network domain

**What the button does:**
Links to existing pages and external sites stay live.
Only payment, signup, and unbuilt features get this button.
Someone motivated enough to hover, read the email, and
write — that is who you want to hear from first.
The friction is the filter.

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

### Session continuation 7 — V4: July 11, 2026
- Launch strategy confirmed — slow, controlled, deliberate
- Five-phase launch sequence locked
- City planner pages confirmed as already built — nothing to do there
- Universal gateway rule confirmed — links live, payments coming soon
- No mention of trials anywhere ever
- Coming soon button is the universal gateway pattern across all IAM domains
- partnerships@industryarmymarketing.com on hover on every coming soon button
- Select group controlled Talc push confirmed as Phase 2
- Content before payment gateways — build SEO before opening commerce
- The friction of the email is the filter — intentional
- SOT versioned as V4 — current version

### Session continuation 6 — V3: July 11, 2026
- Territory page structure final: one planner per city, not per culture
- URL structure locked: /planners/{city} — ~187 pages not 1,700
- Cultural filter tabs = targeting mechanism not page structure
- All non-planner vendors go to marketplace domains
- Three-layer content engine confirmed: holder content, guest spotlights, tribe feed
- Guest post tribe targeting confirmed as seventh Talc distribution channel
- IAM Bot talent monitoring confirmed as internal function only
- No brand name, no badge, no page — bot flags, humans decide
- Talent never knows the system exists until team reaches out
- Three elevation levels: rising, featured, partner (internal only)
- IIMHUB brand name retired — someone owns the .com
- Concept lives inside IAM Bot SOT context only
- Territory page example built: /planners/surrey/hindu (for reference)
- SOT versioned as V3

### Session continuation 5 — V2: July 11, 2026
- Two-system architecture confirmed and locked
- System 1: Weddings.io = planner-focused, $29/$59/$99 tools
- System 2: Marketplace network = vendor-focused, $10/year directory
- Planner tool is NOT for photographers/caterers/decorators
- Power partner sites confirmed as vendor referral network
- IAM Bot routes planner referrals to marketplace vendors
- Planner Talc credits updated: Starter 2, Pro 5, Studio 9 (1-per-$10)
- 14-day trial confirmed — card required, auto-converts, consistent with "nothing is free"
- PPP applies to planner tiers in emerging markets
- EyeSpyR gate applies to planners same as vendors
- Lovable prompt updated for V2 with full architecture context

### Session continuation 4: July 11, 2026
- Verified transactional review weighting confirmed
- Review weight table locked: 1.0× platform transaction, 0.7× verified external, 0.3× unverified, 0.2× imported, 0× anonymous
- Core positioning message locked: "Every review traceable. Every dispute has a process. We do what Google won't."
- Arbitration framework confirmed — territory holders only
- Arbitration fee: $25/case, losing party forfeits, winning party refunded
- Published rubric confirmed — transparency is the trust signal
- Arbitration outcomes: upheld, weight reduced, removed, both removed
- SOT naming convention adopted network-wide
- README renamed to WEDDINGS-IO-SOT.md
- IAM-NETWORK-SOT.md created as master document
- Lovable prompt note added to SOT for design handoff

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

---

## Lovable Prompt — V4 · Final

Paste this into Lovable. This is the current state of the site.

---

```
You are updating the Weddings.io platform UI.
This is V4 — the final pre-launch state.
Read WEDDINGS-IO-SOT-V4.md fully before touching anything.

THE SITE IS COMPLETE IN MESSAGING AND PRICING.
DO NOT rebuild pages that already exist.
DO NOT add features not in the SOT.
DO NOT mention trials anywhere.

WHAT THIS BUILD DOES:
Replace every payment gateway, signup flow, and
unbuilt feature with the coming soon button pattern.
That is the entire job of this build.

---

THE COMING SOON BUTTON — universal pattern:

CSS:
  background: transparent
  color: rgba(201,169,110,.5)
  border: 1px solid rgba(201,169,110,.25)
  border-radius: 6px
  padding: 13px 28px
  font-size: 14px
  font-weight: 400
  cursor: default

On hover:
  border-color: rgba(201,169,110,.5)
  color: rgba(201,169,110,.7)

Tooltip on hover — ALWAYS:
  "partnerships@industryarmymarketing.com"
  Position: above the button
  Background: #1a1a15
  Border: 1px solid rgba(201,169,110,.3)
  Border-radius: 5px
  Padding: 7px 14px
  Font-size: 12px
  Color: #c9a96e

HTML pattern:
  <div class="cs-btn" role="button" aria-disabled="true">
    <div class="cs-tooltip">
      partnerships@industryarmymarketing.com
    </div>
    Coming soon
  </div>

---

EVERY GATEWAY GETS THIS BUTTON:
- Apply for directory
- Apply for territory
- Guest post submission
- Planner tool access ($29/$59/$99)
- IAM Bot chat
- Dashboard
- Arbitration portal
- Tribe feed
- Territory claim
- EyeSpyR verification flow
- Spotlight application
- Any payment or signup flow

LINKS THAT STAY LIVE — do not touch these:
- Navigation between built pages
- /pricing
- /territory-commitment
- eyespyr.com (external link)
- talc.tv (external link)
- industryarmymarketing.com (external link)
- PPP calculator (stays interactive)

---

NEVER CHANGE:
- Gold #c9a96e only
- Cormorant Garamond display, Inter body
- Dark flat surfaces — no gradients no shadows no glow
- "Apply" never "sign up"
- $10/year directory, $10/month territory min, $10/post Talc
- Nothing is free — $10/year after EyeSpyR pass
- Stripe only, no PayPal
- Est. May 13, 2015 in footer
- One planner per city — never suggest multiple
- Cultural filter tabs — do not remove or redesign
- No mention of trials anywhere

CORE POSITIONING — use throughout:
"Every review on Weddings.io is traceable.
Every dispute has a process.
We do what Google won't."

PAGES ALREADY BUILT — do not rebuild:
/pricing
/territory-commitment
/eyespyr (eyespyr.com content)
/planners/{city} pages
PPP calculator

The site is ready. The gateways are closed.
The email is the door. That is the launch.
```

---

*WEDDINGS-IO-SOT-V4.md · Version 4 · July 11, 2026*
*Weddings.io Technologies · Est. May 13, 2015*

Paste this into Lovable to update weddings.io with everything in V3:

---

```
You are updating the Weddings.io platform UI.
This is V3 — read WEDDINGS-IO-SOT-V3.md fully before
touching any component. SOT is the source of truth.

WHAT CHANGED IN V3 — focus here first:

1. TERRITORY PAGES — FINAL STRUCTURE
One wedding planner per city. Not per culture.
URL: /planners/{city} e.g. /planners/surrey

~187 pages total. Each one the best planner
in that city. Clean, authoritative, exclusive.

Cultural filter tabs (South Asian, Chinese, Persian,
Hispanic, Jewish, Nordic, Southeast Asian) filter
which planner is surfaced — not which page loads.
Keep tabs exactly as shown in screenshots.

All non-planner vendors (photographers, caterers,
decorators, florists) go to marketplace domains.
Never show them territory planner pricing.

2. TERRITORY PAGE TEMPLATE
Each /planners/{city} page has three content layers:
- Territory holder's own Talc posts (required monthly)
- Guest post spotlights from verified vendors
- Tribe feed from cultural network

Guest post spotlight section sits below the holder's
content. Shows vendor name, EyeSpyR badge, post title,
culture tag. Requires 4.5+ EyeSpyR to appear.

3. COMING SOON BUTTONS
Style: gold outline, disabled, cursor default.
background: transparent
border: 1px solid rgba(201,169,110,.3)  
color: rgba(201,169,110,.5)
text: "Coming soon"
No hover. No click. No dead links anywhere.

Apply to: /join · /how-it-works · /partners
and any marketplace domain links not yet built.

4. NEVER CHANGE
- Gold #c9a96e only
- Cormorant Garamond display, Inter body
- Dark flat surfaces — no gradients no shadows no glow
- "Apply" never "sign up"
- $10/year directory, $10/month territory min, $10/post Talc
- Nothing is free — $10/year after EyeSpyR pass only
- Stripe only, no PayPal
- Est. May 13, 2015 in footer
- EyeSpyR = external (eyespyr.com) reference only
- Cultural filter tabs — do not remove or redesign
- One planner per city — never suggest multiple per city

5. CORE POSITIONING
"Every review on Weddings.io is traceable.
Every dispute has a process.
We do what Google won't."

6. PLANNER PRICING (from V2 — unchanged)
Starter $29/mo · 2 Talc credits
Pro $59/mo · 5 Talc credits  
Studio $99/mo · 9 Talc credits
All: "Start 14-Day Trial" · card required · auto-converts day 15

7. PAGES BUILT — do not rebuild
/pricing · /territory-commitment · PPP calculator

8. PAGES NEEDED — coming soon buttons only
/join · /how-it-works · /partners · /planners/{city}
```

---

*WEDDINGS-IO-SOT-V3.md · Version 3 · July 11, 2026*
*Weddings.io Technologies · Est. May 13, 2015*

Paste this into Lovable to update weddings.io with everything in V2:

---

```
You are updating the Weddings.io platform UI.
This is V2 — read the full WEDDINGS-IO-SOT-V2.md before
touching any component. The SOT is the source of truth.
Do not guess. Do not invent. Follow the SOT exactly.

WHAT CHANGED IN V2 — focus here first:

1. TWO-SYSTEM ARCHITECTURE
Weddings.io serves two distinct user types.
Never mix their products or pricing.

PLANNERS get: $29/$59/$99 planner tools, client management,
white-label portal, Talc credits bundled, 14-day trial.

VENDORS (photographers, caterers, decorators etc.) get:
$10/year directory, territory if selected, public Talc
at $10/post. They NEVER see planner pricing.

The cultural filter tabs (South Asian, Chinese & East Asian,
Persian, Hispanic Heritage, Jewish, Nordic, Southeast Asian)
are the planner's specialisation filter — keep them exactly
as shown in the screenshot. They are correct.

2. PLANNER PRICING — UPDATE THESE
Starter: $29/mo — 2 Talc credits/month (correct as shown)
Pro: $59/mo — UPDATE to 5 Talc credits/month (was 2)
Studio: $99/mo — UPDATE to 9 Talc credits/month (was 5)
All buttons say "Start 14-Day Trial" — keep this wording.
Add a note under each button: "Card required · Auto-converts day 15"

3. COMING SOON BUTTONS
Any feature or page not yet built gets a coming soon button.
Style: gold outline, disabled state, cursor default.
NOT a banner. NOT a strip. A proper button matching the
existing "Start 14-Day Trial" button shape and size but:
- Background: transparent
- Border: 1px solid rgba(201,169,110,.3)
- Text color: rgba(201,169,110,.5)
- Text: "Coming soon"
- No hover state. No click. Disabled.

4. NEVER CHANGE THESE
- Gold accent #c9a96e only
- Cormorant Garamond display, Inter body
- Dark flat surfaces — no gradients, no shadows, no glow
- "Apply" never "sign up"
- Nothing is free — $10/year directory after EyeSpyR pass
- Stripe only, no PayPal
- Est. May 13, 2015 in footer
- EyeSpyR referenced as external (eyespyr.com) — not explained internally
- The cultural filter tabs — do not remove or redesign

5. CORE POSITIONING — use throughout
"Every review on Weddings.io is traceable.
Every dispute has a process.
We do what Google won't."

6. PAGES STATUS
Built and verified — do not rebuild:
/pricing · /territory-commitment · /eyespyr (eyespyr.com) · PPP calculator

Still needed — add coming soon buttons for these:
/join — application flow
/how-it-works — Talc explainer
/partners — megacity and partnership inquiry

7. REVIEW WEIGHT — add to EyeSpyR references
Verified platform transaction = full weight
Verified external receipt = 0.7×
Unverified = 0.3×
Imported external = 0.2×
Anonymous = not counted

8. ARBITRATION NOTE — territory holders only
$25/case · losing party forfeits · published rubric
Add as a single line in territory commitment section.
Full details at /territory-commitment.
```

---

*WEDDINGS-IO-SOT-V2.md · Version 2 · July 11, 2026*
*Weddings.io Technologies · Est. May 13, 2015*
