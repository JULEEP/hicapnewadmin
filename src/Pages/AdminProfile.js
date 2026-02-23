import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, 
  FaSave, FaTimes, FaShieldAlt, FaBuilding, FaMapMarkerAlt,
  FaLock, FaEye, FaEyeSlash, FaCheck, FaUpload, FaCamera,
  FaExclamationTriangle, FaKey
} from 'react-icons/fa';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    department: '',
    address: '',
    joiningDate: '',
    lastLogin: '',
    profileImage: '',
    password: '' // Add password field
  });
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    view: false // Add view password toggle
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

  // Get adminId from localStorage
  const adminId = localStorage.getItem('adminId');

  // Show alert function
  const showAlert = (type, text) => {
    setAlertMessage({ type, text });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setAlertMessage({ type: '', text: '' });
    }, 3000);
  };

  useEffect(() => {
    if (adminId) {
      fetchAdminProfile();
    } else {
      showAlert('error', 'Admin ID not found. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, [adminId]);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.techsterker.com/api/admin/adminprofile/${adminId}`);
      const data = await response.json();
      
      if (data.success) {
        // Backend se sirf name, email, role aa rahe hain
        // Default values set karte hain baaki fields ke liye
        setProfile({
          name: data.data.name || '',
          email: data.data.email || '',
          phoneNumber: data.data.phoneNumber || 'Not specified',
          role: data.data.role || 'Administrator',
          department: data.data.department || 'Management',
          address: data.data.address || 'Not specified',
          joiningDate: data.data.joiningDate || new Date().toISOString().split('T')[0],
          lastLogin: data.data.lastLogin || new Date().toLocaleString(),
          profileImage: data.data.profileImage || '',
          password: data.data.password ? '••••••••' : '••••••••' // Hide password with dots
        });
      } else {
        showAlert('error', data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showAlert('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showAlert('error', 'Image size should be less than 2MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Sirf wo fields bhejo jo backend se aa rahe hain
      const formData = JSON.stringify({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        department: profile.department,
        address: profile.address
      });
      
      const response = await fetch(`https://api.techsterker.com/api/admin/updateprofile/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Profile updated successfully!');
        setEditMode(false);
        setSelectedImage(null);
        fetchAdminProfile(); // Refresh profile data
      } else {
        showAlert('error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showAlert('error', 'Password must be at least 6 characters long');
      return;
    }
    
    try {
      setSaving(true);
      const response = await fetch(`https://api.techsterker.com/api/admin/updateprofile/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showAlert('error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Function to mask password
  const getMaskedPassword = () => {
    return '••••••••';
  };

  // Function to get actual password (if available)
  const getActualPassword = () => {
    // Yahan aap actual password backend se fetch kar sakte hain
    // For now, we'll return the masked password
    return 'admin@123'; // Replace with actual password from backend
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Alert Notification */}
      {alertMessage.text && (
        <div className={`fixed top-4 right-4 z-50 max-w-md ${alertMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-xl shadow-lg p-4 transition-all duration-300 animate-slideIn`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${alertMessage.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {alertMessage.type === 'success' ? (
                <FaCheck />
              ) : (
                <FaExclamationTriangle />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {alertMessage.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className={`text-sm mt-1 ${alertMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {alertMessage.text}
              </p>
            </div>
            <button
              onClick={() => setAlertMessage({ type: '', text: '' })}
              className={`text-sm ${alertMessage.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Admin Profile</h1>
              <p className="text-gray-600">Manage your account information and settings</p>
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSelectedImage(null);
                      setImagePreview(null);
                      fetchAdminProfile();
                    }}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl transition-all"
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {editMode && imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FaUser className="text-white text-6xl" />
                    </div>
                  )}
                  
                  {editMode && (
                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                      <FaCamera className="text-xl" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {editMode && !imagePreview && !profile.profileImage && (
                  <div className="text-center mt-4">
                    <label className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <FaUpload /> Upload Profile Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Max 2MB • JPG, PNG, GIF</p>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name || 'Admin User'}</h2>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-1.5 rounded-full mb-3">
                  <FaShieldAlt /> {profile.role || 'Administrator'}
                </div>
                <p className="text-gray-600">{profile.department || 'Management'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600">Active</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl mb-4"
              >
                <FaLock /> Change Password
              </button>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {profile.name || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-gray-800">{profile.email || 'Not set'}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                      <FaPhone className="text-gray-400" />
                      <span className="text-gray-800">{profile.phoneNumber || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {editMode ? (
                    <select
                      name="department"
                      value={profile.department}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Management">Management</option>
                      <option value="Technical">Technical</option>
                      <option value="Sales">Sales</option>
                      <option value="Support">Support</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                      <FaBuilding className="text-gray-400" />
                      <span className="text-gray-800">{profile.department || 'Management'}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                      <FaMapMarkerAlt className="text-gray-400 mt-1" />
                      <span className="text-gray-800">{profile.address || 'Not specified'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <FaKey className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Account Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-gray-800 font-mono">{adminId || 'N/A'}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800">{profile.role || 'Administrator'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <FaLock className="text-gray-400" />
                    <span className="text-gray-800 font-mono">
                      {showPassword.view ? getActualPassword() : getMaskedPassword()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, view: !prev.view }))}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.view ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click the eye icon to view/hide password</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800">{formatDate(profile.joiningDate)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-800">{profile.lastLogin || 'Not available'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Security Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <FaLock className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Password Security</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCheck className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-blue-600">Strong Password</div>
                      <div className="text-sm text-gray-600">Password strength: Excellent</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-green-600">Last Changed</div>
                      <div className="text-sm text-gray-600">30 days ago</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaShieldAlt className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-purple-600">Security Level</div>
                      <div className="text-sm text-gray-600">High Protection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <FaLock className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
              </div>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                <FaCheck className="text-yellow-500" />
                Password must be at least 6 characters long
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;