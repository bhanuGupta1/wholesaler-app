// src/components/common/ImageUploader.jsx
import { useState, useEffect, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/config";

/**
 * A unified, reusable image upload component with preview and validation
 *
 * @param {Object} props
 * @param {string} props.label - The label for the component
 * @param {string} props.initialImage - Initial image URL to display
 * @param {Function} props.onImageUploaded - Callback function when image is uploaded or changed
 * @param {Function} props.uploadToStorage - Custom upload function (optional)
 * @param {string} props.folder - Storage folder path (default: 'images')
 * @param {string} props.filePrefix - Prefix for uploaded file names
 * @param {number} props.maxSizeMB - Maximum file size in MB
 * @param {boolean} props.showPreview - Whether to show image preview
 * @param {string} props.previewSize - Size of the preview (sm, md, lg)
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.autoUpload - Whether to automatically upload on file selection
 */
const ImageUploader = ({
  label = "Upload Image",
  initialImage = "",
  onImageUploaded,
  uploadToStorage = null,
  folder = "images",
  filePrefix = "",
  maxSizeMB = 2,
  showPreview = true,
  previewSize = "md",
  darkMode = false,
  className = "",
  autoUpload = false,
  customId = null,
  buttonLabel = null,
}) => {
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  // Update preview if initialImage changes externally
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  // Preview sizes
  const previewSizes = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError(`Please select a valid image file (JPEG, PNG, GIF, or WEBP)`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Reset error
    setError("");
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Auto upload if enabled
    if (autoUpload) {
      await handleUpload(file);
    } else if (onImageUploaded) {
      // If we're not auto-uploading, still notify parent of the file
      onImageUploaded(file);
    }
  };

  // Upload image to Firebase Storage or use custom upload function
  const handleUpload = async (fileToUpload = null) => {
    const file = fileToUpload || imageFile;

    if (!file) {
      if (imagePreview && initialImage) {
        // If we have a preview but no file, it means we're keeping the existing image
        return initialImage;
      }
      setError("Please select an image first");
      return "";
    }

    try {
      setIsUploading(true);
      setError("");
      setUploadProgress(0);

      let downloadURL;

      // Use custom upload function if provided
      if (uploadToStorage) {
        downloadURL = await uploadToStorage(file);
      } else {
        // Otherwise use default Firebase Storage upload
        // Create a unique storage path
        const fileName = `${filePrefix || ""}${Date.now()}_${file.name}`;
        const storagePath = customId
          ? `${folder}/${customId}/${fileName}`
          : `${folder}/${fileName}`;

        const storageRef = ref(storage, storagePath);

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setUploadProgress(Math.min(progress, 90));
          if (progress >= 90) clearInterval(progressInterval);
        }, 200);

        // Upload the file
        await uploadBytes(storageRef, file);
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Get download URL
        downloadURL = await getDownloadURL(storageRef);
      }

      // Call callback
      if (onImageUploaded) {
        onImageUploaded(downloadURL);
      }

      setIsUploading(false);
      return downloadURL;
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
      setIsUploading(false);
      return null;
    }
  };

  // Remove the image
  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
    setUploadProgress(0);

    // Call callback
    if (onImageUploaded) {
      onImageUploaded("");
    }

    // Reset the file input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
        >
          {label}
        </label>
      )}

      <div className="mt-1 flex items-center space-x-4">
        {/* Image Preview */}
        {showPreview && (
          <div
            className={`flex-shrink-0 ${previewSizes[previewSize]} ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-md overflow-hidden flex items-center justify-center relative`}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}

            {/* Remove button (shows only when image exists) */}
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className={`absolute top-0 right-0 p-1 ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700"
                } rounded-bl-md hover:bg-red-500 hover:text-white transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Upload Controls */}
        <div className="flex flex-col flex-1">
          {/* File Input and Button(s) */}
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              id={`image-upload-${customId || "default"}`}
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor={`image-upload-${customId || "default"}`}
              className={`inline-flex items-center px-3 py-1.5 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } border rounded-md text-sm font-medium cursor-pointer transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              {imagePreview ? "Change" : buttonLabel || "Select Image"}
            </label>

            {/* Manual upload button (only if not auto-uploading and we have a file) */}
            {!autoUpload && imageFile && !isUploading && (
              <button
                onClick={() => handleUpload()}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white ${
                  darkMode
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Upload
              </button>
            )}

            {/* Status indicator */}
            {isUploading && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  darkMode
                    ? "bg-indigo-900/30 text-indigo-400"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p
              className={`text-xs mt-1 ${darkMode ? "text-red-400" : "text-red-600"}`}
            >
              {error}
            </p>
          )}

          {/* Upload progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  Uploading...
                </span>
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  {uploadProgress}%
                </span>
              </div>
              <div
                className={`w-full h-1.5 bg-gray-200 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
              >
                <div
                  className={`h-full ${darkMode ? "bg-indigo-500" : "bg-indigo-600"} rounded-full`}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Description hint */}
          <p
            className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Recommended: Square image (e.g., 600×600px), JPEG or PNG, under{" "}
            {maxSizeMB}MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
