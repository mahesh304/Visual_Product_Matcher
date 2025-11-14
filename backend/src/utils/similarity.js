/**
 * Utility functions for computing similarity between embeddings
 */

/**
 * Calculate dot product of two vectors
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} - Dot product
 */
function dotProduct(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  return vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
}

/**
 * Calculate magnitude (L2 norm) of a vector
 * @param {Array<number>} vec - Input vector
 * @returns {number} - Magnitude
 */
function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical direction
 * @param {Array<number>} vecA - First embedding vector
 * @param {Array<number>} vecB - Second embedding vector
 * @returns {number} - Cosine similarity score
 */
export function cosineSimilarity(vecA, vecB) {
  const dot = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  
  if (magA === 0 || magB === 0) {
    return 0;
  }
  
  return dot / (magA * magB);
}

/**
 * Convert cosine similarity (-1 to 1) to percentage score (0 to 100)
 * @param {number} similarity - Cosine similarity value
 * @returns {number} - Percentage score (0-100)
 */
export function similarityToPercentage(similarity) {
  // Normalize from [-1, 1] to [0, 100]
  // In practice, CLIP embeddings are normalized, so values are typically [0, 1]
  return Math.max(0, Math.min(100, similarity * 100));
}

/**
 * Find top N most similar items from a list of products with embeddings
 * @param {Array<number>} queryEmbedding - Query image embedding
 * @param {Array<Object>} products - Array of products with embeddings
 * @param {number} topN - Number of top results to return
 * @param {number} minScore - Minimum similarity score threshold (0-100)
 * @returns {Array<Object>} - Top N similar products with scores
 */
export function findTopMatches(queryEmbedding, products, topN = 10, minScore = 0) {
  // Calculate similarity for each product
  const productsWithScores = products.map(product => {
    const similarity = cosineSimilarity(queryEmbedding, product.embedding);
    const score = similarityToPercentage(similarity);
    
    return {
      ...product,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
    };
  });
  
  // Filter by minimum score and sort by score descending
  const filteredProducts = productsWithScores
    .filter(p => p.score >= minScore)
    .sort((a, b) => b.score - a.score);
  
  // Return top N results
  return filteredProducts.slice(0, topN);
}

/**
 * Normalize an embedding vector (convert to unit vector)
 * @param {Array<number>} vec - Input vector
 * @returns {Array<number>} - Normalized vector
 */
export function normalizeVector(vec) {
  const mag = magnitude(vec);
  if (mag === 0) return vec;
  return vec.map(val => val / mag);
}
