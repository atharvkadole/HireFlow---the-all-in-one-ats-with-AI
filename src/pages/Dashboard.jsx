import { useState } from "react";
import { supabase } from "../main/supabase";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"; // <-- Import Router hooks

import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineMenuAlt2,
} from "react-icons/hi";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // Gets the current URL path
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      dispatch(showSnackbar({ message: error.message || "Logout failed", type: "error" }));
    } else {
      dispatch(showSnackbar({ message: "Logged out", type: "success" }));
      navigate("/login"); // Redirect to login after logout
    }
  };

  // Helper function to dynamically set the header title based on the URL
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes("/candidates")) return "Candidates";
    if (path.includes("/jds")) return "Job Descriptions";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"} shrink-0`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          {!collapsed && <span className="text-white text-xl font-semibold">HireFlow</span>}
          <button className="text-gray-400 hover:text-white" onClick={() => setCollapsed(!collapsed)}>
            <HiOutlineMenuAlt2 size={20} />
          </button>
        </div>

        <ul className="flex-1 p-3 space-y-2">
          {/* Using NavLink and defining the path */}
          <SidebarItem icon={<HiOutlineHome size={20} />} label="Dashboard" path="/" collapsed={collapsed} />
          <SidebarItem icon={<HiOutlineUsers size={20} />} label="Candidates" path="/candidates" collapsed={collapsed} />
          <SidebarItem icon={<HiOutlineDocumentText size={20} />} label="JDs" path="/jds" collapsed={collapsed} />
          <SidebarItem icon={<HiOutlineCog size={20} />} label="Settings" path="/settings" collapsed={collapsed} />
        </ul>

        <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
          {!collapsed && "Made by Atharv Kadole"}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <div className="bg-white h-16 shrink-0 flex items-center justify-between px-8 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
               {user?.user_metadata?.full_name 
                ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                : user?.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-md transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Content Area - Outlet renders the child routes here! */}
        <div className="p-8 md:p-10 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// Updated SidebarItem to use NavLink
function SidebarItem({ icon, label, path, collapsed }) {
  return (
    <li>
      {/* NavLink automatically provides an 'isActive' boolean we can use for styling */}
      <NavLink
        to={path}
        end={path === "/"} // Ensure exact match for the home route
        className={({ isActive }) =>
          `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`${isActive ? "text-white" : ""}`}>{icon}</span>
            {!collapsed && <span className="font-medium">{label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
}