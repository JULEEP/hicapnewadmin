import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaPlus, 
  FaBook, 
  FaUsers, 
  FaCalendar,
  FaFilter,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaFileExport,
  FaList,
  FaThLarge,
  FaCalendarAlt,
  FaTimes
} from 'react-icons/fa';

const CourseModulesList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'single'
  const [displayMode, setDisplayMode] = useState('table'); // 'table' or 'grid'
  const navigate = useNavigate();

  // Advanced filtering and sorting
  const [filters, setFilters] = useState({
    courseName: '',
    mentorName: '',
    dateFrom: '',
    dateTo: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Fetch all course modules
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const modulesResponse = await axios.get('https://api.techsterker.com/api/course-modules');
      const modulesData = modulesResponse.data.data || [];
      setModules(modulesData);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters and sorting
  const filteredModules = useMemo(() => {
    let filtered = modules.filter(module => {
      const courseName = module?.courseId?.name || '';
      const mentorName = module?.mentorName || '';
      
      // Search filter
      const matchesSearch = 
        courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module._id.toLowerCase().includes(searchTerm.toLowerCase());

      // Additional filters
      const matchesCourseName = !filters.courseName || 
        courseName.toLowerCase().includes(filters.courseName.toLowerCase());
      const matchesMentorName = !filters.mentorName || 
        mentorName.toLowerCase().includes(filters.mentorName.toLowerCase());
      
      // Date filter
      const createdAt = new Date(module.createdAt);
      const matchesDateFrom = !filters.dateFrom || 
        createdAt >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || 
        createdAt <= new Date(filters.dateTo + 'T23:59:59');

      return matchesSearch && matchesCourseName && matchesMentorName && 
             matchesDateFrom && matchesDateTo;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'courseName':
            aValue = a.courseId?.name || '';
            bValue = b.courseId?.name || '';
            break;
          case 'mentorName':
            aValue = a.mentorName || '';
            bValue = b.mentorName || '';
            break;
          case 'moduleCount':
            aValue = a.modules?.length || 0;
            bValue = b.modules?.length || 0;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [modules, searchTerm, filters, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination
  const pageCount = Math.ceil(filteredModules.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentModules = filteredModules.slice(offset, offset + itemsPerPage);

  // View single module
  const handleViewModule = (module) => {
    setSelectedModule(module);
    setViewMode('single');
  };

  // Delete module
  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course module?')) {
      return;
    }

    try {
      await axios.delete(`https://api.techsterker.com/api/course-modules/${id}`);
      setModules(modules.filter(module => module._id !== id));
      alert('Course module deleted successfully!');
    } catch (error) {
      setError('Failed to delete course module');
      console.error('Error deleting module:', error);
    }
  };

  // Edit module
  const handleEditModule = (id) => {
    navigate(`/course-modules/edit/${id}`);
  };

  // Create new module
  const handleCreateModule = () => {
    navigate('/course-modules/create');
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      courseName: '',
      mentorName: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedModules.length === 0) return;

    if (bulkAction === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedModules.length} modules?`)) {
        return;
      }

      try {
        const deletePromises = selectedModules.map(id =>
          axios.delete(`https://api.techsterker.com/api/course-modules/${id}`)
        );
        await Promise.all(deletePromises);
        setModules(modules.filter(module => !selectedModules.includes(module._id)));
        setSelectedModules([]);
        alert(`${selectedModules.length} modules deleted successfully!`);
      } catch (error) {
        setError('Failed to delete modules');
        console.error('Error deleting modules:', error);
      }
    }
  };

  // Export data
  const exportData = () => {
    const exportData = filteredModules.map(module => ({
      'Course Name': module.courseId?.name || 'N/A',
      'Mentor Name': module.mentorName || 'N/A',
      'Total Modules': module.modules?.length || 0,
      'Created Date': new Date(module.createdAt).toLocaleDateString(),
      'Last Updated': new Date(module.updatedAt).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-modules-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Next page
  const nextPage = () => {
    if (currentPage < pageCount - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Render single module view
  const renderSingleView = () => {
    if (!selectedModule) return null;

    return (
      <div className="bg-white shadow-xl rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Module Details</h2>
          <button
            onClick={() => setViewMode('table')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
          >
            <FaChevronLeft /> Back to List
          </button>
        </div>

        <div className="space-y-6">
          {/* Course Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-blue-800 flex items-center gap-2">
                <FaBook /> Course Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Course Name:</span>
                  <span className="text-blue-700">{selectedModule.courseId?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Description:</span>
                  <span className="text-gray-600 text-right">{selectedModule.courseId?.description || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Duration:</span>
                  <span className="text-green-600">{selectedModule.courseId?.duration || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Category:</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {selectedModule.courseId?.category || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-green-800 flex items-center gap-2">
                <FaUsers /> Mentor Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Mentor Name:</span>
                  <span className="text-green-700">{selectedModule.mentorName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-600">{selectedModule.mentorId?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Phone:</span>
                  <span className="text-gray-600">{selectedModule.mentorId?.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Expertise:</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {selectedModule.mentorId?.expertise || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Module Information */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-5 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-yellow-800 flex items-center gap-2">
              <FaCalendarAlt /> Module Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{selectedModule.modules?.length || 0}</div>
                <div className="text-sm text-gray-600">Total Modules</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {new Date(selectedModule.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Created At</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {new Date(selectedModule.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {selectedModule.status || 'Active'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Modules Structure */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">Modules Structure</h3>
            {selectedModule.modules?.map((mod, moduleIndex) => (
              <div key={moduleIndex} className="border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                <h4 className="font-bold text-lg mb-3 text-blue-700 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center">
                    {moduleIndex + 1}
                  </span>
                  Subject: {mod.subjectName}
                </h4>

                {mod.topics?.map((topic, topicIndex) => (
                  <div key={topicIndex} className="ml-6 border-l-2 border-blue-200 pl-4 mb-4">
                    <h5 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        {topicIndex + 1}
                      </span>
                      Topic: {topic.topicName}
                    </h5>

                    {topic.lessons?.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="ml-6 border-l-2 border-green-200 pl-4 mb-3">
                        <h6 className="font-medium text-purple-700 mb-1">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">
                            Lesson {lessonIndex + 1}
                          </span>
                          {lesson.name}
                        </h6>
                        <div className="text-xs text-gray-500 space-x-3">
                          {lesson.videoId && (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-medium">Video:</span> {lesson.videoId}
                            </span>
                          )}
                          {lesson.date && (
                            <span className="inline-flex items-center gap-1">
                              <FaCalendar className="text-xs" />
                              {new Date(lesson.date).toLocaleDateString()}
                            </span>
                          )}
                          {lesson.duration && (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-medium">Duration:</span> {lesson.duration}
                            </span>
                          )}
                        </div>
                        {lesson.resources?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-blue-600">Resources:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {lesson.resources.map((res) => (
                                <a
                                  key={res._id}
                                  href={res.file}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                                >
                                  <FaDownload className="text-xs" /> {res.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => handleEditModule(selectedModule._id)}
              className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <FaEdit /> Edit Module
            </button>
            <button
              onClick={() => handleDeleteModule(selectedModule._id)}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <FaTrash /> Delete Module
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render table view
  const renderTableView = () => (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Course Modules Management</h2>
          <p className="text-gray-600 mt-1">Total: {filteredModules.length} modules found</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateModule}
            className="bg-green-500 text-white px-5 py-2.5 rounded-lg hover:bg-green-600 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            <FaPlus /> Create New Module
          </button>
          <button
            onClick={exportData}
            className="bg-purple-500 text-white px-5 py-2.5 rounded-lg hover:bg-purple-600 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            <FaFileExport /> Export CSV
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by course name, mentor name, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filter and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('table')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  displayMode === 'table' ? 'bg-white shadow' : 'hover:bg-gray-200'
                }`}
              >
                <FaList /> Table
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  displayMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
                }`}
              >
                <FaThLarge /> Grid
              </button>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>

            {selectedModules.length > 0 && (
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-600">
                  {selectedModules.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={filters.courseName}
                  onChange={(e) => setFilters({...filters, courseName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Filter by course"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mentor Name
                </label>
                <input
                  type="text"
                  value={filters.mentorName}
                  onChange={(e) => setFilters({...filters, mentorName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Filter by mentor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full border border-grid-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading course modules...</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {displayMode === 'table' ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModules(currentModules.map(m => m._id));
                          } else {
                            setSelectedModules([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('courseName')}>
                      <div className="flex items-center gap-2">
                        Course Name
                        <FaSort />
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('mentorName')}>
                      <div className="flex items-center gap-2">
                        Mentor Name
                        <FaSort />
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('moduleCount')}>
                      <div className="flex items-center gap-2">
                        Total Modules
                        <FaSort />
                      </div>
                    </th>
                    <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center gap-2">
                        Created At
                        <FaSort />
                      </div>
                    </th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentModules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-6xl mb-4">📚</div>
                          <p className="text-xl font-medium text-gray-700 mb-2">No course modules found</p>
                          <p className="text-gray-500">
                            {searchTerm || Object.values(filters).some(f => f) 
                              ? 'Try adjusting your search or filters'
                              : 'Create your first course module to get started'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentModules.map((module, index) => (
                      <tr 
                        key={module._id} 
                        className={`border-b hover:bg-blue-50 transition-colors ${
                          selectedModules.includes(module._id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedModules.includes(module._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModules([...selectedModules, module._id]);
                              } else {
                                setSelectedModules(selectedModules.filter(id => id !== module._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBook className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{module.courseId?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">ID: {module._id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <FaUsers className="text-green-600 text-sm" />
                            </div>
                            {module.mentorName || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {module.modules?.length || 0} modules
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendar className="text-gray-400" />
                            {new Date(module.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewModule(module)}
                              className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditModule(module._id)}
                              className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                              title="Edit Module"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(module._id)}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete Module"
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
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentModules.map((module) => (
                <div key={module._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBook className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{module.courseId?.name || 'N/A'}</h3>
                        <p className="text-xs text-gray-500">ID: {module._id.substring(0, 8)}...</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module._id]);
                        } else {
                          setSelectedModules(selectedModules.filter(id => id !== module._id));
                        }
                      }}
                      className="rounded"
                    />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUsers className="text-green-600 text-sm" />
                      </div>
                      <span className="font-medium">{module.mentorName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendar className="text-gray-400" />
                        <span className="text-sm">{new Date(module.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {module.modules?.length || 0} modules
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleViewModule(module)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleEditModule(module._id)}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simple Pagination - Only Previous/Next */}
          {filteredModules.length > itemsPerPage && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {offset + 1} to {Math.min(offset + itemsPerPage, filteredModules.length)} 
                of {filteredModules.length} modules
                <span className="ml-4">
                  Page {currentPage + 1} of {pageCount}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-2 transition-colors"
                >
                  <FaChevronLeft /> Previous
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Page</span>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={currentPage + 1}
                    onChange={(e) => {
                      const page = Math.max(1, Math.min(pageCount, Number(e.target.value))) - 1;
                      setCurrentPage(page);
                    }}
                    className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-gray-600">of {pageCount}</span>
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === pageCount - 1}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-2 transition-colors"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {viewMode === 'table' ? renderTableView() : renderSingleView()}
    </div>
  );
};

export default CourseModulesList;