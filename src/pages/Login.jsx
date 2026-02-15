import { useState } from "react";
import { supabase } from "../main/supabase";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    const nextErrors = {
      email: "",
      password: "",
      form: "",
    };

    if (!email) {
      nextErrors.email = "Email is required";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      dispatch(
        showSnackbar({
          message: "Email and password are required",
          type: "error",
        })
      );
      return;
    }

    setErrors(nextErrors);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrors({
        ...nextErrors,
        form: error.message || "Login failed",
      });
      dispatch(
        showSnackbar({
          message: error.message || "Login failed",
          type: "error",
        })
      );
      return;
    }

    setErrors({
      email: "",
      password: "",
      form: "",
    });
    dispatch(
      showSnackbar({
        message: "Welcome back!",
        type: "success",
      })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl">Login</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email}</p>
            )}
          </div>

          <div className="form-control mt-2">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password}</p>
            )}
          </div>

          <div className="form-control mt-4">
            <button
              onClick={handleLogin}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
            {errors.form && (
              <p className="mt-2 text-sm text-error">{errors.form}</p>
            )}
          </div>

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="link link-primary">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
