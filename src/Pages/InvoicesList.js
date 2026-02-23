import React, { useEffect, useState } from "react";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaDownload, 
  FaEye, 
  FaFileInvoice, 
  FaRupeeSign, 
  FaCalendarAlt, 
  FaSearch, 
  FaSync, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaBook, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import moment from "moment";

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
    sent: 0
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.techsterker.com/api/getallinvoices");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch invoices");
      }
      
      if (!data.success) {
        throw new Error(data.message || "API returned error");
      }
      
      setInvoices(data.data || []);
      setError("");
      
      // Calculate stats
      const statsData = {
        total: data.data?.length || 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        sent: 0
      };
      
      data.data?.forEach(inv => {
        const status = inv.status?.toLowerCase();
        if (status === 'paid') statsData.paid++;
        else if (status === 'pending') statsData.pending++;
        else if (status === 'cancelled') statsData.cancelled++;
        else if (status === 'sent') statsData.sent++;
      });
      
      setStats(statsData);
      
      setSuccess(`Successfully loaded ${data.data?.length || 0} invoices`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices by search query
  const filtered = invoices.filter((inv) => {
    const searchLower = search.toLowerCase();
    const studentName = inv.student?.name || "";
    const invoiceNumber = inv.invoiceNumber || "";
    const studentEmail = inv.student?.email || "";
    const courseName = inv.student?.course || "";
    
    return (
      studentName.toLowerCase().includes(searchLower) ||
      invoiceNumber.toLowerCase().includes(searchLower) ||
      studentEmail.toLowerCase().includes(searchLower) ||
      courseName.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLast = currentPage * invoicesPerPage;
  const indexOfFirst = indexOfLast - invoicesPerPage;
  const currentInvoices = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / invoicesPerPage);

  const exportData = (type) => {
    const exportInvoices = filtered
      .slice(0, downloadLimit)
      .map((inv) => ({
        "Invoice Number": inv.invoiceNumber || "N/A",
        "Student Name": inv.student?.name || "N/A",
        "Student Email": inv.student?.email || "N/A",
        "Student Mobile": inv.student?.mobile || "N/A",
        "Course": inv.student?.course || "N/A",
        "Subtotal": inv.subtotal || 0,
        "Total Amount": inv.totalAmount || 0,
        "Payment Status": inv.status || "N/A",
        "Issue Date": moment(inv.issueDate).format('DD/MM/YYYY'),
        "Due Date": moment(inv.dueDate).format('DD/MM/YYYY'),
        "Company": inv.companyInfo?.name || "N/A",
        "Company Email": inv.companyInfo?.email || "N/A"
      }));
    
    if (exportInvoices.length === 0) {
      setError("No data to export!");
      return;
    }
    
    const ws = utils.json_to_sheet(exportInvoices);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Invoices");
    writeFile(wb, `invoices_export_${moment().format('YYYY-MM-DD')}.${type}`);
    
    setSuccess(`Exported ${exportInvoices.length} invoices successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setUpdatedStatus(invoice.status || "");
    setIsEditModalOpen(true);
  };

  const handleEditStatus = async () => {
    if (!updatedStatus || !selectedInvoice) {
      setError("Please select a status and invoice");
      return;
    }

    setIsUpdating(true);
    try {
      // Use invoiceId for the API
      const invoiceId = selectedInvoice.invoiceId || selectedInvoice._id;
      if (!invoiceId) {
        throw new Error("Invoice ID not found");
      }

      const res = await fetch(
        `https://api.techsterker.com/api/updateinvoice/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: updatedStatus }),
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update invoice");
      }
      
      if (!data.success) {
        throw new Error(data.message || "Update failed");
      }

      setIsEditModalOpen(false);
      fetchInvoices(); // Refresh the list
      setSuccess("Invoice status updated successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong");
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (invoice) => {
    if (!invoice) {
      setError("No invoice selected for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      // Use invoiceId for the API
      const invoiceId = invoice.invoiceId || invoice._id;
      if (!invoiceId) {
        throw new Error("Invoice ID not found");
      }

      const res = await fetch(
        `https://api.techsterker.com/api/deleteinvoice/${invoiceId}`,
        { 
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete invoice");
      }
      
      if (!data.success) {
        throw new Error(data.message || "Delete failed");
      }

      // Remove from local state immediately
      setInvoices(prev => prev.filter(inv => {
        const invId = inv.invoiceId || inv._id;
        return invId !== invoiceId;
      }));
      
      setDeleteConfirm(null);
      setSuccess("Invoice deleted successfully!");
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh stats
      fetchInvoices();
    } catch (err) {
      setError(err.message || "Something went wrong");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (invoice) => {
    setDeleteConfirm({
      invoiceId: invoice.invoiceId || invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      studentName: invoice.student?.name
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch(statusLower) {
      case 'paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch(statusLower) {
      case 'paid':
        return <FaCheckCircle className="inline mr-1" />;
      case 'pending':
        return <FaClock className="inline mr-1" />;
      case 'cancelled':
        return <FaTimesCircle className="inline mr-1" />;
      case 'sent':
        return <FaInfoCircle className="inline mr-1" />;
      default:
        return <FaFileInvoice className="inline mr-1" />;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Get unique statuses for dropdown
  const statusOptions = ["sent", "Paid", "Pending", "Cancelled"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
              <FaFileInvoice className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Invoice Management</h1>
              <p className="text-gray-600">Manage and track all your invoices in one place</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow animate-fadeIn">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">{error}</p>
                <button 
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800 text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow animate-fadeIn">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-3" />
              <div className="flex-1">
                <p className="text-green-700 font-medium">{success}</p>
                <button 
                  onClick={() => setSuccess("")}
                  className="text-green-600 hover:text-green-800 text-sm mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaFileInvoice className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-gray-800">{stats.paid}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-3xl font-bold text-gray-800">{stats.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaInfoCircle className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-3xl font-bold text-gray-800">{stats.sent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="relative w-full lg:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search by name, email, invoice number or course..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <select
                  value={downloadLimit}
                  onChange={(e) => setDownloadLimit(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10 Records</option>
                  <option value="50">50 Records</option>
                  <option value="100">100 Records</option>
                  <option value="200">200 Records</option>
                  <option value="500">500 Records</option>
                </select>
              </div>

              <button
                onClick={() => exportData("csv")}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <FaDownload /> Export CSV
              </button>

              <button
                onClick={() => exportData("xlsx")}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <FaDownload /> Export Excel
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {filtered.length} of {invoices.length} invoices
              {search && (
                <span className="ml-2 text-blue-600">
                  for "{search}"
                </span>
              )}
            </div>
            
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <FaSync className={loading ? "animate-spin" : ""} /> 
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="py-4 px-6 text-left font-semibold">#</th>
                  <th className="py-4 px-6 text-left font-semibold">Invoice Details</th>
                  <th className="py-4 px-6 text-left font-semibold">Student Info</th>
                  <th className="py-4 px-6 text-left font-semibold">Course</th>
                  <th className="py-4 px-6 text-left font-semibold">Amount & Dates</th>
                  <th className="py-4 px-6 text-left font-semibold">Status</th>
                  <th className="py-4 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading invoices...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No invoices found</h3>
                        <p className="text-gray-500 max-w-md">
                          {search 
                            ? 'Try adjusting your search criteria'
                            : 'No invoices available. Create your first invoice!'}
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentInvoices.map((inv, index) => (
                    <tr 
                      key={inv.invoiceId || inv._id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                          {indexOfFirst + index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {inv.invoiceNumber || "N/A"}
                          </p>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" size={10} />
                              <span className="font-medium">Issued:</span> 
                              {inv.issueDate ? moment(inv.issueDate).format('DD MMM YYYY') : 'N/A'}
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1" size={10} />
                              <span className="font-medium">Due:</span> 
                              {inv.dueDate ? moment(inv.dueDate).format('DD MMM YYYY') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <FaUser className="text-blue-600" size={12} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {inv.student?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">{inv.student?.mobile || "N/A"}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <FaEnvelope className="text-gray-400 mr-2" size={12} />
                            <a 
                              href={`mailto:${inv.student?.email}`} 
                              className="text-blue-600 hover:underline truncate max-w-[200px]"
                            >
                              {inv.student?.email || "N/A"}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 mt-1">
                            <FaBook className="text-green-600" size={12} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {inv.student?.course || "N/A"}
                            </p>
                            {inv.student?.batch && (
                              <p className="text-xs text-gray-500">Batch: {inv.student.batch}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaRupeeSign className="text-gray-500 mr-2" size={14} />
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(inv.totalAmount)}
                            </span>
                          </div>
                          {inv.subtotal && (
                            <div className="text-xs text-gray-500">
                              Subtotal: {formatCurrency(inv.subtotal)}
                            </div>
                          )}
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2" size={12} />
                              Due: {inv.dueDate ? moment(inv.dueDate).format('DD MMM YYYY') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inv.status)}`}>
                          {getStatusIcon(inv.status)}
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {inv.fullPdfUrl && (
                            <a
                              href={inv.fullPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Invoice PDF"
                            >
                              <FaEye />
                            </a>
                          )}
                          <button
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Edit Invoice Status"
                            onClick={() => openEditModal(inv)}
                            disabled={isUpdating}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Invoice"
                            onClick={() => confirmDelete(inv)}
                            disabled={isDeleting}
                          >
                            <FaTrashAlt />
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
          {!loading && filtered.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} •{' '}
                  <span className="font-semibold">
                    {indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)}
                  </span> of {filtered.length} invoices
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
        </div>

        {/* Edit Status Modal */}
        {isEditModalOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Update Invoice Status</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  disabled={isUpdating}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  Invoice: <span className="text-blue-600 font-bold">{selectedInvoice.invoiceNumber}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Student: {selectedInvoice.student?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Current Status: <span className="font-medium capitalize">{selectedInvoice.status}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedInvoice.invoiceId || selectedInvoice._id}</code>
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Status
                </label>
                <select
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isUpdating}
                >
                  <option value="">-- Select Status --</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStatus}
                  disabled={!updatedStatus || isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">
                  Are you sure you want to delete this invoice?
                </p>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Invoice:</span> {deleteConfirm.invoiceNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Student:</span> {deleteConfirm.studentName || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    ID: <code className="bg-gray-200 px-2 py-1 rounded">{deleteConfirm.invoiceId}</code>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const invoiceToDelete = invoices.find(inv => 
                      (inv.invoiceId || inv._id) === deleteConfirm.invoiceId
                    );
                    if (invoiceToDelete) {
                      handleDelete(invoiceToDelete);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Invoice"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}