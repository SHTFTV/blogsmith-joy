# MARKETT MASTER DEPLOYMENT CHECKLIST
*Industry Army Marketing | BuildersHaus Network*
*Last updated: 2026-08-02 — Auto-update this file after every deploy*

---

## NETWORK OVERVIEW

| Site | Domain | GitHub Repo | Vercel Project | Domain Connected | Marketing Page | Schema Type |
|------|--------|-------------|----------------|-----------------|----------------|-------------|
| Roofers | roofers.io | roofers-io-site | roofers-io | ⬜ | ✅ /marketing | RoofingContractor |
| Framers | framers.io | framers-io-site | framers-io | ⬜ | ✅ /marketing | GeneralContractor |
| Drywallers | drywallers.io | drywallers-io-site | drywallers-io | ⬜ | ✅ /marketing | HomeAndConstructionBusiness |
| Gasfitters | gasfitter.io | gasfitter-io-site | gasfitter-io | ⬜ | ✅ /marketing | Plumber |
| Plumbers | plumbers.ltd | plumbers-ltd | plumbers-ltd | ⬜ | ✅ /marketing | Plumber |
| Demolition | demolition.io | demolition-io | demolition-io | ⬜ | ✅ /marketing | GeneralContractor |
| Arborists | arborists.io | arborists-io | arborists-io | ⬜ | ✅ /marketing | LocalBusiness |
| Hardscapes | hardscapes.io | hardscapes-io | hardscapes-io | ⬜ | ✅ /marketing | HomeAndConstructionBusiness |
| Estimators | estimators.io | estimators-io | estimators-io | ⬜ | ✅ /marketing | ProfessionalService |
| Weddings | weddings.io | weddings-io | weddings-io | ✅ | ✅ blog | Organization |
| WeddingSaaS | weddingsaas.com | — | weddingsaas | ✅ | ✅ | SoftwareApplication |
| BuildersHaus | buildershaus.com | buildershaus-com | buildershaus-com | 🔄 DNS pending | ⬜ | Organization |
| SteelStud | steelstud.ca | steelstud-ca | steelstud-ca | ✅ | ⬜ | HomeAndConstructionBusiness |
| BarrierGates | barriergates.ca | barriergates-ca | barriergates-ca | 🔄 DNS pending | ⬜ | LocalBusiness |
| Brides | brides.ltd | — | — | ⬜ | ⬜ | — |
| Grooms | grooms.ltd | — | — | ⬜ | ⬜ | — |
| Parents | parents.ltd | — | — | ⬜ | ⬜ | — |

**Status:** ✅ Done | 🔄 Pending/Propagating | ⬜ Todo

---

## DEPLOY CHECKLIST — EVERY NEW SITE

### 1. BUILD
- [ ] Site built in Replit with correct trade branding
- [ ] Footer: "© 2026 [Site] — A Division of BuildersHaus.com. All rights reserved."
- [ ] Footer: "Powered by IndustryArmyMarketing.com" (linked)
- [ ] All PayPal/payment links → colin@industryarmymarketing.com
- [ ] Contact email: build@buildershaus.com (no phone numbers)
- [ ] llms.txt present
- [ ] robots.txt present
- [ ] sitemap.xml present with all city URLs
- [ ] _redirects present with /* → /index.html 200
- [ ] opengraph.jpg present (1200x630)
- [ ] IndexNow key file present
- [ ] Download Netlify ZIP from Replit

### 2. GITHUB
- [ ] Create private repo: [trade]-io or [trade]-[tld] (no duplicates)
- [ ] Push main branch with all built files
- [ ] Confirm repo visible at github.com/SHTFTV/[repo]

### 3. VERCEL
- [ ] Add New Project → import from GitHub
- [ ] Name project to match domain (e.g. roofers-io)
- [ ] Framework: Other (static)
- [ ] Deploy → confirm green Production status
- [ ] Go to Project Settings → Domains → Add domain
- [ ] Confirm domain shows ✅ Valid Configuration

### 4. DNS (GoDaddy / Namecheap)
- [ ] A record @ → 76.76.21.21
- [ ] CNAME www → cname.vercel-dns.com
- [ ] TTL: 600 seconds
- [ ] Confirm propagation (usually 5-30 min)

### 5. SEO / CONTENT
- [ ] /marketing page live (BuildersHaus backlink + trade schema)
- [ ] Schema type matches trade (see table above)
- [ ] Internal links: estimators.io, buildershaus.com, related trades
- [ ] Submit sitemap to Google Search Console
- [ ] Submit IndexNow key
- [ ] Add to llms.txt network references

### 6. CROSS-LINKING
- [ ] BuildersHaus.com links to this site
- [ ] Estimators.io references this trade
- [ ] Related trade sites link to this one
- [ ] weddings.io blog (if applicable) cross-references

---

## ECOSYSTEM LINK MAP

### BuildersHaus Hub (buildershaus.com)
Links OUT to all trade sites → receives backlinks from all trade /marketing pages

### Trade Cluster 1 — Structure
- framers.io ↔ steelstud.ca ↔ drywallers.io
- All link to: buildershaus.com, estimators.io

### Trade Cluster 2 — Exterior
- roofers.io ↔ hardscapes.io ↔ arborists.io
- All link to: buildershaus.com, estimators.io

### Trade Cluster 3 — Mechanical
- plumbers.ltd ↔ gasfitter.io
- Both link to: buildershaus.com, estimators.io

### Trade Cluster 4 — End of Life / Prep
- demolition.io → framers.io → drywallers.io (project lifecycle flow)

### Wedding Cluster
- weddings.io → brides.ltd, grooms.ltd, parents.ltd (ecosystem articles ✅ done)
- weddingsaas.com ↔ weddings.io (sister site references)

---

## SCHEMA STRATEGY (No Duplicate Content)

Each site uses a DIFFERENT schema type to signal distinct entity:
- roofers.io → RoofingContractor
- plumbers.ltd / gasfitter.io → Plumber
- framers.io / demolition.io → GeneralContractor
- drywallers.io / hardscapes.io → HomeAndConstructionBusiness
- arborists.io → LocalBusiness
- estimators.io → ProfessionalService
- weddings.io → Organization + BlogPosting (per article)
- weddingsaas.com → SoftwareApplication

---

## PSEO CITY PAGE STRATEGY

Each trade site has 500-980 city pages at /areas/[city-slug]
- City pages already built into the React apps
- Target: "roofing contractor [city]", "plumber near [city]" etc.
- All city pages link to /marketing (BuildersHaus backlink)
- Estimators.io city pages: /estimate/[trade]/[city]

**Priority cities:** Vancouver, Surrey, Burnaby, Calgary, Edmonton, Toronto, Seattle, Portland, Los Angeles, Houston, Miami, Chicago, Boston, Atlanta

---

## LLM / AI SEARCH STRATEGY

Each site has llms.txt with:
- Entity name and canonical URL
- Parent org: BuildersHaus.com / Industry Army Marketing
- Trade description and service list
- City coverage
- Related network sites

Goal: Feed correct entity data to ChatGPT, Gemini, Perplexity, Claude

---

## PENDING TODOS

### Immediate
- [ ] Connect all trade domains in Vercel (see table above)
- [ ] Build brides.ltd, grooms.ltd, parents.ltd sites
- [ ] Add BuildersHaus marketing page to steelstud.ca and barriergates.ca
- [ ] Submit all sitemaps to Google Search Console

### Next Sprint
- [ ] fabricators.io — build and deploy
- [ ] painters.tv — deploy existing repo
- [ ] sparkys.tv — deploy existing repo
- [ ] interiordesigners.io — deploy existing repo
- [ ] plumbingdrianage.ca — deploy existing repo (check spelling)
- [ ] drywallers.org — connect domain to drywallers-io-site or separate build

### Future
- [ ] Guest post network activation (all sites have /guest-post)
- [ ] IndexNow bulk submission across all domains
- [ ] Google Business Profile for each trade vertical
- [ ] BuildersHaus directory listings for each trade site
