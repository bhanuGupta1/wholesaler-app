// src/components/common/ImageUploader.jsx
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

/**
 * A reusable component for image uploading
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onImageUploaded - Callback function that receives the image URL after upload
 * @param {string} props.initialImage - Initial image URL (optional)
 * @param {string} props.folder - Storage folder path (default: 'images')
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const ImageUploader = ({ onImageUploaded, initialImage = '', folder = 'images', darkMode = false }) => {
  const [image, setImage] = useState(initialImage);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setImageFile(file);

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload the image to Firebase Storage
  const handleUpload = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError('');

      // Create a unique filename
      const fileName = `${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Upload the file with progress monitoring
      const uploadTask = uploadBytes(storageRef, imageFile);
      
      // Monitor the upload
      // Note: Firebase v9 doesn't provide direct progress monitoring in the modular API
      // This is a simplified version that just shows indeterminate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Complete the upload
      await uploadTask;
      setUploadProgress(100);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Call the callback with the URL
      if (onImageUploaded) {
        onImageUploaded(downloadURL);
      }
      
      setIsUploading(false);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
      return null;
    }
  };

  // Remove the current image
  const handleRemoveImage = () => {
    setImage('');
    setImageFile(null);
    setUploadProgress(0);
    if (onImageUploaded) {
      onImageUploaded('');
    }
  };

  return (
    <div className="w-full">
      {/* Image preview */}
      {image && (
        <div className="mb-4 relative">
          <img
            src={image}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className={`absolute top-2 right-2 p-1 rounded-full ${
              darkMode 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* File input and upload button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label
            htmlFor="image-upload"
            className={`flex justify-center items-center px-4 py-2 border rounded-lg cursor-pointer ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {image ? 'Change Image' : 'Select Image'}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {imageFile && !isUploading && (
          <button
            type="button"
            onClick={handleUpload}
            className={`px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Upload
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Uploading...</span>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{uploadProgress}%</span>
          </div>
          <div className={`w-full h-2 bg-gray-300 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;