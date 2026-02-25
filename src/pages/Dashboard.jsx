// import { useState } from "react";
// import { supabase } from "../main/supabase";
// import { useDispatch, useSelector } from "react-redux";
// import { showSnackbar } from "../slice/uiSlice";
// import ResumeUploader from "../components/ResumeUploader";
// import Candidates from "../pages/Candidates";
// import JDs from "../pages/JDs"; // <-- Added the import for the JDs component
// import JDUploader from "../components/JDUploader";

// import {
//   HiOutlineHome,
//   HiOutlineUsers,
//   HiOutlineDocumentText,
//   HiOutlineCog,
//   HiOutlineMenuAlt2,
// } from "react-icons/hi";

// export default function Dashboard() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [active, setActive] = useState("Dashboard");

//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth.user);

//   const logout = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       dispatch(
//         showSnackbar({
//           message: error.message || "Logout failed",
//           type: "error",
//         })
//       );
//     } else {
//       dispatch(
//         showSnackbar({
//           message: "Logged out",
//           type: "success",
//         })
//       );
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div
//         className={`bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ${
//           collapsed ? "w-20" : "w-64"
//         }`}
//       >
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
//           {!collapsed && (
//             <span className="text-white text-xl font-semibold">
//               HireFlow
//             </span>
//           )}
//           <button
//             className="text-gray-400 hover:text-white"
//             onClick={() => setCollapsed(!collapsed)}
//           >
//             <HiOutlineMenuAlt2 size={20} />
//           </button>
//         </div>

//         <ul className="flex-1 p-3 space-y-2">
//           <SidebarItem icon={<HiOutlineHome size={20} />} label="Dashboard" collapsed={collapsed} active={active} setActive={setActive} />
//           <SidebarItem icon={<HiOutlineUsers size={20} />} label="Candidates" collapsed={collapsed} active={active} setActive={setActive} />
//           <SidebarItem icon={<HiOutlineDocumentText size={20} />} label="JDs" collapsed={collapsed} active={active} setActive={setActive} />
//           <SidebarItem icon={<HiOutlineCog size={20} />} label="Settings" collapsed={collapsed} active={active} setActive={setActive} />
//         </ul>

//         <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
//           {!collapsed && "v1.0.0"}
//         </div>
//       </div>

//       {/* Main */}
//       <div className="flex-1 flex flex-col h-screen overflow-hidden">
//         {/* Header */}
//         <div className="bg-white h-16 shrink-0 flex items-center justify-between px-8 border-b border-gray-200">
//           <h1 className="text-xl font-semibold text-gray-800">{active}</h1>

//           <div className="flex items-center gap-4">
//             <span className="text-sm text-gray-600">{user?.email}</span>

//             <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
//               {user?.email?.[0]?.toUpperCase()}
//             </div>

//             <button
//               onClick={logout}
//               className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         {/* Added overflow-y-auto here so only the content scrolls, not the sidebar */}
//         <div className="p-10 flex-1 overflow-y-auto">
          
//           {active === "Dashboard" && (
//             <ResumeUploader />
//           )}

//           {active === "Candidates" && (
//             <Candidates />
//           )}

//           {/* Replaced the "coming soon" placeholder with the actual JDs component */}
//           {active === "JDs" && (
//             <JDs /> 
//           )}

//           {active === "Settings" && (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               <p className="text-lg">Settings module coming soon...</p>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }

// function SidebarItem({ icon, label, collapsed, active, setActive }) {
//   const isActive = active === label;

//   return (
//     <li>
//       <button
//         onClick={() => setActive(label)}
//         className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
//           isActive
//             ? "bg-gray-800 text-white"
//             : "hover:bg-gray-800 hover:text-white"
//         }`}
//       >
//         {icon}
//         {!collapsed && <span>{label}</span>}
//       </button>
//     </li>
//   );
// }

import { useState } from "react";
import { supabase } from "../main/supabase";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";

// Components
import Analytics from "../components/Analytics";       // <-- NEW
import ResumeUploader from "../components/ResumeUploader";
import JDUploader from "../components/JDUploader";     // <-- NEW
import Candidates from "../pages/Candidates";
import JDs from "../pages/JDs"; 

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
      dispatch(showSnackbar({ message: error.message || "Logout failed", type: "error" }));
    } else {
      dispatch(showSnackbar({ message: "Logged out", type: "success" }));
    }
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
          <SidebarItem icon={<HiOutlineHome size={20} />} label="Dashboard" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineUsers size={20} />} label="Candidates" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineDocumentText size={20} />} label="JDs" collapsed={collapsed} active={active} setActive={setActive} />
          <SidebarItem icon={<HiOutlineCog size={20} />} label="Settings" collapsed={collapsed} active={active} setActive={setActive} />
        </ul>

        <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
          {!collapsed && "Made by Atharv Kadole"}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <div className="bg-white h-16 shrink-0 flex items-center justify-between px-8 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">{active}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">{user?.email}</span>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="px-4 py-1.5 text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-md transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8 md:p-10 flex-1 overflow-y-auto">
          
          {/* THE NEW DASHBOARD LAYOUT */}
          {active === "Dashboard" && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              
              {/* Top Row: Analytics */}
              <Analytics />

              {/* Bottom Row: Uploaders Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Wrap Uploaders in a container to give them context if needed, though they have their own headers */}
                <div className="h-full">
                  <ResumeUploader />
                </div>
                
                <div className="h-full">
                  <JDUploader />
                </div>

              </div>
            </div>
          )}

          {active === "Candidates" && (
            <div className="animate-fade-in"><Candidates /></div>
          )}

          {active === "JDs" && (
            <div className="animate-fade-in"><JDs /></div>
          )}

          {active === "Settings" && (
            <div className="flex items-center justify-center h-64 text-gray-400 animate-fade-in">
              <p className="text-lg">Settings module coming soon...</p>
            </div>
          )}

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
            ? "bg-indigo-600 text-white shadow-md"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span className={`${isActive ? "text-white" : ""}`}>{icon}</span>
        {!collapsed && <span className="font-medium">{label}</span>}
      </button>
    </li>
  );
}