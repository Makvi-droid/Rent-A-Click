// src/services/cloudinaryService.js

const CLOUDINARY_CLOUD_NAME = "dehgg8xgk";
const CLOUDINARY_UPLOAD_PRESET = "rent-a-click"; // Replace with your actual preset name

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path in Cloudinary (e.g., 'profile-photos/userId')
 * @returns {Promise<{url: string, publicId: string}>} - The uploaded image URL and public ID
 */
export const uploadToCloudinary = async (file, folder) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    // Optional: Add transformations for optimization
    // formData.append('transformation', 'c_limit,w_1000,q_auto,f_auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * Note: This requires a signed request, so it should be done from your backend
 * For now, we'll just remove the reference from Firestore
 * @param {string} publicId - The public ID of the image to delete
 */
export const deleteFromCloudinary = async (publicId) => {
  console.warn("Delete from Cloudinary requires backend implementation");
  // This would need to be implemented on your backend with API Secret
  // For now, old images will remain in Cloudinary (you can set up auto-cleanup rules)
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<{file: File, folder: string}>} uploads - Array of files with their target folders
 * @returns {Promise<Array<{url: string, publicId: string}>>} - Array of uploaded image data
 */
export const uploadMultipleToCloudinary = async (uploads) => {
  try {
    const uploadPromises = uploads.map(({ file, folder }) =>
      uploadToCloudinary(file, folder)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw error;
  }
};
