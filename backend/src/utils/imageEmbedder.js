import {
    AutoProcessor,
    CLIPVisionModelWithProjection,
    RawImage
} from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ImageEmbedder class handles image embedding generation using CLIP model
 * Uses Xenova's Transformers.js
 * 
 * REAL Implementation:
 * - Use CLIPVisionModelWithProjection specifically for image embeddings
 * - This is the correct class that has the vision encoder
 */
class ImageEmbedder {
  constructor() {
    this.model = null;
    this.processor = null;
    this.modelName = 'Xenova/clip-vit-base-patch32';
  }

  /**
   * Initialize the CLIP vision model and processor
   * This will download the model on first run (cached afterwards)
   */
  async initialize() {
    if (this.model && this.processor) return;
    
    try {
      // Load the processor for image preprocessing
      this.processor = await AutoProcessor.from_pretrained(this.modelName);
      
      // Load the VISION model specifically (CLIPVisionModelWithProjection)
      this.model = await CLIPVisionModelWithProjection.from_pretrained(this.modelName);
    } catch (error) {
      console.error('Error loading CLIP model:', error);
      throw new Error('Failed to initialize image embedder');
    }
  }

  /**
   * Generate embedding vector for an image URL
   * @param {string} imageUrl - URL of the image
   * @returns {Array<number>} - Embedding vector (512 dimensions for CLIP)
   */
  async embedImageFromUrl(imageUrl) {
    await this.initialize();
    
    try {
      // Fetch the image as a buffer
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use the same upload processing method for consistency
      return await this.embedImageFromUpload(buffer);
    } catch (error) {
      console.error('Error generating embedding from URL:', error.message);
      throw new Error('Failed to generate image embedding from URL');
    }
  }

  /**
   * Generate embedding from uploaded file buffer
   * @param {Buffer} fileBuffer - Uploaded file buffer
   * @returns {Array<number>} - Embedding vector
   */
  async embedImageFromUpload(fileBuffer) {
    await this.initialize();
    
    let tempFilePath = null;
    try {
      // Use sharp to convert buffer to standard PNG format
      // This ensures compatibility with RawImage
      const processedBuffer = await sharp(fileBuffer)
        .png()
        .toBuffer();
      
      // Save to temporary file
      const tempDir = path.join(__dirname, '..', '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      tempFilePath = path.join(tempDir, `upload-${Date.now()}.png`);
      fs.writeFileSync(tempFilePath, processedBuffer);
      
      // Load image from file path
      const image = await RawImage.fromURL(tempFilePath);
      
      // Preprocess image using the processor
      const imageInputs = await this.processor(image);
      
      // Generate embedding using CLIPVisionModelWithProjection
      const output = await this.model(imageInputs);
      
      // Extract embedding from image_embeds
      const embedding = Array.from(output.image_embeds.data);
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding from upload:', error.message);
      throw new Error('Failed to generate image embedding from upload');
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn('Failed to delete temp file:', cleanupError.message);
        }
      }
    }
  }

  /**
   * Detect MIME type from buffer
   * @param {Buffer} buffer - Image buffer
   * @returns {string} - MIME type
   */
  detectMimeType(buffer) {
    // Check magic numbers (file signatures)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
    // Default to jpeg
    return 'image/jpeg';
  }
}

// Export singleton instance
export default new ImageEmbedder();
