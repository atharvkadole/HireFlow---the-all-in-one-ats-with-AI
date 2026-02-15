import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideSnackbar } from "../slice/uiSlice";

export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const { isOpen, message, type } = useSelector((state) => state.ui);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideSnackbar());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="toast toast-bottom toast-end z-50">
      <div
        className={`alert shadow-lg ${
          type === "success"
            ? "alert-success"
            : type === "error"
            ? "alert-error"
            : type === "warning"
            ? "alert-warning"
            : "alert-info"
        }`}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}