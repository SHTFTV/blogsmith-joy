#!/usr/bin/env node

/**
 * 🎨 WEDDINGS.IO IMAGE GENERATION AUTOMATION
 * 
 * Run this script to generate luxury venue images for all 797 cities
 * Cost: ~$48 total ($0.06 per image × 797 cities)
 * Time: ~2-3 hours with batching
 * 
 * Usage:
 * npx ts-node scripts/generateCityImages.ts
 * 
 * Or add to package.json:
 * "scripts": {
 *   "generate-images": "ts-node scripts/generateCityImages.ts"
 * }
 * 
 * Then run: npm run generate-images
 */

import { citiesData } from '../lib/cities';
import {
  batchGenerateVenueImages,
  calculateImageGenerationCost,
  ImageGenerationResult,
} from '../lib/nanoBanana';
import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function main() {
  console.log(`
${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║    🎨 WEDDINGS.IO IMAGE GENERATION AUTOMATION             ║
║    Generating 4K luxury venue images for 797 cities        ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}
`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const sampleMode = args.includes('--sample');
  const aesthetic = args.find((arg) => arg.startsWith('--aesthetic='))?.split('=')[1] || 'luxury_modern';

  // Convert citiesData to array
  const citiesArray = Object.entries(citiesData).map(([name, data]) => ({
    name,
    slug: data.slug,
  }));

  // Show cost breakdown
  const costCalc = calculateImageGenerationCost(
    sampleMode ? 10 : citiesArray.length,
    0.06,
    1
  );

  console.log(`${colors.bright}📊 COST BREAKDOWN${colors.reset}`);
  console.log(`  Total cities: ${sampleMode ? '10 (SAMPLE MODE)' : citiesArray.length}`);
  console.log(`  Images per city: 1`);
  console.log(`  Cost per image: $0.06`);
  console.log(`  Total images: ${costCalc.totalImages}`);
  console.log(`  ${colors.bright}Total cost: $${costCalc.totalCost.toFixed(2)}${colors.reset}`);
  console.log(`  Cost per city: $${costCalc.costPerCity.toFixed(3)}`);
  console.log(`  Aesthetic: ${aesthetic}`);
  console.log();

  // Confirm before proceeding
  if (!sampleMode) {
    console.log(`${colors.yellow}⚠️  WARNING: This will generate 797 images and cost $${costCalc.totalCost.toFixed(2)}${colors.reset}`);
    console.log(`${colors.yellow}Use --sample flag to generate just 10 images first${colors.reset}`);
    console.log();

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Continue? (yes/no): ', async (answer: string) => {
      rl.close();
      if (answer.toLowerCase() === 'yes') {
        await generateImages(citiesArray, aesthetic);
      } else {
        console.log('Cancelled.');
      }
    });
  } else {
    const sampleCities = citiesArray.slice(0, 10);
    console.log(`${colors.green}✅ Running in SAMPLE MODE (10 cities)${colors.reset}`);
    console.log();
    await generateImages(sampleCities, aesthetic);
  }
}

async function generateImages(cities: Array<{ name: string; slug: string }>, aesthetic: string) {
  console.log(`${colors.bright}🚀 Starting image generation...${colors.reset}`);
  console.log();

  const startTime = Date.now();
  const results: ImageGenerationResult[] = [];

  try {
    // Generate images in batches
    const batchResults = await batchGenerateVenueImages(cities, aesthetic, 3, 2000);
    results.push(...batchResults);

    // Save results to database/file
    saveResults(results);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log();
    console.log(`${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════╗
║                    ✅ GENERATION COMPLETE                 ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

    console.log(`  ${colors.green}✓${colors.reset} Generated ${results.length} images`);
    console.log(`  ${colors.green}✓${colors.reset} Time elapsed: ${duration} minutes`);
    console.log(`  ${colors.green}✓${colors.reset} Cost: $${(results.length * 0.06).toFixed(2)}`);
    console.log(`  ${colors.green}✓${colors.reset} Results saved to data/generated-images.json`);
    console.log();
  } catch (error) {
    console.log();
    console.log(`${colors.bright}${colors.bright}❌ Generation failed${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

function saveResults(results: ImageGenerationResult[]) {
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save as JSON
  const outputPath = path.join(dataDir, 'generated-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`${colors.green}✓${colors.reset} Saved results to ${outputPath}`);

  // Also create a summary CSV for easy viewing
  const csvPath = path.join(dataDir, 'generated-images.csv');
  const csvContent = [
    'City,URL,Aesthetic,Timestamp',
    ...results.map(
      (r) =>
        `"${r.cityName}","${r.url}","${r.aesthetic}","${r.timestamp}"`
    ),
  ].join('\n');
  fs.writeFileSync(csvPath, csvContent);

  console.log(`${colors.green}✓${colors.reset} Saved CSV to ${csvPath}`);

  // Print sample results
  console.log();
  console.log(`${colors.bright}Sample Results:${colors.reset}`);
  results.slice(0, 3).forEach((result) => {
    console.log(`  ${colors.cyan}${result.cityName}${colors.reset}`);
    console.log(`    Aesthetic: ${result.aesthetic}`);
    console.log(`    URL: ${result.url}`);
  });

  if (results.length > 3) {
    console.log(`  ... and ${results.length - 3} more`);
  }
}

// Run the main function
main().catch(console.error);
