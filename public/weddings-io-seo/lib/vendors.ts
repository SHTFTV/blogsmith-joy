// lib/vendors.ts
// Comprehensive vendor database with all wedding planners by city

export interface Vendor {
  id: string;
  name: string;
  city: string;
  state: string;
  country: 'US' | 'CA';
  neighborhood: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  description: string;
  specializations: string[]; // ['Hindu', 'Sikh', 'Muslim', 'Interfaith']
  priceRange: {
    min: number;
    max: number;
  };
  yearsExperience: number;
  rating: number; // 1-5
  reviewCount: number;
  services: string[]; // ['Full Planning', 'Day-of Coordination', etc]
  image: string; // URL to vendor image
  certifications?: string[];
  
  // ✨ VISUAL MATCH ENGINE: Aesthetic Tags
  aesthetics: string[]; // ['minimalist_gold', 'industrial_raw', 'boho_garden', 'luxury_modern', 'classic_elegant']
  
  // 🎥 PROOF-OF-WORK: Talc Videos
  talcVideoUrl?: string; // Primary proof video
  portfolioVideos?: string[]; // Multiple event videos
  
  // 🤝 POWER PARTNER: Squad Bundling
  squadPartnerships?: {
    partnerId: string;
    partnerName: string;
    jointPortfolioUrl?: string;
    successRate?: number;
  }[];
}

// Sample vendor data - you would expand this with all your vendors
export const vendors: Vendor[] = [
  // NEW YORK
  {
    id: 'vendor-001',
    name: 'Elegant Weddings New York',
    city: 'New York',
    state: 'NY',
    country: 'US',
    neighborhood: 'Manhattan',
    lat: 40.7580,
    lng: -73.9855,
    phone: '(212) 555-0123',
    email: 'info@elegantny.com',
    website: 'https://elegantny.com',
    description: 'Award-winning wedding planner specializing in luxury South Asian celebrations. 18+ years experience coordinating multi-day ceremonies with meticulous attention to detail.',
    specializations: ['Hindu', 'Interfaith'],
    priceRange: { min: 5000, max: 15000 },
    yearsExperience: 18,
    rating: 4.9,
    reviewCount: 47,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'vendor-002',
    name: 'New York South Asian Events',
    city: 'New York',
    state: 'NY',
    country: 'US',
    neighborhood: 'Brooklyn',
    lat: 40.6782,
    lng: -73.9442,
    phone: '(718) 555-0456',
    email: 'info@nyasianevents.com',
    website: 'https://nyasianevents.com',
    description: 'Specializing in Hindu, Sikh, and interfaith ceremonies. Expert in managing 100+ vendor logistics across NYC venues. Known for seamless coordination and cultural authenticity.',
    specializations: ['Hindu', 'Sikh', 'Interfaith'],
    priceRange: { min: 4000, max: 12000 },
    yearsExperience: 15,
    rating: 4.8,
    reviewCount: 52,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'vendor-003',
    name: 'Mehendi to Memories NYC',
    city: 'New York',
    state: 'NY',
    country: 'US',
    neighborhood: 'Queens',
    lat: 40.7282,
    lng: -73.7949,
    phone: '(347) 555-0789',
    email: 'info@mehendinyc.com',
    website: 'https://mehendinyc.com',
    description: 'Full-service wedding planning with focus on luxury celebrations. Extensive vendor network and in-depth knowledge of NY venues. Specializes in creating unforgettable multi-day events.',
    specializations: ['Hindu', 'Muslim', 'Sikh', 'Interfaith'],
    priceRange: { min: 6000, max: 18000 },
    yearsExperience: 20,
    rating: 4.9,
    reviewCount: 63,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },

  // LOS ANGELES
  {
    id: 'vendor-004',
    name: 'Elegant Weddings Los Angeles',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    neighborhood: 'Downtown LA',
    lat: 34.0522,
    lng: -118.2437,
    phone: '(213) 555-0123',
    email: 'info@elegantla.com',
    website: 'https://elegantla.com',
    description: 'Luxury wedding planning for South Asian celebrations. Experienced with high-profile clients and celebrity events. Known for flawless execution and creative vision.',
    specializations: ['Hindu', 'Sikh'],
    priceRange: { min: 7000, max: 20000 },
    yearsExperience: 17,
    rating: 4.9,
    reviewCount: 41,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'vendor-005',
    name: 'LA South Asian Weddings',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    neighborhood: 'Beverly Hills',
    lat: 34.0736,
    lng: -118.4004,
    phone: '(424) 555-0456',
    email: 'info@lasouthasia.com',
    website: 'https://lasouthasia.com',
    description: 'Expert planners for Hindu, Muslim, and interfaith weddings. Deep understanding of cultural ceremonies combined with modern event management.',
    specializations: ['Hindu', 'Muslim', 'Interfaith'],
    priceRange: { min: 5000, max: 15000 },
    yearsExperience: 14,
    rating: 4.8,
    reviewCount: 38,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'vendor-006',
    name: 'Mehendi Celebrations LA',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    neighborhood: 'Pasadena',
    lat: 34.1478,
    lng: -118.1445,
    phone: '(626) 555-0789',
    email: 'info@mehendila.com',
    website: 'https://mehendila.com',
    description: 'Dedicated to creating magical South Asian weddings. Specializes in Sikh and interfaith ceremonies. Vendor network includes premiere LA and Southern California venues.',
    specializations: ['Sikh', 'Hindu', 'Interfaith'],
    priceRange: { min: 6000, max: 16000 },
    yearsExperience: 16,
    rating: 4.9,
    reviewCount: 45,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },

  // TORONTO
  {
    id: 'vendor-007',
    name: 'Elegant Weddings Toronto',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    neighborhood: 'Downtown Toronto',
    lat: 43.6629,
    lng: -79.3957,
    phone: '(416) 555-0123',
    email: 'info@elegantto.com',
    website: 'https://elegantto.com',
    description: 'Premier wedding planners for South Asian celebrations in Toronto and GTA. 19+ years coordinating Hindu, Sikh, and Muslim ceremonies with cultural authenticity.',
    specializations: ['Hindu', 'Sikh', 'Muslim'],
    priceRange: { min: 4000, max: 12000 },
    yearsExperience: 19,
    rating: 4.9,
    reviewCount: 54,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'vendor-008',
    name: 'Toronto South Asian Events',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    neighborhood: 'Midtown Toronto',
    lat: 43.7315,
    lng: -79.3884,
    phone: '(647) 555-0456',
    email: 'info@toasianevents.com',
    website: 'https://toasianevents.com',
    description: 'Specializing in all types of South Asian weddings. Expert knowledge of Toronto venues, caterers, and vendors. Seamless coordination from engagement to reception.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 3500, max: 11000 },
    yearsExperience: 16,
    rating: 4.8,
    reviewCount: 48,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'vendor-009',
    name: 'Mehendi Memories Toronto',
    city: 'Toronto',
    state: 'ON',
    country: 'CA',
    neighborhood: 'Brampton',
    lat: 43.7315,
    lng: -79.7624,
    phone: '(905) 555-0789',
    email: 'info@mehendito.com',
    website: 'https://mehendito.com',
    description: 'Full-service wedding planning with emphasis on luxury and cultural celebration. Largest vendor network in GTA. Experienced with weddings of all sizes and traditions.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 4500, max: 13000 },
    yearsExperience: 18,
    rating: 4.9,
    reviewCount: 59,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },

  // VANCOUVER
  {
    id: 'vendor-010',
    name: 'Elegant Weddings Vancouver',
    city: 'Vancouver',
    state: 'BC',
    country: 'CA',
    neighborhood: 'Downtown Vancouver',
    lat: 49.2827,
    lng: -123.1207,
    phone: '(604) 555-0123',
    email: 'info@elegantvancouver.com',
    website: 'https://elegantvancouver.com',
    description: 'Award-winning South Asian wedding planners. Specializing in Hindu, Sikh, and interfaith ceremonies across BC. Known for stunning venues and impeccable coordination.',
    specializations: ['Hindu', 'Sikh', 'Interfaith'],
    priceRange: { min: 4000, max: 12000 },
    yearsExperience: 17,
    rating: 4.9,
    reviewCount: 51,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'vendor-011',
    name: 'Vancouver South Asian Weddings',
    city: 'Vancouver',
    state: 'BC',
    country: 'CA',
    neighborhood: 'Kitsilano',
    lat: 49.2735,
    lng: -123.1631,
    phone: '(604) 555-0456',
    email: 'info@vansouthasia.com',
    website: 'https://vansouthasia.com',
    description: 'Dedicated to creating memorable South Asian celebrations. Expert in Hindu, Sikh, Muslim, and multicultural ceremonies. Extensive network of Vancouver and BC vendors.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 3500, max: 11000 },
    yearsExperience: 14,
    rating: 4.8,
    reviewCount: 43,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'vendor-012',
    name: 'Mehendi to Memories Vancouver',
    city: 'Vancouver',
    state: 'BC',
    country: 'CA',
    neighborhood: 'West Vancouver',
    lat: 49.3270,
    lng: -123.1663,
    phone: '(604) 555-0789',
    email: 'info@mehendivancouver.com',
    website: 'https://mehendivancouver.com',
    description: 'Full-service luxury wedding planning for South Asian celebrations. Specializes in creating flawless multi-day events. Vendor relationships across Western Canada.',
    specializations: ['Hindu', 'Sikh', 'Muslim', 'Interfaith'],
    priceRange: { min: 5000, max: 14000 },
    yearsExperience: 19,
    rating: 4.9,
    reviewCount: 56,
    services: ['Full Wedding Planning', 'Day-of Coordination', 'Vendor Curation', 'Décor & Styling', 'Catering Coordination', 'Logistics Management'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
];

// Helper function to get vendors by city
export function getVendorsByCity(city: string, state?: string): Vendor[] {
  return vendors.filter(v => 
    v.city.toLowerCase() === city.toLowerCase() && 
    (!state || v.state === state)
  );
}

// Helper function to get vendors by specialization
export function getVendorsBySpecialization(specialization: string): Vendor[] {
  return vendors.filter(v => 
    v.specializations.some(s => s.toLowerCase() === specialization.toLowerCase())
  );
}

// Helper function to get top-rated vendors
export function getTopVendors(limit: number = 3): Vendor[] {
  return vendors
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, limit);
}

// Helper function to get vendors within price range
export function getVendorsByPriceRange(minPrice: number, maxPrice: number): Vendor[] {
  return vendors.filter(v => 
    !(v.priceRange.max < minPrice || v.priceRange.min > maxPrice)
  );
}

// Helper function to get vendors near coordinates (by distance)
export function getVendorsNearby(lat: number, lng: number, radiusKm: number = 25): Vendor[] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  return vendors.filter(v => {
    const dLat = toRad(v.lat - lat);
    const dLng = toRad(v.lng - lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(v.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance <= radiusKm;
  });
}

// Function to add new vendor (you can call this to populate database)
export function addVendor(vendor: Vendor): void {
  // In production, this would save to database
  vendors.push(vendor);
}

export const TOTAL_VENDORS = vendors.length;
