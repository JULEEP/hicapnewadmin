// CoursePdfDownloader.jsx
import React, { useState, useEffect } from 'react';

const DownloadCoursePdf = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://api.techsterker.com/api/allcourses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCourses(data.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const downloadPdf = async (pdfUrl, courseName) => {
    if (!pdfUrl) {
      alert(`No PDF available for "${courseName}"`);
      return;
    }

    try {
      // Fetch the PDF as a blob
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('PDF not found or inaccessible');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseName.replace(/\s+/g, '_')}.pdf`; // Clean filename
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Failed to download PDF for "${courseName}".\nError: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow max-w-md text-center">
          <h2 className="font-bold text-lg">Failed to Load Courses</h2>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Download Course Materials
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Click any course below to download its PDF brochure
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => downloadPdf(course.pdf, course.name)}
              disabled={!course.pdf}
              className={`flex items-center justify-center p-4 rounded-xl shadow-sm transition-all duration-200 ${
                course.pdf
                  ? 'bg-white hover:shadow-md hover:-translate-y-0.5 border border-gray-200 text-indigo-700 hover:bg-indigo-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={course.pdf ? `Download ${course.name} PDF` : 'PDF not available'}
            >
              <span className="font-medium text-center truncate px-2">
                {course.name}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          All PDFs are securely hosted and downloaded directly to your device.
        </div>
      </div>
    </div>
  );
};

export default DownloadCoursePdf;