# talc.tv — Lovable UI Refresh Prompt
## Paste this as your first message in the existing Lovable talc.tv project

---

## What this prompt does

Design refresh only. Keep all existing functionality, routing, auth, API calls, 
Clerk integration, and backend connections exactly as-is. This is a visual update.

---

## What to Remove

Remove ALL Replit branding:
- "Powered by Replit" / "Built on Replit" / "Made with Replit" — anywhere it appears
- Replit logo marks or icons
- Bottom footer Replit attribution

Replace footer attribution with:
```
Content Intelligence by talc.tv · Part of Weddings.io Technologies Est. 2015
AI by IAM Bot · Verification by EyeSpyR · Intelligence by WeddingSaaS.com
```

---

## Hero Section — Keep Layout, Upgrade the Phone Mockup

The hero currently shows:
- Left: headline "Your Work. Everywhere." + subtext + CTAs
- Right: a phone/video mockup with floating cards (Instagram Published, Google Maps 
  Auto-Pinned, AI Blog Post Generated, and a video card showing @pro_roofer)

**Keep the left side layout exactly as-is.**

**Upgrade the right side phone mockup:**

Replace the single @pro_roofer card with a CYCLING set of 6 industry cards that 
auto-rotate every 2.5 seconds with a smooth crossfade. Each card shows a different 
trade/industry. The phone mockup frame and floating platform cards (Instagram, 
Google Maps, AI Blog Post) stay in place — only the main video card inside the 
phone cycles through the 6 industries.

### The 6 Industry Cards (cycle through these):

**1. Roofing**
```
@pro_roofer · Roofing [pink badge]
Complete roof replacement in Fort Langley
📍 Fort Langley, BC  ✓ GPS Verified
[background: dark slate, tools/roof imagery vibe]
```

**2. Landscaping**
```
@green_cuts · Landscaping [green badge]
Full backyard transformation — sod, irrigation & cedar deck
📍 Surrey, BC  ✓ GPS Verified
[background: deep forest green dark]
```

**3. Plumbing**
```
@pipe_king_bc · Plumbing [blue badge]
Hot water tank replacement & full basement rough-in
📍 Langley, BC  ✓ GPS Verified
[background: deep navy dark]
```

**4. Electrical**
```
@voltz_electric · Electrical [amber badge]
200A panel upgrade & EV charger installation
📍 Abbotsford, BC  ✓ GPS Verified
[background: dark amber/charcoal]
```

**5. Painting**
```
@premium_coat · Painting [purple badge]
Full exterior repaint — 3,200 sq ft heritage home
📍 White Rock, BC  ✓ GPS Verified
[background: dark purple/charcoal]
```

**6. HVAC**
```
@cool_air_pros · HVAC [teal badge]
Heat pump install + full ductwork replacement
📍 Chilliwack, BC  ✓ GPS Verified
[background: dark teal/charcoal]
```

### Each card in the phone mockup should show:
- A coloured gradient background (dark, matching the trade colour above)
- A play button circle in the centre (like the current design)
- The username with a coloured trade badge (pill shape)
- The job description text
- Location pin + "GPS Verified" checkmark in green
- Smooth opacity transition between cards (no slide/bounce — just crossfade)

### The floating platform notification cards (keep these exactly):
- Top right: "Google Maps · Auto-Pinned" with map pin icon ✓
- Bottom right: "AI Blog Post · Generated" with sparkle icon ✓
- Left side of phone: "Instagram · Published" ✓

These three cards represent the syndication — they do NOT need to change per industry.
They are always visible, showing the platform distribution happening automatically.

---

## "One Upload. Six Platforms." Section

Below the hero, the platform row currently shows:
Google Business · Instagram · Facebook · LinkedIn · TikTok · SEO Blog

Keep this exactly. If the icons or styling need a small refresh to match the 
new hero, do that — but keep all 6 platforms and their names.

---

## "Everything a Contractor Needs to Dominate Online" Section

Keep the headline and subtext. If there are feature cards below this, 
keep them structurally the same but make sure they match the dark aesthetic.

---

## Colour & Typography Rules

**Do NOT change:**
- The pink/magenta gradient on "Everywhere." — this is brand
- The `$10` highlight colour (yellow/gold)
- The overall dark background (#0a0a0a or very close)
- The pink "Get Started" button in the nav
- The pink "Enter the Feed" button

**Trade badge colours (for the cycling cards):**
- Roofing: `#e91e8c` (pink, matches brand)
- Landscaping: `#22c55e` (green)
- Plumbing: `#3b82f6` (blue)
- Electrical: `#f59e0b` (amber)
- Painting: `#8b5cf6` (purple)
- HVAC: `#06b6d4` (teal)

---

## Footer Update

Replace any Replit attribution in the footer with:

```
talc.tv · Part of Weddings.io Technologies Est. 2015 · Industry Army Marketing
Content · talc.tv  ·  AI · IAM Bot  ·  Verification · EyeSpyR  ·  Intelligence · WeddingSaaS.com
© 2026 talc.tv · All rights reserved.
```

Style: small, muted white/30, same dark background as rest of site.

---

## What NOT to Touch

- Nav links: Features, How It Works, Industries, Job Map, Explore
- "Log In" and "Get Started" buttons
- All routing and page structure
- Clerk auth
- Any API calls or backend connections
- The chat/support bubble (bottom right circle)
- The "1 Contractors · 1 Projects · 6 Platforms" stats row under the CTAs
- "Build for free" Lovable badge (bottom right) — leave as-is

---

## Summary Checklist

- [ ] Remove all Replit branding, add Weddings.io Technologies attribution in footer
- [ ] Phone mockup cycles through 6 industry cards (crossfade, 2.5s interval)
- [ ] Roofing, Landscaping, Plumbing, Electrical, Painting, HVAC — each with trade colour
- [ ] Each card: gradient bg, play button, username + badge, job description, GPS verified
- [ ] Three floating platform cards (Instagram, Google Maps, AI Blog Post) stay fixed
- [ ] Platform row (6 platforms) kept exactly
- [ ] Pink/magenta brand colour preserved throughout
- [ ] Footer updated with network attribution
- [ ] All existing functionality, auth, and API calls untouched
