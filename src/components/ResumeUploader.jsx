import { useState } from "react";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../slice/uiSlice";
import sendPdf from "../finctions/uploadresume";

export default function ResumeUploader() {
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      dispatch(
        showSnackbar({
          message: "Please upload a PDF file",
          type: "error",
        })
      );
      return;
    }

    try {
      setUploading(true);

      dispatch(
        showSnackbar({
          message: "Uploading resume...",
          type: "info",
        })
      );

      await sendPdf(file);
      setFileError("");

      dispatch(
        showSnackbar({
          message: "Resume uploaded successfully!",
          type: "success",
        })
      );
    } catch (err) {
      setFileError(err.message || "Upload failed");
      dispatch(
        showSnackbar({
          message: err.message || "Upload failed",
          type: "error",
        })
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-xl">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">
        Upload Resume
      </h3>

      <input
        type="file"
        accept="application/pdf"
        disabled={uploading}
        className="file-input file-input-bordered w-full"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleUpload(file);
          e.target.value = "";
        }}
      />
      {fileError && (
        <p className="mt-2 text-sm text-error">{fileError}</p>
      )}
    </div>
  );
}
