import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFileExport, 
  FaTimes, 
  FaCheck, 
  FaEye, 
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';

const API_BASE = 'https://api.techsterker.com/api';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportLimit, setExportLimit] = useState(10);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editedCourse, setEditedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceFilter, setPriceFilter] = useState('all');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    averagePrice: 0,
    highestPrice: 0,
    lowestPrice: 0
  });

  const coursesPerPage = 10;

  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`${API_BASE}/allcourses`);
      console.log('API Response:', res.data);
      
      if (res.data && res.data.success && res.data.data) {
        const coursesData = res.data.data;
        setCourses(coursesData);
        
        // Calculate statistics
        const prices = coursesData
          .filter(c => c.price && !isNaN(c.price))
          .map(c => parseFloat(c.price));
        
        const total = prices.reduce((sum, price) => sum + price, 0);
        const averagePrice = prices.length > 0 ? total / prices.length : 0;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        
        setStats({
          total: coursesData.length,
          averagePrice,
          highestPrice,
          lowestPrice
        });
        
        setSuccess(`Successfully loaded ${coursesData.length} courses`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('No courses found in the response');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Sort and filter courses
  const filteredCourses = courses
    .filter(course => {
      if (!course.name) return false;
      
      const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
                          (course.description && course.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesPrice = priceFilter === 'all' || 
                         (priceFilter === 'free' && (!course.price || course.price === 0)) ||
                         (priceFilter === 'paid' && course.price && course.price > 0);
      
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Open edit modal
  const openEditModal = (course) => {
    if (!course) return;
    
    const safeCourse = {
      _id: course._id || '',
      name: course.name || '',
      description: course.description || '',
      price: course.price || '',
      duration: course.duration || '',
      category: course.category || '',
      instructor: course.instructor || '',
      level: course.level || 'beginner',
      tags: course.tags || [],
      isActive: course.isActive !== undefined ? course.isActive : true
    };
    
    setEditedCourse(safeCourse);
    setEditModal(true);
  };

  // Open view modal
  const openViewModal = (course) => {
    if (!course) return;
    setSelectedCourse(course);
    setViewModal(true);
  };

  // Open delete modal
  const openDeleteModal = (course) => {
    if (!course) return;
    setCourseToDelete(course);
    setDeleteModal(true);
  };

  // Handle edit change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setEditedCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save edited course
  const handleSaveCourse = async () => {
    if (!editedCourse || !editedCourse._id) {
      setError('Invalid course data');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/update-course/${editedCourse._id}`, editedCourse);
      
      if (res.data && res.data.success) {
        setCourses(prev => 
          prev.map(c => c._id === editedCourse._id ? res.data.data : c)
        );
        setEditModal(false);
        setEditedCourse(null);
        setSuccess('Course updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(res.data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/delete-course/${courseToDelete._id}`);
      
      if (res.data && res.data.success) {
        // Show delete success message from backend
        setDeleteSuccessMessage(res.data.message || 'Course deleted successfully');
        
        setCourses(prev => prev.filter(course => course._id !== courseToDelete._id));
        setDeleteModal(false);
        setCourseToDelete(null);
        
        // Clear the delete success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const exportData = (type) => {
    const exportItems = filteredCourses
      .slice(0, exportLimit)
      .map(({ _id, name, description, price, duration, category, instructor }) => ({
        id: _id || 'N/A',
        name: name || 'N/A',
        description: description || 'N/A',
        price: price || 'Free',
        duration: duration || 'N/A',
        category: category || 'N/A',
        instructor: instructor || 'N/A',
      }));

    if (exportItems.length === 0) {
      setError('No data to export');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Courses');
    writeFile(wb, `courses_${new Date().toISOString().split('T')[0]}.${type}`);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setPriceFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Close all modals
  const closeAllModals = () => {
    setEditModal(false);
    setViewModal(false);
    setDeleteModal(false);
    setSelectedCourse(null);
    setEditedCourse(null);
    setCourseToDelete(null);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0 || price === '0') return 'Free';
    return `₹${parseFloat(price).toLocaleString()}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage all courses in the system</p>
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
                <p className="text-blue-600 text-sm mt-1">Course has been permanently removed from the system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl font-bold">📚</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl font-bold">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.averagePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-purple-600 text-xl font-bold">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Highest Price</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.highestPrice}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <span className="text-yellow-600 text-xl font-bold">📉</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lowest Price</p>
                <p className="text-3xl font-bold text-gray-800">₹{stats.lowestPrice}</p>
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
                placeholder="Search courses..."
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
                  value={priceFilter}
                  onChange={(e) => {
                    setPriceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    handleSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="duration">Sort by Duration</option>
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
              Showing {filteredCourses.length} of {courses.length} courses
              {search && (
                <span className="ml-2 text-blue-600">
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
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  onClick={() => exportData('xlsx')}
                >
                  <FaFileExport /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="py-4 px-6 text-left font-semibold">#</th>
                  <th className="py-4 px-6 text-left font-semibold">Course Name</th>
                  <th className="py-4 px-6 text-left font-semibold">Description</th>
                  <th className="py-4 px-6 text-left font-semibold">Price</th>
                  <th className="py-4 px-6 text-left font-semibold">Duration</th>
                  <th className="py-4 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading courses...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
                        <p className="text-gray-500 max-w-md">
                          {search || priceFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'No courses available. Add your first course!'}
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
                  currentCourses.map((course, index) => (
                    <tr 
                      key={course._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                          {indexOfFirst + index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{course.name}</p>
                          {course.category && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {course.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-gray-600 line-clamp-2">
                          {course.description || 'No description'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          !course.price || course.price === 0 || course.price === '0'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {formatPrice(course.price)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{course.duration || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                            onClick={() => openViewModal(course)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Edit Course"
                            onClick={() => openEditModal(course)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Course"
                            onClick={() => openDeleteModal(course)}
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
          {!loading && filteredCourses.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} •{' '}
                  <span className="font-semibold">
                    {indexOfFirst + 1}-{Math.min(indexOfLast, filteredCourses.length)}
                  </span> of {filteredCourses.length} courses
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

        {/* View Course Modal */}
        {viewModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Course Details</h2>
                  <p className="text-gray-600 mt-1">Complete course information</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-xl font-bold">📚</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Course Information</h3>
                        <p className="text-gray-600">Basic course details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Course Name", value: selectedCourse.name, icon: "📛" },
                        { label: "Course ID", value: selectedCourse._id, icon: "🆔" },
                        { label: "Category", value: selectedCourse.category || "Not specified", icon: "🏷️" },
                        { label: "Level", value: selectedCourse.level || "Beginner", icon: "📊" },
                        { label: "Instructor", value: selectedCourse.instructor || "Not specified", icon: "👨‍🏫" },
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

                  {/* Pricing & Duration */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-green-600 text-xl font-bold">💰</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Pricing & Duration</h3>
                        <p className="text-gray-600">Course pricing and schedule</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Course Price</p>
                            <p className={`text-2xl font-bold ${
                              !selectedCourse.price || selectedCourse.price === 0 
                                ? 'text-green-600' 
                                : 'text-gray-800'
                            }`}>
                              {formatPrice(selectedCourse.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              selectedCourse.isActive === false 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {selectedCourse.isActive === false ? 'Inactive' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-bold text-lg">{selectedCourse.duration || 'Not specified'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-medium">
                            {selectedCourse.createdAt 
                              ? new Date(selectedCourse.createdAt).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-lg border border-yellow-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-yellow-600 text-xl font-bold">📝</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Course Description</h3>
                        <p className="text-gray-600">Detailed course overview</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      {selectedCourse.description ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedCourse.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description provided</p>
                      )}
                      
                      {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-3">Tags:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.tags.map((tag, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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
                    openEditModal(selectedCourse);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Edit Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal - SCROLLABLE VERSION */}
        {editModal && editedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit Course</h2>
                  <p className="text-gray-600 mt-1">Update course information</p>
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
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editedCourse.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      placeholder="Enter course name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editedCourse.description}
                      onChange={handleEditChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter course description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editedCourse.price}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave 0 or empty for free course</p>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={editedCourse.duration}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 3 months, 6 weeks"
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
                        value={editedCourse.category}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Web Development, Data Science"
                      />
                    </div>

                    {/* Instructor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor
                      </label>
                      <input
                        type="text"
                        name="instructor"
                        value={editedCourse.instructor}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter instructor name"
                      />
                    </div>

                    {/* Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level
                      </label>
                      <select
                        name="level"
                        value={editedCourse.level}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col justify-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Status
                      </label>
                      <div className="flex items-center h-full">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 w-full">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isActive"
                              name="isActive"
                              checked={editedCourse.isActive}
                              onChange={handleEditChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                              Course is active and visible to students
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Uncheck to hide this course from students
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={editedCourse.tags ? editedCourse.tags.join(', ') : ''}
                      onChange={(e) => {
                        const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setEditedCourse(prev => ({ ...prev, tags: tagsArray }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., JavaScript, React, Web Development"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
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
                  onClick={handleSaveCourse}
                  disabled={loading || !editedCourse.name}
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
        {deleteModal && courseToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Delete Course</h2>
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
                          This will permanently delete the course and all associated data including:
                        </p>
                        <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
                          <li>Course details and content</li>
                          <li>Student enrollments</li>
                          <li>Progress tracking data</li>
                          <li>Any related resources</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">
                    Are you absolutely sure you want to delete "<span className="font-bold">{courseToDelete.name}</span>"?
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
                    onClick={handleDeleteCourse}
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
}