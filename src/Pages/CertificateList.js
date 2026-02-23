import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiDownload, 
  FiSearch, 
  FiFilter,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiUser,
  FiMail,
  FiFileText,
  FiExternalLink
} from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { saveAs } from 'file-saver'; // Install: npm install file-saver

const API_BASE = 'https://api.techsterker.com/api';

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Status dropdown state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  
  // Loading states for operations
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState({}); // Track downloads by ID

  // Ref for dropdown
  const dropdownRef = useRef(null);

  // Fetch certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Apply filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [search, statusFilter, batchFilter, certificates]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/certificates`);
      console.log('Certificates API Response:', res.data);
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCertificates(res.data.data);
        setFilteredCertificates(res.data.data);
      } else {
        setError('No certificates found.');
        setCertificates([]);
        setFilteredCertificates([]);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to fetch certificates. Please check your connection.');
      setCertificates([]);
      setFilteredCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to construct full URL
  const getFullCertificateUrl = (certificatePath) => {
    if (!certificatePath) return null;
    
    // If already a full URL, return as is
    if (certificatePath.startsWith('http://') || certificatePath.startsWith('https://')) {
      return certificatePath;
    }
    
    // If it's a relative path starting with /uploads
    if (certificatePath.startsWith('/uploads/')) {
      return `${window.location.origin}${certificatePath}`;
    }
    
    // If it's just a filename or relative path
    return `${window.location.origin}/uploads/certificates/${certificatePath}`;
  };

  // Download certificate function - FIXED
  const handleDownload = async (certificate) => {
    const certificateId = certificate._id;
    
    // Set loading state for this specific certificate
    setDownloadLoading(prev => ({ ...prev, [certificateId]: true }));
    
    try {
      const certificateUrl = getFullCertificateUrl(certificate.certificateFile);
      
      if (!certificateUrl) {
        alert('Certificate file not available');
        return;
      }
      
      console.log('Downloading certificate from:', certificateUrl);
      
      // Fetch the file
      const response = await fetch(certificateUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      // Get the file blob
      const blob = await response.blob();
      
      // Extract filename from URL or use default
      let filename = 'certificate';
      
      // Try to get filename from URL
      const urlParts = certificateUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        filename = lastPart;
      } else {
        // Create a filename based on user and batch
        const userName = certificate.user?.name || 'user';
        const batchName = certificate.enrolledId?.batchNumber || 'batch';
        const extension = blob.type.includes('pdf') ? '.pdf' : '.jpg';
        filename = `${userName}_${batchName}_certificate${extension}`;
      }
      
      // Sanitize filename
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // Use file-saver to download
      saveAs(blob, filename);
      
      console.log(`Certificate downloaded: ${filename}`);
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Open in new tab
      const fallbackUrl = getFullCertificateUrl(certificate.certificateFile);
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
        console.log('Opened certificate in new tab');
      } else {
        alert(`Failed to download certificate: ${error.message}`);
      }
    } finally {
      // Clear loading state
      setDownloadLoading(prev => ({ ...prev, [certificateId]: false }));
    }
  };

  // Alternative download method - direct anchor tag
  const handleDirectDownload = (certificate) => {
    const certificateUrl = getFullCertificateUrl(certificate.certificateFile);
    
    if (!certificateUrl) {
      alert('Certificate file not available');
      return;
    }
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = certificateUrl;
    
    // Set download attribute with filename
    let filename = 'certificate';
    const urlParts = certificateUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      filename = lastPart;
    } else {
      const userName = certificate.user?.name || 'user';
      const batchName = certificate.enrolledId?.batchNumber || 'batch';
      filename = `${userName}_${batchName}_certificate.jpg`;
    }
    
    link.download = filename;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View certificate in new tab
  const handleViewInNewTab = (certificate) => {
    const certificateUrl = getFullCertificateUrl(certificate.certificateFile);
    
    if (!certificateUrl) {
      alert('Certificate file not available');
      return;
    }
    
    window.open(certificateUrl, '_blank');
  };

  const applyFilters = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(cert => {
        const batchNumber = cert.enrolledId?.batchNumber || '';
        const batchName = cert.enrolledId?.batchName || '';
        const userName = cert.user?.name || '';
        const userEmail = cert.user?.email || '';
        const certId = cert._id || '';

        return (
          batchNumber.toLowerCase().includes(searchLower) ||
          batchName.toLowerCase().includes(searchLower) ||
          userName.toLowerCase().includes(searchLower) ||
          userEmail.toLowerCase().includes(searchLower) ||
          certId.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(cert => cert.status === statusFilter);
    }

    // Apply batch filter
    if (batchFilter !== 'All') {
      filtered = filtered.filter(cert => {
        const batchDisplay = `${cert.enrolledId?.batchNumber || ''} - ${cert.enrolledId?.batchName || ''}`.trim();
        return batchDisplay === batchFilter;
      });
    }

    setFilteredCertificates(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get unique batches for filter dropdown
  const getUniqueBatches = () => {
    const batches = new Set();
    certificates.forEach(cert => {
      if (cert.enrolledId?.batchNumber && cert.enrolledId?.batchName) {
        batches.add(`${cert.enrolledId.batchNumber} - ${cert.enrolledId.batchName}`);
      }
    });
    return Array.from(batches);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedCertificate) return;
    
    setStatusLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/certificate/${selectedCertificate._id}/status`,
        { status: selectedStatus }
      );
      
      if (res.data?.success) {
        // Update certificate in state
        setCertificates(prev =>
          prev.map(cert =>
            cert._id === selectedCertificate._id
              ? { ...cert, status: selectedStatus }
              : cert
          )
        );
        
        setStatusDropdownOpen(false);
        alert('Certificate status updated successfully!');
      } else {
        alert(res.data?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setStatusLoading(false);
      setSelectedCertificate(null);
    }
  };

  // Handle status edit click
  const handleEditStatusClick = (certificate, event) => {
    event.stopPropagation();
    setSelectedCertificate(certificate);
    setSelectedStatus(certificate.status);
    setStatusDropdownOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCertificate) return;
    
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/certificate/${selectedCertificate._id}`);
      
      if (res.data?.success) {
        // Remove certificate from state
        setCertificates(prev => prev.filter(cert => cert._id !== selectedCertificate._id));
        setDeleteModalOpen(false);
        alert('Certificate deleted successfully!');
      } else {
        alert(res.data?.message || 'Failed to delete certificate');
      }
    } catch (err) {
      console.error('Error deleting certificate:', err);
      alert(err.response?.data?.message || 'Failed to delete certificate. Please try again.');
    } finally {
      setDeleteLoading(false);
      setSelectedCertificate(null);
    }
  };

  // Handle view certificate details
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setViewModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (certificate) => {
    setSelectedCertificate(certificate);
    setDeleteModalOpen(true);
  };

  // Copy certificate URL to clipboard
  const copyCertificateUrl = (certificate) => {
    const certificateUrl = getFullCertificateUrl(certificate.certificateFile);
    
    if (certificateUrl) {
      navigator.clipboard.writeText(certificateUrl)
        .then(() => {
          alert('Certificate URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          alert('Failed to copy URL to clipboard');
        });
    } else {
      alert('Certificate file not available');
    }
  };

  // Get file type icon
  const getFileIcon = (certificateFile) => {
    if (!certificateFile) return <FiFileText className="text-gray-400" />;
    
    if (certificateFile.toLowerCase().endsWith('.pdf')) {
      return <span className="text-red-500">📄</span>;
    } else if (certificateFile.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      return <span className="text-blue-500">🖼️</span>;
    }
    return <FiFileText className="text-gray-400" />;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCertificates = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Status options
  const statusOptions = ['Pending', 'Approved', 'Rejected'];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return 'certificate';
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName || 'certificate';
    } catch {
      return 'certificate';
    }
  };

  // Status Dropdown Component
  const StatusDropdown = () => {
    if (!statusDropdownOpen || !selectedCertificate) return null;

    return (
      <div 
        ref={dropdownRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Update Status</h4>
          <button
            onClick={() => setStatusDropdownOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={16} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          Certificate: {selectedCertificate._id.substring(0, 8)}...
        </p>
        
        <div className="space-y-2 mb-3">
          {statusOptions.map(status => (
            <label
              key={status}
              className={`flex items-center p-2 rounded cursor-pointer ${selectedStatus === status ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={selectedStatus === status}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </label>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setStatusDropdownOpen(false)}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={statusLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={statusLoading}
            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            {statusLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin" size={12} />
            ) : (
              <FiCheck size={12} />
            )}
            Update
          </button>
        </div>
      </div>
    );
  };

  // View Modal Component - Updated Download Section
  const ViewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-blue-600 text-white">
          <h3 className="text-lg font-semibold">Certificate Details</h3>
          <button
            onClick={() => setViewModalOpen(false)}
            className="text-white hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Certificate Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-blue-600">📄</span> Certificate Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Certificate ID</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded truncate">
                          {selectedCertificate._id}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCertificate.status)}`}>
                            {selectedCertificate.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="text-sm font-medium">{formatDate(selectedCertificate.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-green-600">👥</span> Batch Information
                    </h4>
                    <div className="space-y-3">
                      {selectedCertificate.enrolledId ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Batch Number</p>
                            <p className="font-medium">{selectedCertificate.enrolledId.batchNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Batch Name</p>
                            <p className="font-medium">{selectedCertificate.enrolledId.batchName || 'N/A'}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">No batch information available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiUser className="text-purple-600" /> User Information
                    </h4>
                    <div className="space-y-3">
                      {selectedCertificate.user ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">User Name</p>
                            <p className="font-medium">{selectedCertificate.user.name || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium truncate">{selectedCertificate.user.email || 'N/A'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">No user information available</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiDownload className="text-blue-600" /> Certificate File Actions
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">File URL</p>
                        <div className="flex items-center gap-2">
                          {getFileIcon(selectedCertificate.certificateFile)}
                          <p className="text-sm font-medium p-2 bg-gray-100 rounded truncate flex-1">
                            {getFileNameFromUrl(selectedCertificate.certificateFile)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDirectDownload(selectedCertificate)}
                            disabled={downloadLoading[selectedCertificate._id]}
                            className="py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {downloadLoading[selectedCertificate._id] ? (
                              <AiOutlineLoading3Quarters className="animate-spin" size={14} />
                            ) : (
                              <FiDownload size={14} />
                            )}
                            Download
                          </button>
                          <button
                            onClick={() => copyCertificateUrl(selectedCertificate)}
                            className="py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center justify-center gap-2"
                          >
                            Copy URL
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleViewInNewTab(selectedCertificate)}
                          className="w-full py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                          <FiExternalLink size={14} />
                          Open in New Tab
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Preview/Info */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Certificate Preview</h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-center">
                    <div className="p-6">
                      <div className="text-4xl mb-3">
                        {getFileIcon(selectedCertificate.certificateFile)}
                      </div>
                      <p className="text-gray-700 font-medium">
                        {getFileNameFromUrl(selectedCertificate.certificateFile)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Click "Open in New Tab" to view the certificate
                      </p>
                      <div className="mt-4 space-x-2">
                        <button
                          onClick={() => handleDirectDownload(selectedCertificate)}
                          disabled={downloadLoading[selectedCertificate._id]}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          {downloadLoading[selectedCertificate._id] ? (
                            <>
                              <AiOutlineLoading3Quarters className="animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <FiDownload />
                              Download Certificate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b bg-red-600 text-white">
          <h3 className="text-lg font-semibold">Delete Certificate</h3>
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="text-white hover:text-gray-200"
            disabled={deleteLoading}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="text-red-500 text-4xl mb-4 text-center">⚠️</div>
            <p className="text-gray-700 text-center font-medium">
              Are you sure you want to delete this certificate?
            </p>
            
            {selectedCertificate && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Certificate ID:</span> {selectedCertificate._id.substring(0, 12)}...
                </p>
                {selectedCertificate.user?.name && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">User:</span> {selectedCertificate.user.name}
                  </p>
                )}
                {selectedCertificate.enrolledId && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Batch:</span> {selectedCertificate.enrolledId.batchNumber}
                  </p>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-500 text-center mt-4">
              This action cannot be undone. The certificate will be permanently removed.
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Certificates Management</h2>
              <p className="text-gray-600 mt-1">Manage and track all certificates</p>
            </div>
            <button
              onClick={fetchCertificates}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <FiRefreshCw />
              )}
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-blue-600">{certificates.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.status === 'Approved').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {certificates.filter(c => c.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter(c => c.status === 'Rejected').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by batch, name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="All">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Filter */}
            <div className="w-full md:w-64">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="All">All Batches</option>
                  {getUniqueBatches().map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <AiOutlineLoading3Quarters className="animate-spin mx-auto text-blue-600" size={32} />
              <p className="text-lg mt-2">Loading certificates...</p>
              <p className="text-sm text-gray-500 mt-1">Fetching data from server</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button
                onClick={fetchCertificates}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw />
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <div className="text-gray-500">
                            <div className="text-4xl mb-2">📄</div>
                            <p className="text-lg">No certificates found</p>
                            <p className="text-sm mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentCertificates.map((certificate) => (
                        <tr key={certificate._id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="text-sm font-mono text-gray-900 truncate max-w-[120px]" title={certificate._id}>
                              {certificate._id.substring(0, 12)}...
                            </div>
                          </td>
                          <td className="p-4">
                            {certificate.enrolledId ? (
                              <div>
                                <div className="font-medium text-gray-900">{certificate.enrolledId.batchNumber}</div>
                                <div className="text-sm text-gray-500 truncate max-w-[150px]">{certificate.enrolledId.batchName}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="p-4">
                            {certificate.user ? (
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-1">
                                  <FiUser className="text-gray-400" size={14} />
                                  {certificate.user.name || 'Unnamed User'}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-[180px] flex items-center gap-1">
                                  <FiMail className="text-gray-400" size={12} />
                                  {certificate.user.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                              {certificate.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getFileIcon(certificate.certificateFile)}
                              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                {getFileNameFromUrl(certificate.certificateFile)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {formatDate(certificate.createdAt)}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewCertificate(certificate)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="View Details"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={(e) => handleEditStatusClick(certificate, e)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                title="Edit Status"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDirectDownload(certificate)}
                                disabled={downloadLoading[certificate._id]}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50"
                                title="Download"
                              >
                                {downloadLoading[certificate._id] ? (
                                  <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                                ) : (
                                  <FiDownload size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteClick(certificate)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
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
              {filteredCertificates.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-6">
                  <div className="text-sm text-gray-600 mb-4 md:mb-0">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCertificates.length)} of {filteredCertificates.length} certificates
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 border rounded ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Status Dropdown */}
      <StatusDropdown />

      {/* Modals */}
      {viewModalOpen && <ViewModal />}
      {deleteModalOpen && <DeleteModal />}
    </div>
  );
};

export default CertificateList;