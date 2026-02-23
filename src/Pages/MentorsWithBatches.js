import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBook,
  FaUsers,
  FaCalendar,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp
} from "react-icons/fa";

const API_BASE = "https://api.techsterker.com/api";

const MentorsWithBatches = () => {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [mentorToEdit, setMentorToEdit] = useState(null);
  const [mentorToDelete, setMentorToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    withBatches: 0,
    withCourses: 0
  });

  const mentorsPerPage = 10;

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/mentors/with-batches`);
      if (res.data && Array.isArray(res.data.data)) {
        const mentorsData = res.data.data;
        setMentors(mentorsData);
        
        // Calculate statistics
        const withBatches = mentorsData.filter(m => m.enrolledBatches?.length > 0).length;
        const withCourses = mentorsData.filter(m => m.assignedCourses?.length > 0).length;
        
        setStats({
          total: mentorsData.length,
          withBatches,
          withCourses
        });
        
        setSuccess(`Successfully loaded ${mentorsData.length} mentors`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError("Invalid data format received from server.");
      }
    } catch (err) {
      console.error("Error fetching mentors:", err);
      setError(err.response?.data?.message || "Failed to fetch mentors.");
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (mentor) => {
    if (!mentor) return;
    
    setMentorToEdit(mentor);
    setEditFormData({
      firstName: mentor.firstName || '',
      lastName: mentor.lastName || '',
      email: mentor.email || '',
      phoneNumber: mentor.phoneNumber || '',
      expertise: mentor.expertise || '',
      subjects: mentor.subjects?.join(', ') || ''
    });
    setEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (mentor) => {
    if (!mentor) return;
    setMentorToDelete(mentor);
    setDeleteModal(true);
  };

  // Handle edit change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!mentorToEdit || !mentorToEdit._id) return;

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/our-mentor/mentor/${mentorToEdit._id}`, editFormData);
      
      if (res.data.success) {
        setMentors(prev => 
          prev.map(m => m._id === mentorToEdit._id ? res.data.data : m)
        );
        setEditModal(false);
        setMentorToEdit(null);
        setSuccess('Mentor updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update mentor');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete mentor
  const handleDeleteMentor = async () => {
    if (!mentorToDelete) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/our-mentor/mentor/${mentorToDelete._id}`);
      
      if (res.data.success) {
        setMentors(prev => prev.filter(m => m._id !== mentorToDelete._id));
        setDeleteModal(false);
        setMentorToDelete(null);
        setSuccess('Mentor deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete mentor');
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter mentors
  const filteredMentors = mentors
    .filter(mentor => {
      if (!mentor) return false;
      
      const fullName = `${mentor.firstName || ''} ${mentor.lastName || ''}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(search.toLowerCase()) ||
        (mentor.email && mentor.email.toLowerCase().includes(search.toLowerCase())) ||
        (mentor.expertise && mentor.expertise.toLowerCase().includes(search.toLowerCase()));
      
      const matchesExpertise = expertiseFilter === 'all' || 
        (mentor.expertise && mentor.expertise.toLowerCase() === expertiseFilter);
      
      return matchesSearch && matchesExpertise;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'batches':
          aValue = a.enrolledBatches?.length || 0;
          bValue = b.enrolledBatches?.length || 0;
          break;
        case 'courses':
          aValue = a.assignedCourses?.length || 0;
          bValue = b.assignedCourses?.length || 0;
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const indexOfLast = currentPage * mentorsPerPage;
  const indexOfFirst = indexOfLast - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  // Get unique expertise for filter
  const uniqueExpertise = [...new Set(mentors
    .map(m => m.expertise)
    .filter(Boolean)
    .map(e => e.toLowerCase())
  )];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setExpertiseFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Close all modals
  const closeAllModals = () => {
    setSelectedMentor(null);
    setEditModal(false);
    setDeleteModal(false);
    setMentorToEdit(null);
    setMentorToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mentors Management</h1>
          <p className="text-gray-600">Manage all mentors with their assigned batches and courses</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-red-500 mr-3">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✅</span>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Mentors</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FaBook className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Batches</p>
                <p className="text-3xl font-bold text-gray-800">{stats.withBatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <FaGraduationCap className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Courses</p>
                <p className="text-3xl font-bold text-gray-800">{stats.withCourses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-500" />
                <select
                  value={expertiseFilter}
                  onChange={(e) => {
                    setExpertiseFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Expertise</option>
                  {uniqueExpertise.map((exp, idx) => (
                    <option key={idx} value={exp}>
                      {exp.charAt(0).toUpperCase() + exp.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="batches">Sort by Batches</option>
                  <option value="courses">Sort by Courses</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredMentors.length} of {mentors.length} mentors
              {search && (
                <span className="ml-2 text-blue-600">
                  for "{search}"
                </span>
              )}
            </div>
            
            <button
              onClick={fetchMentors}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>

        {/* Mentors Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="py-4 px-6 text-left font-semibold">#</th>
                  <th className="py-4 px-6 text-left font-semibold">Mentor</th>
                  <th className="py-4 px-6 text-left font-semibold">Contact</th>
                  <th className="py-4 px-6 text-left font-semibold">Expertise & Subjects</th>
                  <th className="py-4 px-6 text-left font-semibold">Assigned</th>
                  <th className="py-4 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading mentors...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentMentors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No mentors found</h3>
                        <p className="text-gray-500 max-w-md">
                          {search || expertiseFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No mentors available. Register your first mentor!'}
                        </p>
                        {search && (
                          <button
                            onClick={resetFilters}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentMentors.map((mentor, index) => (
                    <tr 
                      key={mentor._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                          {indexOfFirst + index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {mentor.firstName} {mentor.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Joined: {formatDate(mentor.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <FaEnvelope className="text-gray-400 mr-2" size={12} />
                            <a href={`mailto:${mentor.email}`} className="text-blue-600 hover:underline">
                              {mentor.email}
                            </a>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="text-gray-400 mr-2" size={12} />
                            <a href={`tel:${mentor.phoneNumber}`} className="hover:text-blue-600">
                              {mentor.phoneNumber}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          {mentor.expertise && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {mentor.expertise}
                            </span>
                          )}
                          {mentor.subjects && mentor.subjects.length > 0 && (
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {mentor.subjects.slice(0, 3).join(', ')}
                              {mentor.subjects.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaBook className="text-green-500 mr-2" size={14} />
                            <span className="text-sm">
                              Courses: <span className="font-semibold">{mentor.assignedCourses?.length || 0}</span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaCalendar className="text-purple-500 mr-2" size={14} />
                            <span className="text-sm">
                              Batches: <span className="font-semibold">{mentor.enrolledBatches?.length || 0}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                            onClick={() => setSelectedMentor(mentor)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Edit Mentor"
                            onClick={() => openEditModal(mentor)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Mentor"
                            onClick={() => openDeleteModal(mentor)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredMentors.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} •{' '}
                  <span className="font-semibold">
                    {indexOfFirst + 1}-{Math.min(indexOfLast, filteredMentors.length)}
                  </span> of {filteredMentors.length} mentors
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isCurrent = currentPage === page;
                      const isNear = Math.abs(currentPage - page) <= 1;
                      const isFirstOrLast = page === 1 || page === totalPages;
                      
                      if (isFirstOrLast || isNear || page === currentPage) {
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg transition-all ${
                              isCurrent
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={i} className="px-2 text-gray-500">...</span>;
                      }
                      
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                      setCurrentPage(page);
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Mentor Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mentor Details</h2>
                  <p className="text-gray-600 mt-1">Complete mentor profile and assignments</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FaUser className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                        <p className="text-gray-600">Basic mentor details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Mentor ID", value: selectedMentor._id, icon: "🆔" },
                        { label: "Full Name", value: `${selectedMentor.firstName} ${selectedMentor.lastName}`, icon: "👤" },
                        { label: "Email Address", value: selectedMentor.email, icon: "📧" },
                        { label: "Phone Number", value: selectedMentor.phoneNumber, icon: "📱" },
                        { label: "Account Created", value: formatDate(selectedMentor.createdAt), icon: "📅" },
                        { label: "Last Updated", value: formatDate(selectedMentor.updatedAt), icon: "🔄" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start py-3 border-b border-gray-100 last:border-0">
                          <span className="text-lg mr-3">{item.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{item.label}</p>
                            <p className="font-medium text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <FaGraduationCap className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Professional Information</h3>
                        <p className="text-gray-600">Expertise and subjects</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">🎯</span> Expertise
                        </h4>
                        {selectedMentor.expertise ? (
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {selectedMentor.expertise}
                          </span>
                        ) : (
                          <p className="text-gray-500">No expertise specified</p>
                        )}
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📚</span> Subjects
                        </h4>
                        {selectedMentor.subjects && selectedMentor.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedMentor.subjects.map((subject, idx) => (
                              <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {subject}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No subjects specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Courses */}
                  {selectedMentor.assignedCourses && selectedMentor.assignedCourses.length > 0 && (
                    <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-lg border border-yellow-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                          <FaBook className="text-yellow-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Assigned Courses</h3>
                          <p className="text-gray-600">Courses assigned to this mentor</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedMentor.assignedCourses.map((course, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">{course.name}</h4>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                #{idx + 1}
                              </span>
                            </div>
                            {course.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Duration: {course.duration || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrolled Batches */}
                  {selectedMentor.enrolledBatches && selectedMentor.enrolledBatches.length > 0 && (
                    <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-lg border border-purple-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <FaCalendar className="text-purple-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Enrolled Batches</h3>
                          <p className="text-gray-600">Batches this mentor is enrolled in</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedMentor.enrolledBatches.map((batch, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800">{batch.batchName}</h4>
                                <p className="text-sm text-gray-600">
                                  Batch #{batch.batchNumber} • {batch.category || 'No category'}
                                </p>
                              </div>
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                #{idx + 1}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Start Date</p>
                                <p className="font-medium">{formatDate(batch.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Timings</p>
                                <p className="font-medium">{batch.timings || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="font-medium">{batch.courseId?.duration || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeAllModals();
                    openEditModal(selectedMentor);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Edit Mentor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mentor Modal */}
     {/* Edit Mentor Modal */}
{editModal && mentorToEdit && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"> {/* यहाँ changes */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10"> {/* यहाँ changes */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Mentor</h2>
          <p className="text-gray-600 mt-1">Update mentor information</p>
        </div>
        <button
          onClick={closeAllModals}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {/* Form fields यहाँ हैं */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={editFormData.firstName}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={editFormData.lastName}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={editFormData.phoneNumber}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expertise
            </label>
            <input
              type="text"
              name="expertise"
              value={editFormData.expertise}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="E.g., Full Stack Development"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects (Comma separated)
            </label>
            <input
              type="text"
              name="subjects"
              value={editFormData.subjects}
              onChange={handleEditChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="JavaScript, React, Node.js"
            />
          </div>
        </div>
      </div>
      
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3 rounded-b-2xl"> {/* यहाँ changes */}
        <button
          onClick={closeAllModals}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveEdit}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}

        {/* Delete Confirmation Modal */}
        {deleteModal && mentorToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Delete Mentor</h2>
                    <p className="text-gray-600 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
              
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-yellow-600 mr-2">📌</span>
                      <div>
                        <p className="text-yellow-800 font-medium">Important Note:</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          This will permanently delete the mentor and all associated data including:
                        </p>
                        <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
                          <li>Mentor profile and account</li>
                          <li>Course assignments</li>
                          <li>Batch enrollments</li>
                          <li>All related data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">
                    Are you absolutely sure you want to delete "
                    <span className="font-bold">{mentorToDelete.firstName} {mentorToDelete.lastName}</span>"?
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={closeAllModals}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMentor}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FaTrash className="mr-2" />
                        Delete Permanently
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsWithBatches;