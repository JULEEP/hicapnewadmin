import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiPlus, FiEdit, FiTrash2, FiImage, 
  FiCheck, FiX, FiUpload, FiEye,
  FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const API_BASE = 'https://api.techsterker.com/api/admin';

const PopupManagement = () => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPopups, setLoadingPopups] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: null
  });
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    setLoadingPopups(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/all`);
      console.log('API Response:', res.data); // Debug log
      
      if (res.data?.success) {
        // Check if data exists in response
        const popupData = res.data.data || [];
        setPopups(popupData);
        
        if (popupData.length === 0) {
          setError('No popups found.');
        }
      } else {
        setError('Failed to fetch popups. Server response was not successful.');
      }
    } catch (err) {
      console.error('Error fetching popups:', err);
      setError('Failed to fetch popups. Please check your connection.');
    } finally {
      setLoadingPopups(false);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, JPG, GIF, or WebP image.');
      return;
    }

    // Validate file size (2MB max for popup)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditFormData({
          image: file,
          imagePreview: reader.result
        });
      } else {
        setFormData({
          image: file,
          imagePreview: reader.result
        });
      }
    };
    reader.readAsDataURL(file);

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      setError('Please select an image for the popup.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('image', formData.image);

      const res = await axios.post(
        `${API_BASE}/add`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data?.success) {
        setSuccess('Popup added successfully!');
        fetchPopups();
        closeAddModal();
        resetForm();
      } else {
        setError(res.data?.message || 'Failed to add popup.');
      }
    } catch (err) {
      console.error('Error adding popup:', err);
      if (err.response?.data) {
        setError(err.response.data.message || 'Failed to add popup.');
      } else if (err.response?.status === 413) {
        setError('File is too large. Maximum size is 2MB.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPopup) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      if (editFormData.image) {
        submitData.append('image', editFormData.image);
      }

      const res = await axios.put(
        `${API_BASE}/update/${selectedPopup._id}`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (res.data?.success) {
        setSuccess('Popup updated successfully!');
        fetchPopups();
        closeEditModal();
      } else {
        setError(res.data?.message || 'Failed to update popup.');
      }
    } catch (err) {
      console.error('Error updating popup:', err);
      if (err.response?.data) {
        setError(err.response.data.message || 'Failed to update popup.');
      } else if (err.response?.status === 413) {
        setError('File is too large. Maximum size is 2MB.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this popup? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.delete(`${API_BASE}/delete/${id}`);

      if (res.data?.success) {
        setSuccess('Popup deleted successfully!');
        fetchPopups();
      } else {
        setError(res.data?.message || 'Failed to delete popup.');
      }
    } catch (err) {
      console.error('Error deleting popup:', err);
      if (err.response?.data) {
        setError(err.response.data.message || 'Failed to delete popup.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setLoading(true);
    try {
      // Note: यदि आपके API में active status toggle करने का endpoint हो तो यहाँ implement करें
      setSuccess(`Popup ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchPopups();
    } catch (err) {
      console.error('Error toggling popup status:', err);
      setError('Failed to update popup status.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const openEditModal = (popup) => {
    setSelectedPopup(popup);
    setEditFormData({
      image: null,
      imagePreview: null
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPopup(null);
    setEditFormData({
      image: null,
      imagePreview: null
    });
  };

  const openPreviewModal = (imageUrl) => {
    setPreviewImage(imageUrl);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewImage('');
  };

  const resetForm = () => {
    setFormData({
      image: null,
      imagePreview: null
    });
    const fileInput = document.getElementById('popupImage');
    if (fileInput) fileInput.value = '';
  };

  const getFileName = (file) => {
    if (!file) return 'No file chosen';
    return file.name.length > 20
      ? file.name.substring(0, 20) + '...'
      : file.name;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if it starts with /uploads
    if (imagePath.startsWith('/uploads')) {
      return `https://api.techsterker.com${imagePath}`;
    }
    
    // If it's just a filename, add the path
    return `https://api.techsterker.com/uploads/popups/${imagePath}`;
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2U8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
  };

  // Count active popups
  const activePopupsCount = popups.filter(popup => popup.isActive).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Add Popup Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiPlus />
                Add New Popup
              </h2>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FiImage />
                    Popup Image *
                  </span>
                  <span className="text-sm text-gray-500 font-normal">
                    Recommended: 800x600px, JPG/PNG (Max 2MB)
                  </span>
                </label>

                <div className="mt-2">
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-4">
                    <div className="space-y-3 text-center">
                      {formData.imagePreview ? (
                        <div>
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg border"
                            onError={handleImageError}
                          />
                          <p className="text-xs text-gray-500 mt-2">Preview</p>
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 text-sm text-gray-600">
                            <label
                              htmlFor="popupImage"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>Click to upload an image</span>
                              <input
                                id="popupImage"
                                name="image"
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                onChange={(e) => handleFileChange(e, false)}
                                className="sr-only"
                              />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                              or drag and drop
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF, WebP up to 2MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {formData.image && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden">
                            <img
                              src={formData.imagePreview}
                              alt="Selected"
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{getFileName(formData.image)}</p>
                            <p className="text-xs text-gray-500">
                              {(formData.image.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.image}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    loading || !formData.image
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Add Popup
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Popup Modal */}
      {showEditModal && selectedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiEdit />
                Edit Popup
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <FiImage />
                    Update Image (Optional)
                  </span>
                  <span className="text-sm text-gray-500 font-normal">
                    Leave empty to keep current image
                  </span>
                </label>

                <div className="space-y-4">
                  {/* Current Image */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                    <div className="relative">
                      <img
                        src={getImageUrl(selectedPopup.image)}
                        alt="Current popup"
                        className="max-h-48 w-full object-contain mx-auto rounded-lg border bg-gray-100"
                        onError={handleImageError}
                      />
                      {!selectedPopup.image && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <FiAlertCircle className="text-gray-400" size={48} />
                        </div>
                      )}
                    </div>
                    {selectedPopup.image && (
                      <p className="text-xs text-gray-500 text-center mt-2 truncate">
                        {selectedPopup.image.split('/').pop()}
                      </p>
                    )}
                  </div>

                  {/* New Image Upload */}
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-4">
                    <div className="space-y-3 text-center">
                      {editFormData.imagePreview ? (
                        <div>
                          <img
                            src={editFormData.imagePreview}
                            alt="New preview"
                            className="max-h-32 mx-auto rounded-lg border"
                            onError={handleImageError}
                          />
                          <p className="text-xs text-gray-500 mt-2">New image preview</p>
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="mt-2 text-sm text-gray-600">
                            <label
                              htmlFor="editPopupImage"
                              className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>Upload new image</span>
                              <input
                                id="editPopupImage"
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                onChange={(e) => handleFileChange(e, true)}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Update Popup
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiEye />
                Image Preview
              </h2>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="text-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Popup preview"
                    className="max-h-[60vh] max-w-full mx-auto rounded-lg border"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <FiAlertCircle className="text-gray-400 mb-4" size={64} />
                    <p className="text-gray-500">Image not available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t">
              <div className="flex justify-end">
                <button
                  onClick={closePreviewModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FiImage />
                Popup Management
              </h1>
              <p className="text-blue-100 mt-2">
                Manage popup images that appear on your website
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchPopups}
                disabled={loadingPopups}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                <FiRefreshCw className={loadingPopups ? 'animate-spin' : ''} />
                {loadingPopups ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={openAddModal}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <FiPlus />
                Add New Popup
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" size={20} />
                <div>
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 mr-2" size={20} />
                <div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Card 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Popups</p>
                  <p className="text-2xl font-bold text-blue-800 mt-1">
                    {popups.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiImage className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Stats Card 2 */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Popups</p>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    {activePopupsCount}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FiEye className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Stats Card 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Last Added</p>
                  <p className="text-sm font-medium text-purple-800 mt-1">
                    {popups.length > 0 ? formatDate(popups[0].createdAt) : 'No popups'}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FiUpload className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Popups Table */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">All Popups</h3>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  {activePopupsCount} Active • {popups.length - activePopupsCount} Inactive
                </div>
              </div>
            </div>

            {loadingPopups ? (
              <div className="p-8 text-center">
                <AiOutlineLoading3Quarters className="animate-spin text-blue-600 mx-auto mb-3" size={30} />
                <p className="text-gray-500">Loading popups...</p>
              </div>
            ) : popups.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                    <FiImage className="text-gray-400" size={32} />
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No popups yet</h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't added any popup images. Start by adding your first popup.
                </p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FiPlus />
                  Add First Popup
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Image Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popups.map((popup) => {
                      const imageUrl = getImageUrl(popup.image);
                      return (
                        <tr key={popup._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16 relative">
                                <div className="h-16 w-16 rounded-lg border overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {imageUrl ? (
                                    <img
                                      className="h-full w-full object-cover"
                                      src={imageUrl}
                                      alt="Popup"
                                      onError={handleImageError}
                                    />
                                  ) : (
                                    <FiImage className="text-gray-400" size={24} />
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Popup Image
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {popup.image ? popup.image.split('/').pop() : 'No image'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  ID: {popup._id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              popup.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                popup.isActive ? 'bg-green-500' : 'bg-gray-500'
                              }`}></span>
                              {popup.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{formatDate(popup.createdAt)}</div>
                            <div className="text-xs text-gray-500">
                              Updated: {formatDate(popup.updatedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openPreviewModal(imageUrl)}
                                className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                                title="View"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(popup)}
                                className="text-green-600 hover:text-green-900 transition-colors p-2 hover:bg-green-50 rounded-lg"
                                title="Edit"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(popup._id)}
                                className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <span className="text-blue-600">💡</span>
              How to Use
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p className="font-medium mb-1">Adding Popups:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Click "Add New Popup" button</li>
                  <li>Upload an image (max 2MB)</li>
                  <li>Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>Recommended size: 800x600 pixels</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Managing Popups:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Click 👁️ to preview popup</li>
                  <li>Click ✏️ to edit popup image</li>
                  <li>Click 🗑️ to delete popup</li>
                  <li>Refresh button updates the list</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PopupManagement;