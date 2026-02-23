import React, { useState, useEffect } from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFileExport, 
  FaTimes, 
  FaCheck, 
  FaEye, 
  FaCalendar,
  FaClock,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserGraduate,
  FaBook
} from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

const API_BASE = 'https://api.techsterker.com/api';

const AllEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('batchName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [editedEnrollment, setEditedEnrollment] = useState(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0
  });

  const enrollmentsPerPage = 10;

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Fetch enrollments from the API
  const fetchEnrollments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/allenrollments`);
      if (res.data.success && res.data.data) {
        const enrollmentsData = res.data.data;
        setEnrollments(enrollmentsData);
        
        // Calculate statistics
        const now = new Date();
        const activeEnrollments = enrollmentsData.filter(e => {
          if (!e.startDate) return false;
          const startDate = new Date(e.startDate);
          const endDate = e.duration ? calculateEndDate(startDate, e.duration) : null;
          
          if (!endDate) return false;
          return startDate <= now && endDate >= now;
        });

        const upcomingEnrollments = enrollmentsData.filter(e => {
          if (!e.startDate) return false;
          const startDate = new Date(e.startDate);
          return startDate > now;
        });

        const completedEnrollments = enrollmentsData.filter(e => {
          if (!e.startDate) return false;
          const startDate = new Date(e.startDate);
          const endDate = e.duration ? calculateEndDate(startDate, e.duration) : null;
          
          if (!endDate) return false;
          return endDate < now;
        });

        setStats({
          total: enrollmentsData.length,
          active: activeEnrollments.length,
          upcoming: upcomingEnrollments.length,
          completed: completedEnrollments.length
        });

        setSuccess(`Successfully loaded ${enrollmentsData.length} enrollments`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching enrollments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate end date from duration
  const calculateEndDate = (startDate, duration) => {
    const durationMatch = duration.match(/(\d+)\s*(day|week|month|year)s?/i);
    if (!durationMatch) return null;
    
    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    const endDate = new Date(startDate);
    
    switch(unit) {
      case 'day': endDate.setDate(endDate.getDate() + amount); break;
      case 'week': endDate.setDate(endDate.getDate() + (amount * 7)); break;
      case 'month': endDate.setMonth(endDate.getMonth() + amount); break;
      case 'year': endDate.setFullYear(endDate.getFullYear() + amount); break;
    }
    
    return endDate;
  };

  // Sort and filter enrollments
  const filteredEnrollments = enrollments
    .filter(enrollment => {
      if (!enrollment) return false;
      
      // Safe course name access
      const courseName = enrollment.courseId?.name || 'No Course';
      
      const matchesSearch = 
        (enrollment.batchName && enrollment.batchName.toLowerCase().includes(search.toLowerCase())) ||
        (courseName && courseName.toLowerCase().includes(search.toLowerCase())) ||
        (enrollment.category && enrollment.category.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || 
        (enrollment.category && enrollment.category === categoryFilter);
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      // Handle course name sorting
      if (sortBy === 'courseName') {
        aValue = a.courseId?.name || '';
        bValue = b.courseId?.name || '';
      }
      
      // Handle date sorting
      if (sortBy === 'startDate') {
        aValue = a.startDate ? new Date(a.startDate).getTime() : 0;
        bValue = b.startDate ? new Date(b.startDate).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const indexOfLast = currentPage * enrollmentsPerPage;
  const indexOfFirst = indexOfLast - enrollmentsPerPage;
  const currentEnrollments = filteredEnrollments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEnrollments.length / enrollmentsPerPage);

  // Open view modal
  const openViewModal = (enrollment) => {
    if (!enrollment) return;
    setSelectedEnrollment(enrollment);
    setViewModal(true);
  };

  // Open edit modal
  const openEditModal = (enrollment) => {
    if (!enrollment) return;
    
    const safeEnrollment = {
      _id: enrollment._id || '',
      batchName: enrollment.batchName || '',
      courseId: enrollment.courseId?._id || '',
      courseName: enrollment.courseId?.name || 'No Course',
      startDate: enrollment.startDate ? enrollment.startDate.split('T')[0] : '',
      timings: enrollment.timings || '',
      duration: enrollment.duration || '',
      category: enrollment.category || '',
      batchNumber: enrollment.batchNumber || '',
      maxStudents: enrollment.maxStudents || 0,
      currentStudents: enrollment.currentStudents || 0,
      status: enrollment.status || 'active',
      description: enrollment.description || ''
    };
    
    setEditedEnrollment(safeEnrollment);
    setEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (enrollment) => {
    if (!enrollment) return;
    setEnrollmentToDelete(enrollment);
    setDeleteModal(true);
  };

  // Handle edit change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedEnrollment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited enrollment
  const handleSaveEnrollment = async () => {
    if (!editedEnrollment || !editedEnrollment._id) {
      setError('Invalid enrollment data');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/update-enrollment/${editedEnrollment._id}`, editedEnrollment);
      
      if (res.data && res.data.success) {
        setEnrollments(prev => 
          prev.map(e => e._id === editedEnrollment._id ? res.data.data : e)
        );
        setEditModal(false);
        setEditedEnrollment(null);
        setSuccess('Enrollment updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update enrollment');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete enrollment
  const handleDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/delete-enrollment/${enrollmentToDelete._id}`);
      
      if (res.data && res.data.success) {
        setDeleteSuccessMessage(res.data.message || 'Enrollment deleted successfully');
        
        setEnrollments(prev => prev.filter(e => e._id !== enrollmentToDelete._id));
        setDeleteModal(false);
        setEnrollmentToDelete(null);
        
        setTimeout(() => {
          setDeleteSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete enrollment');
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const exportData = (type) => {
    const exportItems = filteredEnrollments
      .slice(0, exportLimit)
      .map(enrollment => ({
        id: enrollment._id || 'N/A',
        batchName: enrollment.batchName || 'N/A',
        courseName: enrollment.courseId?.name || 'N/A',
        startDate: enrollment.startDate ? new Date(enrollment.startDate).toLocaleDateString() : 'N/A',
        timings: enrollment.timings || 'N/A',
        duration: enrollment.duration || 'N/A',
        category: enrollment.category || 'N/A',
        batchNumber: enrollment.batchNumber || 'N/A',
        maxStudents: enrollment.maxStudents || 0,
        currentStudents: enrollment.currentStudents || 0,
        status: enrollment.status || 'N/A'
      }));

    if (exportItems.length === 0) {
      setError('No data to export');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Enrollments');
    writeFile(wb, `enrollments_${new Date().toISOString().split('T')[0]}.${type}`);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setSortBy('batchName');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Close all modals
  const closeAllModals = () => {
    setViewModal(false);
    setEditModal(false);
    setDeleteModal(false);
    setSelectedEnrollment(null);
    setEditedEnrollment(null);
    setEnrollmentToDelete(null);
  };

  // Get unique categories
  const uniqueCategories = [...new Set(enrollments.map(e => e.category).filter(Boolean))];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get enrollment status
  const getEnrollmentStatus = (enrollment) => {
    if (!enrollment.startDate) return 'upcoming';
    
    const startDate = new Date(enrollment.startDate);
    const endDate = enrollment.duration ? calculateEndDate(startDate, enrollment.duration) : null;
    const now = new Date();
    
    if (!endDate) return 'upcoming';
    if (startDate > now) return 'upcoming';
    if (endDate < now) return 'completed';
    return 'active';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Batch Enrollments</h1>
          <p className="text-gray-600">Manage all course batch enrollments</p>
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
              <FaCheck className="text-green-500 mr-3" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Delete Success Alert */}
        {deleteSuccessMessage && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaCheck className="text-blue-500 mr-3" />
              <div>
                <p className="text-blue-700 font-medium">{deleteSuccessMessage}</p>
                <p className="text-blue-600 text-sm mt-1">Enrollment has been permanently removed from the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <FaUserGraduate className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Batches</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl font-bold">▶️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaCalendar className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-gray-800">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-yellow-600 text-xl font-bold">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Search batches, courses, categories..."
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
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    handleSort(e.target.value);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="batchName">Sort by Batch</option>
                  <option value="courseName">Sort by Course</option>
                  <option value="startDate">Sort by Start Date</option>
                  <option value="category">Sort by Category</option>
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
              Showing {filteredEnrollments.length} of {enrollments.length} batches
              {search && (
                <span className="ml-2 text-purple-600">
                  for "{search}"
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Export Limit:</span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={exportLimit}
                  onChange={(e) => setExportLimit(parseInt(e.target.value, 10))}
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>All</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  onClick={() => exportData('csv')}
                >
                  <FaFileExport /> CSV
                </button>
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  onClick={() => exportData('xlsx')}
                >
                  <FaFileExport /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <th className="py-4 px-6 text-left font-semibold">#</th>
                  <th className="py-4 px-6 text-left font-semibold">Batch Details</th>
                  <th className="py-4 px-6 text-left font-semibold">Course</th>
                  <th className="py-4 px-6 text-left font-semibold">Schedule</th>
                  <th className="py-4 px-6 text-left font-semibold">Status</th>
                  <th className="py-4 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-600">Loading enrollments...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No enrollments found</h3>
                        <p className="text-gray-500 max-w-md">
                          {search || categoryFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No enrollments available. Create your first batch!'}
                        </p>
                        {search && (
                          <button
                            onClick={resetFilters}
                            className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEnrollments.map((enrollment, index) => {
                    const status = getEnrollmentStatus(enrollment);
                    const courseName = enrollment.courseId?.name || 'No Course';
                    
                    return (
                      <tr 
                        key={enrollment._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                            {indexOfFirst + index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{enrollment.batchName}</p>
                            {enrollment.batchNumber && (
                              <p className="text-sm text-gray-600">Batch #{enrollment.batchNumber}</p>
                            )}
                            {enrollment.category && (
                              <span className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded mt-1">
                                {enrollment.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <FaBook className="text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">{courseName}</p>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <FaUserGraduate className="mr-1" size={12} />
                                <span>{enrollment.currentStudents || 0}/{enrollment.maxStudents || '∞'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <FaCalendar className="text-gray-400 mr-2" />
                              <span className="text-sm">{formatDate(enrollment.startDate)}</span>
                            </div>
                            {enrollment.timings && (
                              <div className="flex items-center">
                                <FaClock className="text-gray-400 mr-2" />
                                <span className="text-sm">{enrollment.timings}</span>
                              </div>
                            )}
                            {enrollment.duration && (
                              <div className="text-xs text-gray-500">{enrollment.duration}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Details"
                              onClick={() => openViewModal(enrollment)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Edit Enrollment"
                              onClick={() => openEditModal(enrollment)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete Enrollment"
                              onClick={() => openDeleteModal(enrollment)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredEnrollments.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} •{' '}
                  <span className="font-semibold">
                    {indexOfFirst + 1}-{Math.min(indexOfLast, filteredEnrollments.length)}
                  </span> of {filteredEnrollments.length} batches
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
                                ? "bg-purple-600 text-white shadow-md"
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

        {/* View Enrollment Modal */}
        {viewModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Enrollment Details</h2>
                  <p className="text-gray-600 mt-1">Complete batch information</p>
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
                  {/* Batch Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-lg border border-purple-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <FaUserGraduate className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Batch Information</h3>
                        <p className="text-gray-600">Basic batch details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Batch ID", value: selectedEnrollment._id, icon: "🆔" },
                        { label: "Batch Name", value: selectedEnrollment.batchName, icon: "📛" },
                        { label: "Batch Number", value: selectedEnrollment.batchNumber || 'N/A', icon: "#️⃣" },
                        { label: "Category", value: selectedEnrollment.category || 'N/A', icon: "🏷️" },
                        { label: "Max Students", value: selectedEnrollment.maxStudents || 'Unlimited', icon: "👥" },
                        { label: "Current Students", value: selectedEnrollment.currentStudents || 0, icon: "✅" },
                        { label: "Status", value: getEnrollmentStatus(selectedEnrollment), icon: "📊" },
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

                  {/* Course & Schedule */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FaBook className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Course & Schedule</h3>
                        <p className="text-gray-600">Course details and timing</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📚</span> Course Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Course Name</p>
                            <p className="font-medium">{selectedEnrollment.courseId?.name || 'No Course'}</p>
                          </div>
                          {selectedEnrollment.courseId?.description && (
                            <div>
                              <p className="text-sm text-gray-600">Description</p>
                              <p className="text-gray-700 text-sm">{selectedEnrollment.courseId.description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📅</span> Schedule
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{formatDate(selectedEnrollment.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Timings</p>
                            <p className="font-medium">{selectedEnrollment.timings || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{selectedEnrollment.duration || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-medium">
                              {selectedEnrollment.startDate && selectedEnrollment.duration 
                                ? formatDate(calculateEndDate(new Date(selectedEnrollment.startDate), selectedEnrollment.duration))
                                : 'Not available'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedEnrollment.description && (
                    <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-lg border border-yellow-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-yellow-600 text-xl font-bold">📝</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Batch Description</h3>
                          <p className="text-gray-600">Additional batch information</p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEnrollment.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">⏰</span> Timestamps
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <span className="text-xl mr-2">✨</span>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Created At</p>
                            <p className="font-medium">
                              {selectedEnrollment.createdAt 
                                ? formatDate(selectedEnrollment.createdAt)
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-2">
                          <span className="text-xl mr-2">🔄</span>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Last Updated</p>
                            <p className="font-medium">
                              {selectedEnrollment.updatedAt 
                                ? formatDate(selectedEnrollment.updatedAt)
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    openEditModal(selectedEnrollment);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                  Edit Enrollment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Enrollment Modal - SCROLLABLE VERSION */}
        {editModal && editedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit Enrollment</h2>
                  <p className="text-gray-600 mt-1">Update batch information</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  title="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Batch Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Name *
                    </label>
                    <input
                      type="text"
                      name="batchName"
                      value={editedEnrollment.batchName}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      placeholder="e.g., Web Development Batch 1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Batch Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={editedEnrollment.batchNumber}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., 001"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={editedEnrollment.category}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., Web Development"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={editedEnrollment.startDate}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Timings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timings
                      </label>
                      <input
                        type="text"
                        name="timings"
                        value={editedEnrollment.timings}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., 10:00 AM - 12:00 PM"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={editedEnrollment.duration}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., 3 months, 6 weeks"
                      />
                    </div>

                    {/* Max Students */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Students
                      </label>
                      <input
                        type="number"
                        name="maxStudents"
                        value={editedEnrollment.maxStudents}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        min="1"
                        placeholder="e.g., 30"
                      />
                    </div>
                  </div>

                  {/* Course Information (Read-only) */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Information
                    </label>
                    <div className="flex items-center p-3 bg-white rounded border">
                      <FaBook className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{editedEnrollment.courseName}</p>
                        <p className="text-sm text-gray-600">Course ID: {editedEnrollment.courseId}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Course information cannot be changed here. Contact admin for course changes.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editedEnrollment.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter batch description (optional)"
                    />
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEnrollment}
                  disabled={loading || !editedEnrollment.batchName || !editedEnrollment.startDate}
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
        {deleteModal && enrollmentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Delete Enrollment</h2>
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
                          This will permanently delete the batch and all associated data including:
                        </p>
                        <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
                          <li>Batch schedule and timings</li>
                          <li>Student enrollments in this batch</li>
                          <li>Progress tracking data</li>
                          <li>Attendance records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">
                    Are you absolutely sure you want to delete "<span className="font-bold">{enrollmentToDelete.batchName}</span>"?
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
                    onClick={handleDeleteEnrollment}
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

export default AllEnrollments;