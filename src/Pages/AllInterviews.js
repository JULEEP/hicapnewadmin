import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { utils, writeFile } from 'xlsx';
import { FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const API_BASE = 'https://api.techsterker.com/api';

const AllInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(10);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [editForm, setEditForm] = useState({
    companyName: '',
    role: '',
    experience: '',
    location: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInterviewId, setDeleteInterviewId] = useState(null);
  const [deleteInterviewCompany, setDeleteInterviewCompany] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingInterview, setViewingInterview] = useState(null);

  const interviewsPerPage = 5;

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/interviews`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInterviews(res.data.data);
      } else {
        setError('No interviews found.');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to fetch interviews.');
    } finally {
      setLoading(false);
    }
  };

  // Search by companyName or role
  const filteredInterviews = interviews.filter((interview) =>
    (interview.companyName?.toLowerCase().includes(search.toLowerCase()) ||
     interview.role?.toLowerCase().includes(search.toLowerCase()))
  );

  const indexOfLast = currentPage * interviewsPerPage;
  const indexOfFirst = indexOfLast - interviewsPerPage;
  const currentInterviews = filteredInterviews.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInterviews.length / interviewsPerPage);

  // Handle Edit
  const handleEditClick = (interview) => {
    setEditingInterview(interview);
    setEditForm({
      companyName: interview.companyName || '',
      role: interview.role || '',
      experience: interview.experience || '',
      location: interview.location || ''
    });
    setEditError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingInterview) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      const res = await axios.put(
        `${API_BASE}/interview/${editingInterview._id}`,
        editForm
      );
      
      if (res.data?.success) {
        // Update the interview in state
        setInterviews(prev => prev.map(interview => 
          interview._id === editingInterview._id 
            ? { ...interview, ...editForm }
            : interview
        ));
        setEditModalOpen(false);
        alert('Interview updated successfully!');
      } else {
        setEditError(res.data?.message || 'Failed to update interview');
      }
    } catch (err) {
      console.error('Error updating interview:', err);
      setEditError(err.response?.data?.message || 'Failed to update interview. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = (interview) => {
    setDeleteInterviewId(interview._id);
    setDeleteInterviewCompany(interview.companyName || 'Unknown Company');
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteInterviewId) return;
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      const res = await axios.delete(`${API_BASE}/interview/${deleteInterviewId}`);
      
      if (res.data?.success) {
        // Remove the interview from state
        setInterviews(prev => prev.filter(interview => interview._id !== deleteInterviewId));
        setDeleteModalOpen(false);
        alert('Interview deleted successfully!');
      } else {
        setDeleteError(res.data?.message || 'Failed to delete interview');
      }
    } catch (err) {
      console.error('Error deleting interview:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete interview. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteInterviewId(null);
    }
  };

  // Handle View
  const handleViewClick = (interview) => {
    setViewingInterview(interview);
    setViewModalOpen(true);
  };

  // Export functionality
  const exportData = (type) => {
    const data = filteredInterviews.slice(0, exportLimit).map((interview) => ({
      ID: interview._id,
      Company: interview.companyName || 'N/A',
      Role: interview.role || 'N/A',
      Experience: interview.experience || 'N/A',
      Location: interview.location || 'N/A',
      BatchNumber: interview.enrolledId?.batchNumber || 'N/A',
      BatchName: interview.enrolledId?.batchName || 'N/A',
      CreatedAt: interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'N/A',
    }));

    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Interviews');
    writeFile(wb, `interviews.${type}`);
  };

  // Modal components
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-blue-900">Edit Interview</h3>
          <button
            onClick={() => setEditModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleEditSubmit} className="p-4">
          {editError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {editError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={editForm.companyName}
                onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <input
                type="text"
                required
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <input
                type="text"
                value={editForm.experience}
                onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {editLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FiCheck />
                  Update Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-red-600">Delete Interview</h3>
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={deleteLoading}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {deleteError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {deleteError}
            </div>
          )}
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the interview for{' '}
            <span className="font-semibold">{deleteInterviewCompany}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ViewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-blue-900">Interview Details</h3>
          <button
            onClick={() => setViewModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {viewingInterview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{viewingInterview.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{viewingInterview.role || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{viewingInterview.experience || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{viewingInterview.location || 'N/A'}</p>
                </div>
                {viewingInterview.enrolledId && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Batch Number</p>
                      <p className="font-medium">{viewingInterview.enrolledId.batchNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Batch Name</p>
                      <p className="font-medium">{viewingInterview.enrolledId.batchName || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {viewingInterview.createdAt 
                      ? new Date(viewingInterview.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setViewModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Interviews</h2>
        <button
          onClick={fetchInterviews}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <FiEye />
          Refresh Data
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredInterviews.length} interviews
          </span>
          <select
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={exportLimit}
            onChange={(e) => setExportLimit(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            onClick={() => exportData('csv')}
          >
            Export CSV
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            onClick={() => exportData('xlsx')}
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <AiOutlineLoading3Quarters className="animate-spin mx-auto text-blue-600" size={32} />
          <p className="text-lg mt-2">Loading interviews...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchInterviews}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <FiEye />
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 border text-left">#</th>
                  <th className="p-3 border text-left">Company</th>
                  <th className="p-3 border text-left">Role</th>
                  <th className="p-3 border text-left">Experience</th>
                  <th className="p-3 border text-left">Location</th>
                  <th className="p-3 border text-left">Batch</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-xl mb-2">🎤</span>
                        <p className="text-lg">No interviews found</p>
                        {search && (
                          <p className="text-sm mt-1">
                            Try adjusting your search: "{search}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentInterviews.map((interview, index) => (
                    <tr key={interview._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border">{index + 1 + indexOfFirst}</td>
                      <td className="p-3 border">{interview.companyName || 'N/A'}</td>
                      <td className="p-3 border">{interview.role || 'N/A'}</td>
                      <td className="p-3 border">{interview.experience || 'N/A'}</td>
                      <td className="p-3 border">{interview.location || 'N/A'}</td>
                      <td className="p-3 border">
                        {interview.enrolledId
                          ? `${interview.enrolledId.batchNumber} - ${interview.enrolledId.batchName}`
                          : 'N/A'}
                      </td>
                      <td className="p-3 border">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewClick(interview)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(interview)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(interview)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
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
          {filteredInterviews.length > interviewsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredInterviews.length)} of {filteredInterviews.length} interviews
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 flex items-center gap-2"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 flex items-center gap-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {editModalOpen && <EditModal />}
      {deleteModalOpen && <DeleteModal />}
      {viewModalOpen && <ViewModal />}
    </div>
  );
};

export default AllInterviews;