import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Eye, X, Save, Plus, Download, Search, Filter, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';

const FormsManagement = () => {
  const [activeTab, setActiveTab] = useState('enquiry');
  const [enquiries, setEnquiries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [applies, setApplies] = useState([]);
  const [demos, setDemos] = useState([]);
  const [getInTouch, setGetInTouch] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [formData, setFormData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const API_BASE = 'https://api.techsterker.com/api';

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'enquiry':
          endpoint = '/Enquiry';
          const enqRes = await fetch(`${API_BASE}${endpoint}`);
          const enqData = await enqRes.json();
          setEnquiries(enqData.data || []);
          break;
        case 'contact':
          endpoint = '/contactus';
          const conRes = await fetch(`${API_BASE}${endpoint}`);
          const conData = await conRes.json();
          setContacts(conData.data || []);
          break;
        case 'apply':
          endpoint = '/apply';
          const appRes = await fetch(`${API_BASE}${endpoint}`);
          const appData = await appRes.json();
          setApplies(appData.data || []);
          break;
        case 'demo':
          endpoint = '/demo';
          const demoRes = await fetch(`${API_BASE}${endpoint}`);
          const demoData = await demoRes.json();
          setDemos(demoData.data || []);
          break;
        case 'getintouch':
          endpoint = '/getintouchs';
          const gitRes = await fetch(`${API_BASE}${endpoint}`);
          const gitData = await gitRes.json();
          setGetInTouch(gitData.data || []);
          break;
        case 'users':
          endpoint = '/users';
          const usersRes = await fetch(`${API_BASE}${endpoint}`);
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    }
    setLoading(false);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'enquiry': return enquiries;
      case 'contact': return contacts;
      case 'apply': return applies;
      case 'demo': return demos;
      case 'getintouch': return getInTouch;
      case 'users': return users;
      default: return [];
    }
  };

  const getFilteredData = () => {
    let data = getCurrentData();

    if (searchTerm) {
      data = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();

        if (activeTab === 'enquiry') {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchLower)) ||
            (item.city && item.city.toLowerCase().includes(searchLower)) ||
            (typeof item.courses === 'string' && item.courses.toLowerCase().includes(searchLower))
          );
        } else if (activeTab === 'contact') {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchLower)) ||
            (item.enquiryType && item.enquiryType.toLowerCase().includes(searchLower)) ||
            (item.message && item.message.toLowerCase().includes(searchLower))
          );
        } else if (activeTab === 'apply') {
          return (
            (item.fullname && item.fullname.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.mobile && item.mobile.toLowerCase().includes(searchLower)) ||
            (item.experties && item.experties.toLowerCase().includes(searchLower)) ||
            (item.experience && item.experience.toLowerCase().includes(searchLower))
          );
        } else if (activeTab === 'demo') {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchLower)) ||
            (item.course && item.course.toLowerCase().includes(searchLower))
          );
        } else if (activeTab === 'getintouch') {
          return (
            (item.fullName && item.fullName.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchLower)) ||
            (item.iAm && item.iAm.toLowerCase().includes(searchLower)) ||
            (item.collegeName && item.collegeName.toLowerCase().includes(searchLower)) ||
            (item.companyName && item.companyName.toLowerCase().includes(searchLower))
          );
        } else if (activeTab === 'users') {
          return (
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchLower)) ||
            (item.syllabus && item.syllabus.toLowerCase().includes(searchLower))
          );
        }
        return false;
      });
    }

    if (filterField !== 'all') {
      data = data.filter(item => {
        if (activeTab === 'enquiry' && filterField === 'city') {
          return item.city;
        } else if (activeTab === 'contact' && filterField === 'enquiryType') {
          return item.enquiryType;
        } else if (activeTab === 'apply' && filterField === 'experties') {
          return item.experties;
        } else if (activeTab === 'demo' && filterField === 'course') {
          return item.course;
        } else if (activeTab === 'getintouch' && filterField === 'iAm') {
          return item.iAm;
        } else if (activeTab === 'users' && filterField === 'syllabus') {
          return item.syllabus;
        }
        return true;
      });
    }

    if (dateFrom || dateTo) {
      data = data.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        if (from && to) {
          return itemDate >= from && itemDate <= to;
        } else if (from) {
          return itemDate >= from;
        } else if (to) {
          return itemDate <= to;
        }
        return true;
      });
    }

    return data;
  };

  const getPaginatedData = () => {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToCSV = () => {
    const data = getFilteredData();
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    let headers = [];
    let rows = [];

    if (activeTab === 'enquiry') {
      headers = ['Name', 'Email', 'Phone Number', 'Courses', 'City', 'Message', 'Created At'];
      rows = data.map(item => [
        item.name || '',
        item.email || '',
        item.phoneNumber || '',
        Array.isArray(item.courses)
          ? item.courses.map(c => typeof c === 'object' ? c.name : c).join('; ')
          : typeof item.courses === 'object' ? JSON.stringify(item.courses) : item.courses || '',
        item.city || '',
        item.message || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    } else if (activeTab === 'contact') {
      headers = ['Name', 'Email', 'Phone Number', 'Enquiry Type', 'Message', 'Created At'];
      rows = data.map(item => [
        item.name || '',
        item.email || '',
        item.phoneNumber || '',
        item.enquiryType || '',
        item.message || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    } else if (activeTab === 'apply') {
      headers = ['Full Name', 'Email', 'Mobile', 'Expertise', 'Experience', 'Message', 'Resume URL', 'Created At'];
      rows = data.map(item => [
        item.fullname || '',
        item.email || '',
        item.mobile || '',
        item.experties || '',
        item.experience || '',
        item.message || '',
        item.resume || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    } else if (activeTab === 'demo') {
      headers = ['Name', 'Email', 'Phone Number', 'Course', 'Created At'];
      rows = data.map(item => [
        item.name || '',
        item.email || '',
        item.phoneNumber || '',
        item.course || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    } else if (activeTab === 'getintouch') {
      headers = ['Full Name', 'Email', 'Phone Number', 'I Am', 'College Name', 'Branch', 'Year Passed Out', 'Company Name', 'Role', 'Experience (Years)', 'Message', 'Created At'];
      rows = data.map(item => [
        item.fullName || '',
        item.email || '',
        item.phoneNumber || '',
        item.iAm || '',
        item.collegeName || '',
        item.branch || '',
        item.yearOfPassedOut || '',
        item.companyName || '',
        item.role || '',
        item.experienceInYears || '',
        item.message || '',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    } else if (activeTab === 'users') {
      headers = ['Name', 'Phone Number', 'Syllabus', 'Verified', 'Created At'];
      rows = data.map(item => [
        item.name || '',
        item.phoneNumber || '',
        item.syllabus || '',
        item.verified ? 'Yes' : 'No',
        item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = getFilteredData();
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({});
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      let endpoint = '';
      switch (activeTab) {
        case 'enquiry': endpoint = `/Enquiry/${id}`; break;
        case 'contact': endpoint = `/contactus/${id}`; break;
        case 'apply': endpoint = `/apply/${id}`; break;
        case 'demo': endpoint = `/demo/${id}`; break;
        case 'getintouch': endpoint = `/getintouch/${id}`; break;
        case 'users': endpoint = `/users/${id}`; break;
        default: return;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    }
  };

  const handleSave = async () => {
    try {
      let endpoint = '';
      let method = modalMode === 'create' ? 'POST' : 'PUT';

      switch (activeTab) {
        case 'enquiry':
          endpoint = modalMode === 'create' ? '/Enquiry' : `/Enquiry/${selectedItem._id}`;
          break;
        case 'contact':
          endpoint = modalMode === 'create' ? '/contactus' : `/contactus/${selectedItem._id}`;
          break;
        case 'apply':
          endpoint = modalMode === 'create' ? '/apply' : `/apply/${selectedItem._id}`;
          break;
        case 'demo':
          endpoint = modalMode === 'create' ? '/demo' : `/demo/${selectedItem._id}`;
          break;
        case 'getintouch':
          endpoint = modalMode === 'create' ? '/getintouch' : `/getintouch/${selectedItem._id}`;
          break;
        case 'users':
          endpoint = modalMode === 'create' ? '/users' : `/users/${selectedItem._id}`;
          break;
        default:
          return;
      }

      let body;
      let headers = {};

      if (activeTab === 'apply' && formData.resumeFile) {
        const formDataObj = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'resumeFile') {
            formDataObj.append('resume', formData[key]);
          } else if (key !== 'resume' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
            formDataObj.append(key, formData[key]);
          }
        });
        body = formDataObj;
      } else {
        headers['Content-Type'] = 'application/json';
        const cleanData = { ...formData };
        delete cleanData._id;
        delete cleanData.createdAt;
        delete cleanData.updatedAt;
        delete cleanData.__v;
        delete cleanData.resumeFile;
        body = JSON.stringify(cleanData);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body,
      });

      if (response.ok) {
        alert(`${modalMode === 'create' ? 'Created' : 'Updated'} successfully`);
        setIsModalOpen(false);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterField('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const renderTable = () => {
    const data = getPaginatedData();

    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {activeTab === 'enquiry' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Courses</th>
                  <th className="px-4 py-2 border-b text-left">City</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
              {activeTab === 'contact' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Type</th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
              {activeTab === 'apply' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Full Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Mobile</th>
                  <th className="px-4 py-2 border-b text-left">Expertise</th>
                  <th className="px-4 py-2 border-b text-left">Experience</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
              {activeTab === 'demo' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Course</th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
              {activeTab === 'getintouch' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Full Name</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">I Am</th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
              {activeTab === 'users' && (
                <>
                  <th className="px-4 py-2 border-b text-left">Name</th>
                  <th className="px-4 py-2 border-b text-left">Phone</th>
                  <th className="px-4 py-2 border-b text-left">Syllabus</th>
                  <th className="px-4 py-2 border-b text-left">Verified</th>
                  <th className="px-4 py-2 border-b text-left">Date</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {activeTab === 'enquiry' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.name}</td>
                    <td className="px-4 py-2 border-b">{item.email}</td>
                    <td className="px-4 py-2 border-b">{item.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">
                      {Array.isArray(item.courses)
                        ? item.courses.map(c => typeof c === 'object' ? c.name : c).join(', ')
                        : typeof item.courses === 'object' && item.courses !== null
                          ? item.courses.name || JSON.stringify(item.courses)
                          : item.courses || 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b">{item.city || 'N/A'}</td>
                  </>
                )}
                {activeTab === 'contact' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.name || 'N/A'}</td>
                    <td className="px-4 py-2 border-b">{item.email || 'N/A'}</td>
                    <td className="px-4 py-2 border-b">{item.phoneNumber || 'N/A'}</td>
                    <td className="px-4 py-2 border-b">{item.enquiryType || 'N/A'}</td>
                    <td className="px-4 py-2 border-b">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </>
                )}
                {activeTab === 'apply' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.fullname}</td>
                    <td className="px-4 py-2 border-b">{item.email}</td>
                    <td className="px-4 py-2 border-b">{item.mobile}</td>
                    <td className="px-4 py-2 border-b">{item.experties}</td>
                    <td className="px-4 py-2 border-b">{item.experience}</td>
                  </>
                )}
                {activeTab === 'demo' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.name}</td>
                    <td className="px-4 py-2 border-b">{item.email}</td>
                    <td className="px-4 py-2 border-b">{item.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">{item.course}</td>
                    <td className="px-4 py-2 border-b">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </>
                )}
                {activeTab === 'getintouch' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.fullName}</td>
                    <td className="px-4 py-2 border-b">{item.email}</td>
                    <td className="px-4 py-2 border-b">{item.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">{item.iAm}</td>
                    <td className="px-4 py-2 border-b">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <td className="px-4 py-2 border-b">{item.name}</td>
                    <td className="px-4 py-2 border-b">{item.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">{item.syllabus || 'N/A'}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${item.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.verified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </>
                )}
                <td className="px-4 py-2 border-b">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    {/* <button
                      onClick={() => handleEdit(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button> */}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderForm = () => {
    const isReadOnly = modalMode === 'view';

    return (
      <div className="space-y-4">
        {activeTab === 'enquiry' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Courses</label>
              <input
                type="text"
                name="courses"
                value={
                  Array.isArray(formData.courses)
                    ? formData.courses.map(c => typeof c === 'object' ? c.name : c).join(', ')
                    : typeof formData.courses === 'object' && formData.courses !== null
                      ? JSON.stringify(formData.courses)
                      : formData.courses || ''
                }
                onChange={handleInputChange}
                disabled={isReadOnly}
                placeholder="Enter courses separated by commas"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <small className="text-gray-500">Separate multiple courses with commas</small>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (with country code)</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                placeholder="+919398459192"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Enquiry Type</label>
              <input
                type="text"
                name="enquiryType"
                value={formData.enquiryType || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {activeTab === 'apply' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expertise</label>
              <input
                type="text"
                name="experties"
                value={formData.experties || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            {!isReadOnly && (
              <div>
                <label className="block text-sm font-medium mb-1">Resume Upload</label>
                <input
                  type="file"
                  name="resumeFile"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {formData.resume && (
              <div>
                <label className="block text-sm font-medium mb-1">Current Resume</label>
                <a
                  href={formData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Download size={16} />
                  View Resume
                </a>
              </div>
            )}
          </>
        )}

        {activeTab === 'demo' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <input
                type="text"
                name="course"
                value={formData.course || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {activeTab === 'getintouch' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">I Am</label>
              <select
                name="iAm"
                value={formData.iAm || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            {formData.iAm === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">College Name</label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year of Passed Out</label>
                  <input
                    type="text"
                    name="yearOfPassedOut"
                    value={formData.yearOfPassedOut || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
            {formData.iAm === 'professional' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience (Years)</label>
                  <input
                    type="text"
                    name="experienceInYears"
                    value={formData.experienceInYears || ''}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Syllabus</label>
              <input
                type="text"
                name="syllabus"
                value={formData.syllabus || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verified</label>
              <select
                name="verified"
                value={formData.verified || ''}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Forms Management</h1>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('enquiry')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'enquiry'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Enquiries ({enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'contact'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Contact Us ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'apply'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Job Applications ({applies.length})
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'demo'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Book a Demo ({demos.length})
            </button>
            <button
              onClick={() => setActiveTab('getintouch')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'getintouch'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Get In Touch ({getInTouch.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Certificate Users ({users.length})
            </button>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
    <div className="flex gap-3 items-center flex-wrap">
  <button
    onClick={handleCreate}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 flex-shrink-0"
  >
    <Plus size={18} />
    Create New
  </button>

  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <select
    value={filterField}
    onChange={(e) => setFilterField(e.target.value)}
    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[150px] flex-shrink-0"
  >
    <option value="all">All Fields</option>
    {activeTab === 'enquiry' && <option value="city">By City</option>}
    {activeTab === 'contact' && <option value="enquiryType">By Type</option>}
    {activeTab === 'apply' && <option value="experties">By Expertise</option>}
    {activeTab === 'demo' && <option value="course">By Course</option>}
    {activeTab === 'getintouch' && <option value="iAm">By Type</option>}
    {activeTab === 'users' && <option value="syllabus">By Syllabus</option>}
  </select>

  <div className="flex gap-3 items-center mb-4">
    <div className="flex flex-col min-w-[150px]">
      <label htmlFor="dateFrom" className="text-sm text-gray-600 mb-1">
        From Date
      </label>
      <input
        id="dateFrom"
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="flex flex-col min-w-[150px]">
      <label htmlFor="dateTo" className="text-sm text-gray-600 mb-1">
        To Date
      </label>
      <input
        id="dateTo"
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>


                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex-shrink-0"
                >
                  Clear Filters
                </button>
              </div>


              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FileDown size={18} />
                  Export CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <FileDown size={18} />
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {renderTable()}
          </div>

          {getFilteredData().length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData().length)} of {getFilteredData().length} entries
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {modalMode === 'view' ? 'View' : modalMode === 'edit' ? 'Edit' : 'Create'}{' '}
                  {activeTab === 'enquiry' ? 'Enquiry' :
                    activeTab === 'contact' ? 'Contact' :
                      activeTab === 'apply' ? 'Application' :
                        activeTab === 'demo' ? 'Demo' :
                          activeTab === 'getintouch' ? 'Get In Touch' : 'User'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="px-6 py-4">
                {renderForm()}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsManagement;