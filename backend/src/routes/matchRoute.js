import express from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { optionalAuth } from '../middleware/auth.js';
import SearchHistory from '../models/SearchHistory.js';
import imageEmbedder from '../utils/imageEmbedder.js';
import { findTopMatches } from '../utils/similarity.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
      return;
    }
    cb(null, true);
  },
});

/**
 * Load products and embeddings data
 * @returns {Object} - Object containing products array and embeddings map
 */
async function loadProductData() {
  try {
    const productsPath = path.join(__dirname, '../data/products.json');
    const embeddingsPath = path.join(__dirname, '../data/embeddings.json');
    
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsData);
    
    let embeddings = {};
    try {
      const embeddingsData = await fs.readFile(embeddingsPath, 'utf-8');
      embeddings = JSON.parse(embeddingsData);
    } catch (error) {
      console.warn('Embeddings file not found. Products will be matched on-the-fly (slower).');
    }
    
    return { products, embeddings };
  } catch (error) {
    console.error('Error loading product data:', error);
    throw new Error('Failed to load product database');
  }
}

/**
 * Add a new product to the database
 * @param {Object} productData - Product information
 * @param {Array} embedding - Product image embedding
 */
async function addProductToDatabase(productData, embedding) {
  try {
    const productsPath = path.join(__dirname, '../data/products.json');
    const embeddingsPath = path.join(__dirname, '../data/embeddings.json');
    
    // Load existing data
    const { products, embeddings } = await loadProductData();
    
    // Generate new product ID
    const newId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;
    
    // Create new product entry
    const newProduct = {
      id: newId,
      name: productData.name || `Product ${newId}`,
      category: productData.category || 'Uncategorized',
      price: productData.price || 0,
      image: productData.image,
      addedAt: new Date().toISOString()
    };
    
    // Add to products array
    products.push(newProduct);
    
    // Add embedding
    embeddings[newId] = embedding;
    
    // Save to files
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf-8');
    await fs.writeFile(embeddingsPath, JSON.stringify(embeddings, null, 2), 'utf-8');
    
    console.log(`✓ Added new product to database: ${newProduct.name} (ID: ${newId})`);
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product to database:', error);
    throw error;
  }
}

/**
 * POST /api/match
 * Match an uploaded image or image URL with similar products
 * Accepts: multipart/form-data with 'image' file OR JSON with 'imageUrl'
 * Returns: { matches: [...], queryImage: string }
 */
router.post('/match', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    let queryEmbedding;
    let queryImageUrl = null;
    
    // Check if image file was uploaded
    if (req.file) {
      queryEmbedding = await imageEmbedder.embedImageFromUpload(req.file.buffer);
      // For uploaded files, we'll use a placeholder or base64 representation
      queryImageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } 
    // Check if imageUrl was provided in request body
    else if (req.body.imageUrl) {
      queryImageUrl = req.body.imageUrl;
      
      // Check if it's a data URL (base64 encoded image)
      if (queryImageUrl.startsWith('data:image')) {
        // Extract base64 data from data URL
        const base64Data = queryImageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        queryEmbedding = await imageEmbedder.embedImageFromUpload(buffer);
      } else {
        // Regular HTTP/HTTPS URL
        
        // Basic validation - must be http/https
        if (!queryImageUrl.startsWith('http://') && !queryImageUrl.startsWith('https://')) {
          return res.status(400).json({
            error: 'Invalid URL. Please provide a valid HTTP or HTTPS image URL.',
            hint: 'The URL should start with http:// or https://'
          });
        }
        
        // Try to fetch and process the image
        queryEmbedding = await imageEmbedder.embedImageFromUrl(req.body.imageUrl);
      }
    } 
    else {
      return res.status(400).json({
        error: 'No image provided. Please upload an image file or provide an imageUrl.',
      });
    }
    
    // Load products and embeddings
    const { products, embeddings } = await loadProductData();
    
    // If we have precomputed embeddings, use them
    let productsWithEmbeddings;
    if (Object.keys(embeddings).length > 0) {
      productsWithEmbeddings = products
        .filter(p => embeddings[p.id] !== null && embeddings[p.id] !== undefined)
        .map(p => ({
          ...p,
          embedding: embeddings[p.id],
        }));
    } else {
      // Fallback: compute embeddings on-the-fly (slower)
      productsWithEmbeddings = await Promise.all(
        products.map(async (p) => {
          try {
            const embedding = await imageEmbedder.embedImageFromUrl(p.image_url);
            return { ...p, embedding };
          } catch (error) {
            console.error(`Failed to embed product ${p.id}:`, error.message);
            return null;
          }
        })
      );
      productsWithEmbeddings = productsWithEmbeddings.filter(p => p !== null);
    }
    
    // Get filter parameters from query
    const topN = parseInt(req.query.limit) || 50; // Increased default to 50
    const minScore = parseFloat(req.query.minScore) || 0;
    
    // Find top matches
    const matches = findTopMatches(queryEmbedding, productsWithEmbeddings, topN, minScore);
    
    // Remove embedding from response (too large)
    const cleanMatches = matches.map(({ embedding, ...product }) => product);
    
    // Save search history if user is logged in
    if (req.user) {
      try {
        const topMatches = cleanMatches.slice(0, 5).map(match => ({
          productId: match.id?.toString(),
          productName: match.name,
          productImage: match.image,
          similarity: match.similarity,
          price: match.price,
        }));
        
        await SearchHistory.create({
          user: req.user._id,
          queryImage: queryImageUrl,
          searchMode: 'local',
          resultsCount: cleanMatches.length,
          topMatches,
        });
      } catch (historyError) {
        console.error('Failed to save search history:', historyError.message);
        // Don't fail the request if history save fails
      }
    }
    
    // Return results
    res.json({
      success: true,
      matches: cleanMatches,
      queryImage: queryImageUrl,
      totalMatches: cleanMatches.length,
    });
    
  } catch (error) {
    console.error('Error in /api/match:', error);
    res.status(500).json({
      error: error.message || 'Failed to process image and find matches',
    });
  }
});

/**
 * GET /api/products
 * Get all products from the database
 */
router.get('/products', async (req, res) => {
  try {
    const { products } = await loadProductData();
    res.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('Error in /api/products:', error);
    res.status(500).json({
      error: 'Failed to load products',
    });
  }
});

/**
 * POST /api/products/add
 * Add a new product to the database
 * Accepts: multipart/form-data with 'image' file + product details
 * OR JSON with 'imageUrl' + product details
 */
router.post('/products/add', upload.single('image'), async (req, res) => {
  try {
    let imageUrl;
    let embedding;
    
    // Get product details from request body
    const { name, category, price } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Product name is required',
      });
    }
    
    // Process image (same logic as /match endpoint)
    if (req.file) {
      embedding = await imageEmbedder.embedImageFromUpload(req.file.buffer);
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.imageUrl) {
      const imageUrl = req.body.imageUrl;
      
      if (imageUrl.startsWith('data:image')) {
        const base64Data = imageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        embedding = await imageEmbedder.embedImageFromUpload(buffer);
      } else {
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          return res.status(400).json({
            error: 'Invalid URL format',
          });
        }
        embedding = await imageEmbedder.embedImageFromUrl(imageUrl);
      }
    } else {
      return res.status(400).json({
        error: 'No image provided. Upload an image or provide imageUrl.',
      });
    }
    
    // Add product to database
    const newProduct = await addProductToDatabase(
      {
        name,
        category: category || 'Uncategorized',
        price: parseFloat(price) || 0,
        image: imageUrl,
      },
      embedding
    );
    
    res.json({
      success: true,
      message: 'Product added successfully',
      product: newProduct,
    });
    
  } catch (error) {
    console.error('Error in /api/products/add:', error);
    res.status(500).json({
      error: error.message || 'Failed to add product',
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Visual Product Matcher API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
