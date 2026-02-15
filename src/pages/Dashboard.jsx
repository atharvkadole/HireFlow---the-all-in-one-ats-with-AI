import { useState } from "react";
import { supabase } from "../main/supabase";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";
import ResumeUploader from "../components/ResumeUploader";

import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineMenuAlt2,
} from "react-icons/hi";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      dispatch(
        showSnackbar({
          message: error.message || "Logout failed",
          type: "error",
        })
      );
    } else {
      dispatch(
        showSnackbar({
          message: "Logged out",
          type: "success",
        })
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          {!collapsed && (
            <span className="text-white text-xl font-semibold">
              HireFlow
            </span>
          )}
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            <HiOutlineMenuAlt2 size={20} />
          </button>
        </div>

        <ul className="flex-1 p-3 space-y-2">
          <SidebarItem icon={<HiOutlineHome size={20} />} label="Dashboard" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineUsers size={20} />} label="Candidates" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineDocumentText size={20} />} label="JDs" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineCog size={20} />} label="Settings" collapsed={collapsed} active={active} setActive={setActive} />
        </ul>

        <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
          {!collapsed && "v1.0.0"}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white h-16 flex items-center justify-between px-8 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">{active}</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>

            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
              {user?.email?.[0]?.toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <ResumeUploader />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, collapsed, active, setActive }) {
  const isActive = active === label;

  return (
    <li>
      <button
        onClick={() => setActive(label)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? "bg-gray-800 text-white"
            : "hover:bg-gray-800 hover:text-white"
        }`}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </button>
    </li>
  );
}
