// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { showSnackbar } from "../slice/uiSlice";
// import sendPdf from "../finctions/uploadresume";

// export default function ResumeUploader() {
//   const [uploading, setUploading] = useState(false);
//   const [fileError, setFileError] = useState("");
//   const dispatch = useDispatch();

//   const handleUpload = async (file) => {
//     setFileError("");
//     if (!file) return;
//     if (file.type !== "application/pdf") {
//       setFileError("Please upload a PDF file");
//       dispatch(
//         showSnackbar({
//           message: "Please upload a PDF file",
//           type: "error",
//         })
//       );
//       return;
//     }

//     try {
//       setUploading(true);

//       dispatch(
//         showSnackbar({
//           message: "Uploading resume...",
//           type: "info",
//         })
//       );

//       await sendPdf(file);
//       setFileError("");

//       dispatch(
//         showSnackbar({
//           message: "Resume uploaded successfully!",
//           type: "success",
//         })
//       );
//     } catch (err) {
//       setFileError(err.message || "Upload failed");
//       dispatch(
//         showSnackbar({
//           message: err.message || "Upload failed",
//           type: "error",
//         })
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-8 max-w-xl">
//       <h3 className="text-lg font-semibold mb-6 text-gray-800">
//         Upload Resume
//       </h3>

//       <input
//         type="file"
//         accept="application/pdf"
//         disabled={uploading}
//         className="file-input file-input-bordered w-full"
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           handleUpload(file);
//           e.target.value = "";
//         }}
//       />
//       {fileError && (
//         <p className="mt-2 text-sm text-error">{fileError}</p>
//       )}
//     </div>
//   );
// }


import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentAdd,
  HiOutlineExclamationCircle,
  HiOutlineUpload,
} from "react-icons/hi";
import { showSnackbar } from "../slice/uiSlice";
import sendPdf, {
  MAX_BULK_RESUME_FILES,
  sendBulkPdfs,
} from "../finctions/uploadresume";

const isPdfFile = (file) =>
  file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");

const numberOrFallback = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getBulkResultFileName = (result, fallbackFile, index) =>
  result?.data?.file_name ||
  result?.data?.original_filename ||
  result?.fileName ||
  result?.file_name ||
  result?.original_filename ||
  fallbackFile?.name ||
  `Resume ${index + 1}`;

const resultFailed = (result) =>
  result?.success === false ||
  result?.data?.processing_status === "failed" ||
  Boolean(result?.error);

const getResultMessage = (result) =>
  result?.message ||
  result?.error ||
  result?.data?.error ||
  (resultFailed(result) ? "Failed to process" : "Processed successfully");

const normalizeBulkSummary = (payload, files) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      success: true,
      message: "Bulk resume processing completed",
      total: files.length,
      successful: files.length,
      failed: 0,
      results: files.map((file, index) => ({
        success: true,
        message: "Processed successfully",
        fileName: getBulkResultFileName(null, file, index),
      })),
    };
  }

  const results = Array.isArray(payload.results) ? payload.results : [];
  const inferredFailed = results.filter(resultFailed).length;
  const total = numberOrFallback(payload.total, results.length || files.length);
  const failed = numberOrFallback(
    payload.failed,
    payload.success === false && inferredFailed === 0 ? total : inferredFailed
  );
  const successful = numberOrFallback(payload.successful, Math.max(total - failed, 0));

  return {
    success: payload.success ?? failed === 0,
    message: payload.message || "Bulk resume processing completed",
    total,
    successful,
    failed,
    results,
  };
};

const buildBulkSnackbarMessage = (summary) => {
  if (summary.failed > 0) {
    return `${summary.successful} of ${summary.total} resumes uploaded. ${summary.failed} failed.`;
  }

  return `${summary.successful} resumes uploaded successfully.`;
};

export default function ResumeUploader() {
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [singleError, setSingleError] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSummary, setBulkSummary] = useState(null);
  const bulkInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleUpload = async (file) => {
    setSingleError("");
    if (!file) return;
    if (!isPdfFile(file)) {
      setSingleError("Please upload a PDF file");
      dispatch(showSnackbar({ message: "Please upload a PDF file", type: "error" }));
      return;
    }

    try {
      setUploading(true);
      dispatch(showSnackbar({ message: "Uploading resume...", type: "info" }));

      await sendPdf(file);
      setSingleError("");

      dispatch(showSnackbar({ message: "Resume uploaded successfully!", type: "success" }));
    } catch (err) {
      setSingleError(err.message || "Upload failed");
      dispatch(showSnackbar({ message: err.message || "Upload failed", type: "error" }));
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async (fileList) => {
    const files = Array.from(fileList || []);

    setBulkError("");
    setBulkSummary(null);

    if (files.length === 0) return;

    if (files.length > MAX_BULK_RESUME_FILES) {
      const message = `Select up to ${MAX_BULK_RESUME_FILES} resumes at a time`;
      setBulkError(message);
      dispatch(showSnackbar({ message, type: "error" }));
      return;
    }

    const invalidFile = files.find((file) => !isPdfFile(file));
    if (invalidFile) {
      const message = `${invalidFile.name || "One selected file"} is not a PDF`;
      setBulkError(message);
      dispatch(showSnackbar({ message, type: "error" }));
      return;
    }

    try {
      setBulkUploading(true);
      dispatch(
        showSnackbar({
          message: `Uploading ${files.length} resume${files.length === 1 ? "" : "s"}...`,
          type: "info",
        })
      );

      const payload = await sendBulkPdfs(files);
      const summary = normalizeBulkSummary(payload, files);

      setBulkSummary(summary);

      dispatch(
        showSnackbar({
          message: buildBulkSnackbarMessage(summary),
          type: summary.failed > 0 ? "warning" : "success",
        })
      );
    } catch (err) {
      const message = err.message || "Bulk upload failed";
      setBulkError(message);
      dispatch(showSnackbar({ message, type: "error" }));
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full flex flex-col justify-center">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">Upload Candidate Resume</h3>
        <p className="text-sm text-gray-500">Parse a new candidate profile into your talent pool.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">Single resume</label>
          <input
            type="file"
            accept="application/pdf"
            disabled={uploading || bulkUploading}
            className="file-input file-input-bordered w-full mt-2"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleUpload(file);
              e.target.value = "";
            }}
          />
          {singleError && <p className="mt-2 text-sm text-red-500 font-medium">{singleError}</p>}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Bulk upload</p>
              <p className="text-xs text-gray-500">
                Upload up to {MAX_BULK_RESUME_FILES} PDF resumes in one request.
              </p>
            </div>

            <button
              type="button"
              disabled={uploading || bulkUploading}
              onClick={() => bulkInputRef.current?.click()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkUploading ? (
                <HiOutlineUpload className="h-5 w-5 animate-pulse" />
              ) : (
                <HiOutlineDocumentAdd className="h-5 w-5" />
              )}
              {bulkUploading ? "Uploading..." : "Bulk Upload Resumes"}
            </button>
          </div>

          <input
            ref={bulkInputRef}
            type="file"
            accept="application/pdf"
            multiple
            disabled={uploading || bulkUploading}
            className="hidden"
            onChange={(e) => {
              handleBulkUpload(e.target.files);
              e.target.value = "";
            }}
          />

          {bulkError && <p className="mt-2 text-sm text-red-500 font-medium">{bulkError}</p>}

          {bulkSummary && (
            <div
              className={`mt-3 rounded-lg border px-3 py-3 text-sm ${
                bulkSummary.failed > 0
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {bulkSummary.failed > 0 ? (
                  <HiOutlineExclamationCircle className="h-5 w-5 shrink-0" />
                ) : (
                  <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />
                )}
                <span>{bulkSummary.message}</span>
              </div>
              <p className="mt-1">
                Total: {bulkSummary.total} | Successful: {bulkSummary.successful} | Failed:{" "}
                {bulkSummary.failed}
              </p>
              {bulkSummary.results.length > 0 && (
                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1">
                  {bulkSummary.results.map((result, index) => {
                    const failed = resultFailed(result);

                    return (
                      <li
                        key={`${getBulkResultFileName(result, null, index)}-${index}`}
                        className="grid gap-1 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3"
                      >
                        <span className="min-w-0 truncate">
                          {getBulkResultFileName(result, null, index)}
                        </span>
                        <span
                          className={`break-words sm:text-right ${
                            failed ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          {getResultMessage(result)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
