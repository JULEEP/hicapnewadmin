import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCopy,
  FiCheckCircle,
  FiUser,
  FiClock,
  FiHash,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiPrinter,
  FiBookOpen,
  FiMail,
  FiPhone,
  FiInfo,
  FiX,
  FiExternalLink,
  FiTrendingUp,
  FiTrendingDown,
  FiPercent,
  FiAward,
  FiCalendar,
  FiFileText,
  FiRefreshCw,
  FiTrash2 // Added delete icon
} from "react-icons/fi";

const GetAllSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState("all");
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [viewSubmission, setViewSubmission] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [viewMentor, setViewMentor] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State for delete confirmation
  const [deleting, setDeleting] = useState(false); // State for delete loading
  const [deleteSuccess, setDeleteSuccess] = useState(null); // State for delete success message

  // API से submissions fetch करें
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.techsterker.com/api/our-mentor/allsubmissionquizz');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Ensure all submissions have required fields
        const sanitizedSubmissions = (result.submissions || []).map(sub => ({
          ...sub,
          mentor: sub.mentor || { _id: 'unknown', name: 'Unknown Mentor' },
          student: sub.student || { _id: 'unknown', name: 'Unknown Student', userId: 'N/A' },
          quiz: sub.quiz || { _id: 'unknown', title: 'Unknown Quiz' },
          detailedResults: sub.detailedResults || [],
          score: sub.score || 0,
          percentage: sub.percentage || 0,
          submittedAt: sub.submittedAt || new Date().toISOString()
        }));
        setSubmissions(sanitizedSubmissions);
      } else {
        throw new Error(result.message || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.message || 'Failed to load submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Delete submission API call
  const deleteSubmission = async (attemptId) => {
    if (!attemptId) {
      alert('Invalid submission ID');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`https://api.techsterker.com/api/our-mentor/deletequiz-attempt/${attemptId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete submission');
      }

      if (result.success) {
        // Remove deleted submission from state
        setSubmissions(prev => prev.filter(sub => sub._id !== attemptId));
        setDeleteSuccess('Submission deleted successfully!');
        
        // Clear selected submissions if deleted
        setSelectedSubmissions(prev => prev.filter(id => id !== attemptId));
        
        // Close any open modals
        if (viewSubmission?._id === attemptId) {
          setViewSubmission(null);
        }
        
        // Clear delete confirm modal
        setDeleteConfirm(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccess(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to delete submission');
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Delete multiple submissions
  const deleteMultipleSubmissions = async () => {
    if (selectedSubmissions.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedSubmissions.length} submission(s)? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      // Delete each submission one by one
      const deletePromises = selectedSubmissions.map(async (attemptId) => {
        const response = await fetch(`https://api.techsterker.com/api/deletequiz-attempt/${attemptId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.json();
      });

      const results = await Promise.all(deletePromises);
      
      // Check if all deletions were successful
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        // Remove all deleted submissions from state
        setSubmissions(prev => prev.filter(sub => !selectedSubmissions.includes(sub._id)));
        setDeleteSuccess(`${selectedSubmissions.length} submission(s) deleted successfully!`);
        setSelectedSubmissions([]);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccess(null);
        }, 3000);
      } else {
        throw new Error('Some submissions could not be deleted');
      }
    } catch (err) {
      console.error('Error deleting submissions:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format time ago
  const timeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      const now = new Date();
      if (isNaN(date.getTime())) return 'Unknown time';
      
      const seconds = Math.floor((now - date) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      
      return Math.floor(seconds) + " seconds ago";
    } catch {
      return 'Unknown time';
    }
  };

  // Get unique values with null checking
  const mentors = [...new Set(submissions
    .filter(s => s.mentor && s.mentor._id)
    .map(s => s.mentor._id)
  )].map(id => {
    const sub = submissions.find(s => s.mentor && s.mentor._id === id);
    return sub?.mentor || { _id: 'unknown', name: 'Unknown Mentor' };
  });

  const students = [...new Set(submissions
    .filter(s => s.student && s.student._id)
    .map(s => s.student._id)
  )].map(id => {
    const sub = submissions.find(s => s.student && s.student._id === id);
    return sub?.student || { _id: 'unknown', name: 'Unknown Student', userId: 'N/A' };
  });

  const quizzes = [...new Set(submissions
    .filter(s => s.quiz && s.quiz._id)
    .map(s => s.quiz._id)
  )].map(id => {
    const sub = submissions.find(s => s.quiz && s.quiz._id === id);
    return sub?.quiz || { _id: 'unknown', title: 'Unknown Quiz' };
  });

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      // Safe access to nested properties
      const studentName = submission.student?.name || '';
      const quizTitle = submission.quiz?.title || '';
      const mentorName = submission.mentor?.name || '';
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Mentor filter
      const matchesMentor = 
        selectedMentor === "all" || 
        submission.mentor?._id === selectedMentor;
      
      // Student filter
      const matchesStudent = 
        selectedStudent === "all" || 
        submission.student?._id === selectedStudent;
      
      // Quiz filter
      const matchesQuiz = 
        selectedQuiz === "all" || 
        submission.quiz?._id === selectedQuiz;
      
      // Score filter
      const submissionPercentage = submission.percentage || 0;
      const matchesScore = 
        scoreFilter === "all" ||
        (scoreFilter === "perfect" && submissionPercentage === 100) ||
        (scoreFilter === "high" && submissionPercentage >= 70 && submissionPercentage < 100) ||
        (scoreFilter === "medium" && submissionPercentage >= 40 && submissionPercentage < 70) ||
        (scoreFilter === "low" && submissionPercentage < 40);
      
      return matchesSearch && matchesMentor && matchesStudent && matchesQuiz && matchesScore;
    })
    .sort((a, b) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt) : new Date(0);
      const bDate = b.submittedAt ? new Date(b.submittedAt) : new Date(0);
      const aPercentage = a.percentage || 0;
      const bPercentage = b.percentage || 0;
      const aName = a.student?.name || '';
      const bName = b.student?.name || '';
      
      switch (sortBy) {
        case "latest":
          return bDate - aDate;
        case "oldest":
          return aDate - bDate;
        case "scoreHigh":
          return bPercentage - aPercentage;
        case "scoreLow":
          return aPercentage - bPercentage;
        case "name":
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

  // Toggle submission expansion
  const toggleExpand = (submissionId) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
  };

  // Select/Deselect all submissions
  const toggleSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(s => s._id).filter(Boolean));
    }
  };

  // Toggle single submission selection
  const toggleSubmissionSelection = (submissionId) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId) 
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  // Calculate stats with safe access
  const stats = {
    totalSubmissions: submissions.length,
    totalStudents: new Set(submissions.map(s => s.student?._id).filter(Boolean)).size,
    totalMentors: new Set(submissions.map(s => s.mentor?._id).filter(Boolean)).size,
    totalQuizzes: new Set(submissions.map(s => s.quiz?._id).filter(Boolean)).size,
    averageScore: submissions.length > 0 
      ? (submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length).toFixed(1)
      : 0,
    perfectSubmissions: submissions.filter(s => s.percentage === 100).length,
    failedSubmissions: submissions.filter(s => (s.percentage || 0) === 0).length,
  };

  // Handle copy submission details
  const handleCopySubmission = (submission) => {
    const submissionText = `
Submission ID: ${submission._id || 'N/A'}
Student: ${submission.student?.name || 'N/A'} (${submission.student?.userId || 'N/A'})
Quiz: ${submission.quiz?.title || 'N/A'}
Mentor: ${submission.mentor?.name || 'N/A'}
Score: ${submission.score || 0}/${submission.detailedResults?.reduce((sum, q) => sum + (q.points || 0), 0) || 0}
Percentage: ${submission.percentage || 0}%
Submitted: ${formatDate(submission.submittedAt)}
    `;
    navigator.clipboard.writeText(submissionText);
    alert('Submission details copied to clipboard!');
  };

  // Safe getter functions
  const getSubmissionPercentage = (submission) => submission.percentage || 0;
  const getSubmissionScore = (submission) => submission.score || 0;
  const getStudentName = (submission) => submission.student?.name || 'Unknown Student';
  const getStudentUserId = (submission) => submission.student?.userId || 'N/A';
  const getQuizTitle = (submission) => submission.quiz?.title || 'Unknown Quiz';
  const getMentorName = (submission) => submission.mentor?.name || 'Unknown Mentor';
  const getDetailedResults = (submission) => submission.detailedResults || [];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-blue-600 font-semibold">Loading submissions...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchSubmissions}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
              All Quiz Submissions
            </h1>
            <p className="text-gray-600 mt-1">View and manage all submitted quizzes by students</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={fetchSubmissions}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
            <button 
              onClick={() => {}}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <FiDownload className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {deleteSuccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiCheckCircle className="mr-2 text-xl" />
              <span>{deleteSuccess}</span>
            </div>
            <button onClick={() => setDeleteSuccess(null)}>
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 text-white mr-4">
              <FiFileText className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-400 text-white mr-4">
              <FiPercent className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-white mr-4">
              <FiAward className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Perfect Scores</p>
              <p className="text-2xl font-bold text-gray-800">{stats.perfectSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-400 text-white mr-4">
              <FiUser className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Unique Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
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
                placeholder="Search by student name, quiz title, or mentor..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="scoreHigh">Score: High to Low</option>
                <option value="scoreLow">Score: Low to High</option>
                <option value="name">Student Name A-Z</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Score Filter */}
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="all">All Scores</option>
              <option value="perfect">Perfect (100%)</option>
              <option value="high">High (70-99%)</option>
              <option value="medium">Medium (40-69%)</option>
              <option value="low">Low (0-39%)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Mentor Filter */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Filter by Mentor</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
              >
                <option value="all">All Mentors</option>
                {mentors.map((mentor, idx) => (
                  <option key={mentor._id || idx} value={mentor._id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Filter by Student</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="all">All Students</option>
                {students.map((student, idx) => (
                  <option key={student._id || idx} value={student._id}>
                    {student.name} ({student.userId || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quiz Filter */}
          <div>
            <label className="block text-sm text-gray-500 mb-2">Filter by Quiz</label>
            <div className="relative">
              <FiBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
              >
                <option value="all">All Quizzes</option>
                {quizzes.map((quiz, idx) => (
                  <option key={quiz._id || idx} value={quiz._id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <FiTrash2 className="text-red-500 mr-2" />
              <span className="font-medium text-red-700">
                {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={deleteMultipleSubmissions}
                disabled={deleting}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center"
              >
                <FiTrash2 className="mr-2" />
                {deleting ? 'Deleting...' : 'Delete Selected'}
              </button>
              <button
                onClick={() => setSelectedSubmissions([])}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-5xl mb-4">📄</div>
            <p className="text-gray-500 text-lg">No submissions found</p>
            {searchTerm || selectedMentor !== "all" || selectedStudent !== "all" || selectedQuiz !== "all" ? (
              <p className="text-gray-400 mt-2">Try changing your search or filters</p>
            ) : null}
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div 
              key={submission._id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Submission Header */}
              <div className={`p-5 ${expandedSubmission === submission._id ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission._id)}
                        onChange={() => toggleSubmissionSelection(submission._id)}
                        className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-xl font-bold text-gray-800">
                            {getStudentName(submission)}
                          </h3>
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {getStudentUserId(submission)}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          Submitted: <strong>{getQuizTitle(submission)}</strong> | Mentor: {getMentorName(submission)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <div className="flex items-center text-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          getSubmissionPercentage(submission) === 100 
                            ? 'bg-gradient-to-br from-green-100 to-teal-100 text-green-700' 
                            : getSubmissionPercentage(submission) >= 70 
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700'
                            : getSubmissionPercentage(submission) >= 40
                            ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-700'
                            : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700'
                        }`}>
                          <span className="text-lg font-bold">{getSubmissionPercentage(submission)}%</span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-800">Score: {getSubmissionScore(submission)} points</div>
                          <div className={`text-sm font-medium ${
                            getSubmissionPercentage(submission) === 100 ? 'text-green-600' :
                            getSubmissionPercentage(submission) >= 70 ? 'text-blue-600' :
                            getSubmissionPercentage(submission) >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {getSubmissionPercentage(submission) === 100 ? 'Perfect Score!' :
                             getSubmissionPercentage(submission) >= 70 ? 'Good Score' :
                             getSubmissionPercentage(submission) >= 40 ? 'Average Score' : 'Needs Improvement'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-1" />
                        <span>{formatDate(submission.submittedAt)}</span>
                        <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {timeAgo(submission.submittedAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FiBookOpen className="mr-1" />
                        <span>{getQuizTitle(submission)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FiUser className="mr-1" />
                        <button
                          onClick={() => setViewMentor(submission.mentor)}
                          className="font-medium hover:text-blue-600 hover:underline transition-colors"
                        >
                          {getMentorName(submission)}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <button
                      onClick={() => toggleExpand(submission._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedSubmission === submission._id ? (
                        <FiChevronUp className="text-gray-500" />
                      ) : (
                        <FiChevronDown className="text-gray-500" />
                      )}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewSubmission(submission)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="View Submission Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleCopySubmission(submission)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Copy Submission Details"
                      >
                        <FiCopy />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(submission)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Submission"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedSubmission === submission._id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Submission Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Submission ID</p>
                        <p className="font-mono text-sm break-all">{submission._id || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Quiz ID</p>
                        <p className="font-mono text-sm">{submission.quiz?._id || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Student</p>
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-gray-400" />
                          <span>{getStudentName(submission)} ({getStudentUserId(submission)})</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500">Submitted At</p>
                        <p>{formatDate(submission.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons in Expanded View */}
                  <div className="mb-6">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setViewSubmission(submission)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
                      >
                        <FiEye className="mr-2" />
                        View Full Details
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(submission)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center"
                      >
                        <FiTrash2 className="mr-2" />
                        Delete Submission
                      </button>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Detailed Results ({getDetailedResults(submission).length} questions)
                    </h4>
                    <div className="space-y-4">
                      {getDetailedResults(submission).map((result, idx) => (
                        <div key={idx} className="bg-white rounded-lg border p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="font-semibold text-gray-700 mr-2">Q{idx + 1}:</span>
                                <span className="text-gray-800">{result.question || 'Question not available'}</span>
                              </div>
                              <div className="ml-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className={`p-3 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                                    <div className="flex items-center">
                                      {result.isCorrect ? (
                                        <FiCheckCircle className="mr-2 text-green-500" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-red-500 mr-2 flex items-center justify-center">
                                          <span className="text-white text-xs">✕</span>
                                        </div>
                                      )}
                                      <span className={result.isCorrect ? 'text-green-700 font-medium' : 'text-red-700'}>
                                        {result.userAnswer || 'Not answered'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Correct Answer:</p>
                                    <div className="flex items-center">
                                      <FiCheckCircle className="mr-2 text-blue-500" />
                                      <span className="text-blue-700 font-medium">{result.correctAnswer || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-center px-3 py-2 rounded-lg ${
                                result.isCorrect 
                                  ? 'bg-gradient-to-br from-green-100 to-teal-100 text-green-800' 
                                  : 'bg-gradient-to-br from-red-100 to-pink-100 text-red-800'
                              }`}>
                                <div className="font-bold text-lg">{result.earnedPoints || 0}/{result.points || 0}</div>
                                <div className="text-xs">points</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.status === 'correct' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.status === 'correct' ? 'Correct' : 'Incorrect'}
                              </span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600">Question ID: {result.questionId || 'N/A'}</span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Submission</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this submission? This action cannot be undone.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm font-medium text-gray-700">Submission Details:</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Student: <span className="font-medium">{getStudentName(deleteConfirm)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Quiz: <span className="font-medium">{getQuizTitle(deleteConfirm)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Score: <span className="font-medium">{getSubmissionPercentage(deleteConfirm)}%</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteSubmission(deleteConfirm._id)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Submission Popup Modal */}
      {viewSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Submission Details</h2>
                  <p className="text-gray-600 mt-1">
                    {getStudentName(viewSubmission)} - {getQuizTitle(viewSubmission)}
                  </p>
                </div>
                <button
                  onClick={() => setViewSubmission(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-2xl text-gray-500" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center">
                  <div className={`text-2xl font-bold px-4 py-2 rounded-xl ${
                    getSubmissionPercentage(viewSubmission) === 100 
                      ? 'bg-green-100 text-green-700' 
                      : getSubmissionPercentage(viewSubmission) >= 70 
                      ? 'bg-blue-100 text-blue-700'
                      : getSubmissionPercentage(viewSubmission) >= 40
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {getSubmissionPercentage(viewSubmission)}%
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-800">Score: {getSubmissionScore(viewSubmission)} points</div>
                    <div className="text-sm text-gray-600">Perfect Score: {
                      getDetailedResults(viewSubmission).reduce((sum, q) => sum + (q.points || 0), 0)
                    } points</div>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FiClock className="mr-2" />
                  <span>{formatDate(viewSubmission.submittedAt)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-2" />
                  <button
                    onClick={() => setViewStudent(viewSubmission.student)}
                    className="font-medium hover:text-blue-600 hover:underline transition-colors"
                  >
                    {getStudentName(viewSubmission)}
                  </button>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FiUser className="mr-2" />
                  <button
                    onClick={() => setViewMentor(viewSubmission.mentor)}
                    className="font-medium hover:text-blue-600 hover:underline transition-colors"
                  >
                    {getMentorName(viewSubmission)}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Submission Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Submission Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Submission ID</p>
                    <p className="font-mono text-sm break-all">{viewSubmission._id || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Quiz ID</p>
                    <p className="font-mono text-sm break-all">{viewSubmission.quiz?._id || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono text-sm break-all">{viewSubmission.student?._id || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Mentor ID</p>
                    <p className="font-mono text-sm break-all">{viewSubmission.mentor?._id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700">{getSubmissionScore(viewSubmission)}</div>
                      <p className="text-sm text-gray-600 mt-1">Points Earned</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700">
                        {getDetailedResults(viewSubmission).filter(r => r.isCorrect).length}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Correct Answers</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-700">{getDetailedResults(viewSubmission).length}</div>
                      <p className="text-sm text-gray-600 mt-1">Total Questions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex space-x-3">
                <button
                  onClick={() => handleCopySubmission(viewSubmission)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center"
                >
                  <FiCopy className="mr-2" />
                  Copy Details
                </button>
                <button
                  onClick={() => setDeleteConfirm(viewSubmission)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  Delete Submission
                </button>
              </div>

              {/* Detailed Results */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detailed Question Results
                </h3>
                <div className="space-y-6">
                  {getDetailedResults(viewSubmission).map((result, idx) => (
                    <div key={idx} className={`border rounded-xl p-5 ${result.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                              result.isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-800">{result.question || 'Question not available'}</h4>
                              <div className="flex items-center mt-1">
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  result.status === 'correct' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.status === 'correct' ? 'Correct' : 'Incorrect'}
                                </span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-sm text-gray-600">Question ID: {result.questionId || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                            <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-100/50 border border-green-300' : 'bg-red-100/50 border border-red-300'}`}>
                              <div className="flex items-center mb-2">
                                <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${
                                  result.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                  A
                                </div>
                                <span className="font-medium">Student's Answer</span>
                              </div>
                              <p className={`text-lg font-medium ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {result.userAnswer || 'Not answered'}
                              </p>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-blue-100/50 border border-blue-300">
                              <div className="flex items-center mb-2">
                                <div className="w-5 h-5 rounded-full mr-2 bg-blue-500 text-white flex items-center justify-center">
                                  B
                                </div>
                                <span className="font-medium">Correct Answer</span>
                              </div>
                              <p className="text-lg font-medium text-blue-700">
                                {result.correctAnswer || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className={`text-center px-4 py-3 rounded-xl ${
                            result.isCorrect 
                              ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white' 
                              : 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
                          }`}>
                            <div className="text-2xl font-bold">{result.earnedPoints || 0}/{result.points || 0}</div>
                            <div className="text-xs opacity-90">points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {}}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center"
                  >
                    <FiPrinter className="mr-2" />
                    Print Report
                  </button>
                </div>
                <button
                  onClick={() => setViewSubmission(null)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Popup */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Student Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Student Details</h2>
                  <p className="opacity-90 mt-1">Information about student</p>
                </div>
                <button
                  onClick={() => setViewStudent(null)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Student Body */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {viewStudent.profileImage ? (
                    <img 
                      src={viewStudent.profileImage} 
                      alt={viewStudent.name || 'Student'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span>${(viewStudent.name || 'S').charAt(0)}</span>`;
                      }}
                    />
                  ) : (
                    <span>{(viewStudent.name || 'S').charAt(0)}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">{viewStudent.name || 'Unknown Student'}</h3>
                  <p className="text-gray-600">Student ID: {viewStudent.userId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiUser className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{viewStudent.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiMail className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{viewStudent.email || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiHash className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono text-sm break-all">{viewStudent._id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiHash className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium">{viewStudent.userId || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiBookOpen className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Submissions</p>
                    <p className="font-medium">
                      {viewStudent._id ? submissions.filter(s => s.student?._id === viewStudent._id).length : 0} quizzes
                    </p>
                  </div>
                </div>

                {/* Student Performance Stats */}
                {viewStudent._id && submissions.filter(s => s.student?._id === viewStudent._id).length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-2">Performance Summary:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {(
                            submissions
                              .filter(s => s.student?._id === viewStudent._id)
                              .reduce((sum, s) => sum + (s.percentage || 0), 0) / 
                            submissions.filter(s => s.student?._id === viewStudent._id).length
                          ).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Average Score</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {submissions.filter(s => s.student?._id === viewStudent._id && s.percentage === 100).length}
                        </div>
                        <div className="text-xs text-gray-600">Perfect Scores</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setViewStudent(null)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Details Popup */}
      {viewMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Mentor Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Mentor Details</h2>
                  <p className="opacity-90 mt-1">Quiz creator information</p>
                </div>
                <button
                  onClick={() => setViewMentor(null)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Mentor Body */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                  <span>{(viewMentor.name || 'M').charAt(0)}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">{viewMentor.name || 'Unknown Mentor'}</h3>
                  <p className="text-gray-600">Quiz Mentor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiUser className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{viewMentor.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiMail className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{viewMentor.email || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiHash className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Mentor ID</p>
                    <p className="font-mono text-sm break-all">{viewMentor._id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FiBookOpen className="text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Quiz Submissions</p>
                    <p className="font-medium">
                      {viewMentor._id ? submissions.filter(s => s.mentor?._id === viewMentor._id).length : 0} submissions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setViewMentor(null)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredSubmissions.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
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

export default GetAllSubmissions;