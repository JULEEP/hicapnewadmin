import { useState, useEffect } from "react";
import {
  FiUsers,
  FiBook,
  FiUserCheck,
  FiDollarSign,
  FiGrid,
  FiPlusCircle,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiStar,
  FiVideo,
  FiAward,
  FiTrendingDown,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiCheckCircle,
  FiSun,
  FiCoffee,
  FiMoon
} from "react-icons/fi";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("weekly");
  const [enrollmentFilter, setEnrollmentFilter] = useState("weekly");
  const [courseFilter, setCourseFilter] = useState("weekly");
  const [topCoursesFilter, setTopCoursesFilter] = useState("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMentorPage, setCurrentMentorPage] = useState(1);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  const studentsPerPage = 5;
  const mentorsPerPage = 5;

  // Time and greeting update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  // Get greeting icon
  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <FiSun className="text-2xl text-yellow-500" />;
    if (hour < 17) return <FiCoffee className="text-2xl text-orange-500" />;
    return <FiMoon className="text-2xl text-indigo-500" />;
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // API integration
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.techsterker.com/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mock chart data
  const getMockChartData = (filter) => {
    const baseData = [
      { name: 'Mon', revenue: 4200, enrolled: 24, active: 150 },
      { name: 'Tue', revenue: 3800, enrolled: 18, active: 145 },
      { name: 'Wed', revenue: 2500, enrolled: 12, active: 130 },
      { name: 'Thu', revenue: 3780, enrolled: 20, active: 160 },
      { name: 'Fri', revenue: 2890, enrolled: 15, active: 140 },
      { name: 'Sat', revenue: 3390, enrolled: 17, active: 135 },
      { name: 'Sun', revenue: 4290, enrolled: 22, active: 170 },
    ];

    if (filter === 'today') {
      return [{ name: 'Today', revenue: 1800, enrolled: 8, active: 85 }];
    } else if (filter === 'monthly') {
      return [
        { name: 'Week 1', revenue: 15000, enrolled: 80, active: 450 },
        { name: 'Week 2', revenue: 18000, enrolled: 95, active: 520 },
        { name: 'Week 3', revenue: 22000, enrolled: 110, active: 580 },
        { name: 'Week 4', revenue: 25000, enrolled: 130, active: 620 },
      ];
    }
    return baseData;
  };

  // Mock course data
  const getMockCourseData = (filter) => {
    return [
      { name: 'JavaScript', enrolled: 45, revenue: 45000, completion: 85 },
      { name: 'React', enrolled: 38, revenue: 38000, completion: 78 },
      { name: 'Node.js', enrolled: 32, revenue: 32000, completion: 82 },
      { name: 'Python', enrolled: 28, revenue: 28000, completion: 75 },
      { name: 'Data Science', enrolled: 25, revenue: 25000, completion: 70 },
      { name: 'Machine Learning', enrolled: 22, revenue: 22000, completion: 68 },
    ];
  };

  // Pie chart data
  const pieData = [
    { name: 'Active', value: 65, color: '#3b82f6' },
    { name: 'Inactive', value: 25, color: '#9ca3af' },
    { name: 'Completed', value: 10, color: '#10b981' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-blue-600 font-semibold">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-gray-500 text-4xl mb-4">📊</div>
          <div className="text-xl text-gray-600 mb-4">No data available</div>
        </div>
      </div>
    );
  }

  // Pagination logic for students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = dashboardData.tables?.studentInsightsData?.slice(indexOfFirstStudent, indexOfLastStudent) || [];
  const totalPages = Math.ceil((dashboardData.tables?.studentInsightsData?.length || 0) / studentsPerPage);

  // Pagination logic for mentors
  const indexOfLastMentor = currentMentorPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = dashboardData.tables?.mentorInsightsData?.slice(indexOfFirstMentor, indexOfLastMentor) || [];
  const totalMentorPages = Math.ceil((dashboardData.tables?.mentorInsightsData?.length || 0) / mentorsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* Header with Greeting Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left side - Title */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage your platform performance</p>
        </div>

        {/* Right side - Greeting & Time Card */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                {getGreetingIcon()}
                <span className="text-xl font-bold ml-3">{getGreeting()}!</span>
              </div>
              <p className="text-3xl font-bold mb-1">{formatTime(currentTime)}</p>
              <p className="text-sm opacity-90">{formatDate(currentTime)}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <FiCalendar className="text-2xl" />
              </div>
              <div className="mt-2 text-xs opacity-80">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <div className="font-bold">{currentTime.getDate()}</div>
                <div className="opacity-80">Day</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{currentTime.getMonth() + 1}</div>
                <div className="opacity-80">Month</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{currentTime.getFullYear()}</div>
                <div className="opacity-80">Year</div>
              </div>
              <div className="text-center">
                <div className="font-bold">
                  {currentTime.getHours() < 12 ? 'AM' : 'PM'}
                </div>
                <div className="opacity-80">Shift</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={FiUsers} 
          label="Total Students" 
          value={dashboardData.totals?.students || 0} 
          color="blue" 
          trend="up"
          percentage="12%"
        />
        <StatCard 
          icon={FiBook} 
          label="Total Courses" 
          value={dashboardData.totals?.courses || 0} 
          color="green" 
          trend="up"
          percentage="8%"
        />
        <StatCard 
          icon={FiUserCheck} 
          label="Total Mentors" 
          value={dashboardData.totals?.mentors || 0} 
          color="purple" 
          trend="up"
          percentage="15%"
        />
        <StatCard 
          icon={FiGrid} 
          label="Total Categories" 
          value={dashboardData.totals?.categories || 0} 
          color="yellow" 
          trend="stable"
        />
      </div>

      {/* Today's Stats with Glass Effect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Enrollments</p>
              <p className="text-2xl font-bold mt-1">{dashboardData.todayStats?.todaysEnrollments || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiPlusCircle className="text-2xl" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <FiArrowUp className="mr-1" />
            <span>24% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed Courses</p>
              <p className="text-2xl font-bold mt-1">{dashboardData.todayStats?.completedCoursesToday || 0}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiCheckCircle className="text-2xl" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <FiArrowUp className="mr-1" />
            <span>18% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Revenue from Courses</p>
              <p className="text-2xl font-bold mt-1">₹{(dashboardData.todayStats?.revenueToday || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiDollarSign className="text-2xl" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <FiArrowUp className="mr-1" />
            <span>32% from yesterday</span>
          </div>
        </div>
      </div>

      {/* Rest of the code remains the same */}
      {/* Active Students Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard2 
          icon={FiClock} 
          label="Daily Active Students" 
          value={dashboardData.activeStudents?.daily || 0} 
          color="blue" 
          subtitle="Last 24 hours"
        />
        <StatCard2 
          icon={FiTrendingUp} 
          label="Weekly Active Students" 
          value={dashboardData.activeStudents?.weekly || 0} 
          color="green" 
          subtitle="Last 7 days"
        />
        <StatCard2 
          icon={FiCalendar} 
          label="Monthly Active Students" 
          value={dashboardData.activeStudents?.monthly || 0} 
          color="purple" 
          subtitle="Last 30 days"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Revenue Overview</h3>
              <p className="text-gray-600 text-sm">Track your revenue performance</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getMockChartData(revenueFilter)}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Trends Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Enrollment Trends</h3>
              <p className="text-gray-600 text-sm">Monitor course enrollments</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={enrollmentFilter}
              onChange={(e) => setEnrollmentFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMockChartData(enrollmentFilter)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: 'white' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Enrollment by Course */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Course Performance</h3>
              <p className="text-gray-600 text-sm">Top courses by enrollment</p>
            </div>
            <select
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getMockCourseData(courseFilter)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar
                  dataKey="enrolled"
                  name="Students Enrolled"
                  fill="#8884d8"
                  radius={[8, 8, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Student Status</h3>
              <p className="text-gray-600 text-sm">Distribution overview</p>
            </div>
            <FiEye className="text-gray-400" />
          </div>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Activity Insights Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Student Activity Insights</h3>
            <p className="text-gray-600">Detailed view of student activities</p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300">
            Export Report
          </button>
        </div>
        
        {currentStudents.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Mobile</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Account Created</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentStudents.map((student, idx) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-gray-700">{student.email}</td>
                      <td className="px-6 py-4 text-gray-700">{student.mobile}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDateString(student.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, dashboardData.tables?.studentInsightsData?.length || 0)} of {dashboardData.tables?.studentInsightsData?.length || 0} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${currentPage === pageNumber ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"} transition-colors`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">No student data available</p>
          </div>
        )}
      </div>

      {/* Mentor Insights Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Mentor Insights</h3>
            <p className="text-gray-600">Expert mentors and their performance</p>
          </div>
          <button 
            onClick={() => navigate("/mentorlist")}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
          >
            View All Mentors
          </button>
        </div>
        
        {currentMentors.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Expertise</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentMentors.map((mentor, idx) => (
                    <tr key={mentor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{mentor.expertise}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDateString(mentor.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FiStar className="text-yellow-500 mr-1" />
                          <span className="font-medium">4.8</span>
                          <span className="text-gray-500 text-xs ml-1">/5.0</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalMentorPages > 1 && (
              <div className="flex justify-end mt-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentMentorPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentMentorPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalMentorPages, 3) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentMentorPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${currentMentorPage === pageNumber ? "bg-purple-600 text-white" : "border border-gray-300 hover:bg-gray-50"} transition-colors`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentMentorPage(prev => Math.min(prev + 1, totalMentorPages))}
                    disabled={currentMentorPage === totalMentorPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">👨‍🏫</div>
            <p className="text-gray-500 text-lg">No mentor data available</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 to-gray-900 rounded-2xl shadow-xl p-6 mb-6 text-white">
        <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/create-course")}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 hover:bg-white/20 transition-all duration-300 flex flex-col items-center"
          >
            <FiPlusCircle className="text-2xl mb-2" />
            <span className="font-medium">Create Course</span>
          </button>
          <button
            onClick={() => navigate("/mentorlist")}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 hover:bg-white/20 transition-all duration-300 flex flex-col items-center"
          >
            <FiUserCheck className="text-2xl mb-2" />
            <span className="font-medium">Manage Mentors</span>
          </button>
          <button
            onClick={() => navigate("/course-modules")}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 hover:bg-white/20 transition-all duration-300 flex flex-col items-center"
          >
            <FiBook className="text-2xl mb-2" />
            <span className="font-medium">Course Module</span>
          </button>
          <button
            onClick={() => navigate("/courselist")}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 hover:bg-white/20 transition-all duration-300 flex flex-col items-center"
          >
            <FiEye className="text-2xl mb-2" />
            <span className="font-medium">View Courses</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mb-4">
        <p>Dashboard updated: {currentTime.toLocaleString()}</p>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend, percentage }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-400",
    green: "from-emerald-500 to-teal-400",
    purple: "from-purple-500 to-pink-400",
    yellow: "from-amber-500 to-yellow-400",
    orange: "from-orange-500 to-red-400",
    red: "from-red-500 to-rose-400",
    emerald: "from-emerald-600 to-green-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md`}>
          <Icon className="text-xl text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3">
          {trend === 'up' ? (
            <FiArrowUp className="text-green-500 mr-1" />
          ) : trend === 'down' ? (
            <FiArrowDown className="text-red-500 mr-1" />
          ) : null}
          {percentage && (
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {percentage} {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Second Stat Card Component
const StatCard2 = ({ icon: Icon, label, value, color, subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${colorClasses[color]} mr-4`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <p className="text-gray-800 font-bold text-xl">{value}</p>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;