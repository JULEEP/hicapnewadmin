import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaSignOutAlt, FaUserCircle, FaHome, FaUsers, FaBook, FaGraduationCap, FaChalkboardTeacher, FaCalendarAlt, FaFileAlt, FaPhone, FaCertificate, FaCreditCard, FaUserTie, FaFolderOpen, FaVideo, FaClipboardList } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigate = useNavigate();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("authToken");
      
      delete axios.defaults.headers.common['Authorization'];
      
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  const getIconForItem = (name) => {
    switch(name) {
      case "Dashboard": return <FaHome className="text-lg" />;
      case "Users": return <FaUsers className="text-lg" />;
      case "Attendance": return <FaClipboardList className="text-lg" />;
      case "Courses": return <FaBook className="text-lg" />;
      case "Course Module": return <FaFolderOpen className="text-lg" />;
      case "Enrollments": return <FaGraduationCap className="text-lg" />;
      case "Mentors": return <FaUserTie className="text-lg" />;
      case "Invoices": return <FaFileAlt className="text-lg" />;
      case "Contacts": return <FaPhone className="text-lg" />;
      case "Classes": return <FaVideo className="text-lg" />;
      case "Interviews": return <FaCalendarAlt className="text-lg" />;
      case "Certificates": return <FaCertificate className="text-lg" />;
      case "Payments": return <FaCreditCard className="text-lg" />;
      case "Logout": return <FaSignOutAlt className="text-lg" />;
      default: return <FaHome className="text-lg" />;
    }
  };

  const elements = [
    {
      icon: getIconForItem("Dashboard"),
      name: "Dashboard",
      path: "/dashboard",
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      icon: getIconForItem("Users"),
      name: "Users",
      gradient: "from-purple-600 to-indigo-500",
      dropdown: [
        { name: "Get All Users", path: "/users", icon: <FaChevronRight className="text-xs" /> },
        { name: "Create User", path: "/createuser", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Attendance"),
      name: "Attendance",
      gradient: "from-emerald-600 to-teal-500",
      dropdown: [
        { name: "All Attendance", path: "/attendancelist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Courses"),
      name: "Courses",
      gradient: "from-amber-600 to-orange-500",
      dropdown: [
        { name: "Create Course", path: "/create-course", icon: <FaChevronRight className="text-xs" /> },
        { name: "Get All Courses", path: "/courselist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Course Module"),
      name: "Course Module",
      gradient: "from-rose-600 to-pink-500",
      dropdown: [
        { name: "Create Course Module", path: "/course-modules/create", icon: <FaChevronRight className="text-xs" /> },
        { name: "All Courses Modules", path: "/course-modules", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Enrollments"),
      name: "Enrollments",
      gradient: "from-violet-600 to-purple-500",
      dropdown: [
        { name: "Get All Enrollments", path: "/allenrollments", icon: <FaChevronRight className="text-xs" /> },
        { name: "Create Enrollment", path: "/create-enrollment", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Mentors"),
      name: "Mentors",
      gradient: "from-sky-600 to-blue-500",
      dropdown: [
        { name: "Register Mentor", path: "/creatementor", icon: <FaChevronRight className="text-xs" /> },
        // { name: "All Mentors", path: "/mentorlist", icon: <FaChevronRight className="text-xs" /> },
        { name: "Add Enroll to Mentor", path: "/addmentortoenrollered", icon: <FaChevronRight className="text-xs" /> },
        { name: "Mentors with batches", path: "/mentorswithbatches", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Invoices"),
      name: "Invoices",
      gradient: "from-lime-600 to-green-500",
      dropdown: [
        { name: "Generate Invoice", path: "/generateinvoice", icon: <FaChevronRight className="text-xs" /> },
        { name: "All Invoices", path: "/invoicelist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Contacts"),
      name: "Contacts",
      gradient: "from-indigo-600 to-blue-500",
      dropdown: [
        { name: "User ContactsList", path: "/usercontactformlist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Classes"),
      name: "Classes",
      gradient: "from-red-600 to-orange-500",
      dropdown: [
        { name: "Create Live Class", path: "/createliveclass", icon: <FaChevronRight className="text-xs" /> },
        { name: "Get All LiveClasses", path: "/liveclasses", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Interviews"),
      name: "Interviews",
      gradient: "from-yellow-600 to-amber-500",
      dropdown: [
        { name: "Schedule Interview", path: "/add-interview", icon: <FaChevronRight className="text-xs" /> },
        { name: "Get All Interviews", path: "/interviewlist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
      icon: getIconForItem("Certificates"),
      name: "Certificates",
      gradient: "from-cyan-600 to-teal-500",
      dropdown: [
        { name: "Issue Certificate", path: "/add-certificate", icon: <FaChevronRight className="text-xs" /> },
        { name: "View Certificates", path: "/certificate-list", icon: <FaChevronRight className="text-xs" /> },
      ],
    },
    {
  icon: getIconForItem("Quizzes"),
  name: "Quizzes",
  gradient: "from-purple-600 to-pink-500",
  dropdown: [
    { 
      name: "View Quizzes", 
      path: "/allquizzes", 
      icon: <FaChevronRight className="text-xs" /> 
    },
     { 
      name: "View Quizzes Submissions", 
      path: "/allsubmissionquizzes", 
      icon: <FaChevronRight className="text-xs" /> 
    },
  ],
},

 {
  icon: getIconForItem("Weekly Tasks"),
  name: "Weekly Tasks",
  gradient: "from-purple-600 to-pink-500",
  dropdown: [
    { 
      name: "View Tasks", 
      path: "/alltasks", 
      icon: <FaChevronRight className="text-xs" /> 
    },
     { 
      name: "View Quizzes Submissions", 
      path: "/allsubmissionquizzes", 
      icon: <FaChevronRight className="text-xs" /> 
    },
  ],
},

{
  icon: <FaFolderOpen />,
  name: "Popup",
  gradient: "from-cyan-600 to-teal-500",
  dropdown: [
    { name: "Website Popup", path: "/popup", icon: <FaChevronRight className="text-xs" /> },
  ],
},
    {
      icon: getIconForItem("Payments"),
      name: "Payments",
      gradient: "from-green-600 to-emerald-500",
      dropdown: [
        { name: "Get All Payments", path: "/paymentlist", icon: <FaChevronRight className="text-xs" /> },
      ],
    },

    {
  icon: <FaFileAlt />,
  name: "Download All PDFs",
  gradient: "from-green-600 to-emerald-500",
  dropdown: [
    { name: "Get All Payments", path: "/allpdfs", icon: <FaChevronRight className="text-xs" /> },
  ],
},
  {
  icon: <FaUserCircle />,
  name: "Profile",
  gradient: "from-indigo-600 to-purple-500",
  dropdown: [
    {
      name: "View Profile",
      path: "/adminprofile",
      icon: <FaChevronRight className="text-xs" />
    },
  ],
},
    
    {
      icon: getIconForItem("Logout"),
      name: "Logout",
      gradient: "from-gray-600 to-slate-500",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isMobile
          ? isCollapsed
            ? "w-0 opacity-0"
            : "w-72 opacity-100"
          : isCollapsed
          ? "w-20"
          : "w-72"
      } h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 backdrop-blur-xl border-r border-blue-500/20 shadow-2xl`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 p-6 flex flex-col items-center bg-gradient-to-r from-gray-800/80 to-blue-800/80 backdrop-blur-md border-b border-blue-500/30">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <FaUserCircle className="text-2xl text-white" />
          </div>
        </div>
        <span
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-xl ${
            isCollapsed && !isMobile ? "hidden" : "block"
          }`}
        >
          Admin Panel
        </span>
        <span
          className={`text-xs text-blue-300 mt-1 ${
            isCollapsed && !isMobile ? "hidden" : "block"
          }`}
        >
          Control Dashboard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-2">
          {elements.map((item, idx) => {
            const isDropdownOpen = openDropdown === item.name;
            const hasDropdown = item.dropdown && item.dropdown.length > 0;
            
            return (
              <div key={idx} className="relative">
                {/* Main Menu Item */}
                <div
                  className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer group ${
                    isCollapsed && !isMobile ? "justify-center px-2" : ""
                  } ${
                    isDropdownOpen
                      ? `bg-gradient-to-r ${item.gradient} shadow-lg shadow-blue-500/30 text-white`
                      : hoveredItem === item.name
                        ? `bg-white/10 backdrop-blur-sm text-white`
                        : "hover:bg-white/5 text-gray-300 hover:text-white"
                  }`}
                  onClick={() => hasDropdown ? toggleDropdown(item.name) : (item.action ? item.action() : navigate(item.path))}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Icon Container */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                      isDropdownOpen
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-white/10 backdrop-blur-sm"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isDropdownOpen ? "text-white scale-110" : "text-white"
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  {/* Text */}
                  <span
                    className={`ml-3 font-medium transition-all duration-300 ${
                      isCollapsed && !isMobile ? "hidden" : "block"
                    } ${
                      isDropdownOpen ? "text-white font-semibold" : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Dropdown Arrow */}
                  {hasDropdown && !isCollapsed && (
                    <FaChevronDown
                      className={`ml-auto text-xs transition-all duration-300 ${
                        isDropdownOpen ? "rotate-180 text-white" : "text-blue-300"
                      }`}
                    />
                  )}
                </div>

                {/* Dropdown Items - NO UNDERLINES */}
                {isDropdownOpen && hasDropdown && !isCollapsed && (
                  <div className="ml-12 mt-2 space-y-1.5 animate-fadeIn">
                    {item.dropdown.map((subItem, subIdx) => (
                      <div
                        key={subIdx}
                        className={`flex items-center py-2.5 px-4 rounded-lg transition-all duration-300 cursor-pointer ${
                          hoveredItem === subItem.name
                            ? `bg-gradient-to-r ${item.gradient} bg-opacity-20 text-white`
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => navigate(subItem.path)}
                        onMouseEnter={() => setHoveredItem(subItem.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Indicator Dot */}
                        <div
                          className={`w-2 h-2 rounded-full mr-3 transition-all duration-300 ${
                            hoveredItem === subItem.name
                              ? "bg-white"
                              : "bg-blue-400/50 group-hover:bg-blue-300"
                          }`}
                        />
                        
                        {/* Sub Item Content - NO UNDERLINE */}
                        <Link
                          to={subItem.path}
                          className={`flex-1 flex items-center font-medium transition-all duration-300 ${
                            "text-gray-400 hover:text-white"
                          }`}
                          style={{ textDecoration: "none" }}
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span>{subItem.name}</span>
                          <span className="ml-auto opacity-60">
                            {subItem.icon}
                          </span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-500/20">
          <div className="text-center">
            <small style={{ opacity: 0.6, fontSize: '0.75rem', color: '#93c5fd' }}>
              © 2025 Techsterker Admin Portal
            </small>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;