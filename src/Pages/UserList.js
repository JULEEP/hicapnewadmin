import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaEye, FaUserPlus, FaTimes, FaSearch, FaFileExport, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [downloadLimit, setDownloadLimit] = useState(50);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [enrollmentModal, setEnrollmentModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchEnrollments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://api.techsterker.com/api/allusers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get("https://api.techsterker.com/api/allenrollments");
      setEnrollments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setError("Failed to load enrollments");
    }
  };

  const openViewModal = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setViewModal(true);
  };

  const openEditModal = (user) => {
    if (!user) {
      console.error("No user provided to edit");
      return;
    }
    
    // Safe user object with default values
    const safeUser = {
      _id: user._id || "",
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      city: user.city || "",
      zipcode: user.zipcode || "",
      dateOfBirth: user.dateOfBirth || "",
      course: user.course || "",
      role: user.role || "student"
    };
    
    setEditedUser(safeUser);
    setEditModal(true);
  };

  const openEnrollmentModal = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setSelectedEnrollment("");
    setEnrollmentModal(true);
  };

  const openDeleteModal = (user) => {
    if (!user) return;
    setUserToDelete(user);
    setDeleteModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => {
      if (!prev) {
        // Create a new object if prev is null
        return { [name]: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (!editedUser || !editedUser._id) {
      setError("Invalid user data");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.techsterker.com/api/userregister/${editedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editedUser.name || "",
            email: editedUser.email || "",
            mobile: editedUser.mobile || "",
            city: editedUser.city || "",
            zipcode: editedUser.zipcode || "",
            dateOfBirth: editedUser.dateOfBirth || "",
            course: editedUser.course || "",
            role: editedUser.role || "student",
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      
      setUsers((prev) =>
        prev.map((u) => (u._id === editedUser._id ? data.updatedUser : u))
      );
      setEditModal(false);
      setEditedUser(null);
      setError("");
      setSuccess("User updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSubmit = async () => {
    if (!selectedUser || !selectedEnrollment) {
      setError("Please select an enrollment");
      return;
    }

    setEnrollLoading(true);
    try {
      const res = await axios.post("https://api.techsterker.com/api/enrollments/add-user", {
        userId: selectedUser._id,
        enrollmentId: selectedEnrollment
      });

      if (res.data.success) {
        setEnrollmentModal(false);
        setSelectedUser(null);
        setSelectedEnrollment("");
        setError("");
        setSuccess("User enrolled successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error(res.data.message || "Enrollment failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Enrollment failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(
        `https://api.techsterker.com/api/userregister/${userToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setDeleteModal(false);
      setUserToDelete(null);
      setError("");
      setSuccess("User deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Safe filtering with null checks
  const filtered = users.filter((u) => {
    if (!u) return false;
    const userName = u.name || "";
    return userName.toLowerCase().includes(search.toLowerCase());
  });

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / usersPerPage);

  const exportData = (type) => {
    const exportUsers = filtered.slice(0, downloadLimit).map((u) => ({
      id: u?._id || "",
      name: u?.name || "",
      email: u?.email || "",
      phone: u?.mobile || "",
      course: u?.course || "",
      role: u?.role || "",
      createdAt: u?.createdAt,
      updatedAt: u?.updatedAt,
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Users");
    writeFile(wb, `users_export.${type}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  const closeAllModals = () => {
    setViewModal(false);
    setEditModal(false);
    setEnrollmentModal(false);
    setDeleteModal(false);
    setSelectedUser(null);
    setEditedUser(null);
    setUserToDelete(null);
    setSelectedEnrollment("");
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage and monitor all registered users</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-3" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative w-full lg:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search users by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={downloadLimit}
                  onChange={(e) => setDownloadLimit(Number(e.target.value))}
                  className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {[10, 50, 100, 200].map((v) => (
                    <option key={v} value={v}>
                      Limit: {v}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              
              <button
                onClick={() => exportData("csv")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                <FaFileExport />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 font-medium">Filtered</p>
              <p className="text-2xl font-bold text-gray-800">{filtered.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">Current Page</p>
              <p className="text-2xl font-bold text-gray-800">{currentUsers.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-600 font-medium">Total Pages</p>
              <p className="text-2xl font-bold text-gray-800">{totalPages}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="py-4 px-6 text-left font-semibold">#</th>
                  <th className="py-4 px-6 text-left font-semibold">Name</th>
                  <th className="py-4 px-6 text-left font-semibold">Email</th>
                  <th className="py-4 px-6 text-left font-semibold">Phone</th>
                  <th className="py-4 px-6 text-left font-semibold">Course</th>
                  <th className="py-4 px-6 text-left font-semibold">Role</th>
                  <th className="py-4 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u, idx) => (
                  <tr 
                    key={u?._id || idx} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        {indexOfFirst + idx + 1}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{u?.name || "N/A"}</td>
                    <td className="py-4 px-6">
                      <a href={`mailto:${u?.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {u?.email || "N/A"}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <a href={`tel:${u?.mobile}`} className="text-gray-700 hover:text-blue-600">
                        {u?.mobile || "N/A"}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {u?.course || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        u?.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : u?.role === 'teacher'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {u?.role || "student"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View Details"
                          onClick={() => openViewModal(u)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Edit User"
                          onClick={() => openEditModal(u)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Enroll User"
                          onClick={() => openEnrollmentModal(u)}
                        >
                          <FaUserPlus />
                        </button>
                        <button
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete User"
                          onClick={() => openDeleteModal(u)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {currentUsers.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">👤</div>
                <p className="text-gray-500 text-lg">No users found</p>
                {search && (
                  <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)}</span> of{" "}
                  <span className="font-semibold">{filtered.length}</span> users
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

        {/* Edit User Modal - FIXED VERSION */}
        {editModal && editedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                  <p className="text-gray-600 mt-1">Update user information</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">👤</span>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📧</span>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter email"
                    />
                  </div>
                  
                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📱</span>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={editedUser.mobile || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🏙️</span>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editedUser.city || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                  </div>
                  
                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📚</span>
                      Course
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={editedUser.course || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter course"
                    />
                  </div>
                  
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">👑</span>
                      Role
                    </label>
                    <select
                      name="role"
                      value={editedUser.role || "student"}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {viewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">User Details</h2>
                  <p className="text-gray-600 mt-1">Complete user profile information</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-xl font-bold">👤</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                        <p className="text-gray-600">Basic user details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "User ID", value: selectedUser.userId || "N/A", icon: "🆔" },
                        { label: "Full Name", value: selectedUser.name || "N/A", icon: "📛" },
                        { label: "Email Address", value: selectedUser.email || "N/A", icon: "📧" },
                        { label: "Mobile Number", value: selectedUser.mobile || "N/A", icon: "📱" },
                        { label: "Degree", value: selectedUser.degree || "N/A", icon: "🎓" },
                        { label: "Department", value: selectedUser.department || "N/A", icon: "🏛️" },
                        { label: "Passout Year", value: selectedUser.yearOfPassedOut || "N/A", icon: "📅" },
                        { label: "User Role", value: selectedUser.role || "N/A", icon: "👑" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start py-3 border-b border-gray-100 last:border-0">
                          <span className="text-lg mr-3">{item.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{item.label}</p>
                            <p className="font-medium text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course & Payment Card */}
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-green-600 text-xl font-bold">💰</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Course & Payment</h3>
                        <p className="text-gray-600">Financial and course details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">📚</span> Course Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Course Name</p>
                            <p className="font-medium">{selectedUser.course || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Company</p>
                            <p className="font-medium">{selectedUser.company || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Experience</p>
                            <p className="font-medium">{selectedUser.experience || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2">💳</span> Payment Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              selectedUser.paymentStatus === "Paid" 
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {selectedUser.paymentStatus || "Pending"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Advance Payment</p>
                            <p className="font-medium">₹{selectedUser.advancePayment?.toLocaleString() || "0"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="font-medium text-lg">₹{selectedUser.totalPrice?.toLocaleString() || "0"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Remaining</p>
                            <p className="font-medium text-red-600">₹{selectedUser.remainingPayment?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-lg border border-yellow-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <span className="mr-3">📊</span> Additional Information
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Generated Password", value: selectedUser.generatedPassword || "N/A", icon: "🔑" },
                            { label: "Interviews", value: selectedUser.interviews?.length || 0, icon: "💼" },
                            { label: "Certificates", value: selectedUser.certificates?.length || 0, icon: "🏆" },
                            { label: "Recommended Courses", value: selectedUser.recommendedCourses?.length || 0, icon: "🎯" },
                          ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center mb-2">
                                <span className="text-xl mr-2">{item.icon}</span>
                                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                              </div>
                              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <span className="mr-3">⏰</span> Timestamps
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center mb-2">
                              <span className="text-xl mr-2">✨</span>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Account Created</p>
                                <p className="text-lg font-bold text-gray-800">{formatDate(selectedUser.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center mb-2">
                              <span className="text-xl mr-2">🔄</span>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                                <p className="text-lg font-bold text-gray-800">{formatDate(selectedUser.updatedAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeAllModals();
                    openEditModal(selectedUser);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Modal */}
        {enrollmentModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Enroll User</h2>
                  <p className="text-gray-600 mt-1">Add user to a course batch</p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-white p-5 rounded-xl border border-purple-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">👤</span> Selected User
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-600">{selectedUser.mobile}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">📚</span>
                    Select Enrollment Batch
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEnrollment}
                      onChange={(e) => setSelectedEnrollment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">-- Select Enrollment Batch --</option>
                      {enrollments.map((enrollment) => (
                        <option key={enrollment._id} value={enrollment._id}>
                          {enrollment.batchName}{" "}
                          {enrollment.courseId?.name ? `(${enrollment.courseId.name})` : ""}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                <button
                  onClick={closeAllModals}
                  disabled={enrollLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollmentSubmit}
                  disabled={enrollLoading || !selectedEnrollment}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrollLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enrolling...
                    </span>
                  ) : "Enroll User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                    <FaExclamationTriangle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Confirm Deletion</h2>
                    <p className="text-gray-600 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">⚠️ Warning: You are about to delete a user permanently.</p>
                  <div className="mt-3">
                    <p className="font-semibold text-gray-800">{userToDelete.name}</p>
                    <p className="text-sm text-gray-600">{userToDelete.email}</p>
                    <p className="text-sm text-gray-600">Role: {userToDelete.role || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <span className="font-bold">{userToDelete.name}</span>? 
                  All associated data will be permanently removed from the system.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    disabled={deleteLoading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      "Delete Permanently"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}