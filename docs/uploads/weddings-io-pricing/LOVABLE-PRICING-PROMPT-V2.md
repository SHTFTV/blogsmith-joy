# Weddings.io™ — Pricing Page
## Lovable Prompt · Final Version · USD · Population Formula

---

## CONTEXT

Official pricing page for Weddings.io™ (https://weddings.io).
Page lives at: weddings.io/pricing
Do NOT change any auth, Clerk, Stripe, routing, or IAM Bot widget.

---

## THE PRICING FORMULA — THIS IS THE WHOLE MODEL

**$10 USD per 100,000 population · rounded down to nearest $10 · minimum $10 USD · all prices in USD**

Formula in code:
```javascript
function territoryPrice(population) {
  const raw = Math.floor(population / 100000) * 10;
  return Math.max(10, raw);
}
```

Examples:
- Aldergrove BC (50K pop) → $10 USD/mo
- Chilliwack BC (130K) → $10 USD/mo
- Langley BC (180K) → $10 USD/mo
- Burnaby BC (245K) → $20 USD/mo
- Surrey BC (570K) → $50 USD/mo
- Vancouver BC (675K) → $60 USD/mo
- Toronto ON (2.9M) → $290 USD/mo
- Dubai UAE (3.5M) → $350 USD/mo
- London UK (9M) → $900 USD/mo
- Mumbai India (20M) → $2,000 USD/mo

---

## TWO DISTINCT PRODUCTS ON THIS PAGE

### 1. Open Directory — Free to register
- Any wedding business can apply
- Must pass EyeSpyR business credential verification to be listed
- EyeSpyR rating displayed on every listing (visible to couples)
- No exclusivity — multiple businesses per category per city
- Free for couples to browse
- This is the base layer — open to all

### 2. Exclusive Territory Slot — Paid, selective
- One slot per culture per category per city
- Price = $10 USD per 100K population (formula above)
- Filled slowly and selectively — reputable businesses only
- Not first-come-first-served — Weddings.io selects partners
- Exclusive: only promoted business for that culture+category+city
- Gets: IAM Bot AI lead routing, all city SEO leads,
  Talc.tv content syndication to 6 platforms,
  EyeSpyR verified badge, city territory page feature
- Culture-specific: e.g. one Hindu wedding planner in Surrey,
  one Sikh wedding planner in Surrey, one Persian wedding
  planner in Surrey — each is a separate exclusive slot

---

## BRAND & DESIGN

Background: #080808
Surface: #141414
Panel: #1a1a1a
Gold accent: #c9a96e — ONLY accent colour
White text: #f2efe8
Muted text: rgba(242,239,232,0.5)
Border: rgba(255,255,255,0.07)
Green (verified/success): #4caf7d

Fonts: Cormorant Garamond (headings) + Inter (body) — already loaded
Nav: keep existing exactly. Active = Pricing link highlighted gold.
Add "Claim a Territory" as primary nav CTA — gold background, black text.

---

## PAGE SECTIONS IN ORDER

### Hero
Eyebrow: TERRITORY PRICING · USD · EST. 2015
Headline: "Your city. Your culture. Your category. One slot."
Sub: "Exclusive territory pricing based on your city's population.
$10 USD per 100,000 people. The same formula everywhere in the world."
Badges: ✓ All prices USD  ✓ EyeSpyR Verified  ✓ One slot per culture  ✓ Month to month

---

### The Formula — displayed prominently

Large display:
"$10 USD per 100,000 population"
"Rounded down. Minimum $10. Same formula worldwide."

Three examples side by side:
- Langley BC · 180K pop · $10/mo
- Surrey BC · 570K pop · $50/mo
- Toronto ON · 2.9M pop · $290/mo

---

### City Price Calculator

Card with:
- Input: "Enter your city's population"
- Live result shown as: "$XX USD / month"
- Formula shown below: "[pop] population · $10 per 100K · rounded down"
- CTA button: "Apply for This Territory →"

JS formula:
```javascript
function price(pop) {
  return Math.max(10, Math.floor(pop / 100000) * 10);
}
```

---

### Global City Examples Table

Show as a clean table — city, population, monthly price USD.
Group by region loosely. Include at minimum:

Canada:
Aldergrove BC | 50K | $10
Langley BC | 180K | $10
Burnaby BC | 245K | $20
Surrey BC | 570K | $50
Vancouver BC | 675K | $60
Toronto ON | 2.9M | $290

Global:
Dubai UAE | 3.5M | $350
London UK | 9M | $900
Mumbai India | 20M | $2,000
New York USA | 8.3M | $830
Sydney Australia | 5.3M | $530

Highlight Surrey row as the "Lower Mainland anchor" example.
Show prices in USD clearly on every row.

---

### Two Products — Directory vs Territory

Side by side comparison:

LEFT — Open Directory (free to join):
Title: "Open Directory"
Sub: "Register. Pass EyeSpyR. Get listed."
Points:
✓ Any wedding business can apply
✓ EyeSpyR business credential verification required
✓ Rating displayed on your listing
✓ Visible to all couples searching your city
✓ Multiple businesses per category — no exclusivity
Price: Free to apply · EyeSpyR verification required

RIGHT — Exclusive Territory (selective):
Title: "Exclusive Territory"
Sub: "One slot. One culture. One city. Selected by Weddings.io."
Points:
★ One vendor per culture per category per city
★ IAM Bot AI lead routing — 24/7
★ All city SEO leads come to you
★ Talc.tv syndication — 6 platforms automatically
★ EyeSpyR verified badge (prominent)
★ Culture-specific territory page feature
★ Selected by Weddings.io — not first come first served
Price: $10 USD per 100K population · your city's formula

Give the Territory card a gold border accent (not the Directory card).
Add note: "We fill territories slowly. We are looking for
reputable businesses that represent their culture well."

---

### What "Culture + Category + City" Means

Explain the three-dimensional slot system:
One table or grid showing examples:

Culture | Category | City | Slot
Hindu | Wedding Planner | Surrey BC | 1 slot
Sikh | Wedding Planner | Surrey BC | 1 slot
Muslim | Wedding Planner | Surrey BC | 1 slot
Persian | Wedding Planner | Surrey BC | 1 slot
Hindu | Caterer | Surrey BC | 1 slot
Sikh | Photographer | Langley BC | 1 slot

Note: "Each combination is its own independent exclusive slot.
A city like Surrey may have 40+ exclusive slots across cultures
and categories. Each one is priced at Surrey's population formula."

---

### EyeSpyR Verification

Small section explaining:
"All directory listings require EyeSpyR business credential
verification. Portfolio authenticity, business registration,
and insurance independently confirmed.
Your EyeSpyR rating is displayed on your listing.
Exclusive territory partners must also pass EyeSpyR."

Link to: eyespyr.com

---

### FAQ

Q: How is my price calculated?
A: $10 USD per 100,000 people in your city, rounded down to
the nearest $10. Minimum $10. Enter your city's population
in the calculator above to see your exact monthly price.

Q: How do I get an exclusive territory slot?
A: Apply through Weddings.io. We review applications and
select partners based on reputation, cultural depth, and fit.
We fill slots slowly — we are not rushing to fill positions.
We want the best businesses representing each culture in each city.

Q: What is the difference between the directory and a territory?
A: The directory is open to all EyeSpyR-verified businesses.
Multiple businesses can be listed per category per city.
A territory is exclusive — one business per culture per category
per city, actively promoted through IAM Bot leads, city SEO pages,
and Talc.tv content syndication.

Q: Is there a contract?
A: Month to month. No annual lock-in. Cancel any time.
Territory slots return to the waitlist when released.

Q: Can I hold territories in multiple cities?
A: Yes. Each city is priced independently at that city's
population formula. A business covering Surrey and Langley
pays $50 + $10 = $60 USD/month for both territories.

---

### Final CTA — full width gold background

Headline: "Your slot is waiting. We're looking for the right fit."
Sub: "Exclusive territory. One culture. One category. One city.
Priced at $10 USD per 100,000 people in your market."
Button 1: "Apply for a Territory →" — black bg, gold text
Button 2: "Join the Open Directory" — ghost

---

## ROUTING

"Apply for a Territory →" → /join?type=territory
"Join the Open Directory" → /join?type=directory
"Claim a Territory" (nav) → /join?type=territory
Calculator CTA → /join?type=territory&city={city}

---

## DO NOT

- Never show prices in any currency other than USD
- Never imply territories are first-come-first-served
- Never say the directory is "premium" — it is the open layer
- Never remove "Est. May 13, 2015" from brand references
- Never change the IAM Bot widget
- Never add a free tier to the exclusive territory
- Never call this a "directory listing fee" — it is a territory


---

## ADDITIONAL SECTION — Partner & Spokesperson Tier

Add this section AFTER the FAQ and BEFORE the final CTA.
This is not a standard pricing tier. It has no price listed.
It is a quiet invitation to a different kind of relationship.

---

### Section: "Think you have what it takes?"

Background: slightly elevated surface — dark panel, subtle gold border.
Not loud. Not a banner. Reads like an editorial note, not a sales pitch.

Eyebrow (small caps, gold):
FOR THE ONES DOING SOMETHING REAL

Headline (Cormorant Garamond, large, white):
"Think you belong on the ground floor?"

Body copy:
"We are building the world's most sophisticated wedding platform
from the ground up — and we are open to the idea that the best
people in every culture's wedding world should have a stake in it.

If you are a planner, photographer, caterer, or creative
who is genuinely exceptional at what you do —
someone with a real following, a real reputation,
and a real presence in your community —
we want to hear from you.

We have always given great deals to excellent people
doing interesting things. That is not changing.
What we are looking for is people who see what we are building
and want to be part of it early — not as a vendor,
but as a voice."

Three signal points (small, understated — not bullet points, more like footnotes):

· Megacity markets — if your city breaks the population formula,
  let's talk about what a real partnership looks like

· Rising stars — if you are building your name in your culture's
  wedding world and you want a platform behind you, we are listening

· Future faces — if you have the audience, the reputation,
  and the ambition to be the face of weddings in your city or culture,
  there is a version of this built around you

CTA — single button, ghost style (NOT gold filled — this is understated):
"Start a conversation →" → routes to /partners

Below the button, in very small dim text:
"No forms. No pitch decks. Just tell us who you are and what you're building."

---

## MEGACITY NOTE — add inline to the city table

For cities over 2M population, add a small note in the table:
"Cities over 2M are priced by district — contact us for your area."
And a small "Talk to us →" link next to those rows
(Mumbai, London, New York, Delhi, Cairo, Jakarta etc.)

This naturally funnels megacity applicants into the partnership
conversation rather than the standard territory flow.

---

## POSITIONING NOTE FOR LOVABLE

The Partner section should feel like the most exclusive part of the page
— but it should not look like it is trying to be exclusive.
No gold fills. No big badges. Just clean, quiet, confident copy
that signals Weddings.io knows what it is building
and is selective about who it brings along for it.

The person this section is written for will recognize themselves in it.
Everyone else will scroll past it. That is exactly right.
