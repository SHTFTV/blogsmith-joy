// lib/vendors-with-moat.ts
// Enhanced vendor data with: aesthetic tags, Talc video URLs, squad partnerships

export const enhancedVendors = [
  // NEW YORK VENDORS
  {
    id: 'vendor-001',
    name: 'Elegant Weddings New York',
    city: 'New York',
    state: 'NY',
    country: 'US' as const,
    neighborhood: 'Manhattan',
    lat: 40.7580,
    lng: -73.9855,
    phone: '(212) 555-0123',
    email: 'info@elegantny.com',
    website: 'https://elegantny.com',
    description: 'Award-winning luxury wedding planner specializing in high-end celebrations. 18+ years coordinating multi-day ceremonies with meticulous attention to detail.',
    specializations: ['Hindu', 'Interfaith'],
    priceRange: { min: 5000, max: 15000 },
    yearsExperience: 18,
    rating: 4.9,
    reviewCount: 47,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    
    // ✨ MOAT: Aesthetic tags
    aesthetics: ['minimalist_gold', 'luxury_modern', 'classic_elegant'],
    
    // 🎥 MOAT: Talc video proof
    talcVideoUrl: 'https://talc.tv/venues/elegant-weddings-ny-event-001',
    portfolioVideos: [
      'https://talc.tv/weddings/elegant-ny-hindu-ceremony',
      'https://talc.tv/weddings/elegant-ny-interfaith-reception',
      'https://talc.tv/weddings/elegant-ny-mehendi'
    ],
    
    // 🤝 MOAT: Squad partnerships
    squadPartnerships: [
      {
        partnerId: 'vendor-002',
        partnerName: 'Wild Bloom Florist NYC',
        successRate: 92,
        jointPortfolioUrl: 'https://portfolio.elegantnd-wildblooom.com'
      },
      {
        partnerId: 'vendor-003',
        partnerName: 'Golden Hour Photography',
        successRate: 88
      }
    ]
  },

  {
    id: 'vendor-002',
    name: 'Wild Bloom Florist NYC',
    city: 'New York',
    state: 'NY',
    country: 'US' as const,
    neighborhood: 'Brooklyn',
    lat: 40.6782,
    lng: -73.9442,
    phone: '(718) 555-0456',
    email: 'hello@wildbloomplanter.com',
    website: 'https://wildbloomplanter.com',
    description: 'Luxury floral design specializing in organic, garden-style arrangements. We create immersive floral experiences that transform venues.',
    specializations: ['Hindu', 'Sikh', 'Interfaith'],
    priceRange: { min: 3000, max: 10000 },
    yearsExperience: 15,
    rating: 4.8,
    reviewCount: 52,
    services: ['Floral Design', 'Installation', 'Day-of Support', 'Custom Arrangements'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    
    aesthetics: ['boho_garden', 'garden_romantic', 'luxury_glamour'],
    
    talcVideoUrl: 'https://talc.tv/venues/wild-bloom-setup-video-001',
    portfolioVideos: [
      'https://talc.tv/weddings/wild-bloom-mandap-installation',
      'https://talc.tv/weddings/wild-bloom-mehendi-setup'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-001',
        partnerName: 'Elegant Weddings New York',
        successRate: 92,
        jointPortfolioUrl: 'https://portfolio.elegantnd-wildblooom.com'
      },
      {
        partnerId: 'vendor-004',
        partnerName: 'Maharani Catering',
        successRate: 85
      }
    ]
  },

  {
    id: 'vendor-003',
    name: 'Golden Hour Photography',
    city: 'New York',
    state: 'NY',
    country: 'US' as const,
    neighborhood: 'Queens',
    lat: 40.7282,
    lng: -73.7949,
    phone: '(347) 555-0789',
    email: 'book@goldenhourchoto.com',
    website: 'https://goldenhourchoto.com',
    description: 'Award-winning wedding photography capturing authentic moments. Specializing in Indian weddings with cultural understanding and artistic vision.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 4000, max: 12000 },
    yearsExperience: 16,
    rating: 4.9,
    reviewCount: 63,
    services: ['Full Coverage', 'Engagement Session', 'Album', 'Video Highlights'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    
    aesthetics: ['luxury_modern', 'cultural_vibrant', 'classic_elegant'],
    
    talcVideoUrl: 'https://talc.tv/photoshoot/golden-hour-highlight-reel',
    portfolioVideos: [
      'https://talc.tv/weddings/golden-hour-ceremony-edit',
      'https://talc.tv/weddings/golden-hour-reception-highlights'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-001',
        partnerName: 'Elegant Weddings New York',
        successRate: 88
      }
    ]
  },

  {
    id: 'vendor-004',
    name: 'Maharani Catering',
    city: 'New York',
    state: 'NY',
    country: 'US' as const,
    neighborhood: 'Jackson Heights',
    lat: 40.7564,
    lng: -73.8817,
    phone: '(718) 555-1011',
    email: 'events@maharanicatering.com',
    website: 'https://maharanicatering.com',
    description: 'Authentic Indian cuisine for weddings. Award-winning chefs creating custom menus honoring culinary traditions.',
    specializations: ['Hindu', 'Sikh', 'Muslim'],
    priceRange: { min: 8000, max: 18000 },
    yearsExperience: 20,
    rating: 4.9,
    reviewCount: 71,
    services: ['Full Catering', 'Menu Consulting', 'Setup & Service', 'Dessert Bar'],
    image: 'https://images.unsplash.com/photo-1511910849217-e8c5bfd4a486?w=400',
    
    aesthetics: ['cultural_vibrant', 'luxury_modern', 'temple_sacred'],
    
    talcVideoUrl: 'https://talc.tv/catering/maharani-plating-video',
    portfolioVideos: [
      'https://talc.tv/catering/maharani-lunch-service',
      'https://talc.tv/catering/maharani-dinner-setup'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-002',
        partnerName: 'Wild Bloom Florist NYC',
        successRate: 85
      }
    ]
  },

  // LOS ANGELES VENDORS
  {
    id: 'vendor-005',
    name: 'LA Luxury Weddings',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US' as const,
    neighborhood: 'Downtown LA',
    lat: 34.0522,
    lng: -118.2437,
    phone: '(213) 555-0123',
    email: 'hello@laluxuryweddings.com',
    website: 'https://laluxuryweddings.com',
    description: 'High-end wedding planning for celebrity-caliber events. Experience with A-list venues and celebrity clientele.',
    specializations: ['Hindu', 'Sikh'],
    priceRange: { min: 7000, max: 20000 },
    yearsExperience: 17,
    rating: 4.9,
    reviewCount: 41,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling'],
    image: 'https://images.unsplash.com/photo-1519221314046-80f2b9b373e2?w=400',
    
    aesthetics: ['luxury_glamour', 'luxury_modern', 'rooftop_skyline'],
    
    talcVideoUrl: 'https://talc.tv/venues/la-luxury-rooftop-event',
    portfolioVideos: [
      'https://talc.tv/weddings/la-luxury-ceremony',
      'https://talc.tv/weddings/la-luxury-reception'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-006',
        partnerName: 'LA Décor Studio',
        successRate: 90
      }
    ]
  },

  {
    id: 'vendor-006',
    name: 'LA Décor Studio',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US' as const,
    neighborhood: 'Beverly Hills',
    lat: 34.0736,
    lng: -118.4004,
    phone: '(424) 555-0456',
    email: 'design@ladecor.com',
    website: 'https://ladecor.com',
    description: 'Cutting-edge venue design and transformation. We turn any space into your dream wedding venue.',
    specializations: ['Hindu', 'Muslim', 'Interfaith'],
    priceRange: { min: 5000, max: 15000 },
    yearsExperience: 14,
    rating: 4.8,
    reviewCount: 38,
    services: ['Design Consultation', 'Full Décor', 'Installation', 'Day-of Management'],
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400',
    
    aesthetics: ['minimalist_gold', 'industrial_raw', 'luxury_modern'],
    
    talcVideoUrl: 'https://talc.tv/decor/la-decor-transformation-timelapse',
    portfolioVideos: [
      'https://talc.tv/weddings/la-decor-mandap',
      'https://talc.tv/weddings/la-decor-reception'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-005',
        partnerName: 'LA Luxury Weddings',
        successRate: 90
      }
    ]
  },

  // TORONTO VENDORS
  {
    id: 'vendor-007',
    name: 'Toronto Weddings by Ananya',
    city: 'Toronto',
    state: 'ON',
    country: 'CA' as const,
    neighborhood: 'Downtown Toronto',
    lat: 43.6629,
    lng: -79.3957,
    phone: '(416) 555-0123',
    email: 'ananya@torontoweddings.com',
    website: 'https://torontoweddings.com',
    description: 'Premier wedding planner for South Asian celebrations in GTA. 19+ years coordinating Hindu, Sikh, and Muslim ceremonies with cultural authenticity.',
    specializations: ['Hindu', 'Sikh', 'Muslim'],
    priceRange: { min: 4000, max: 12000 },
    yearsExperience: 19,
    rating: 4.9,
    reviewCount: 54,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    
    aesthetics: ['cultural_vibrant', 'luxury_modern', 'temple_sacred'],
    
    talcVideoUrl: 'https://talc.tv/venues/toronto-weddings-ananya-highlights',
    portfolioVideos: [
      'https://talc.tv/weddings/toronto-hindu-ceremony',
      'https://talc.tv/weddings/toronto-reception-highlights'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-008',
        partnerName: 'GTA Flowers & Florals',
        successRate: 94
      }
    ]
  },

  {
    id: 'vendor-008',
    name: 'GTA Flowers & Florals',
    city: 'Toronto',
    state: 'ON',
    country: 'CA' as const,
    neighborhood: 'Midtown Toronto',
    lat: 43.7315,
    lng: -79.3884,
    phone: '(647) 555-0456',
    email: 'hello@gtaflowers.com',
    website: 'https://gtaflowers.com',
    description: 'Award-winning floral design creating stunning arrangements for South Asian weddings. Specializing in mandap flowers and reception décor.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 3500, max: 11000 },
    yearsExperience: 16,
    rating: 4.8,
    reviewCount: 48,
    services: ['Floral Design', 'Installation', 'Day-of Support', 'Bridal Bouquet'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    
    aesthetics: ['boho_garden', 'garden_romantic', 'cultural_vibrant'],
    
    talcVideoUrl: 'https://talc.tv/florals/gta-flowers-installation',
    portfolioVideos: [
      'https://talc.tv/weddings/gta-flowers-mandap',
      'https://talc.tv/weddings/gta-flowers-reception'
    ],
    
    squadPartnerships: [
      {
        partnerId: 'vendor-007',
        partnerName: 'Toronto Weddings by Ananya',
        successRate: 94
      }
    ]
  },
];

// Helper: Get vendor with moat features
export function getEnhancedVendor(vendorId: string) {
  return enhancedVendors.find(v => v.id === vendorId);
}

// Helper: Get all vendors with moat features by city
export function getEnhancedVendorsByCity(city: string, state: string) {
  return enhancedVendors.filter(v => v.city === city && v.state === state);
}
