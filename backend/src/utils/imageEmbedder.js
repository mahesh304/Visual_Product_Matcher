import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lightweight ImageEmbedder for free tier hosting
 * Uses color histograms and simple features instead of CLIP model
 */
class ImageEmbedder {
  constructor() {
    this.modelName = 'lightweight-color-features';
  }

  async initialize() {
    // No model loading needed for lightweight approach
    return;
  }

  /**
   * Generate lightweight embedding from image URL
   * @param {string} imageUrl - URL of the image
   * @returns {Array<number>} - Feature vector
   */
  async embedImageFromUrl(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      return await this.embedImageFromUpload(buffer);
    } catch (error) {
      console.error('Error generating embedding from URL:', error.message);
      throw new Error('Failed to process image from URL');
    }
  }

  /**
   * Generate lightweight embedding from uploaded file buffer
   * Uses color histogram and simple image features
   * @param {Buffer} fileBuffer - Uploaded file buffer
   * @returns {Array<number>} - Feature vector (128 dimensions)
   */
  async embedImageFromUpload(fileBuffer) {
    try {
      // Resize to standard size and extract statistics
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();
      
      // Resize to 64x64 for consistent processing
      const resized = await image
        .resize(64, 64, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const { data, info } = resized;
      const channels = info.channels;
      
      // Extract color histogram (32 bins per channel = 96 features)
      const histogram = this.computeColorHistogram(data, channels);
      
      // Extract additional features (32 features)
      const features = this.extractFeatures(data, channels, info.width, info.height);
      
      // Combine into single feature vector
      return [...histogram, ...features];
    } catch (error) {
      console.error('Error generating embedding from upload:', error.message);
      throw new Error('Failed to process uploaded image');
    }
  }

  /**
   * Compute color histogram
   * @param {Buffer} data - Raw pixel data
   * @param {number} channels - Number of color channels
   * @returns {Array<number>} - Histogram features
   */
  computeColorHistogram(data, channels) {
    const bins = 32; // Bins per channel
    const histogram = new Array(bins * Math.min(channels, 3)).fill(0);
    
    for (let i = 0; i < data.length; i += channels) {
      for (let c = 0; c < Math.min(channels, 3); c++) {
        const value = data[i + c];
        const bin = Math.floor((value / 256) * bins);
        const index = c * bins + Math.min(bin, bins - 1);
        histogram[index]++;
      }
    }
    
    // Normalize
    const total = data.length / channels;
    return histogram.map(v => v / total);
  }

  /**
   * Extract additional image features
   * @param {Buffer} data - Raw pixel data
   * @param {number} channels - Number of color channels
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Array<number>} - Additional features
   */
  extractFeatures(data, channels, width, height) {
    const features = [];
    
    // Average color per channel
    const avgColors = new Array(3).fill(0);
    for (let i = 0; i < data.length; i += channels) {
      for (let c = 0; c < Math.min(channels, 3); c++) {
        avgColors[c] += data[i + c];
      }
    }
    const pixelCount = data.length / channels;
    features.push(...avgColors.map(v => v / pixelCount / 255));
    
    // Standard deviation per channel
    const stdColors = new Array(3).fill(0);
    for (let i = 0; i < data.length; i += channels) {
      for (let c = 0; c < Math.min(channels, 3); c++) {
        const diff = data[i + c] - (avgColors[c] / pixelCount);
        stdColors[c] += diff * diff;
      }
    }
    features.push(...stdColors.map(v => Math.sqrt(v / pixelCount) / 255));
    
    // Brightness distribution (quartiles)
    const brightness = [];
    for (let i = 0; i < data.length; i += channels) {
      const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
      brightness.push(b);
    }
    brightness.sort((a, b) => a - b);
    const q1 = brightness[Math.floor(brightness.length * 0.25)] / 255;
    const q2 = brightness[Math.floor(brightness.length * 0.50)] / 255;
    const q3 = brightness[Math.floor(brightness.length * 0.75)] / 255;
    features.push(q1, q2, q3);
    
    // Edge density approximation (gradient magnitude)
    let edgeSum = 0;
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx = (y * width + x) * channels;
        const idxRight = (y * width + x + 1) * channels;
        const idxDown = ((y + 1) * width + x) * channels;
        
        let gradX = 0, gradY = 0;
        for (let c = 0; c < Math.min(channels, 3); c++) {
          gradX += Math.abs(data[idxRight + c] - data[idx + c]);
          gradY += Math.abs(data[idxDown + c] - data[idx + c]);
        }
        edgeSum += Math.sqrt(gradX * gradX + gradY * gradY);
      }
    }
    features.push(edgeSum / (width * height) / 255);
    
    // Color dominance (max - min average color)
    const colorRange = Math.max(...avgColors.map(v => v / pixelCount)) - 
                       Math.min(...avgColors.map(v => v / pixelCount));
    features.push(colorRange / 255);
    
    // Saturation approximation
    let satSum = 0;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      satSum += max > 0 ? (max - min) / max : 0;
    }
    features.push(satSum / pixelCount);
    
    // Pad to 32 features
    while (features.length < 32) {
      features.push(0);
    }
    
    return features.slice(0, 32);
  }

  detectMimeType(buffer) {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png';
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }
}

export default new ImageEmbedder();
