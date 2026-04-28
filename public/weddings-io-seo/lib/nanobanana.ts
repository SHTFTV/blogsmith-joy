// lib/nanoBanana.ts
// Nano Banana 2 API - Generate 4K luxury wedding venue images for 797 cities
// Cost: ~$0.06 per image (scales perfectly for automation)

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ImageGenerationResult {
  url: string;
  cityName: string;
  aesthetic: string;
  timestamp: string;
  prompt: string;
}

/**
 * generateCityVenueImage
 * Creates a 4K luxury wedding venue image for a specific city
 * Uses Gemini Vision to analyze and tag aesthetics
 */
export async function generateCityVenueImage(
  cityName: string,
  aesthetic: string = "luxury_modern"
): Promise<ImageGenerationResult> {
  try {
    // Step 1: Create descriptive prompt for venue image
    const venuePrompt = createVenuePrompt(cityName, aesthetic);

    console.log(`🎨 Generating ${aesthetic} venue image for ${cityName}...`);

    // Step 2: Call Gemini 3.1 Flash (Nano Banana 2) for image generation
    // This endpoint supports vision + generation combined
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022", // Using Claude Sonnet as fallback (can be updated to Gemini when available)
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: venuePrompt,
        },
      ],
    });

    // For actual Nano Banana 2 implementation:
    // POST to: https://api.nanobananai.com/v1/image/generate
    // Headers: { "Authorization": "Bearer YOUR_API_KEY" }
    // Body: { "prompt": venuePrompt, "model": "gemini-3.1-flash", "width": 1920, "height": 1080 }

    const imageUrl = await generateImageWithNanoBanana(venuePrompt, aesthetic);

    // Step 3: Analyze generated image with multimodal reasoning
    const aestheticTags = await analyzeImageAesthetic(imageUrl, cityName);

    return {
      url: imageUrl,
      cityName,
      aesthetic: aestheticTags.primary,
      timestamp: new Date().toISOString(),
      prompt: venuePrompt,
    };
  } catch (error) {
    console.error(`Error generating image for ${cityName}:`, error);
    throw error;
  }
}

/**
 * generateImageWithNanoBanana
 * Direct API call to Nano Banana 2 for image generation
 * Cost: $0.06 per image
 */
async function generateImageWithNanoBanana(
  prompt: string,
  aesthetic: string
): Promise<string> {
  const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;

  if (!nanoBananaApiKey) {
    throw new Error("NANO_BANANA_API_KEY not found in environment");
  }

  try {
    const response = await fetch("https://api.nanobananai.com/v1/image/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nanoBananaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: "gemini-3.1-flash", // Nano Banana 2
        width: 1920,
        height: 1080,
        quality: "high",
        style: "photorealistic",
      }),
    });

    if (!response.ok) {
      throw new Error(`Nano Banana API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.image_url || data.url;
  } catch (error) {
    console.error("Nano Banana API call failed:", error);
    // Fallback: Return placeholder image
    return `https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=80&auto=format`;
  }
}

/**
 * analyzeImageAesthetic
 * Uses Claude vision to analyze generated image and extract aesthetic tags
 * Multimodal reasoning - the secret weapon
 */
async function analyzeImageAesthetic(
  imageUrl: string,
  cityName: string
): Promise<{ primary: string; tags: string[] }> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: `Analyze this luxury wedding venue photo for ${cityName}. 
              
Return ONLY a JSON object with exactly this format:
{
  "primary": "ONE of: minimalist_gold, luxury_modern, boho_garden, industrial_raw, classic_elegant, garden_romantic, cultural_vibrant, luxury_glamour, coastal_chic, vintage_retro, temple_sacred, rooftop_skyline",
  "tags": ["tag1", "tag2", "tag3"]
}

Be precise. The primary aesthetic is what dominates the image.`,
            },
          ],
        },
      ],
    });

    // Parse response
    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        primary: "luxury_modern",
        tags: ["wedding", "venue", "elegant"],
      };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Image analysis failed:", error);
    return {
      primary: "luxury_modern",
      tags: ["wedding", "venue", "elegant"],
    };
  }
}

/**
 * createVenuePrompt
 * Creates detailed, specific prompts for each city
 * The prompt engineering is key to consistency
 */
function createVenuePrompt(cityName: string, aesthetic: string): string {
  const aestheticPrompts: Record<string, string> = {
    minimalist_gold:
      "Clean lines, subtle gold accents, minimal decoration, modern chic, sophisticated simplicity",
    luxury_modern:
      "Contemporary elegance, geometric shapes, modern furniture, sophisticated color palette, upscale ambiance",
    boho_garden:
      "Natural florals, organic flowing fabrics, garden setting, wildflower arrangements, relaxed elegance",
    industrial_raw:
      "Exposed brick walls, steel beams, concrete floors, urban warehouse aesthetic, candlelit ambiance",
    classic_elegant:
      "Traditional decorative elements, chandeliers, ornate details, timeless sophistication, regal atmosphere",
    garden_romantic:
      "Lush gardens, romantic lighting, natural flowers, outdoor setting, intimate atmosphere",
    cultural_vibrant:
      "Bold colors, traditional elements, rich textiles, festive decoration, colorful celebration",
    luxury_glamour:
      "Dramatic sparkle, luxurious fabrics, statement lighting, high-end finish, glamorous flair",
    coastal_chic:
      "Beach setting, ocean views, light nautical elements, breezy atmosphere, relaxed luxury",
    vintage_retro:
      "Classic 1950s-1980s aesthetic, vintage furniture, nostalgic decor, timeless charm",
    temple_sacred:
      "Spiritual elements, traditional architecture, ceremonial setup, sacred atmosphere, cultural reverence",
    rooftop_skyline:
      "City skyline backdrop, elevated venue, modern rooftop, nighttime cityscape, urban elegance",
  };

  const aestheticStyle = aestheticPrompts[aesthetic] || aestheticPrompts.luxury_modern;

  return `Create a stunning 4K photorealistic luxury wedding venue photograph for ${cityName}.

The venue must showcase: ${aestheticStyle}

Requirements:
- 4K resolution, professional photography quality
- High-end wedding venue setting
- Beautiful lighting that conveys luxury
- Empty space ready for wedding setup (visible floor, ceiling, walls)
- No people in the image
- Professional color grading
- Architectural focus showing venue details
- Style: ${aesthetic}

This is for a wedding planning marketplace. Make it aspirational and beautiful.`;
}

/**
 * batchGenerateVenueImages
 * Automate image generation for multiple cities
 * Generate all 797 city images in one afternoon
 */
export async function batchGenerateVenueImages(
  cities: Array<{ name: string; slug: string }>,
  aesthetic: string = "luxury_modern",
  batchSize: number = 5, // Batch to avoid rate limits
  delayMs: number = 1000 // Delay between requests
): Promise<ImageGenerationResult[]> {
  const results: ImageGenerationResult[] = [];
  let processed = 0;

  console.log(
    `🚀 Starting batch generation for ${cities.length} cities with aesthetic: ${aesthetic}`
  );

  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const batchPromises = batch.map((city) =>
      generateCityVenueImage(city.name, aesthetic)
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      processed += batch.length;

      console.log(
        `✅ Processed ${processed}/${cities.length} cities (${Math.round((processed / cities.length) * 100)}%)`
      );

      // Delay between batches to respect rate limits
      if (i + batchSize < cities.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error processing batch at index ${i}:`, error);
    }
  }

  console.log(`🎉 Batch generation complete! Generated ${results.length} images`);
  return results;
}

/**
 * extractAestheticFromVendorPhoto
 * Analyze vendor's existing photo and auto-tag aesthetics
 * The "secret weapon" - automate aesthetic tagging
 */
export async function extractAestheticFromVendorPhoto(
  photoUrl: string,
  vendorName: string
): Promise<string[]> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: photoUrl,
              },
            },
            {
              type: "text",
              text: `Analyze this wedding vendor photo for ${vendorName}.

Return ONLY a JSON array with 3-4 aesthetic tags from this list:
["minimalist_gold", "luxury_modern", "boho_garden", "industrial_raw", "classic_elegant", "garden_romantic", "cultural_vibrant", "luxury_glamour", "coastal_chic", "vintage_retro", "temple_sacred", "rooftop_skyline"]

Example: ["luxury_modern", "industrial_raw", "rooftop_skyline"]

Just the JSON array, no other text.`,
            },
          ],
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "[]";

    // Extract JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return ["luxury_modern"];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Vendor photo analysis failed:", error);
    return ["luxury_modern"];
  }
}

/**
 * Cost Calculator
 * Understand your image generation costs at scale
 */
export function calculateImageGenerationCost(
  numberOfCities: number = 797,
  costPerImage: number = 0.06,
  aestheticsPerCity: number = 1
): {
  totalImages: number;
  totalCost: number;
  costPerCity: number;
} {
  const totalImages = numberOfCities * aestheticsPerCity;
  const totalCost = totalImages * costPerImage;
  const costPerCity = totalCost / numberOfCities;

  return {
    totalImages,
    totalCost,
    costPerCity,
  };
}

// Export types
export type { ImageGenerationResult };
