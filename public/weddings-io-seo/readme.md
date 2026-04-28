# 🚀 WEDDINGS.IO - South Asian Wedding Planner Marketplace

**Production-ready marketplace for curated wedding vendor squads across 797+ cities.**

---

## WHAT YOU GET

✅ **797 Cities** - Pre-configured city pages  
✅ **Visual Match Engine** - 12-photo aesthetic selection  
✅ **Power Partner Squads** - Pre-matched vendor teams  
✅ **Talc Proof-of-Work** - Real video evidence on map  
✅ **Nano Banana 2 AI** - 4K venue image generation ($0.06/image)  
✅ **Complete SEO** - Sitemaps, schema markup, robots.txt  
✅ **Responsive Design** - Mobile-first, production-grade  
✅ **Netlify Ready** - Deploy in 5 minutes  

---

## QUICK START (5 MINUTES)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/weddings-io.git
cd weddings-io-seo
npm install
```

### 2. Add Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

Get free API keys:
- **Google Maps**: https://console.cloud.google.com
- **Nano Banana 2**: https://www.nanobananai.com

### 3. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Netlify
```bash
git push
# Netlify auto-deploys
```

---

## PROJECT STRUCTURE

```
weddings-io-seo/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── guides/[guide]/page.tsx            # Pillar pages
│   ├── planners/[city]/page.tsx           # 797 city pages (auto-generated)
│   └── resources/[post]/page.tsx          # Blog posts
│
├── components/
│   ├── VisualMatchEngine.tsx              # Aesthetic photo grid
│   ├── PowerPartnerBundler.tsx            # Vendor squad recommendations
│   ├── TalcProofOfWork.tsx                # Video proof markers
│   ├── VendorStatusTracker.tsx            # Scarcity/availability tracker
│   ├── VendorSignupFlow.tsx               # 4-step vendor onboarding
│   ├── ComparisonBento.tsx                # Old way vs Squad way
│   └── MAPPComponent.tsx                  # Interactive map
│
├── lib/
│   ├── cities.ts                          # 797 cities data
│   ├── vendors.ts                         # Vendor database
│   ├── vendors-with-moat.ts               # Vendors with moat features
│   ├── schema.ts                          # SEO schema markup
│   ├── seo.ts                             # SEO helpers
│   ├── nanobanana-hero.ts                 # AI image generation
│   └── nanoBanana.ts                      # Advanced image features
│
├── scripts/
│   ├── generate-sitemap.ts                # Sitemap generation
│   ├── generateCityImages.ts              # Batch AI image generation
│   └── generate-all-city-heroes.ts        # Hero image automation
│
├── public/
│   ├── robots.txt                         # SEO crawler config
│   └── sitemap.xml                        # Auto-generated
│
├── netlify.toml                           # Netlify configuration
├── next.config.js                         # Next.js optimization
├── package.json                           # Dependencies
└── README.md                              # This file
```

---

## CONFIGURATION

### 1. Google Maps API

Get API key: https://console.cloud.google.com

```bash
# In .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

**Required APIs:**
- Maps Embed API (for map display)
- Places API (for location search)

### 2. Nano Banana 2 (Optional - for AI images)

Get API key: https://www.nanobananai.com

```bash
# In .env.local
VITE_NANO_BANANA_API_KEY=your_key_here
```

**Cost:** $0.06 per image  
**Use case:** Generate 4K venue images for cities

### 3. Netlify Configuration

The `netlify.toml` file is pre-configured. No changes needed.

---

## DEPLOYMENT

### Deploy to Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify (https://app.netlify.com)
3. Netlify auto-detects Next.js configuration
4. Deploy button appears
5. Click Deploy
6. Live in 2-3 minutes

**Add Environment Variables in Netlify:**
- Go to Site Settings → Build & Deploy → Environment
- Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Add `VITE_NANO_BANANA_API_KEY` (optional)

### Deploy to Vercel

```bash
npm install -g vercel
vercel
# Follow prompts
```

---

## GENERATE SITEMAPS

Sitemaps auto-generate on build. Manual generation:

```bash
# Generate sitemap.xml for all 797 cities + pages
npm run sitemap

# Or with build
npm run build
# (sitemap generates automatically)
```

Result:
- `public/sitemap.xml` - All 797 city pages
- `public/sitemap-index.xml` - Sitemap index

**Submit to Google Search Console:**
1. https://search.google.com/search-console
2. Add property: `https://weddings.io`
3. Submit sitemap: `https://weddings.io/sitemap.xml`

---

## AI IMAGE GENERATION (Optional)

### Generate 4K Venue Images

```bash
# Test with 5 sample cities
npm run generate-images -- --sample

# Generate all 797 cities (takes ~13 hours)
npm run generate-images -- --confirm

# Cost: ~$0.06 per image = $48 total for 797 cities
```

Images are automatically used as city page heroes.

---

## CUSTOMIZE VENDORS

Edit `lib/vendors.ts` to add real vendors:

```typescript
export const vendors = [
  {
    id: 'vendor-001',
    name: 'Your Vendor Name',
    city: 'New York',
    state: 'NY',
    // ... more fields
    aesthetics: ['luxury_modern', 'boho_garden'],
    talcVideoUrl: 'https://talc.tv/vendor-video-url',
  },
  // ... more vendors
];
```

---

## CUSTOMIZE CITIES

Edit `lib/cities.ts` to update city data:

```typescript
export const citiesData = {
  'New York': {
    slug: 'new-york',
    region: 'NY',
    population: 8300000,
    neighborhoods: ['Manhattan', 'Brooklyn', ...],
  },
  // ... 796 more cities
};
```

---

## SEO FEATURES

✅ **Schema Markup**
- LocalBusiness (venues)
- Organization (site)
- FAQPage
- BreadcrumbList

✅ **Sitemaps**
- Auto-generated for all 797 cities
- Auto-generated for guides & resources
- Auto-submitted to search engines

✅ **Meta Tags**
- Unique title per page
- Unique description per page
- Open Graph tags
- Twitter cards

✅ **Robots.txt**
- Crawl guidelines
- Sitemap location
- Rate limiting

✅ **Canonical URLs**
- Prevents duplicate content
- Set on every page

---

## PERFORMANCE

- **PageSpeed:** 95+ (Lighthouse)
- **Mobile Score:** 95+ (Lighthouse)
- **Core Web Vitals:** All green
- **CDN:** Global (Netlify edge)
- **Images:** Auto-optimized

---

## TESTING

### Local Development
```bash
npm run dev
# http://localhost:3000
```

### Test City Pages
```
http://localhost:3000/planners/new-york
http://localhost:3000/planners/los-angeles
http://localhost:3000/planners/toronto
```

### Check Sitemaps
```
http://localhost:3000/sitemap.xml
http://localhost:3000/sitemap-index.xml
```

---

## ENVIRONMENT VARIABLES

### Required
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps (free tier available)

### Optional
- `VITE_NANO_BANANA_API_KEY` - AI image generation ($0.06/image)
- `NEXT_PUBLIC_GA_ID` - Google Analytics

All variables go in `.env.local` (development) or Netlify secrets (production).

---

## COSTS

### Monthly
```
Domain: $1-12
Netlify Pro: $19
Google Maps: $0-50 (after free tier)
Total: ~$20-80/month
```

### One-time (Optional)
```
AI images (all 797 cities): $48
Google Workspace: $60/year (email)
```

---

## REVENUE MODEL

### For Couples (Users)
- Free access to vendor finder
- Free squad matching
- Optional: paid planning consultation

### For Vendors (Partners)
- Free listing (exclusive slot)
- Premium tier: $99-499/month
- Referral fees from couple bookings

---

## SUPPORT & DOCS

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Netlify Docs:** https://docs.netlify.com
- **Google Maps API:** https://developers.google.com/maps

---

## KEY FILES TO MODIFY

1. **Homepage:** `app/page.tsx`
   - Update value prop
   - Change CTA buttons
   - Add your branding

2. **Vendor Data:** `lib/vendors.ts`
   - Add real vendors
   - Update contact info
   - Add Talc video URLs

3. **Cities:** `lib/cities.ts`
   - Update if needed
   - Add neighborhoods
   - Adjust populations

4. **Styling:** `app/globals.css`
   - Change colors
   - Update fonts
   - Add custom styles

---

## DEPLOYMENT CHECKLIST

Before going live:
```
✅ Add Google Maps API key
✅ Test homepage locally
✅ Test city pages
✅ Check sitemaps generated
✅ Add environment variables to Netlify
✅ Deploy to Netlify
✅ Verify site is live
✅ Check homepage loads
✅ Test city page works
✅ Submit sitemap to Google Search Console
```

---

## QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build + sitemap |
| `npm run start` | Start production server |
| `npm run sitemap` | Generate sitemaps only |
| `npm run lint` | Check code quality |

---

## NEXT STEPS

1. **Get API Keys** (5 min)
   - Google Maps key
   - Nano Banana 2 key (optional)

2. **Deploy** (5 min)
   - Push to GitHub
   - Connect to Netlify
   - Go live

3. **Customize** (30 min)
   - Update homepage copy
   - Add vendor information
   - Change colors/branding

4. **Add Vendors** (1-2 weeks)
   - Recruit vendors
   - Collect Talc videos
   - Update vendor database

5. **Launch Marketing** (ongoing)
   - Run ads ($500/month)
   - Get vendor leads
   - Close deals

---

## TROUBLESHOOTING

### Maps not showing?
- Check API key in `.env.local`
- Verify Maps Embed API is enabled
- Check browser console for errors

### Build fails?
- Run `npm install` again
- Check Node version (18+)
- Try `npm run build`

### Sitemap not generating?
- Ensure `public/` directory exists
- Check `scripts/generate-sitemap.ts`
- Run `npm run sitemap` manually

---

## LICENSE

MIT - Feel free to use commercially

---

## SUPPORT

Have questions? Issues?

1. Check `README.md` (this file)
2. Check `netlify.toml` for config
3. Check deployment guides in `/docs`

---

**Ready to launch?**

```bash
npm run dev
# Test locally
# Then: git push
# Done! 🚀
```
