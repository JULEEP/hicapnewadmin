import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_BASE = 'https://api.techsterker.com/api';

const GenerateInitialInvoice = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    courseId: '',
    course: '',
    degree: '',
    department: '',
    yearOfPassedOut: '',
    company: '',
    role: '',
    experience: '',
    totalAmount: '',
    upiId: '',
    paymentMode: 'UPI',
    // New payment fields
    transactionId: '',
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

  const navigate = useNavigate();

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/allcourses`);
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, []);

  // Handle course selection to auto-fill course name and price
  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = courses.find(course => course._id === selectedCourseId);
    
    if (selectedCourse) {
      setFormData(prevState => ({
        ...prevState,
        courseId: selectedCourseId,
        course: selectedCourse.name,
        totalAmount: selectedCourse.price || '',
        paidAmount: selectedCourse.price || '' // Auto-fill paid amount same as course price
      }));
    }
  };

  // Handle input field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccessMessage('');
  setInvoiceData(null);

  // Validation
  if (!formData.name || !formData.mobile || !formData.course || !formData.totalAmount || !formData.paidAmount || !formData.transactionId) {
    setError('Name, mobile, course, total amount, paid amount and transaction ID are required fields');
    setLoading(false);
    return;
  }

  // Mobile number validation
  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(formData.mobile)) {
    setError('Please enter a valid 10-digit mobile number');
    setLoading(false);
    return;
  }

  try {
    // Ensure paymentDate is properly formatted and not empty
    const submitData = {
      ...formData,
      paymentDate: formData.paymentDate || new Date().toISOString().split('T')[0]
    };

    console.log('Sending data:', submitData); // Debug log

    const res = await axios.post(`${API_BASE}/generateinvoice`, submitData);
    
    if (res.data.success) {
      setSuccessMessage('Invoice generated successfully with paid status!');
      setInvoiceData(res.data.data);

      // Reset form
      setFormData({
        name: '',
        mobile: '',
        email: '',
        courseId: '',
        course: '',
        degree: '',
        department: '',
        yearOfPassedOut: '',
        company: '',
        role: '',
        experience: '',
        totalAmount: '',
        upiId: '',
        paymentMode: 'UPI',
        transactionId: '',
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI'
      });

      // Show success message for 3 seconds then navigate
      setTimeout(() => {
        navigate('/invoicelist');
      }, 3000);

    } else {
      setError(res.data.message || 'Failed to generate invoice');
    }
  } catch (err) {
    console.error('Invoice generation error:', err);
    
    // Better error logging
    if (err.response) {
      console.error('Server response error:', err.response.data);
      setError(err.response.data.message || 'An error occurred while generating the invoice');
    } else if (err.request) {
      console.error('Network error:', err.request);
      setError('Network error: Please check your internet connection');
    } else {
      console.error('Error:', err.message);
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};
  // Calculate GST and total amount (18% GST)
  const calculateAmounts = () => {
    if (!formData.totalAmount) return { coursePrice: 0, gstAmount: 0, totalPrice: 0 };
    
    const coursePrice = parseFloat(formData.totalAmount) || 0;
    const gstAmount = (coursePrice * 18) / 100;
    const totalPrice = coursePrice + gstAmount;
    
    return {
      coursePrice,
      gstAmount,
      totalPrice
    };
  };

  const amounts = calculateAmounts();

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Generate Paid Invoice (Admin)</h2>
      <p className="text-gray-600 mb-6">Create and send paid invoice to user with welcome email</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Invoice Success Details */}
      {invoiceData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">✅ Invoice Generated Successfully</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>User ID:</strong> {invoiceData.userId}</p>
              <p><strong>Name:</strong> {invoiceData.name}</p>
              <p><strong>Course:</strong> {invoiceData.course}</p>
              <p><strong>Total Amount:</strong> ₹{invoiceData.totalAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Payment Status:</strong> <span className="text-green-600 font-bold">{invoiceData.paymentStatus}</span></p>
              <p><strong>Paid Amount:</strong> ₹{invoiceData.paidAmount?.toLocaleString()}</p>
              <p><strong>Transaction ID:</strong> {invoiceData.transactionId}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {invoiceData.invoice?.fullPdfUrl && (
              <a 
                href={invoiceData.invoice.fullPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                📄 View Invoice PDF
              </a>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Student Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter student name"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              pattern="[6-9]{1}[0-9]{9}"
            />
            {formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid mobile number</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Enter email address"
          />
        </div>

        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Course *</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleCourseChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} {course.price ? `(₹${course.price.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Course Price (₹) *</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter course price"
            />
          </div>
        </div>

        {/* Amount Breakdown */}
        {formData.totalAmount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">💰 Amount Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Course Price</p>
                <p className="text-lg font-semibold">₹{amounts.coursePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GST (18%)</p>
                <p className="text-lg font-semibold">₹{amounts.gstAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-green-600">₹{amounts.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4">💳 Payment Details (Paid)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Paid Amount */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Paid Amount (₹) *</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleInputChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Enter paid amount"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Transaction ID *</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Enter transaction ID"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Payment Method */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="UPI">UPI Transfer</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card Payment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">UPI ID (if UPI payment)</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., yourname@upi"
              />
            </div>
          </div>
        </div>

        {/* Educational Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Degree */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., B.Tech, B.Sc"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Computer Science"
            />
          </div>

          {/* Year of Passed Out */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Year of Passing</label>
            <input
              type="text"
              name="yearOfPassedOut"
              value={formData.yearOfPassedOut}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2023"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Current company"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Current role"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Experience (Years)</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 years"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Paid Invoice...
              </span>
            ) : (
              '💰 Generate Paid Invoice'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateInitialInvoice;