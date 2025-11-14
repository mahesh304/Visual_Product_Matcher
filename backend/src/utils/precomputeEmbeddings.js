import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import imageEmbedder from './imageEmbedder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Precompute embeddings for all products in products.json
 * This script should be run once to generate embeddings.json
 * Run with: npm run precompute
 */
async function precomputeEmbeddings() {
  try {
    console.log('Starting embedding precomputation...\n');
    
    // Load products
    const productsPath = path.join(__dirname, '../data/products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsData);
    
    console.log(`Loaded ${products.length} products\n`);
    
    // Initialize the model
    await imageEmbedder.initialize();
    console.log('Model initialized\n');
    
    // Generate embeddings for each product
    const embeddings = {};
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`[${i + 1}/${products.length}] Processing: ${product.name}...`);
      
      try {
        const embedding = await imageEmbedder.embedImageFromUrl(product.image_url);
        embeddings[product.id] = embedding;
        successCount++;
        console.log(`✓ Success (${embedding.length} dimensions)\n`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed: ${error.message}\n`);
        // Store null for failed embeddings
        embeddings[product.id] = null;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save embeddings to file
    const embeddingsPath = path.join(__dirname, '../data/embeddings.json');
    await fs.writeFile(embeddingsPath, JSON.stringify(embeddings, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log('Precomputation complete!');
    console.log(`Success: ${successCount}/${products.length}`);
    console.log(`Failed: ${failCount}/${products.length}`);
    console.log(`Embeddings saved to: ${embeddingsPath}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Error during precomputation:', error);
    process.exit(1);
  }
}

// Run the precomputation
precomputeEmbeddings();
