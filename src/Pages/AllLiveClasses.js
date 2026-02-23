import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, writeFile } from 'xlsx';
import { FaEye, FaEdit, FaTrash, FaFileExport, FaSearch, FaSync, FaCalendarAlt, FaClock, FaLink, FaGraduationCap, FaBook, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const API_BASE = 'https://api.techsterker.com/api';

const AllLiveClasses = () => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Current class states
  const [selectedClass, setSelectedClass] = useState(null);
  const [editFormData, setEditFormData] = useState({
    className: '',
    subjectName: '',
    date: '',
    timing: '',
    link: ''
  });
  
  // Loading states for operations
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const classesPerPage = 10;

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/liveclass`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setClasses(res.data.data);
      } else {
        setError('No live classes found.');
      }
    } catch (err) {
      console.error('Error fetching live classes:', err);
      setError('Failed to fetch live classes.');
    } finally {
      setLoading(false);
    }
  };

  // Handle View
  const handleView = (cls) => {
    setSelectedClass(cls);
    setShowViewModal(true);
  };

  // Handle Edit
  const handleEdit = (cls) => {
    setSelectedClass(cls);
    setEditFormData({
      className: cls.className || '',
      subjectName: cls.subjectName || '',
      date: cls.date ? new Date(cls.date).toISOString().split('T')[0] : '',
      timing: cls.timing || '',
      link: cls.link || ''
    });
    setShowEditModal(true);
  };

  // Handle Delete
  const handleDelete = (cls) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedClass(null);
  };

  // Handle Edit Form Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update Live Class
  const handleUpdate = async () => {
    if (!selectedClass) return;

    // Basic validation
    if (!editFormData.className || !editFormData.subjectName || !editFormData.date || !editFormData.timing || !editFormData.link) {
      alert('Please fill all required fields!');
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE}/liveclass/${selectedClass._id}`,
        editFormData
      );
      
      if (res.data.success) {
        // Update the class in state
        setClasses(prev => prev.map(cls => 
          cls._id === selectedClass._id ? res.data.data : cls
        ));
        setShowEditModal(false);
        setSelectedClass(null);
        alert('Live class updated successfully!');
      } else {
        alert('Failed to update live class: ' + res.data.message);
      }
    } catch (err) {
      console.error('Error updating live class:', err);
      alert(err.response?.data?.message || 'Failed to update live class');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Live Class
  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;

    setDeleting(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/liveclass/${selectedClass._id}`
      );
      
      if (res.data.success) {
        // Remove the class from state
        setClasses(prev => prev.filter(cls => cls._id !== selectedClass._id));
        setShowDeleteModal(false);
        setSelectedClass(null);
        alert('Live class deleted successfully!');
      } else {
        alert('Failed to delete live class: ' + res.data.message);
      }
    } catch (err) {
      console.error('Error deleting live class:', err);
      alert(err.response?.data?.message || 'Failed to delete live class');
    } finally {
      setDeleting(false);
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.className?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * classesPerPage;
  const indexOfFirst = indexOfLast - classesPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  const exportData = (type) => {
    const data = filteredClasses.slice(0, exportLimit).map((cls) => ({
      ID: cls._id,
      ClassName: cls.className || 'N/A',
      Subject: cls.subjectName || 'N/A',
      Date: cls.date ? new Date(cls.date).toLocaleDateString() : 'N/A',
      Time: cls.timing || 'N/A',
      Link: cls.link || 'N/A'
    }));

    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'LiveClasses');
    writeFile(wb, `live-classes.${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Live Classes Management</h1>
                <p className="text-gray-600">View, edit and manage all live classes</p>
              </div>
            </div>
            
            <button
              onClick={fetchLiveClasses}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-1/3">
              <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by class name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <select
                  value={exportLimit}
                  onChange={(e) => setExportLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10 Records</option>
                  <option value="50">50 Records</option>
                  <option value="100">100 Records</option>
                  <option value="200">200 Records</option>
                </select>
              </div>

              <button
                onClick={() => exportData("csv")}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <FaFileExport /> Export CSV
              </button>

              <button
                onClick={() => exportData("xlsx")}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <FaFileExport /> Export Excel
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredClasses.length} of {classes.length} live classes
            {search && (
              <span className="ml-2 text-blue-600">
                for "{search}"
              </span>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <FaEye className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Class Details</h3>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Class Name</label>
                    <div className="flex items-center gap-3">
                      <FaGraduationCap className="text-blue-600" />
                      <p className="text-lg font-semibold text-gray-800">{selectedClass.className || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-green-700 mb-2">Subject</label>
                    <div className="flex items-center gap-3">
                      <FaBook className="text-green-600" />
                      <p className="text-lg font-semibold text-gray-800">{selectedClass.subjectName || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-yellow-700 mb-2">Date</label>
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-yellow-600" />
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedClass.date ? new Date(selectedClass.date).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-purple-700 mb-2">Time</label>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-purple-600" />
                      <p className="text-lg font-semibold text-gray-800">{selectedClass.timing || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaLink /> Class Link
                  </label>
                  {selectedClass.link ? (
                    <a
                      href={selectedClass.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all text-lg font-medium"
                    >
                      {selectedClass.link}
                    </a>
                  ) : (
                    <p className="text-gray-500">N/A</p>
                  )}
                </div>
                
                {selectedClass.mentorId && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Information</label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedClass.mentorId.firstName?.charAt(0)}{selectedClass.mentorId.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {selectedClass.mentorId.firstName} {selectedClass.mentorId.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedClass.mentorId.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class ID</label>
                  <code className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-mono break-all">
                    {selectedClass._id}
                  </code>
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <FaEdit className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Edit Live Class</h3>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name *
                    </label>
                    <input
                      type="text"
                      name="className"
                      value={editFormData.className}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter class name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      value={editFormData.subjectName}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter subject name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="timing"
                      value={editFormData.timing}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Link *
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={editFormData.link}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="https://meet.google.com/..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the meeting link for the live class
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Update Class
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center p-6 border-b">
                <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete Live Class</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="p-6 text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Are you sure you want to delete this live class?
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-left">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Class:</span>
                      <span className="text-gray-800">{selectedClass.className}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Subject:</span>
                      <span className="text-gray-800">{selectedClass.subjectName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="text-gray-800">
                        {selectedClass.date ? new Date(selectedClass.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="text-gray-800">{selectedClass.timing || 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <p className="text-red-600 font-medium">
                  All associated data will be permanently deleted.
                </p>
              </div>
              
              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete Class
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg text-gray-600">Loading live classes...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">{error}</p>
              <button
                onClick={fetchLiveClasses}
                className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="py-4 px-6 text-left font-semibold">#</th>
                      <th className="py-4 px-6 text-left font-semibold">Class Name</th>
                      <th className="py-4 px-6 text-left font-semibold">Subject</th>
                      <th className="py-4 px-6 text-left font-semibold">Date</th>
                      <th className="py-4 px-6 text-left font-semibold">Time</th>
                      <th className="py-4 px-6 text-left font-semibold">Link</th>
                      <th className="py-4 px-6 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClasses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="text-gray-400 text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No live classes found</h3>
                            <p className="text-gray-500 max-w-md">
                              {search 
                                ? 'Try adjusting your search criteria'
                                : 'No live classes available. Schedule your first class!'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentClasses.map((cls, index) => (
                        <tr 
                          key={cls._id} 
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                              {indexOfFirst + index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {cls.className || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            {cls.subjectName || 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaCalendarAlt className="text-gray-400" />
                              {cls.date ? new Date(cls.date).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaClock className="text-gray-400" />
                              {cls.timing || 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {cls.link ? (
                              <a
                                href={cls.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                <FaLink /> Join Class
                              </a>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(cls)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(cls)}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title="Edit Class"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(cls)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Delete Class"
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
              {!loading && filteredClasses.length > 0 && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} •{' '}
                      <span className="font-semibold">
                        {indexOfFirst + 1}-{Math.min(indexOfLast, filteredClasses.length)}
                      </span> of {filteredClasses.length} classes
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllLiveClasses;