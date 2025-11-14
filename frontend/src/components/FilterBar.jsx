import { useState } from 'react';

/**
 * FilterBar Component
 * Provides controls to filter products by similarity score
 */
const FilterBar = ({ onFilterChange, totalResults, filteredResults }) => {
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'price-asc', 'price-desc'

  // Handle similarity score change
  const handleScoreChange = (e) => {
    const value = parseInt(e.target.value);
    setMinScore(value);
    onFilterChange({ minScore: value, sortBy });
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onFilterChange({ minScore, sortBy: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Similarity Score Filter */}
        <div className="flex-1">
          <label htmlFor="similarity-slider" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Similarity: <span className="text-primary-600 font-semibold">{minScore}%</span>
          </label>
          <input
            id="similarity-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={handleScoreChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div className="lg:w-64">
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={handleSortChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="score">Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="lg:w-48 text-center lg:text-right">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredResults}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalResults}</span> results
          </p>
        </div>
      </div>

      {/* Active Filters Display */}
      {minScore > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
              Min {minScore}% similarity
              <button
                onClick={() => {
                  setMinScore(0);
                  onFilterChange({ minScore: 0, sortBy });
                }}
                className="ml-1 hover:text-primary-900"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
