import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { FaUserCog } from "react-icons/fa";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-blue-900 text-white sticky top-0 w-full h-20 px-6 flex items-center shadow-xl z-50 border-b border-blue-500/30">
      {/* Sidebar toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-white" />
        ) : (
          <RiMenu3Line className="text-2xl text-white" />
        )}
      </button>

      {/* Admin Text on Left */}
      <div className="ml-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
          <FaUserCog className="text-lg text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Admin Panel
          </span>
          <p className="text-xs text-blue-300 mt-0.5">Control Dashboard</p>
        </div>
      </div>

      {/* Spacer to push logo to right */}
      <div className="flex-grow"></div>

      {/* Logo on the right side */}
      <div className="flex items-center gap-3 pr-6">
        <div className="text-right">
          <span className="text-sm font-medium text-blue-300">Welcome</span>
          <p className="text-white font-semibold">Administrator</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center p-2 border border-blue-500/30">
          <img
            src="/logo.png"
            alt="Vendor Logo"
            className="w-full h-auto"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;