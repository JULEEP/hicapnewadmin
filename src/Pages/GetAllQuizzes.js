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
  FiRefreshCw
} from "react-icons/fi";

const GetAllQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("all");
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_BASE = 'https://api.techsterker.com/api';

  // API से quizzes fetch करें
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE}/our-mentor/allquizz`);
      
      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message || 'Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Delete quiz function - FIXED
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE}/our-mentor/deletequiz/${quizToDelete.quizId}/${quizToDelete.mentorId}`
      );
      
      console.log('Delete response:', response.data); // Debug log
      
      // Check if the response indicates success
      if (response.data.message === "Quiz deleted successfully" || response.data.quiz) {
        // Remove deleted quiz from state
        setQuizzes(prevQuizzes => 
          prevQuizzes.filter(quiz => quiz._id !== quizToDelete.quizId)
        );
        
        // Reset states
        setDeleteConfirmOpen(false);
        setQuizToDelete(null);
        
        // Show success message
        alert('Quiz deleted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      
      // More detailed error message
      let errorMessage = 'Failed to delete quiz. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 404) {
          errorMessage = 'Quiz not found. It may have already been deleted.';
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'You are not authorized to delete this quiz.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (quiz) => {
    setQuizToDelete({
      quizId: quiz._id,
      mentorId: quiz.mentorId?._id || quiz.mentorId,
      quizTitle: quiz.title,
      mentorName: quiz.mentorName
    });
    setDeleteConfirmOpen(true);
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

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = 
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.mentorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMentor = 
      selectedMentor === "all" || 
      quiz.mentorId?._id === selectedMentor;
    
    return matchesSearch && matchesMentor;
  });

  // Get unique mentors
  const mentors = [...new Set(quizzes.map(q => q.mentorId).filter(Boolean))];

  // Toggle quiz expansion
  const toggleExpand = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  // Select/Deselect all quizzes
  const toggleSelectAll = () => {
    if (selectedQuizzes.length === filteredQuizzes.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filteredQuizzes.map(q => q._id));
    }
  };

  // Toggle single quiz selection
  const toggleQuizSelection = (quizId) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  // Calculate total questions
  const getTotalQuestions = (quiz) => {
    return quiz.questions?.length || 0;
  };

  // Calculate total points
  const getTotalPoints = (quiz) => {
    return quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  };

  // Handle view quiz
  const handleViewQuiz = (quiz) => {
    setViewQuiz(quiz);
  };

  // Handle copy quiz
  const handleCopyQuiz = (quiz) => {
    const quizText = `
Title: ${quiz.title}
Description: ${quiz.description}
Mentor: ${quiz.mentorName}
Questions: ${getTotalQuestions(quiz)}
Total Points: ${getTotalPoints(quiz)}
Created: ${formatDate(quiz.createdAt)}
    `;
    navigator.clipboard.writeText(quizText);
    alert('Quiz details copied to clipboard!');
  };

  // Handle view mentor details
  const handleViewMentor = (mentor) => {
    setMentorDetails(mentor);
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Quiz</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
          </div>

          {quizToDelete && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz Title:</span>
                  <span className="font-semibold">{quizToDelete.quizTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mentor:</span>
                  <span className="font-semibold">{quizToDelete.mentorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz ID:</span>
                  <span className="text-sm font-mono">{quizToDelete.quizId.substring(0, 12)}...</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setQuizToDelete(null);
              }}
              disabled={deleteLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteQuiz}
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
                  Delete Quiz
                </>
              )}
            </button>
          </div>
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
          <div className="text-xl text-indigo-600 font-semibold">Loading quizzes...</div>
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
            onClick={fetchQuizzes}
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
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && <DeleteConfirmationModal />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">
              All Quizzes
            </h1>
            <p className="text-gray-600 mt-1">Manage and view all quizzes created by mentors</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={fetchQuizzes}
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
              <p className="text-gray-500 text-sm">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-800">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-400 text-white mr-4">
              <FiBookOpen className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Questions</p>
              <p className="text-2xl font-bold text-gray-800">
                {quizzes.reduce((sum, quiz) => sum + getTotalQuestions(quiz), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-white mr-4">
              <FiUser className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Unique Mentors</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(quizzes.map(q => q.mentorId?._id).filter(Boolean)).size}
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
              <p className="text-gray-500 text-sm">Latest Quiz</p>
              <p className="text-lg font-bold text-gray-800">
                {quizzes.length > 0 ? formatDate(quizzes[0].createdAt).split(',')[0] : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes by title, description, or mentor..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Mentor Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
              >
                <option value="all">All Mentors</option>
                {mentors.map((mentor, idx) => (
                  <option key={idx} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={toggleSelectAll}
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {selectedQuizzes.length === filteredQuizzes.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={() => {}}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 flex items-center"
            >
              <FiPlus className="mr-2" />
              New Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-5xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No quizzes found</p>
            {searchTerm || selectedMentor !== "all" ? (
              <p className="text-gray-400 mt-2">Try changing your search or filter</p>
            ) : null}
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div 
              key={quiz._id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quiz Header */}
              <div className={`p-5 ${expandedQuiz === quiz._id ? 'bg-gradient-to-r from-indigo-50 to-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedQuizzes.includes(quiz._id)}
                        onChange={() => toggleQuizSelection(quiz._id)}
                        className="mr-3 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          {quiz.title}
                          <span className="ml-2 text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                            {getTotalQuestions(quiz)} Questions
                          </span>
                        </h3>
                        <p className="text-gray-600 mt-1">{quiz.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiUser className="mr-1" />
                        <button
                          onClick={() => handleViewMentor(quiz.mentorId)}
                          className="font-medium hover:text-indigo-600 hover:underline transition-colors"
                        >
                          {quiz.mentorName}
                        </button>
                        <span className="mx-2">•</span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          Mentor
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-1" />
                        <span>{formatDate(quiz.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiHash className="mr-1" />
                        <span>{getTotalPoints(quiz)} Total Points</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCheckCircle className="mr-1 text-green-500" />
                        <span>{quiz.questions?.length || 0} Questions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <button
                      onClick={() => toggleExpand(quiz._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedQuiz === quiz._id ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewQuiz(quiz)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View Quiz Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleCopyQuiz(quiz)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Copy Quiz Details"
                      >
                        <FiCopy />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(quiz)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Quiz"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedQuiz === quiz._id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Quiz Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Quiz ID</p>
                        <p className="font-mono text-sm">{quiz._id}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Course ID</p>
                        <p className="font-mono text-sm">{quiz.courseId}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Mentor</p>
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" />
                          <button
                            onClick={() => handleViewMentor(quiz.mentorId)}
                            className="font-medium hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {quiz.mentorName}
                          </button>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Created</p>
                        <p>{formatDate(quiz.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Questions ({getTotalQuestions(quiz)})
                    </h4>
                    <div className="space-y-4">
                      {quiz.questions?.map((question, qIdx) => (
                        <div key={qIdx} className="bg-white rounded-lg border p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="font-semibold text-gray-700 mr-2">Q{qIdx + 1}:</span>
                                <span className="text-gray-800">{question.question}</span>
                              </div>
                              <div className="ml-6">
                                <p className="text-sm text-gray-500 mb-2">Options:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {question.options?.map((option, optIdx) => (
                                    <div 
                                      key={optIdx}
                                      className={`p-2 rounded border ${option === question.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                      <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full mr-2 ${option === question.correctAnswer ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className={option === question.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                          {option}
                                        </span>
                                        {option === question.correctAnswer && (
                                          <FiCheckCircle className="ml-2 text-green-500" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                {question.points} points
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Quiz Popup Modal */}
      {viewQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{viewQuiz.title}</h2>
                  <p className="text-gray-600 mt-1">{viewQuiz.description}</p>
                </div>
                <button
                  onClick={() => setViewQuiz(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-2" />
                  <span className="font-medium">{viewQuiz.mentorName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiClock className="mr-2" />
                  <span>{formatDate(viewQuiz.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiHash className="mr-2" />
                  <span>{getTotalPoints(viewQuiz)} Total Points</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiBookOpen className="mr-2" />
                  <span>{getTotalQuestions(viewQuiz)} Questions</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Quiz Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Quiz ID</p>
                    <p className="font-mono text-sm break-all">{viewQuiz._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Course ID</p>
                    <p className="font-mono text-sm break-all">{viewQuiz.courseId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Mentor ID</p>
                    <p className="font-mono text-sm break-all">{viewQuiz.mentorId?._id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p>{formatDate(viewQuiz.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Questions ({getTotalQuestions(viewQuiz)})
                </h3>
                <div className="space-y-6">
                  {viewQuiz.questions?.map((question, qIdx) => (
                    <div key={qIdx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <span className="font-bold text-lg text-indigo-600 mr-3">Q{qIdx + 1}</span>
                            <span className="text-lg text-gray-800">{question.question}</span>
                          </div>
                          
                          <div className="ml-8">
                            <p className="text-sm font-medium text-gray-700 mb-3">Options:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {question.options?.map((option, optIdx) => (
                                <div 
                                  key={optIdx}
                                  className={`p-3 rounded-lg border-2 ${option === question.correctAnswer ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                                >
                                  <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${option === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </div>
                                    <span className={option === question.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                      {option}
                                    </span>
                                    {option === question.correctAnswer && (
                                      <FiCheckCircle className="ml-2 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-xl text-center">
                            <div className="text-2xl font-bold">{question.points}</div>
                            <div className="text-xs">points</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiInfo className="mr-2" />
                          <span className="font-medium">Correct Answer:</span>
                          <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            {question.correctAnswer}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleCopyQuiz(viewQuiz);
                    setViewQuiz(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FiCopy className="mr-2" />
                  Copy Details
                </button>
                <button
                  onClick={() => setViewQuiz(null)}
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
            {/* Mentor Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Mentor Details</h2>
                  <p className="opacity-90 mt-1">Information about quiz creator</p>
                </div>
                <button
                  onClick={() => setMentorDetails(null)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Mentor Body */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {mentorDetails.firstName?.charAt(0)}{mentorDetails.lastName?.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {mentorDetails.firstName} {mentorDetails.lastName}
                  </h3>
                  <p className="text-gray-600">Quiz Creator & Mentor</p>
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
                  <FiPhone className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{mentorDetails.phone || 'Not available'}</p>
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
                  <FiBookOpen className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Created Quizzes</p>
                    <p className="font-medium">
                      {quizzes.filter(q => q.mentorId?._id === mentorDetails._id).length} quizzes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Footer */}
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
      {selectedQuizzes.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4 flex items-center space-x-4">
            <span className="font-medium">
              {selectedQuizzes.length} quiz{selectedQuizzes.length !== 1 ? 'zes' : ''} selected
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

      {/* Pagination (if needed) */}
      {filteredQuizzes.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
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

export default GetAllQuizzes;