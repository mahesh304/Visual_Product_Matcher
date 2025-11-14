import { useRef, useState } from 'react';

/**
 * ImageUpload Component
 * Allows users to upload an image file or paste an image URL
 * Displays preview of the selected image
 */
const ImageUpload = ({ onImageSelect, loading }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Pass file to parent
      onImageSelect({ type: 'file', data: file });
    }
  };

  // Handle URL input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setImagePreview(imageUrl);
    onImageSelect({ type: 'url', data: imageUrl });
  };

  // Reset form
  const handleReset = () => {
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Method Selector */}
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => {
            setUploadMethod('file');
            handleReset();
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'file'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => {
            setUploadMethod('url');
            handleReset();
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'url'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Image URL
        </button>
      </div>

      {/* File Upload Section */}
      {uploadMethod === 'file' && (
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600">
                <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Section */}
      {uploadMethod === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input-field"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !imageUrl.trim()}
            className="btn-primary w-full"
          >
            Load Image
          </button>
        </form>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-6">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-contain bg-gray-100 rounded-lg"
            />
            {!loading && (
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
