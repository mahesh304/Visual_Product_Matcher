/**
 * ProductCard Component
 * Displays a single product with image, name, price, and similarity score
 */
const ProductCard = ({ product }) => {
  const { id, name, category, price, image_url, score } = product;

  // Determine score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    if (score >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="card hover:scale-105">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={image_url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
          }}
        />
        
        {/* Similarity Score Badge */}
        {score !== undefined && (
          <div className={`absolute top-2 right-2 px-4 py-2 rounded-lg font-bold text-lg shadow-lg ${getScoreColor(score)}`}>
            {Math.round(score)}%
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary-600">
            ₹{price.toFixed(2)}
          </p>
          
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
