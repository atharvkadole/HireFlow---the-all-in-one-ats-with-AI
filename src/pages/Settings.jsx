import { useState, useEffect } from "react";
import { supabase } from "../main/supabase";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";

export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // State for Profile Info
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // State for Password
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Load existing user data into the form on mount
  useEffect(() => {
    if (user?.user_metadata) {
      setProfileForm({
        name: user.user_metadata.full_name || "",
        phone: user.user_metadata.phone_number || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.name,
          phone_number: profileForm.phone,
        },
      });

      if (error) throw error;

      dispatch(
        showSnackbar({ message: "Profile updated successfully!", type: "success" })
      );
    } catch (error) {
      dispatch(
        showSnackbar({ message: error.message || "Failed to update profile", type: "error" })
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      dispatch(showSnackbar({ message: "Passwords do not match!", type: "error" }));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      dispatch(showSnackbar({ message: "Password must be at least 6 characters.", type: "error" }));
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({ newPassword: "", confirmPassword: "" });
      dispatch(
        showSnackbar({ message: "Password updated successfully!", type: "success" })
      );
    } catch (error) {
      dispatch(
        showSnackbar({ message: error.message || "Failed to update password", type: "error" })
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      
      {/* Profile Details Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-sm text-gray-500 mb-6">Update your personal details here.</p>
        
        <div className="space-y-4 max-w-md">
          <div className="form-control">
            <label className="label text-sm font-medium text-gray-700">Email (Cannot be changed)</label>
            <input 
              type="text" 
              value={user?.email || ""} 
              disabled 
              className="border border-gray-300 p-2.5 rounded-lg bg-gray-50 text-gray-500 outline-none w-full"
            />
          </div>

          <div className="form-control">
            <label className="label text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              value={profileForm.name} 
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full transition"
            />
          </div>

          <div className="form-control">
            <label className="label text-sm font-medium text-gray-700">Phone Number</label>
            <input 
              type="tel" 
              value={profileForm.phone} 
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full transition"
            />
          </div>

          <button 
            onClick={handleProfileUpdate}
            disabled={updatingProfile}
            className="mt-4 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            {updatingProfile ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Change Password</h2>
        <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>
        
        <div className="space-y-4 max-w-md">
          <div className="form-control">
            <label className="label text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              value={passwordForm.newPassword} 
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full transition"
              placeholder="••••••••"
            />
          </div>

          <div className="form-control">
            <label className="label text-sm font-medium text-gray-700">Confirm New Password</label>
            <input 
              type="password" 
              value={passwordForm.confirmPassword} 
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            onClick={handlePasswordUpdate}
            disabled={updatingPassword}
            className="mt-4 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium"
          >
            {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

    </div>
  );
}