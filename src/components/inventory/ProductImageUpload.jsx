// src/components/inventory/ProductImageUpload.jsx
import React, { useState, useRef } from 'react';
import { uploadProductImage } from '../../utils/imageManagement';

const ProductImageUpload = ({ productId, currentImageUrl, onImageUpload, darkMode }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);
    
    // Upload the image
    try {
      setIsUploading(true);
      const downloadUrl = await uploadProductImage(file, productId);
      setIsUploading(false);
      
      // Callback with the new URL
      if (onImageUpload) {
        onImageUpload(downloadUrl);
      }
    } catch (err) {
      setIsUploading(false);
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="mt-2">
      <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="relative">
          {/* Preview Image */}
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Product preview" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <svg 
                  className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No image selected
                </p>
              </div>
            )}
            
            {/* Upload overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100"
              onClick={triggerFileInput}
            >
              <button 
                type="button"
                className="bg-white bg-opacity-90 rounded-full p-2 shadow-md"
                disabled={isUploading}
              >
                {isUploading ? (
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Upload button bar */}
        <div className={`p-3 flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {isUploading ? 'Uploading...' : 'Click to upload product image'}
          </span>
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading}
            className={`px-3 py-1 rounded text-xs font-medium ${
              isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Supported formats: JPEG, PNG, GIF, WEBP. Max size: 5MB
      </p>
    </div>
  );
};

export default ProductImageUpload;