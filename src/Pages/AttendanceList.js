import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // For Excel export
import { saveAs } from 'file-saver'; // For CSV export
import { FaTrash, FaEdit, FaEye, FaDownload, FaPrint, FaFilter, FaSync } from 'react-icons/fa';

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterMentor, setFilterMentor] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.techsterker.com/api/allattendance');
      setAttendanceData(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Delete attendance record
  const handleDelete = async (attendanceId) => {
    try {
      setDeletingId(attendanceId);
      const response = await axios.delete(`https://api.techsterker.com/api/deleteattendance/${attendanceId}`);
      
      if (response.data.success) {
        setAttendanceData(prevData => 
          prevData.filter(record => record._id !== attendanceId)
        );
        alert('✅ Attendance record deleted successfully!');
        setConfirmDelete(null);
      } else {
        alert('❌ ' + (response.data.message || 'Failed to delete attendance'));
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('❌ ' + (error.response?.data?.message || 'Failed to delete attendance. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  // Filter attendance data
  const filteredData = attendanceData.filter(record => {
    const mentorName = `${record.mentorId?.firstName || ''} ${record.mentorId?.lastName || ''}`.toLowerCase();
    
    // Date filter
    const matchesDate = filterDate ? 
      record.attendance?.some(item => item.date.includes(filterDate)) : true;
    
    // Subject filter
    const matchesSubject = filterSubject ? 
      record.attendance?.some(item => 
        item.subject?.toLowerCase().includes(filterSubject.toLowerCase())
      ) : true;
    
    // Mentor filter
    const matchesMentor = filterMentor ? 
      mentorName.includes(filterMentor.toLowerCase()) : true;
    
    // Student filter
    const matchesStudent = filterStudent ? 
      record.attendance?.some(item => 
        item.studentName?.toLowerCase().includes(filterStudent.toLowerCase())
      ) : true;
    
    // Status filter
    const matchesStatus = filterStatus ? 
      record.attendance?.some(item => 
        item.status?.toLowerCase() === filterStatus.toLowerCase()
      ) : true;
    
    return matchesDate && matchesSubject && matchesMentor && matchesStudent && matchesStatus;
  });

  // Get unique values for filters
  const uniqueSubjects = [...new Set(
    attendanceData.flatMap(record => 
      record.attendance?.map(item => item.subject) || []
    ).filter(Boolean)
  )];

  const uniqueMentors = [...new Set(
    attendanceData.map(record => 
      `${record.mentorId?.firstName || ''} ${record.mentorId?.lastName || ''}`.trim()
    )
  )].filter(Boolean);

  const uniqueStudents = [...new Set(
    attendanceData.flatMap(record => 
      record.attendance?.map(item => item.studentName) || []
    ).filter(Boolean)
  )];

  const uniqueStatuses = ['present', 'absent', 'late'];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timing) => {
    return timing || 'N/A';
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.flatMap(record => 
      (record.attendance || []).map(item => ({
        'Mentor Name': `${record.mentorId?.firstName || ''} ${record.mentorId?.lastName || ''}`,
        'Mentor Email': record.mentorId?.email || 'N/A',
        'Student Name': item.studentName || 'N/A',
        'Enrollment ID': item.enrollmentId || 'N/A',
        'Subject': item.subject || 'N/A',
        'Date': formatDate(item.date),
        'Timing': item.timing || 'N/A',
        'Status': item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A',
        'Record Date': new Date(record.createdAt).toLocaleString()
      }))
    );

    if (exportData.length === 0) {
      alert('No data to export!');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // Mentor Name
      { wch: 25 }, // Mentor Email
      { wch: 20 }, // Student Name
      { wch: 15 }, // Enrollment ID
      { wch: 15 }, // Subject
      { wch: 12 }, // Date
      { wch: 15 }, // Timing
      { wch: 10 }, // Status
      { wch: 20 }  // Record Date
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `attendance_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = filteredData.flatMap(record => 
      (record.attendance || []).map(item => ({
        'Mentor Name': `${record.mentorId?.firstName || ''} ${record.mentorId?.lastName || ''}`,
        'Mentor Email': record.mentorId?.email || 'N/A',
        'Student Name': item.studentName || 'N/A',
        'Enrollment ID': item.enrollmentId || 'N/A',
        'Subject': item.subject || 'N/A',
        'Date': formatDate(item.date),
        'Timing': item.timing || 'N/A',
        'Status': item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A',
        'Record Date': new Date(record.createdAt).toLocaleString()
      }))
    );

    if (exportData.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = ['Mentor Name', 'Mentor Email', 'Student Name', 'Enrollment ID', 'Subject', 'Date', 'Timing', 'Status', 'Record Date'];
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export to PDF (print version)
  const exportToPDF = () => {
    const printContent = document.getElementById('attendance-content');
    if (!printContent) {
      alert('No content to print!');
      return;
    }
    
    const originalContents = document.body.innerHTML;
    const printContents = `
      <html>
        <head>
          <title>Attendance Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .print-header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-footer { 
              text-align: center; 
              margin-top: 20px; 
              border-top: 1px solid #000;
              padding-top: 10px;
              font-size: 12px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .present { background-color: #d4edda; }
            .absent { background-color: #f8d7da; }
            .summary { 
              background-color: #f8f9fa; 
              padding: 10px; 
              border: 1px solid #dee2e6;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Attendance Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${filteredData.length}</p>
          </div>
          ${printContent.innerHTML}
          <div class="print-footer">
            <p>© ${new Date().getFullYear()} Attendance Management System</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContents);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterDate('');
    setFilterSubject('');
    setFilterMentor('');
    setFilterStudent('');
    setFilterStatus('');
    setShowAdvancedFilters(false);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg text-gray-600">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAttendanceData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header with Export Buttons */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Attendance Management</h1>
              <p className="text-blue-100 mt-1">View, manage and export attendance records</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <FaDownload /> <span>Excel</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <FaDownload /> <span>CSV</span>
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <FaPrint /> <span>Print</span>
              </button>
              <button
                onClick={fetchAttendanceData}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <FaSync /> <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-50 px-6 py-5 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaFilter className="mr-2" /> Filters
            </h2>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </button>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mentor Name
                </label>
                <select
                  value={filterMentor}
                  onChange={(e) => setFilterMentor(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Mentors</option>
                  {uniqueMentors.map(mentor => (
                    <option key={mentor} value={mentor}>
                      {mentor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  placeholder="Search student name..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {filteredData.length > 0 && (
          <div className="bg-white px-6 py-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.flatMap(record => record.attendance || [])
                    .filter(item => item.status === 'present').length}
                </div>
                <div className="text-sm text-gray-600">Total Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.flatMap(record => record.attendance || [])
                    .filter(item => item.status === 'absent').length}
                </div>
                <div className="text-sm text-gray-600">Total Absent</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(filteredData.flatMap(record => 
                    (record.attendance || []).map(item => item.studentName)
                  ))].length}
                </div>
                <div className="text-sm text-gray-600">Unique Students</div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        <div id="attendance-content" className="p-0">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No attendance records found</h3>
              <p className="text-gray-500 mb-6">
                {Object.values({
                  filterDate,
                  filterSubject,
                  filterMentor,
                  filterStudent,
                  filterStatus
                }).some(value => value) 
                  ? 'Try adjusting your filters' 
                  : 'No attendance records available'}
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {filteredData.map((record) => (
                <div key={record._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Record Header with Delete Button */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              Mentor: {record.mentorId?.firstName || 'N/A'} {record.mentorId?.lastName || ''}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Email:</span> {record.mentorId?.email || 'N/A'} | 
                              <span className="font-medium ml-2">Phone:</span> {record.mentorId?.phoneNumber || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Expertise:</span> {record.mentorId?.expertise || 'N/A'}
                            </p>
                          </div>
                          
                          {/* Delete Button */}
                          <div className="relative">
                            {confirmDelete === record._id ? (
                              <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg">
                                <span className="text-sm text-red-700">Confirm delete?</span>
                                <button
                                  onClick={() => handleDelete(record._id)}
                                  disabled={deletingId === record._id}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                >
                                  {deletingId === record._id ? 'Deleting...' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(record._id)}
                                disabled={deletingId === record._id}
                                className="bg-red-100 text-red-600 p-2.5 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Delete Record"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-2 md:mt-0 md:text-right">
                        <div>Created: {new Date(record.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(record.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Enrollment ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Timing
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(record.attendance || []).map((item, index) => (
                          <tr 
                            key={item._id || index} 
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.studentName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                                {item.enrollmentId || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {item.subject || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {formatDate(item.date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {formatTime(item.timing)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}
                              >
                                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-blue-50 px-6 py-3 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                      <div className="mb-2 sm:mb-0">
                        <span className="text-gray-600">
                          Total Students: <span className="font-semibold">{record.attendance?.length || 0}</span>
                        </span>
                      </div>
                      <div className="flex space-x-4">
                        <span className="text-green-600 font-medium">
                          Present: {record.attendance?.filter(item => item.status === 'present').length || 0}
                        </span>
                        <span className="text-red-600 font-medium">
                          Absent: {record.attendance?.filter(item => item.status === 'absent').length || 0}
                        </span>
                        <span className="text-yellow-600 font-medium">
                          Late: {record.attendance?.filter(item => item.status === 'late').length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Records Footer */}
        {filteredData.length > 0 && (
          <div className="bg-gray-800 text-white px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm">
                  Showing <span className="font-semibold">{filteredData.length}</span> of{' '}
                  <span className="font-semibold">{attendanceData.length}</span> records
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <p className="text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;