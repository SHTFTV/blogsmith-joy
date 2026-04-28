// lib/nanobanana-hero.ts
// 🎨 Nano Banana 2 API - Generate 4K luxury wedding venue hero images
// Direct integration with Replit VITE_GOOGLE_AI_API_KEY
// Cost: $0.06 per image | Time: 30-60 seconds per image

/**
 * generateCityHero
 * 
 * Creates a stunning 4K hero image for any wedding planner city page
 * 
 * Example:
 * const imageUrl = await generateCityHero('New York');
 * const imageUrl = await generateCityHero('Toronto', 'boho_garden');
 * 
 * Returns: URL to the generated image (ready to display)
 */

interface CityHeroResult {
  url: string;
  cityName: string;
  aesthetic: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export async function generateCityHero(
  cityName: string,
  aesthetic: string = 'luxury_modern'
): Promise<CityHeroResult> {
  const apiKey = import.meta.env.VITE_NANO_BANANA_API_KEY || 
                 process.env.NANO_BANANA_API_KEY ||
                 import.meta.env.VITE_GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ No API key found. Add VITE_NANO_BANANA_API_KEY to .env.local');
    return {
      url: `https://images.unsplash.com/photo-1519721260643-ab7093ab2a73?w=1920&q=80`,
      cityName,
      aesthetic,
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'API key not configured',
    };
  }

  const prompt = createHeroPrompt(cityName, aesthetic);

  try {
    console.log(`🎨 Generating hero image for ${cityName} (${aesthetic})...`);

    // Call Nano Banana 2 API
    const response = await fetch('https://api.nanobananai.com/v1/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemini-3.1-flash', // Nano Banana 2
        width: 1920,
        height: 1080,
        quality: 'hd',
        style: 'photorealistic',
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.image_url || data.url;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    console.log(`✅ Generated: ${imageUrl.substring(0, 50)}...`);

    return {
      url: imageUrl,
      cityName,
      aesthetic,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
  } catch (error) {
    console.error(`❌ Failed to generate image for ${cityName}:`, error);

    // Fallback to high-quality Unsplash image
    const fallbackUrl = getFallbackImage(aesthetic);

    return {
      url: fallbackUrl,
      cityName,
      aesthetic,
      timestamp: new Date().toISOString(),
      status: 'error',
      error: String(error),
    };
  }
}

/**
 * createHeroPrompt
 * 
 * Generates optimized prompts for each aesthetic
 * The prompt is the key to consistent, beautiful results
 */
function createHeroPrompt(cityName: string, aesthetic: string): string {
  const aestheticDescriptions: Record<string, string> = {
    minimalist_gold:
      'Sleek minimalist wedding venue with subtle gold accents, clean white walls, polished concrete floors, statement lighting, luxury minimalism',
    
    luxury_modern:
      'Ultra-modern luxury wedding venue with contemporary design, geometric architecture, glass and steel elements, sophisticated ambiance, high-end finishes',
    
    boho_garden:
      'Bohemian garden wedding venue with lush florals, organic flowing fabrics, natural outdoor setting, wildflowers, romantic botanical atmosphere',
    
    industrial_raw:
      'Industrial chic wedding venue with exposed brick walls, steel beams, concrete columns, candlelit atmosphere, urban warehouse aesthetic',
    
    classic_elegant:
      'Classic elegant wedding ballroom with ornate chandeliers, grand architecture, timeless sophisticated decor, regal atmosphere, traditional elegance',
    
    garden_romantic:
      'Romantic garden wedding venue with lush landscaping, intimate lighting, natural flowers, outdoor elegance, evening garden ambiance',
    
    cultural_vibrant:
      'Vibrant cultural wedding venue with bold rich colors, traditional architectural elements, festive decoration, colorful celebration space',
    
    luxury_glamour:
      'Glamorous luxury wedding venue with dramatic sparkle, luxurious fabrics, statement lighting fixtures, high-end finish, dramatic elegance',
    
    coastal_chic:
      'Coastal chic wedding venue with ocean views, beach aesthetic, light nautical elements, breezy atmosphere, relaxed luxury by water',
    
    vintage_retro:
      'Vintage wedding venue with 1950s-1980s aesthetic, classic furniture, nostalgic decor, retro color palette, timeless charm',
    
    temple_sacred:
      'Sacred temple-style wedding venue with traditional architectural elements, spiritual atmosphere, ceremonial setup, cultural reverence',
    
    rooftop_skyline:
      'Rooftop wedding venue with dramatic city skyline backdrop, elevated modern space, nighttime urban ambiance, contemporary rooftop elegance',
  };

  const description = aestheticDescriptions[aesthetic] || aestheticDescriptions.luxury_modern;

  return `Generate a stunning, professional 4K wedding venue photograph for ${cityName}.

Venue Description: ${description}

Requirements:
- Ultra-high resolution (1920x1080, 4K quality)
- Professional photography quality
- Dramatic, beautiful lighting that conveys luxury
- Empty venue ready for wedding setup (clear floor and walls visible)
- No people in the image
- Professional color grading and contrast
- Shows architectural beauty and venue details
- Aspirational and magazine-quality
- Style: ${aesthetic}

This image will be the hero banner for a wedding planner marketplace. Make it stunning and inspiring.`;
}

/**
 * getFallbackImage
 * 
 * Returns high-quality Unsplash fallback images if API fails
 * Ensures site always looks good even if image generation fails
 */
function getFallbackImage(aesthetic: string): string {
  const fallbacks: Record<string, string> = {
    minimalist_gold:
      'https://images.unsplash.com/photo-1519721260643-ab7093ab2a73?w=1920&q=80&auto=format',
    luxury_modern:
      'https://images.unsplash.com/photo-1519221314046-80f2b9b373e2?w=1920&q=80&auto=format',
    boho_garden:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&q=80&auto=format',
    industrial_raw:
      'https://images.unsplash.com/photo-1519167758993-e67d6dcd9d63?w=1920&q=80&auto=format',
    classic_elegant:
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&q=80&auto=format',
    garden_romantic:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80&auto=format',
    cultural_vibrant:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=80&auto=format',
    luxury_glamour:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1920&q=80&auto=format',
    coastal_chic:
      'https://images.unsplash.com/photo-1519915212116-7cfef71f1d4e?w=1920&q=80&auto=format',
    vintage_retro:
      'https://images.unsplash.com/photo-1465495976519-61d271a8eed7?w=1920&q=80&auto=format',
    temple_sacred:
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&q=80&auto=format',
    rooftop_skyline:
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=80&auto=format',
  };

  return fallbacks[aesthetic] || fallbacks.luxury_modern;
}

/**
 * generateMultipleCityHeroes
 * 
 * Generate hero images for multiple cities
 * Perfect for batch processing
 * 
 * Example:
 * const results = await generateMultipleCityHeroes(
 *   ['New York', 'Los Angeles', 'Toronto'],
 *   'luxury_modern',
 *   1000  // 1 second delay between requests
 * );
 */
export async function generateMultipleCityHeroes(
  cities: string[],
  aesthetic: string = 'luxury_modern',
  delayMs: number = 1000
): Promise<CityHeroResult[]> {
  const results: CityHeroResult[] = [];

  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const result = await generateCityHero(city, aesthetic);
    results.push(result);

    // Progress
    console.log(`[${i + 1}/${cities.length}] ${city}`);

    // Delay between requests to avoid rate limiting
    if (i < cities.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * analyzeVendorPhotoAesthetic
 * 
 * Uses vision API to analyze a vendor's photo and extract aesthetic tags
 * Automates aesthetic categorization
 * 
 * Example:
 * const aesthetics = await analyzeVendorPhotoAesthetic(
 *   'https://vendor-photo-url.com/image.jpg',
 *   'John\'s Photography'
 * );
 * // Returns: ['luxury_modern', 'industrial_raw', 'rooftop_skyline']
 */
export async function analyzeVendorPhotoAesthetic(
  photoUrl: string,
  vendorName: string
): Promise<string[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY ||
                 import.meta.env.VITE_NANO_BANANA_API_KEY ||
                 process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ No API key for vision analysis');
    return ['luxury_modern'];
  }

  try {
    console.log(`🔍 Analyzing aesthetic for ${vendorName}...`);

    // Use Google's Vision API or similar multimodal endpoint
    const response = await fetch('https://api.nanobananai.com/v1/vision/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: photoUrl,
        prompt: `Analyze this wedding venue/vendor photo for ${vendorName}.
        
        Return ONLY a JSON array with 3-4 aesthetic tags from this exact list:
        ["minimalist_gold", "luxury_modern", "boho_garden", "industrial_raw", "classic_elegant", "garden_romantic", "cultural_vibrant", "luxury_glamour", "coastal_chic", "vintage_retro", "temple_sacred", "rooftop_skyline"]
        
        Example output: ["luxury_modern", "industrial_raw", "rooftop_skyline"]
        
        Just the JSON array, no other text.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.result || data.text || '["luxury_modern"]';

    // Parse JSON array from response
    const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ['luxury_modern'];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`❌ Vision analysis failed for ${vendorName}:`, error);
    return ['luxury_modern'];
  }
}

/**
 * CityHeroCache
 * 
 * Simple in-memory cache to avoid regenerating the same images
 * Saves API calls and money
 */
class CityHeroCache {
  private cache = new Map<string, CityHeroResult>();

  get(cityName: string, aesthetic: string): CityHeroResult | undefined {
    return this.cache.get(`${cityName}:${aesthetic}`);
  }

  set(result: CityHeroResult): void {
    this.cache.set(`${result.cityName}:${result.aesthetic}`, result);
  }

  has(cityName: string, aesthetic: string): boolean {
    return this.cache.has(`${cityName}:${aesthetic}`);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const heroCache = new CityHeroCache();

/**
 * generateCityHeroWithCache
 * 
 * Smart wrapper that checks cache before generating
 * Saves money and API calls
 */
export async function generateCityHeroWithCache(
  cityName: string,
  aesthetic: string = 'luxury_modern'
): Promise<CityHeroResult> {
  // Check cache first
  if (heroCache.has(cityName, aesthetic)) {
    console.log(`✅ Cache hit: ${cityName} (${aesthetic})`);
    return heroCache.get(cityName, aesthetic)!;
  }

  // Generate if not in cache
  const result = await generateCityHero(cityName, aesthetic);

  // Store in cache
  if (result.status === 'success') {
    heroCache.set(result);
  }

  return result;
}

/**
 * calculateImageGenerationCost
 * 
 * Quick cost calculator for image generation at scale
 */
export function calculateImageGenerationCost(
  numberOfCities: number,
  costPerImage: number = 0.06
): {
  totalImages: number;
  totalCost: number;
  costPerCity: number;
  estimatedMinutes: number;
} {
  const totalCost = numberOfCities * costPerImage;
  const costPerCity = totalCost / numberOfCities;
  const estimatedMinutes = numberOfCities * 1; // ~1 minute per image with batching

  return {
    totalImages: numberOfCities,
    totalCost,
    costPerCity,
    estimatedMinutes,
  };
}

// Export types
export type { CityHeroResult };
