import { useState } from "react";
import { supabase } from "../main/supabase";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignup = async () => {
    const emptyErrors = { email: "", password: "", form: "" };
    setErrors(emptyErrors);

    const validation = signupSchema.safeParse(form);

    if (!validation.success) {
      const nextErrors = { ...emptyErrors };
      for (const issue of validation.error.errors) {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      dispatch(
        showSnackbar({
          message: validation.error.errors[0].message,
          type: "error",
        })
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrors({
          ...emptyErrors,
          form: error.message || "Signup failed",
        });
        dispatch(
          showSnackbar({
            message: error.message || "Signup failed",
            type: "error",
          })
        );
        return;
      }

      setErrors(emptyErrors);
      dispatch(
        showSnackbar({
          message: "Signup successful! Check your email to confirm.",
          type: "success",
        })
      );
    } catch (err) {
      setErrors({
        ...emptyErrors,
        form: err.message || "Signup failed",
      });
      dispatch(
        showSnackbar({
          message: err.message || "Signup failed",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl">Create Account</h2>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="input input-bordered"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
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
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password}</p>
            )}
          </div>

          <div className="form-control mt-4">
            <button
              onClick={handleSignup}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Signup"}
            </button>
            {errors.form && (
              <p className="mt-2 text-sm text-error">{errors.form}</p>
            )}
          </div>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
