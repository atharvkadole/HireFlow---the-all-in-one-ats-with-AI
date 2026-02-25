import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logoutUser } from "../slice/auth";
import { supabase } from "./supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GlobalSnackbar from "../components/GlobalSnackbar";

// Auth Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";

// Dashboard Layout & Nested Pages
import Dashboard from "../pages/Dashboard";
import DashboardHome from "../pages/DashboardHome"; 
import Candidates from "../pages/Candidates";
import JDs from "../pages/JDs";
import Settings from "../pages/Settings";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          dispatch(setUser(session.user));
        } else {
          dispatch(logoutUser());
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* Protected Dashboard Route (Layout) 
          If the user is logged in, render the Dashboard layout. Inside that layout, 
          React Router will render the specific child route (like Candidates) in the <Outlet />.
        */}
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        >
          {/* Default view when navigating to "/" */}
          <Route index element={<DashboardHome />} />
          
          {/* Nested routes mapped to the sidebar */}
          <Route path="candidates" element={<Candidates />} />
          <Route path="jds" element={<JDs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" />}
        />

        {/* Fallback route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
      <GlobalSnackbar />
    </BrowserRouter>
  );
}

export default App;