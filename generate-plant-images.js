#!/usr/bin/env node

/**
 * OpenAI DALL-E Image Generator for Beaucharme Plant Images
 *
 * Usage:
 *   1. First regenerate your API key at https://platform.openai.com/api-keys
 *   2. Run: OPENAI_API_KEY=sk-your-new-key node generate-plant-images.js
 *
 * Or set the key in your environment:
 *   export OPENAI_API_KEY=sk-your-new-key
 *   node generate-plant-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  OPENAI_API_KEY=sk-your-key node generate-plant-images.js');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, 'public/images/plants');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const plants = [
  {
    id: 'bourrache',
    prompt: 'RAW photo of blue star-shaped borage flowers in a French farm field, shot with Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, morning golden hour light, dew drops visible on petals, photorealistic, editorial nature photography for magazine, 8k resolution, no illustration, no painting, no digital art'
  },
  {
    id: 'cameline',
    prompt: 'RAW photo of camelina sativa yellow flowers in agricultural field, Burgundy France countryside, shot with Sony A7R IV, 70-200mm telephoto lens, warm afternoon sunlight, realistic farming scene, photojournalistic style, National Geographic quality, no CGI, no illustration'
  },
  {
    id: 'camomille',
    prompt: 'RAW photograph of white roman chamomile flowers with yellow centers in meadow, macro shot with Canon 100mm f/2.8L lens, morning dew drops, soft bokeh background, natural daylight, documentary style botanical photography, ultra realistic, film grain, no digital art'
  },
  {
    id: 'carthame',
    prompt: 'RAW photo of orange safflower carthamus flowers blooming in field, shot on Hasselblad medium format, natural sunlight, French agricultural landscape background, photorealistic texture detail, editorial stock photography style, real plant no illustration'
  },
  {
    id: 'chanvre',
    prompt: 'RAW photograph of industrial hemp cannabis sativa leaves and plants in farm field, shot with Nikon D850, 50mm lens, overcast natural lighting, shallow depth of field, documentary agricultural photography, photojournalistic, no CGI no illustration'
  },
  {
    id: 'laurier',
    prompt: 'RAW photo of fresh bay laurel laurus nobilis branch with glossy dark green leaves, studio-style natural lighting, shot on Phase One IQ4, shallow focus, culinary herb photography, food magazine quality, photorealistic, no digital art'
  },
  {
    id: 'lavandin',
    prompt: 'RAW photograph of purple lavender field rows in Provence France at sunset golden hour, shot with Canon 5D Mark IV, 24-70mm lens, warm light, real location photography, travel magazine quality, photorealistic landscape, no painting no illustration'
  },
  {
    id: 'menthe-poivree',
    prompt: 'RAW macro photo of fresh green peppermint mentha leaves with water droplets, shot with Canon MP-E 65mm macro lens, natural window light, shallow depth of field, herb garden setting, food photography style, photorealistic detail, no CGI'
  },
  {
    id: 'sauge',
    prompt: 'RAW photograph of clary sage salvia sclarea purple flower spikes in herb field, shot with Sony 90mm macro lens, soft natural lighting, French countryside background, botanical documentary style, National Geographic quality, photorealistic'
  },
  {
    id: 'tournesol',
    prompt: 'RAW photo of sunflower field helianthus at golden hour sunset, France countryside, shot with Canon EOS R5 and 35mm lens, warm golden light, bees on flowers, editorial landscape photography, photojournalistic style, no illustration no digital art'
  }
];

async function generateImage(plant) {
  console.log(`\nGenerating image for: ${plant.id}...`);

  const requestBody = JSON.stringify({
    model: 'dall-e-3',
    prompt: plant.prompt,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
    response_format: 'url'
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else if (response.data && response.data[0] && response.data[0].url) {
            resolve(response.data[0].url);
          } else {
            reject(new Error('Invalid response format'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Beaucharme Plant Image Generator');
  console.log('Using OpenAI DALL-E 3');
  console.log('='.repeat(60));
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
  console.log(`Plants to generate: ${plants.length}`);

  for (const plant of plants) {
    const outputPath = path.join(OUTPUT_DIR, `${plant.id}.jpg`);

    // Skip if image already exists
    if (fs.existsSync(outputPath)) {
      console.log(`\n[SKIP] ${plant.id}.jpg already exists`);
      continue;
    }

    try {
      const imageUrl = await generateImage(plant);
      console.log(`  Generated! Downloading...`);

      await downloadImage(imageUrl, outputPath);
      console.log(`  Saved to: ${outputPath}`);

      // Wait a bit between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done! Check the public/images/plants directory.');
  console.log('='.repeat(60));
}

main().catch(console.error);
