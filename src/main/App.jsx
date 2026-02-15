import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logoutUser } from "../slice/auth";
import { supabase } from "./supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GlobalSnackbar from "../components/GlobalSnackbar";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";

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
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/" />}
        />
      </Routes>
      <GlobalSnackbar />
    </BrowserRouter>
  );
}

export default App;
