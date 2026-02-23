import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiUsers, FiFileText, FiCheckCircle, FiUserCheck, FiUserX } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://api.techsterker.com/api';

const CreateCertificate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    enrolledId: '',
    certificateFile: null,
    selectedUsers: []
  });
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/allenrollments`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEnrollments(res.data.data);
      } else {
        setError('No enrollments found.');
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to fetch enrollments.');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      selectedUsers: []
    });

    if (name === 'enrolledId') {
      const selected = enrollments.find(enrollment => enrollment._id === value);
      setSelectedEnrollment(selected || null);
      setSelectAll(true);
    }
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => {
      const newSelectedUsers = [...prev.selectedUsers];
      if (newSelectedUsers.includes(userId)) {
        return {
          ...prev,
          selectedUsers: newSelectedUsers.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          selectedUsers: [...newSelectedUsers, userId]
        };
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEnrollment?.enrolledUsers) {
      if (selectAll) {
        const allUserIds = selectedEnrollment.enrolledUsers.map(user => user._id);
        setFormData(prev => ({
          ...prev,
          selectedUsers: allUserIds
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          selectedUsers: []
        }));
      }
      setSelectAll(!selectAll);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, JPEG, JPG, or PNG file.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB.');
      return;
    }

    setFormData({
      ...formData,
      certificateFile: file
    });

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.enrolledId) {
      setError('Please select an enrollment batch.');
      return;
    }

    if (!formData.certificateFile) {
      setError('Please upload a certificate file.');
      return;
    }

    if (formData.selectedUsers.length === 0) {
      setError('Please select at least one user.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append('enrolledId', formData.enrolledId);
      submitData.append('certificateFile', formData.certificateFile);
      submitData.append('selectedUsers', JSON.stringify(formData.selectedUsers));

      console.log('Submitting certificate request...');
      
      const res = await axios.post(
        `${API_BASE}/certificate`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        }
      );

      console.log('Response received:', res.data);
      
      // FIX: Check for success response properly
      if (res.data && res.data.success === true) {
        setSuccess(res.data.message || `Certificates created successfully for ${formData.selectedUsers.length} user(s)!`);
        
        // 3 seconds ke baad certificate list page pe redirect
        setTimeout(() => {
          navigate('/certificate-list');
        }, 3000);
        
        // Optional: Reset form
        setFormData({
          enrolledId: '',
          certificateFile: null,
          selectedUsers: []
        });
        setSelectedEnrollment(null);
        setFilePreview(null);
        setSelectAll(true);
        const fileInput = document.getElementById('certificateFile');
        if (fileInput) fileInput.value = '';
      } else {
        // Agar success false hai ya undefined hai
        setError(res.data?.message || 'Failed to create certificates. Unknown error.');
      }
    } catch (err) {
      console.error('Error creating certificates:', err);
      
      // FIX: Better error handling
      if (err.response && err.response.data) {
        // Server se error response aaya
        const errorData = err.response.data;
        setError(errorData.message || errorData.error || 'Failed to create certificates.');
      } else if (err.request) {
        // Request bheji but response nahi aaya
        setError('No response from server. Please check your connection.');
      } else {
        // Request bhejne mein error
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileName = () => {
    if (!formData.certificateFile) return 'No file chosen';
    return formData.certificateFile.name.length > 30
      ? formData.certificateFile.name.substring(0, 30) + '...'
      : formData.certificateFile.name;
  };

  const getFileIcon = () => {
    if (!formData.certificateFile) return <FiFileText size={20} />;
    
    const type = formData.certificateFile.type;
    if (type === 'application/pdf') {
      return <span className="text-red-500">📄</span>;
    } else if (type.startsWith('image/')) {
      return <span className="text-blue-500">🖼️</span>;
    }
    return <FiFileText size={20} />;
  };

  const handleViewCertificates = () => {
    navigate('/certificate-list');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              Create Certificates
            </h2>
            <p className="text-gray-600 mt-2">
              Upload a certificate template and assign it to selected users in a batch.
            </p>
          </div>
          <button
            onClick={handleViewCertificates}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            View All Certificates
          </button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="text-green-500 mr-2" size={20} />
              <div>
                <p className="text-green-700 font-medium">{success}</p>
                <p className="text-green-600 text-sm mt-1">
                  Redirecting to certificate list in 3 seconds...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <FiUsers />
                  Select Enrollment Batch *
                </span>
              </label>
              
              {loadingEnrollments ? (
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-500">Loading enrollments...</span>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-center">No enrollments found.</p>
                  <button
                    type="button"
                    onClick={fetchEnrollments}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Retry loading enrollments
                  </button>
                </div>
              ) : (
                <select
                  name="enrolledId"
                  value={formData.enrolledId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a batch...</option>
                  {enrollments.map((enrollment) => (
                    <option key={enrollment._id} value={enrollment._id}>
                      {enrollment.batchNumber} - {enrollment.batchName} 
                      {enrollment.enrolledUsers && ` (${enrollment.enrolledUsers.length} users)`}
                    </option>
                  ))}
                </select>
              )}

              {selectedEnrollment && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Selected Batch Details:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Batch Number:</span>
                        <p className="font-medium">{selectedEnrollment.batchNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Batch Name:</span>
                        <p className="font-medium">{selectedEnrollment.batchName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Users:</span>
                        <p className="font-medium">
                          {selectedEnrollment.enrolledUsers?.length || 0} users
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Selected Users:</span>
                        <p className="font-medium text-blue-600">
                          {formData.selectedUsers.length} users
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedEnrollment.enrolledUsers && selectedEnrollment.enrolledUsers.length > 0 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <FiUserCheck />
                          Select Users for Certificates
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Selected: {formData.selectedUsers.length} / {selectedEnrollment.enrolledUsers.length}
                          </span>
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectAll ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                        {selectedEnrollment.enrolledUsers.map((user) => (
                          <div
                            key={user._id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.selectedUsers.includes(user._id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => handleUserSelect(user._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {user.name || user.fullName || 'No Name'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {user.email || 'No Email'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserSelect(user._id);
                                }}
                                className={`p-2 rounded-full ${
                                  formData.selectedUsers.includes(user._id)
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {formData.selectedUsers.includes(user._id) ? (
                                  <FiUserCheck size={18} />
                                ) : (
                                  <FiUserX size={18} />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <FiUpload />
                  Upload Certificate Template *
                </span>
                <span className="text-sm text-gray-500 font-normal">
                  Supports PDF, JPG, PNG files (Max 5MB)
                </span>
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-3 text-center w-full">
                  {filePreview && (
                    <div className="mx-auto max-w-xs">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-2">Preview</p>
                    </div>
                  )}

                  {formData.certificateFile ? (
                    <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getFileIcon()}
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{getFileName()}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.certificateFile.size / 1024).toFixed(2)} KB • {
                            formData.certificateFile.type === 'application/pdf' ? 'PDF' :
                            formData.certificateFile.type.split('/')[1].toUpperCase()
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({...formData, certificateFile: null});
                          setFilePreview(null);
                          document.getElementById('certificateFile').value = '';
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 flex text-sm text-gray-600">
                        <label
                          htmlFor="certificateFile"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="certificateFile"
                            name="certificateFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.enrolledId || !formData.certificateFile || formData.selectedUsers.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                loading || !formData.enrolledId || !formData.certificateFile || formData.selectedUsers.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  Creating Certificates...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Create Certificates for {formData.selectedUsers.length} Selected User{formData.selectedUsers.length !== 1 ? 's' : ''}
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> This will create certificates for {formData.selectedUsers.length > 0 ? `${formData.selectedUsers.length} selected` : 'selected'} users. 
                The certificate will be uploaded and marked as "Pending" status for each selected user.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCertificate;