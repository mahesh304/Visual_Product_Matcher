import mongoose from 'mongoose';

/**
 * Search History Model Schema
 * Tracks user searches and product views
 */
const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  queryImage: {
    type: String, // Image URL or base64
    required: true,
  },
  searchMode: {
    type: String,
    enum: ['local', 'free', 'live'],
    default: 'local',
  },
  resultsCount: {
    type: Number,
    default: 0,
  },
  topMatches: [{
    productId: String,
    productName: String,
    productImage: String,
    similarity: Number,
    price: Number,
  }],
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
searchHistorySchema.index({ user: 1, searchedAt: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
