import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import ProductGrid from '../components/ProductGrid';

/**
 * Results Page Component
 * Displays matched products with filtering and sorting options
 */
const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { matches: initialMatches, queryImage } = location.state || {};
  
  const [allMatches, setAllMatches] = useState(initialMatches || []);
  const [filteredMatches, setFilteredMatches] = useState(initialMatches || []);
  const [filters, setFilters] = useState({ minScore: 0, sortBy: 'score' });

  // Redirect to home if no data
  useEffect(() => {
    if (!initialMatches || !queryImage) {
      navigate('/');
    }
  }, [initialMatches, queryImage, navigate]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allMatches];

    // Filter by minimum score
    filtered = filtered.filter(product => product.score >= filters.minScore);

    // Sort products
    switch (filters.sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredMatches(filtered);
  }, [filters, allMatches]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle new search
  const handleNewSearch = () => {
    navigate('/');
  };

  if (!initialMatches || !queryImage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={handleNewSearch}
                className="text-primary-600 hover:text-primary-700"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Search Results</h1>
            </div>
            <button
              onClick={handleNewSearch}
              className="btn-primary text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2"
            >
              <span className="hidden sm:inline">New Search</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Query Image Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 md:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Your Search Image</h2>
          <div className="flex flex-col items-center">
            <img
              src={queryImage}
              alt="Query"
              className="max-w-xs w-full h-48 object-contain bg-gray-100 rounded-lg border-2 border-gray-300"
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Comparing with <span className="font-bold text-blue-600">50 products</span> from local database</p>
              <p className="text-xs text-gray-500 mt-1">Results sorted by similarity percentage</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          onFilterChange={handleFilterChange}
          totalResults={allMatches.length}
          filteredResults={filteredMatches.length}
        />

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Similar Products Found
          </h2>
          {filteredMatches.length > 0 && (
            <p className="text-gray-600 mt-1">
              Showing <span className="font-semibold text-blue-600">{filteredMatches.length}</span> matches with similarity scores
            </p>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid products={filteredMatches} loading={false} />

        {/* No Results Message */}
        {filteredMatches.length === 0 && allMatches.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No products match your current filter settings. Try lowering the minimum similarity score.
            </p>
            <button
              onClick={() => setFilters({ minScore: 0, sortBy: 'score' })}
              className="mt-4 btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Back to Top Button */}
        {filteredMatches.length > 6 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Back to Top
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Visual Product Matcher • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Results;
