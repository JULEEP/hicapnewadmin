import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiEye,
  FiCopy,
  FiCheckCircle,
  FiPlus,
  FiBookOpen,
  FiUser,
  FiClock,
  FiHash,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiPrinter,
  FiList,
  FiMail,
  FiPhone,
  FiInfo,
  FiX,
  FiExternalLink,
  FiTrash2,
  FiRefreshCw,
  FiCalendar,
  FiType,
  FiFileText,
  FiFile,
  FiCheckSquare,
  FiXCircle,
  FiAlertCircle,
  FiEdit2,
  FiSave,
  FiUsers
} from "react-icons/fi";

const GetAllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedTaskType, setSelectedTaskType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedTask, setExpandedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const API_BASE = 'https://api.techsterker.com/api/our-mentor';

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE}/all-tasks`);
      
      if (response.data.success) {
        setTasks(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Delete task function
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/delete/${taskToDelete.taskId}`
      );
      
      if (response.data.success) {
        // Remove deleted task from state
        setTasks(prevTasks => 
          prevTasks.filter(task => task._id !== taskToDelete.taskId)
        );
        
        // Reset states
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
        
        // Show success message
        alert('Task deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      
      let errorMessage = 'Failed to delete task. Please try again.';
      
      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 404) {
          errorMessage = 'Task not found. It may have already been deleted.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Update task function
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTaskData) return;

    setEditLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/update/${editTaskData._id}`,
        editTaskData
      );

      if (response.data.success) {
        // Update task in state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === editTaskData._id ? response.data.data : task
          )
        );
        
        setEditModalOpen(false);
        setEditTaskData(null);
        alert('Task updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      alert(err.message || 'Failed to update task. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (task) => {
    setTaskToDelete({
      taskId: task._id,
      taskTitle: task.title,
      mentorName: task.mentorId ? `${task.mentorId.firstName} ${task.mentorId.lastName}` : 'Unknown'
    });
    setDeleteConfirmOpen(true);
  };

  // Open edit modal
  const openEditModal = (task) => {
    setEditTaskData({
      ...task,
      // Ensure we have the right structure for editing
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status,
      questionType: task.questionType,
      questionText: task.questionText || ''
    });
    setEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = (task) => {
    setViewTask(task);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'reviewed': return 'bg-indigo-100 text-indigo-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get task type color
  const getTaskTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'batch': return 'bg-blue-100 text-blue-800';
      case 'individual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.mentorId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.mentorId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.enrollmentId?.batchName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMentor = 
      selectedMentor === "all" || 
      task.mentorId?._id === selectedMentor;

    const matchesBatch = 
      selectedBatch === "all" || 
      task.enrollmentId?._id === selectedBatch;

    const matchesTaskType = 
      selectedTaskType === "all" || 
      task.taskType === selectedTaskType;

    const matchesStatus = 
      selectedStatus === "all" || 
      task.status === selectedStatus;

    return matchesSearch && matchesMentor && matchesBatch && matchesTaskType && matchesStatus;
  });

  // Get unique mentors
  const mentors = [...new Map(tasks.map(task => [task.mentorId?._id, task.mentorId]).filter(([id, mentor]) => id && mentor))].map(([id, mentor]) => mentor);

  // Get unique batches
  const batches = [...new Map(tasks.map(task => [task.enrollmentId?._id, task.enrollmentId]).filter(([id, batch]) => id && batch))].map(([id, batch]) => batch);

  // Toggle task expansion
  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // Select/Deselect all tasks
  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t._id));
    }
  };

  // Toggle single task selection
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Calculate submission stats
  const getSubmissionStats = (task) => {
    if (!task.submissions || task.submissions.length === 0) return { total: 0, submitted: 0, pending: 0 };
    
    const total = task.submissions.length;
    const submitted = task.submissions.filter(s => s.status !== 'not-submitted').length;
    const pending = total - submitted;
    
    return { total, submitted, pending };
  };

  // Handle copy task
  const handleCopyTask = (task) => {
    const taskText = `
Title: ${task.title}
Description: ${task.description}
Mentor: ${task.mentorId ? `${task.mentorId.firstName} ${task.mentorId.lastName}` : 'Unknown'}
Batch: ${task.enrollmentId?.batchName || 'N/A'}
Task Type: ${task.taskType}
Status: ${task.status}
Due Date: ${formatDate(task.dueDate)}
Submissions: ${getSubmissionStats(task).submitted}/${getSubmissionStats(task).total}
    `;
    navigator.clipboard.writeText(taskText);
    alert('Task details copied to clipboard!');
  };

  // Handle view mentor details
  const handleViewMentor = (mentor) => {
    setMentorDetails(mentor);
  };

  // Handle edit input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FiTrash2 className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Task</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
          </div>

          {taskToDelete && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Task Title:</span>
                  <span className="font-semibold">{taskToDelete.taskTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span className="font-semibold">{taskToDelete.mentorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Task ID:</span>
                  <span className="text-sm font-mono">{taskToDelete.taskId.substring(0, 12)}...</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setTaskToDelete(null);
              }}
              disabled={deleteLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTask}
              disabled={deleteLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl hover:from-red-700 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {deleteLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2" />
                  Delete Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Task Modal
  const EditTaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
              <p className="text-gray-600">Update task details</p>
            </div>
            <button
              onClick={() => setEditModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="text-2xl text-gray-500" />
            </button>
          </div>

          {editTaskData && (
            <form onSubmit={handleUpdateTask}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editTaskData.title}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Type *
                    </label>
                    <select
                      name="taskType"
                      value={editTaskData.taskType}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="batch">Batch Task</option>
                      <option value="individual">Individual Task</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      name="questionType"
                      value={editTaskData.questionType}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editTaskData.status}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editTaskData.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      name="questionText"
                      value={editTaskData.questionText || ''}
                      onChange={handleEditChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={editTaskData.dueDate}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Current Files</h4>
                  {editTaskData.questionFiles && editTaskData.questionFiles.length > 0 ? (
                    <div className="space-y-2">
                      {editTaskData.questionFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                          <div className="flex items-center">
                            <FiFile className="text-gray-500 mr-2" />
                            <span className="text-sm">{file.originalname}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No files attached</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    disabled={editLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-xl hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Update Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-indigo-600 font-semibold">Loading tasks...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchTasks}
            className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-4 md:p-6">
      {/* Modals */}
      {deleteConfirmOpen && <DeleteConfirmationModal />}
      {editModalOpen && <EditTaskModal />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">
              Task Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all tasks assigned by mentors</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={fetchTasks}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-400 text-white mr-4">
              <FiList className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-400 text-white mr-4">
              <FiUsers className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(tasks.map(t => t.mentorId?._id).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-white mr-4">
              <FiFileText className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">PDF Tasks</p>
              <p className="text-2xl font-bold text-gray-800">
                {tasks.filter(t => t.questionType === 'pdf').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-400 text-white mr-4">
              <FiClock className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-800">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks by title, description, mentor or batch..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Mentor Filter */}
          <div>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
              >
                <option value="all">All Mentors</option>
                {mentors.map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Batch Filter */}
          <div>
            <div className="relative">
              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No tasks found</p>
            {searchTerm || selectedMentor !== "all" || selectedStatus !== "all" ? (
              <p className="text-gray-400 mt-2">Try changing your search or filters</p>
            ) : null}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const submissionStats = getSubmissionStats(task);
            return (
              <div 
                key={task._id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Task Header */}
                <div className={`p-5 ${expandedTask === task._id ? 'bg-gradient-to-r from-indigo-50 to-blue-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task._id)}
                          onChange={() => toggleTaskSelection(task._id)}
                          className="mr-3 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            {task.title}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.taskType)}`}>
                              {task.taskType}
                            </span>
                          </h3>
                          <p className="text-gray-600 mt-1">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiUser className="mr-1" />
                          <button
                            onClick={() => handleViewMentor(task.mentorId)}
                            className="font-medium hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {task.mentorId ? `${task.mentorId.firstName} ${task.mentorId.lastName}` : 'Unknown Mentor'}
                          </button>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiBookOpen className="mr-1" />
                          <span>{task.enrollmentId?.batchName || 'N/A'}</span>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {task.enrollmentId?.batchNumber}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiClock className="mr-1" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiType className="mr-1" />
                          <span>{task.questionType.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiUsers className="mr-1" />
                          <span>Submissions: {submissionStats.submitted}/{submissionStats.total}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <button
                        onClick={() => toggleExpand(task._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {expandedTask === task._id ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewModal(task)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="View Task Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                          title="Edit Task"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleCopyTask(task)}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Copy Task Details"
                        >
                          <FiCopy />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(task)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Task"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTask === task._id && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Task Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Task ID</p>
                          <p className="font-mono text-sm break-all">{task._id}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Mentor</p>
                          <div className="flex items-center">
                            <FiUser className="mr-2 text-gray-400" />
                            <button
                              onClick={() => handleViewMentor(task.mentorId)}
                              className="font-medium hover:text-indigo-600 hover:underline transition-colors"
                            >
                              {task.mentorId ? `${task.mentorId.firstName} ${task.mentorId.lastName}` : 'Unknown'}
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Batch</p>
                          <p>{task.enrollmentId?.batchName} ({task.enrollmentId?.batchNumber})</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Created</p>
                          <p>{formatDate(task.createdAt)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p>{formatDate(task.updatedAt)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-sm text-gray-500">Question Type</p>
                          <p className="font-medium">{task.questionType.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Files Section */}
                    {task.questionFiles && task.questionFiles.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Attached Files</h4>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {task.questionFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FiFile className="text-gray-500 mr-3" />
                                  <div>
                                    <p className="font-medium">{file.originalname}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024).toFixed(2)} KB • {file.mimetype}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.open(`https://api.techsterker.com${file.path}`, '_blank')}
                                  className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                                >
                                  View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Question Text */}
                    {task.questionText && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Question Text</h4>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-gray-700">{task.questionText}</p>
                        </div>
                      </div>
                    )}

                    {/* Submissions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Submissions ({submissionStats.submitted}/{submissionStats.total})
                      </h4>
                      <div className="space-y-3">
                        {task.submissions?.map((submission, index) => (
                          <div key={index} className="bg-white rounded-lg border p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${
                                  submission.status === 'submitted' ? 'bg-green-500' :
                                  submission.status === 'not-submitted' ? 'bg-gray-400' :
                                  submission.status === 'reviewed' ? 'bg-blue-500' :
                                  submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                                <span className="font-medium capitalize">{submission.status.replace('-', ' ')}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(submission.createdAt)}
                              </span>
                            </div>
                            
                            {submission.userId && (
                              <p className="text-sm text-gray-600 mb-2">
                                User ID: {submission.userId.substring(0, 8)}...
                              </p>
                            )}
                            
                            {submission.mentorNote && (
                              <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-sm font-medium text-yellow-800">Mentor Note:</p>
                                <p className="text-yellow-700">{submission.mentorNote}</p>
                              </div>
                            )}
                            
                            {submission.answerFiles && submission.answerFiles.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-1">Answer Files:</p>
                                <div className="flex flex-wrap gap-2">
                                  {submission.answerFiles.map((file, fileIndex) => (
                                    <span key={fileIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                      {file.originalname}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* View Task Popup Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{viewTask.title}</h2>
                  <p className="text-gray-600 mt-1">{viewTask.description}</p>
                </div>
                <button
                  onClick={() => setViewTask(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-500" />
                  <span className="font-medium">
                    {viewTask.mentorId ? `${viewTask.mentorId.firstName} ${viewTask.mentorId.lastName}` : 'Unknown Mentor'}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiBookOpen className="mr-2 text-gray-500" />
                  <span>{viewTask.enrollmentId?.batchName || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-500" />
                  <span>Due: {formatDate(viewTask.dueDate)}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewTask.status)}`}>
                  {viewTask.status}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTaskTypeColor(viewTask.taskType)}`}>
                  {viewTask.taskType}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Task Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Task ID</p>
                    <p className="font-mono text-sm break-all">{viewTask._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Mentor ID</p>
                    <p className="font-mono text-sm break-all">{viewTask.mentorId?._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Enrollment ID</p>
                    <p className="font-mono text-sm break-all">{viewTask.enrollmentId?._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Question Type</p>
                    <p className="font-medium">{viewTask.questionType.toUpperCase()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{formatDate(viewTask.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p>{formatDate(viewTask.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              {viewTask.questionText && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Text</h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-gray-700">{viewTask.questionText}</p>
                  </div>
                </div>
              )}

              {/* Files Section */}
              {viewTask.questionFiles && viewTask.questionFiles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Attached Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewTask.questionFiles.map((file, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <FiFile className="text-gray-500 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium">{file.originalname}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB • {file.mimetype}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`https://api.techsterker.com${file.path}`, '_blank')}
                            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                          >
                            View File
                          </button>
                          <button
                            onClick={() => window.open(`https://api.techsterker.com${file.path}`, '_blank', 'download')}
                            className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Submissions ({getSubmissionStats(viewTask).submitted}/{getSubmissionStats(viewTask).total})
                </h3>
                <div className="space-y-4">
                  {viewTask.submissions?.map((submission, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 ${
                            submission.status === 'submitted' ? 'bg-green-500' :
                            submission.status === 'not-submitted' ? 'bg-gray-400' :
                            submission.status === 'reviewed' ? 'bg-blue-500' :
                            submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="font-medium text-lg capitalize">{submission.status.replace('-', ' ')}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>

                      {submission.userId && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Submitted by:</p>
                          <p className="font-mono text-sm">{submission.userId}</p>
                        </div>
                      )}

                      {submission.mentorNote && (
                        <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-800 mb-1">Mentor Feedback:</p>
                          <p className="text-yellow-700">{submission.mentorNote}</p>
                        </div>
                      )}

                      {submission.answerFiles && submission.answerFiles.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Answer Files:</p>
                          <div className="flex flex-wrap gap-2">
                            {submission.answerFiles.map((file, fileIndex) => (
                              <div key={fileIndex} className="px-3 py-2 bg-gray-100 rounded-lg">
                                <p className="text-sm font-medium">{file.originalname}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleCopyTask(viewTask)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FiCopy className="mr-2" />
                  Copy Details
                </button>
                <button
                  onClick={() => openEditModal(viewTask)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-300 flex items-center"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Task
                </button>
                <button
                  onClick={() => setViewTask(null)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Details Popup */}
      {mentorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Mentor Details</h2>
                  <p className="opacity-90 mt-1">Information about task creator</p>
                </div>
                <button
                  onClick={() => setMentorDetails(null)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {mentorDetails.firstName?.charAt(0)}{mentorDetails.lastName?.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {mentorDetails.firstName} {mentorDetails.lastName}
                  </h3>
                  <p className="text-gray-600">Task Creator & Mentor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiUser className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {mentorDetails.firstName} {mentorDetails.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiMail className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{mentorDetails.email || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiHash className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Mentor ID</p>
                    <p className="font-mono text-sm break-all">{mentorDetails._id}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiList className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Created Tasks</p>
                    <p className="font-medium">
                      {tasks.filter(t => t.mentorId?._id === mentorDetails._id).length} tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setMentorDetails(null)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {selectedTasks.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4 flex items-center space-x-4">
            <span className="font-medium">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center">
                <FiDownload className="mr-2" />
                Export
              </button>
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center">
                <FiPrinter className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredTasks.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllTasks;