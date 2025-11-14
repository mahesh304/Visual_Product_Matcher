import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

/**
 * Search History Page
 * Displays user's past product searches
 */
function History() {
  const { user, getSearchHistory, deleteSearchHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSearchHistory();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load search history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, getSearchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this search?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await deleteSearchHistory(id);
      if (success) {
        // Remove from local state
        setHistory(history.filter(item => item._id !== id));
      } else {
        alert('Failed to delete search history');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete search history');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Please Login
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              You need to be logged in to view your search history.
            </p>
            <Link
              to="/login"
              className="inline-block w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition text-sm md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Search History
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Your past product searches and matches
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12 md:py-16">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm md:text-base">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
              <div className="text-5xl md:text-6xl mb-4">🔍</div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                No Search History Yet
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                Start searching for products to build your history!
              </p>
              <Link
                to="/"
                className="inline-block w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Start Searching
              </Link>
            </div>
          )}

          {/* History List */}
          {!loading && !error && history.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete this search"
                  >
                    {deletingId === item._id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>

                  {/* Query Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.queryImage}
                      alt="Search query"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400?text=Search+Image';
                      }}
                    />
                  </div>

                  {/* Search Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(item.searchedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.searchedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          <span className="font-bold text-blue-600">{item.resultsCount}</span> results
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {item.searchMode.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {!loading && !error && history.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {history.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Searches</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {history.reduce((sum, item) => sum + item.resultsCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Results</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {history.length > 0
                      ? Math.round(
                          history.reduce((sum, item) => sum + item.resultsCount, 0) /
                            history.length
                        )
                      : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Results/Search</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
