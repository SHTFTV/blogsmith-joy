// Example: How to use generateCityHero in your city pages
// app/planners/[city]/page-with-hero.tsx

'use client';

import { useEffect, useState } from 'react';
import { generateCityHeroWithCache } from '@/lib/nanobanana-hero';
import type { CityHeroResult } from '@/lib/nanobanana-hero';

export default function CityPlanners({ params }: { params: { city: string } }) {
  const [heroImage, setHeroImage] = useState<CityHeroResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate hero image when page loads
    const generateHero = async () => {
      setLoading(true);
      const result = await generateCityHeroWithCache(
        'New York',
        'luxury_modern'
      );
      setHeroImage(result);
      setLoading(false);
    };

    generateHero();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Generated Image */}
      <div className="relative h-96 overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <p className="text-gray-600">✨ Generating beautiful image...</p>
          </div>
        ) : heroImage ? (
          <img
            src={heroImage.url}
            alt="Wedding venue"
            className="w-full h-full object-cover"
          />
        ) : null}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-serif text-white text-center drop-shadow-lg">
            Wedding Planners in New York
          </h1>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold">
          {heroImage?.status === 'success' ? '✨ Generated' : '⚠️ Using fallback'}
        </div>
      </div>

      {/* Rest of page content */}
      <div className="max-w-6xl mx-auto p-8">
        <p className="text-gray-600">
          Find the perfect wedding planner in New York with our AI-powered aesthetic matching.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ALTERNATIVE: Server-side generation (for static builds)
// ============================================================

// If you want to pre-generate images at build time:
// app/planners/[city]/page-static.tsx

import { generateCityHero } from '@/lib/nanobanana-hero';

export default async function CityPlannersStatic({ 
  params 
}: { 
  params: { city: string } 
}) {
  // Generate image at build time (runs once during deployment)
  const heroImage = await generateCityHero('New York', 'luxury_modern');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with pre-generated image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={heroImage.url}
          alt="Wedding venue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-serif text-white text-center drop-shadow-lg">
            Wedding Planners in New York
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <p className="text-gray-600">
          Find the perfect wedding planner in New York.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// BATCH GENERATION: Generate hero images for all 797 cities
// ============================================================

// scripts/generate-all-city-heroes.ts

import { generateMultipleCityHeroes } from '@/lib/nanobanana-hero';
import { citiesData } from '@/lib/cities';
import * as fs from 'fs';
import * as path from 'path';

async function generateAllCityHeroes() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎨 GENERATING HERO IMAGES FOR ALL 797 CITIES              ║
║  Cost: ~$48 | Time: ~13 hours (with 1-second delays)       ║
╚════════════════════════════════════════════════════════════╝
  `);

  const cities = Object.keys(citiesData);
  
  console.log(`📍 Generating images for ${cities.length} cities...`);
  console.log(`💰 Estimated cost: $${(cities.length * 0.06).toFixed(2)}`);
  console.log(`⏱️  Estimated time: ${Math.round(cities.length / 60)} hours`);
  console.log('');

  // Ask for confirmation
  if (process.argv.includes('--confirm')) {
    const results = await generateMultipleCityHeroes(cities, 'luxury_modern', 1000);
    
    // Save results
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'city-heroes.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n✅ Generated ${results.length} city hero images!`);
    console.log(`📁 Saved to: ${outputPath}`);
  } else {
    console.log('⚠️  This will generate 797 images and cost ~$48');
    console.log('Run with --confirm flag to proceed:');
    console.log('npx ts-node scripts/generate-all-city-heroes.ts --confirm');
  }
}

generateAllCityHeroes().catch(console.error);

// ============================================================
// QUICK TEST: Generate just 5 sample city heroes
// ============================================================

// scripts/test-city-hero.ts

import { generateCityHero, calculateImageGenerationCost } from '@/lib/nanobanana-hero';

async function testCityHero() {
  console.log('🎨 Testing City Hero Generation\n');

  const testCities = ['New York', 'Los Angeles', 'Toronto', 'Austin', 'Miami'];
  const aesthetic = 'luxury_modern';

  // Show cost
  const cost = calculateImageGenerationCost(5, 0.06);
  console.log(`💰 Cost for 5 cities: $${cost.totalCost.toFixed(2)}`);
  console.log(`⏱️  Estimated time: ${cost.estimatedMinutes} minutes\n`);

  // Generate
  console.log('Generating images...\n');
  
  for (const city of testCities) {
    const result = await generateCityHero(city, aesthetic);
    
    if (result.status === 'success') {
      console.log(`✅ ${city}`);
      console.log(`   URL: ${result.url.substring(0, 60)}...`);
    } else {
      console.log(`⚠️  ${city} (using fallback)`);
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('✨ Test complete!');
}

testCityHero().catch(console.error);

// ============================================================
// USAGE IN YOUR PROJECT
// ============================================================

// Option 1: Client-side generation (load images as user browses)
// ✅ Pros: Images generated on demand, saves initial cost
// ❌ Cons: Users see loading state while image generates

// Option 2: Server-side generation (pre-generate at build time)
// ✅ Pros: Images ready immediately on page load
// ❌ Cons: Slower deploy, costs upfront

// Option 3: Hybrid (background generation)
// ✅ Pros: Generate in batches during off-hours
// ❌ Cons: More complex setup

// RECOMMENDED FOR YOUR USE CASE:
// Start with Option 1 (client-side on demand)
// - First 20 cities will have hero images within a day
- Cost: ~$1.20
// - Fallback images look good until AI images generate
// - Once you have data, decide if worth pre-generating all 797

// Then scale to Option 3 (background batch)
// - Generate all 797 at once (weekend task)
// - Cost: ~$48
// - Takes 12-14 hours with rate limit delays
// - Result: All 797 cities with perfect hero images
