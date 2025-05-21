// src/components/inventory/ProductImageUpload.jsx
import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

/**
 * Product image upload component specifically for product management
 * Has optimizations for product images and maintains consistent aspect ratios
 */
const ProductImageUpload = ({ 
  initialImage = '',
  onImageUploaded,
  productId = null,
  darkMode = false 
}) => {
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Update preview if initialImage changes externally
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    // Reset error
    setError('');
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageFile) {
      if (imagePreview) {
        // If we have a preview but no file, it means we're keeping the existing image
        return initialImage;
      }
      return '';
    }
    
    try {
      setUploading(true);
      setError('');
      
      // Create a unique storage path using product ID if available
      const storagePath = productId 
        ? `product-images/${productId}/${Date.now()}_${imageFile.name}`
        : `product-images/${Date.now()}_${imageFile.name}`;
      
      const storageRef = ref(storage, storagePath);
      
      // Upload the file
      await uploadBytes(storageRef, imageFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setUploading(false);
      
      // Call callback
      if (onImageUploaded) {
        onImageUploaded(downloadURL);
      }
      
      return downloadURL;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
      return null;
    }
  };

  // Remove the image
  const handleRemoveImage = () => {
    setImagePreview('');
    setImageFile(null);
    
    // Call callback
    if (onImageUploaded) {
      onImageUploaded('');
    }
  };

  return (
    <div>
      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Product Image
      </label>
      
      <div className="mt-1 flex items-center space-x-4">
        {/* Image Preview */}
        <div className={`flex-shrink-0 h-20 w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md overflow-hidden flex items-center justify-center relative`}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          
          {/* Remove button (shows only when image exists) */}
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className={`absolute top-0 right-0 p-1 ${
                darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
              } rounded-bl-md hover:bg-red-500 hover:text-white transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Upload Controls */}
        <div className="flex flex-col flex-1">
          {/* File Input */}
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              id="product-image"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="product-image"
              className={`inline-flex items-center px-3 py-1.5 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } border rounded-md text-sm font-medium cursor-pointer transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              {imagePreview ? 'Change' : 'Select Image'}
            </label>
            
            {/* Status indicator */}
            {uploading && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
              }`}>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          )}
          
          {/* Description */}
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Recommended: 600×600px or larger, JPEG or PNG, under 2MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductImageUpload;