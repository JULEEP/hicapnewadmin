import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const navigate = useNavigate();

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (confirmLogout) {
      // Clear all authentication related data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("authToken");

      // Clear any axios default headers if set
      delete axios.defaults.headers.common['Authorization'];

      // Navigate to home page
      navigate("/", { replace: true });

      // Optional: Force reload to reset application state
      window.location.reload();
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "Get All Users", path: "/users" },
        { name: "Create User", path: "/createuser" },
      ],
    },
    {
      icon: <i className="ri-book-open-fill text-white"></i>,
      name: "Attendance", // Section name
      dropdown: [
        { name: "All Attendance", path: "/attendancelist" }, // This path will lead to the attendance list page
      ],
    },
    {
      icon: <i className="ri-book-open-fill text-white"></i>,
      name: "Courses",
      dropdown: [
        { name: "Create Course", path: "/create-course" },
        { name: "Get All Courses", path: "/courselist" },
      ],
    },
    {
      icon: <i className="ri-book-open-fill text-white"></i>,
      name: "Course Module",
      dropdown: [
        { name: "Create Course Module", path: "/course-modules/create" },
        { name: "All Courses Modules", path: "/course-modules" },
      ],
    },
    {
      icon: <i className="ri-archive-fill text-white"></i>,
      name: "Enrollments",
      dropdown: [
        { name: "Get All Enrollments", path: "/allenrollments" },
        { name: "Create Enrollment", path: "/create-enrollment" },
      ],
    },
    {
      icon: <i className="ri-user-star-fill text-white"></i>,
      name: "Mentors",
      dropdown: [
        { name: "Register Mentor", path: "/creatementor" },
        { name: "All Mentors", path: "/mentorlist" },
        { name: "Add Enroll to Mentor", path: "/addmentortoenrollered" },
        { name: "Mentors with batches", path: "/mentorswithbatches" },
      ],
    },
    {
      icon: <i className="ri-file-text-fill text-white"></i>, // Using a file/invoice icon
      name: "Invoices",
      dropdown: [
        { name: "Generate Invoice", path: "/generateinvoice" },
        { name: "All Invoices", path: "/invoicelist" },
      ],
    },
    {
      icon: <i className="ri-phone-fill text-white"></i>, // Using a phone icon
      name: "Contacts",
      dropdown: [
        { name: "User ContactsList", path: "/usercontactformlist" },
      ],
    },
    {
      icon: <i className="ri-layout-fill text-white"></i>,
      name: "Classes",
      dropdown: [
        { name: "Create Live Class", path: "/createliveclass" },
        { name: "Get All LiceClasses", path: "/liveclasses" },
      ],
    },
    {
      icon: <i className="ri-questionnaire-fill text-white"></i>,
      name: "Interviews",
      dropdown: [
        { name: "Schedule Interview", path: "/add-interview" },
        { name: "Get All Interviews", path: "/interviewlist" },
      ],
    },
   {
      icon: <i className="ri-file-text-fill text-white"></i>, // Using a file/invoice icon
  name: "Certificates",
  dropdown: [
    { name: "Issue Certificate", path: "/add-certificate" }, // Path to the page where certificates can be issued
    { name: "View Certificates", path: "/certificate-list" }, // Path to view the list of issued certificates
  ],
},
    {
      icon: <i className="ri-money-dollar-box-fill text-white"></i>,
      name: "Payments",
      dropdown: [
        { name: "Get All Payments", path: "/paymentlist" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } h-screen overflow-y-scroll no-scrollbar flex flex-col bg-blue-800`}
    >
      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl">
        <span>Admin Dashboard</span>
      </div>
      <div className="border-b-4 border-gray-800 my-2"></div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white space-y-1">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-medium cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div
                className="flex items-center py-3 px-4 font-semibold text-sm text-white mx-4 rounded-lg hover:bg-gray-700 hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action || (() => navigate(item.path))}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;