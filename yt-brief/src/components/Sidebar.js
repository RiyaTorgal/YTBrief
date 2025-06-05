import { MdDashboard } from "react-icons/md";
import { FaFolder, FaCog } from "react-icons/fa";

const Sidebar = ({ activeItem, onItemClick }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { id: 'files', label: 'Files', icon: <FaFolder /> },
    { id: 'settings', label: 'Account/Settings', icon: <FaCog /> }
  ];

  return (
    <div className="w-64 h-screen sidebar_tone border-r border-gray-200 flex flex-col">
      {/* Logo/Profile Section */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-center w-full">
        {/* <div className="logo-placeholder2"></div> */}
        <a href="/">
          <img src="/YTBrief_Logo.png" alt="YTBrief Logo" className="logo-placeholder2" />
        </a>
      </div>
      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center px-6 py-3 justify-center transition-colors duration-200
              ${activeItem === item.id 
                ? 'menu_clr' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <footer className="text-left text-sm text-gray-500 mt-28 mb-6 m-4">
          ©2025 YTBrief All Right Reserved
      </footer>
    </div>
  );
};

export default Sidebar;